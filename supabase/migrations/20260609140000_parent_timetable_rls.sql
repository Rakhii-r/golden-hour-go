
-- =====================================================================
-- CRITICAL: Parent SELECT access on timetables table
-- Without this policy, parentSupabase.from("timetables").select()
-- returns [] silently for all parent JWT tokens.
-- This also fixes the parent portal's own Timetable page which
-- has the same invisible bug.
-- =====================================================================

-- Parents can read timetable entries for their organization
CREATE POLICY parent_select_timetables ON public.timetables
  FOR SELECT TO authenticated
  USING (
    is_parent(auth.uid())
    AND organization_id = get_parent_org_id(auth.uid())
  );

-- Parents can read time slot definitions (needed for timetable page)
CREATE POLICY parent_select_timetable_time_slots ON public.timetable_time_slots
  FOR SELECT TO authenticated
  USING (
    is_parent(auth.uid())
    AND organization_id = get_parent_org_id(auth.uid())
  );
