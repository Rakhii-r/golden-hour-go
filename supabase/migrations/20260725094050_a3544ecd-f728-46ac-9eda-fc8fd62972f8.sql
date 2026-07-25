
-- Revoke EXECUTE from PUBLIC on all SECURITY DEFINER functions in public schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC', r.proname, r.args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon', r.proname, r.args);
  END LOOP;
END $$;

-- Pin search_path on remaining functions
ALTER FUNCTION public.touch_daycare_staff_assignments() SET search_path = public;
ALTER FUNCTION public.map_planner_holiday_type(text) SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
ALTER FUNCTION public.prevent_future_attendance() SET search_path = public;
ALTER FUNCTION public.norm_academic_year(text) SET search_path = public;
ALTER FUNCTION public.resolve_transport_stop_fee(uuid, text, text) SET search_path = public;
