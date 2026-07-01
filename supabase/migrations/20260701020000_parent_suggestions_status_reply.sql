-- Add status/reply workflow columns to parent_suggestions for CRM triage.
ALTER TABLE public.parent_suggestions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'New' CHECK (status IN ('New','Read','Closed')),
  ADD COLUMN IF NOT EXISTS school_reply text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP POLICY IF EXISTS parent_suggestions_update_staff ON public.parent_suggestions;
CREATE POLICY parent_suggestions_update_staff ON public.parent_suggestions
  FOR UPDATE TO authenticated
  USING (organization_id = get_user_organization(auth.uid()))
  WITH CHECK (organization_id = get_user_organization(auth.uid()));
