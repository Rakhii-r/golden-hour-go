
-- 1) parent_accounts: block hijacking via BEFORE UPDATE trigger
CREATE OR REPLACE FUNCTION public.prevent_parent_account_relink()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role)
     OR has_role(auth.uid(), 'principal'::app_role)
     OR has_role(auth.uid(), 'admissions_officer'::app_role)
     OR is_super_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF NEW.student_id IS DISTINCT FROM OLD.student_id
     OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
     OR NEW.admission_number IS DISTINCT FROM OLD.admission_number
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to modify linkage fields on parent_accounts';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_parent_account_relink ON public.parent_accounts;
CREATE TRIGGER trg_prevent_parent_account_relink
BEFORE UPDATE ON public.parent_accounts
FOR EACH ROW EXECUTE FUNCTION public.prevent_parent_account_relink();

-- 2) transport_vendors: org-scoped access, admin-only writes
DROP POLICY IF EXISTS "enable all for authenticated users" ON public.transport_vendors;

CREATE POLICY transport_vendors_org_read
ON public.transport_vendors
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY transport_vendors_org_write
ON public.transport_vendors
FOR ALL
TO authenticated
USING (
  organization_id = get_user_organization(auth.uid())
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'principal'::app_role)
    OR is_super_admin(auth.uid())
  )
)
WITH CHECK (
  organization_id = get_user_organization(auth.uid())
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'principal'::app_role)
    OR is_super_admin(auth.uid())
  )
);

-- 3) org-signatures: enforce org folder match on cross-role SELECT policy
DROP POLICY IF EXISTS "Authenticated org users can view org signatures" ON storage.objects;
CREATE POLICY "Authenticated org users can view org signatures"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'org-signatures'
  AND (storage.foldername(name))[1] = (get_user_organization(auth.uid()))::text
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::app_role, 'principal'::app_role, 'super_admin'::app_role])
  )
);

-- 4) org-logos: enforce org folder match on SELECT
DROP POLICY IF EXISTS "Authenticated users can view org logos" ON storage.objects;
CREATE POLICY "Authenticated users can view org logos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'org-logos'
  AND (storage.foldername(name))[1] = (get_user_organization(auth.uid()))::text
);

-- 5) message-attachments: restrict SELECT to uploader's own folder
DROP POLICY IF EXISTS "Authenticated can read message attachments" ON storage.objects;
CREATE POLICY "Users read own message attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 6) Revoke EXECUTE from anon on all SECURITY DEFINER functions in public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon', r.proname, r.args);
  END LOOP;
END $$;
