
-- ── Helper: notify parent of a student ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public._notify_parents_of_student(
  _student_id uuid,
  _org_id uuid,
  _title text,
  _message text,
  _type text,
  _action_url text,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, action_url, metadata)
  SELECT pa.user_id, _org_id, _title, _message, _type, _action_url, _metadata
  FROM public.parent_accounts pa
  WHERE pa.student_id = _student_id AND pa.user_id IS NOT NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_parents_of_student failed: %', SQLERRM;
END;
$$;

-- ── Attendance: notify parent on absent ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_attendance_notify_parent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s_name text;
BEGIN
  IF lower(coalesce(NEW.status,'')) IN ('absent','a') THEN
    SELECT name INTO s_name FROM public.students_or_clients WHERE id = NEW.student_id;
    PERFORM public._notify_parents_of_student(
      NEW.student_id,
      NEW.organization_id,
      'Absence Alert',
      format('%s was marked absent on %s.', coalesce(s_name,'Your child'), to_char(NEW.date,'DD Mon YYYY')),
      'attendance',
      '/parent/attendance',
      jsonb_build_object('attendance_id', NEW.id, 'date', NEW.date, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'attendance notify trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS attendance_notify_parent ON public.attendance;
CREATE TRIGGER attendance_notify_parent
AFTER INSERT OR UPDATE OF status ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.trg_attendance_notify_parent();

-- ── Circulars: notify each recipient ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_circular_recipient_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c_title text; c_desc text; c_org uuid;
BEGIN
  SELECT title, description, organization_id INTO c_title, c_desc, c_org
  FROM public.circulars WHERE id = NEW.circular_id;
  IF c_org IS NULL OR NEW.user_id IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, action_url, metadata)
  VALUES (
    NEW.user_id, c_org,
    coalesce('New Circular: ' || c_title, 'New Circular'),
    left(coalesce(c_desc, ''), 240),
    'circular',
    '/parent/circulars',
    jsonb_build_object('circular_id', NEW.circular_id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'circular notify trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS circular_recipient_notify ON public.circular_recipients;
CREATE TRIGGER circular_recipient_notify
AFTER INSERT ON public.circular_recipients
FOR EACH ROW EXECUTE FUNCTION public.trg_circular_recipient_notify();

-- ── Messages: notify receiver ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_message_notify_receiver()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  sender_name text;
BEGIN
  IF NEW.receiver_id IS NULL OR NEW.organization_id IS NULL THEN RETURN NEW; END IF;
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, action_url, metadata)
  VALUES (
    NEW.receiver_id, NEW.organization_id,
    'New message from ' || coalesce(sender_name, initcap(coalesce(NEW.sender_role,'sender'))),
    left(coalesce(NEW.message,''), 240),
    'message',
    '/parent/communication',
    jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'message notify trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS message_notify_receiver ON public.messages;
CREATE TRIGGER message_notify_receiver
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.trg_message_notify_receiver();

-- ── Marks: notify parents when a class submission is published ──────────────
CREATE OR REPLACE FUNCTION public.trg_marks_submission_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ex_name text;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status IN ('submitted','published'))
     OR (TG_OP = 'UPDATE' AND NEW.status IN ('submitted','published')
         AND coalesce(OLD.status,'') <> NEW.status) THEN
    SELECT name INTO ex_name FROM public.exam_types WHERE id = NEW.exam_type_id;
    INSERT INTO public.notifications (user_id, organization_id, title, message, type, action_url, metadata)
    SELECT pa.user_id, NEW.organization_id,
      'Marks Published: ' || coalesce(ex_name,'Exam'),
      format('%s marks have been published for Class %s%s.',
             coalesce(NEW.subject,'Subject'),
             coalesce(NEW.class_name,''),
             CASE WHEN NEW.section IS NOT NULL THEN ' - ' || NEW.section ELSE '' END),
      'exam',
      '/parent/marks',
      jsonb_build_object('exam_type_id', NEW.exam_type_id, 'subject', NEW.subject)
    FROM public.students_or_clients s
    JOIN public.parent_accounts pa ON pa.student_id = s.id
    WHERE s.organization_id = NEW.organization_id
      AND s.class = NEW.class_name
      AND (NEW.section IS NULL OR s.section = NEW.section)
      AND pa.user_id IS NOT NULL;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'marks submission notify trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marks_submission_notify ON public.marks_submissions;
CREATE TRIGGER marks_submission_notify
AFTER INSERT OR UPDATE OF status ON public.marks_submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_marks_submission_notify();

-- ── Fees: notify parent on any fee_payments insert (covers manual/offline) ──
CREATE OR REPLACE FUNCTION public.trg_fee_payment_notify_parent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Razorpay edge function already inserts a richer notification; skip to avoid dupes.
  IF coalesce(NEW.payment_mode,'') = 'razorpay' THEN RETURN NEW; END IF;
  PERFORM public._notify_parents_of_student(
    NEW.student_id,
    NEW.organization_id,
    'Fee Payment Recorded',
    format('Payment of ₹%s recorded. Receipt: %s',
           to_char(NEW.amount,'FM999,999,999.00'),
           coalesce(NEW.receipt_number,'—')),
    'fee_payment',
    '/parent/fees',
    jsonb_build_object('fee_payment_id', NEW.id, 'receipt_number', NEW.receipt_number, 'amount', NEW.amount)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'fee payment notify trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fee_payment_notify_parent ON public.fee_payments;
CREATE TRIGGER fee_payment_notify_parent
AFTER INSERT ON public.fee_payments
FOR EACH ROW EXECUTE FUNCTION public.trg_fee_payment_notify_parent();
