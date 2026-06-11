
-- =====================================================================
-- Parent Teacher Discovery — RLS Policies
-- Allows parents to query teacher assignments for their child's class.
-- Fixes the empty teacher list in the Communication module.
-- =====================================================================

-- ── class_teachers: parent can view class teacher assignments in their org ──
CREATE POLICY parent_select_class_teachers ON public.class_teachers
  FOR SELECT TO authenticated
  USING (
    is_parent(auth.uid())
    AND organization_id = get_parent_org_id(auth.uid())
  );

-- ── teacher_class_assignments: parent can view subject teacher assignments ──
CREATE POLICY parent_select_teacher_class_assignments ON public.teacher_class_assignments
  FOR SELECT TO authenticated
  USING (
    is_parent(auth.uid())
    AND organization_id = get_parent_org_id(auth.uid())
  );
