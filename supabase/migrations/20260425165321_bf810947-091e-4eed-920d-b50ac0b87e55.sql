
INSERT INTO public.user_roles (user_id, role, organization_id, core_role_id)
SELECT DISTINCT pa.user_id, 'parent'::app_role, pa.organization_id,
  (SELECT id FROM public.core_roles WHERE LOWER(name) = 'parent' LIMIT 1)
FROM public.parent_accounts pa
WHERE pa.user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.ensure_parent_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_core_role_id uuid;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT id INTO v_core_role_id FROM public.core_roles WHERE LOWER(name) = 'parent' LIMIT 1;
  INSERT INTO public.user_roles (user_id, role, organization_id, core_role_id)
  VALUES (NEW.user_id, 'parent'::app_role, NEW.organization_id, v_core_role_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_parent_role ON public.parent_accounts;
CREATE TRIGGER trg_ensure_parent_role
AFTER INSERT OR UPDATE OF user_id ON public.parent_accounts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_parent_role();
