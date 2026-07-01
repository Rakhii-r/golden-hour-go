-- =====================================================================
-- Parent Profile: editable contact info (address/phone) + suggestion box
-- =====================================================================

-- ── 1. RPC: parent can update ONLY their own child's address & phone ──
-- Scoped via parent_accounts (user_id = auth.uid()) so parents cannot
-- touch any other row or any other column (no blanket UPDATE RLS).
CREATE OR REPLACE FUNCTION public.update_own_student_contact(
  p_address text,
  p_phone text
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
      phone = NULLIF(TRIM(p_phone), '')
  WHERE id = v_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_own_student_contact(text, text) TO authenticated;

-- ── 2. Suggestion box: parents can write a note to the school ─────────
CREATE TABLE IF NOT EXISTS public.parent_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  student_id uuid NOT NULL,
  parent_user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY parent_suggestions_insert_own ON public.parent_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (
    parent_user_id = auth.uid()
    AND student_id IN (SELECT student_id FROM public.parent_accounts WHERE user_id = auth.uid())
  );

CREATE POLICY parent_suggestions_select_own ON public.parent_suggestions
  FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid());

CREATE POLICY parent_suggestions_select_staff ON public.parent_suggestions
  FOR SELECT TO authenticated
  USING (organization_id = get_user_organization(auth.uid()));
