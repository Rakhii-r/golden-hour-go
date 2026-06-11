
-- Audit log table for fee payment events
CREATE TABLE public.fee_payment_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  organization_id uuid NOT NULL,
  student_id uuid,
  parent_user_id uuid,
  fee_payment_id uuid,
  receipt_number text,
  razorpay_payment_id text,
  amount numeric,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.fee_payment_audit_logs TO authenticated;
GRANT ALL ON public.fee_payment_audit_logs TO service_role;

ALTER TABLE public.fee_payment_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and accountants read org audit"
ON public.fee_payment_audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND p.organization_id = fee_payment_audit_logs.organization_id
  )
);

CREATE INDEX idx_fpa_org_created ON public.fee_payment_audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_fpa_student ON public.fee_payment_audit_logs(student_id);

-- Toggle for notifying class teacher on payment
ALTER TABLE public.organization_settings
  ADD COLUMN IF NOT EXISTS notify_class_teacher_on_payment boolean NOT NULL DEFAULT false;
