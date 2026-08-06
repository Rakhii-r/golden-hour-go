-- 1. Remove public read policy on profile-images bucket
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;

-- 2. Revoke anonymous execute on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.archive_organization(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role_in_org(uuid, public.app_role, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_core_role_assignment() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_assignment_published() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_student_attendance() FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role_in_org(uuid, public.app_role, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.archive_organization(uuid, uuid) TO authenticated, service_role;