-- =====================================================================
-- Parent Profile: broaden the self-service RPC to cover guardian
-- (emergency contact) details and medical info, alongside address/phone.
-- Self-sufficient: safe to run even if 20260701000000_* was never applied.
-- =====================================================================

-- Suggestion box (re-created here defensively in case the prior file
-- was never applied to this database).
CREATE TABLE IF NOT EXISTS public.parent_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  student_id uuid NOT NULL,
  parent_user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.parent_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parent_suggestions_insert_own ON public.parent_suggestions;
CREATE POLICY parent_suggestions_insert_own ON public.parent_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (
    parent_user_id = auth.uid()
    AND student_id IN (SELECT student_id FROM public.parent_accounts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS parent_suggestions_select_own ON public.parent_suggestions;
CREATE POLICY parent_suggestions_select_own ON public.parent_suggestions
  FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS parent_suggestions_select_staff ON public.parent_suggestions;
CREATE POLICY parent_suggestions_select_staff ON public.parent_suggestions
  FOR SELECT TO authenticated
  USING (organization_id = get_user_organization(auth.uid()));

-- Supersede the narrower contact-only RPC from 20260701000000_*.
DROP FUNCTION IF EXISTS public.update_own_student_contact(text, text);

-- Broadened RPC: address, phone, guardian (emergency contact), and
-- medical_record — still scoped strictly to the caller's own linked
-- child via parent_accounts, still column-restricted (no blanket UPDATE
-- RLS), so parents cannot touch grades/status/roll_number/etc.
CREATE OR REPLACE FUNCTION public.update_own_student_profile(
  p_address text,
  p_phone text,
  p_guardian_name text,
  p_guardian_phone text,
  p_guardian_email text,
  p_guardian_relation text,
  p_medical_record jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id uuid;
BEGIN
  SELECT student_id INTO v_student_id
  FROM public.parent_accounts
  WHERE user_id = auth.uid();

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'No linked student for this account';
  END IF;

  UPDATE public.students_or_clients
  SET address = NULLIF(TRIM(p_address), ''),
      phone = NULLIF(TRIM(p_phone), ''),
      guardian_name = NULLIF(TRIM(p_guardian_name), ''),
      guardian_phone = NULLIF(TRIM(p_guardian_phone), ''),
      guardian_email = NULLIF(TRIM(p_guardian_email), ''),
      guardian_relation = NULLIF(TRIM(p_guardian_relation), ''),
      medical_record = p_medical_record
  WHERE id = v_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_own_student_profile(text, text, text, text, text, text, jsonb) TO authenticated;
