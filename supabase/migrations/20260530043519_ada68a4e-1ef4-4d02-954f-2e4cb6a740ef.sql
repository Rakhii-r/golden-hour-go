
-- 1. ATTENDANCE: split staff vs parent SELECT
DROP POLICY IF EXISTS attendance_select ON public.attendance;
CREATE POLICY attendance_select_staff ON public.attendance
  FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (
      has_role(auth.uid(),'admin'::app_role)
      OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role)
      OR has_role(auth.uid(),'teacher'::app_role)
      OR has_role(auth.uid(),'counselor'::app_role)
      OR has_role(auth.uid(),'coach'::app_role)
      OR is_super_admin(auth.uid())
    )
  );
CREATE POLICY attendance_select_parent ON public.attendance
  FOR SELECT TO authenticated
  USING (student_id = get_parent_student_id(auth.uid()));

-- 2. AUDIT LOGS: restrict to privileged roles
DROP POLICY IF EXISTS "Org members can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view audit logs in their organization" ON public.audit_logs;
CREATE POLICY "Privileged roles can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (
      has_role(auth.uid(),'admin'::app_role)
      OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'accountant'::app_role)
      OR is_super_admin(auth.uid())
    )
  );

-- 3. PROFILES: parent only sees own profile
DROP POLICY IF EXISTS parent_select_profiles ON public.profiles;
CREATE POLICY parent_select_own_profile ON public.profiles
  FOR SELECT TO authenticated
  USING (is_parent(auth.uid()) AND id = auth.uid());

-- 4. DAILY_TIMETABLE: restrict writes to staff roles
DROP POLICY IF EXISTS "Users can insert daily timetable in their org" ON public.daily_timetable;
DROP POLICY IF EXISTS "Users can update daily timetable in their org" ON public.daily_timetable;
DROP POLICY IF EXISTS "Users can delete daily timetable in their org" ON public.daily_timetable;
CREATE POLICY "Staff can insert daily timetable" ON public.daily_timetable
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role) OR has_role(auth.uid(),'teacher'::app_role))
  );
CREATE POLICY "Staff can update daily timetable" ON public.daily_timetable
  FOR UPDATE TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role) OR has_role(auth.uid(),'teacher'::app_role))
  )
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role) OR has_role(auth.uid(),'teacher'::app_role))
  );
CREATE POLICY "Staff can delete daily timetable" ON public.daily_timetable
  FOR DELETE TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role))
  );

-- 5. SUBSTITUTIONS: restrict writes to staff roles
DROP POLICY IF EXISTS "Users can insert substitutions in their org" ON public.substitutions;
DROP POLICY IF EXISTS "Users can update substitutions in their org" ON public.substitutions;
DROP POLICY IF EXISTS "Users can delete substitutions in their org" ON public.substitutions;
CREATE POLICY "Staff can insert substitutions" ON public.substitutions
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role))
  );
CREATE POLICY "Staff can update substitutions" ON public.substitutions
  FOR UPDATE TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role))
  )
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role))
  );
CREATE POLICY "Staff can delete substitutions" ON public.substitutions
  FOR DELETE TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role)
      OR has_role(auth.uid(),'manager'::app_role))
  );

-- 6. TALLY LEDGERS: restrict writes to accountant/admin
DROP POLICY IF EXISTS "Users can insert their org imported ledgers" ON public.tally_imported_ledgers;
DROP POLICY IF EXISTS "Users can update their org imported ledgers" ON public.tally_imported_ledgers;
CREATE POLICY "Finance can insert imported ledgers" ON public.tally_imported_ledgers
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'accountant'::app_role))
  );
CREATE POLICY "Finance can update imported ledgers" ON public.tally_imported_ledgers
  FOR UPDATE TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'accountant'::app_role))
  )
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'accountant'::app_role))
  );

-- 7. TALLY VOUCHERS: restrict writes to accountant/admin
DROP POLICY IF EXISTS "Users can insert their org imported vouchers" ON public.tally_imported_vouchers;
DROP POLICY IF EXISTS "Users can update their org imported vouchers" ON public.tally_imported_vouchers;
CREATE POLICY "Finance can insert imported vouchers" ON public.tally_imported_vouchers
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'accountant'::app_role))
  );
CREATE POLICY "Finance can update imported vouchers" ON public.tally_imported_vouchers
  FOR UPDATE TO authenticated
  USING (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'accountant'::app_role))
  )
  WITH CHECK (
    organization_id = get_user_organization(auth.uid())
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'accountant'::app_role))
  );

-- 8. CONVERSATIONS insert: allow parent to use parent org id
DROP POLICY IF EXISTS conv_insert_participant ON public.conversations;
CREATE POLICY conv_insert_participant ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IS NOT NULL
    AND (
      (teacher_id = auth.uid() AND organization_id = get_user_organization(auth.uid()))
      OR (parent_id = auth.uid() AND organization_id = get_parent_org_id(auth.uid()))
    )
  );

-- 9. STORAGE: custom-document-themes — require org membership
DROP POLICY IF EXISTS custom_doc_themes_public_read ON storage.objects;
CREATE POLICY custom_doc_themes_org_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'custom-document-themes'
    AND (storage.foldername(name))[1] = (get_user_organization(auth.uid()))::text
  );

-- 10. STORAGE: leave-documents admin read — fix broken subquery
DROP POLICY IF EXISTS "Users read own leave docs" ON storage.objects;
CREATE POLICY "Users read own leave docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'leave-documents'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR is_super_admin(auth.uid())
      OR (
        (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'principal'::app_role) OR has_role(auth.uid(),'manager'::app_role))
        AND EXISTS (
          SELECT 1 FROM public.leaves l
          WHERE (l.user_id)::text = (storage.foldername(name))[1]
            AND l.organization_id = get_user_organization(auth.uid())
        )
      )
    )
  );

-- 11. ABSENCE ALERTS: drop parent_phone column to prevent exposure to teachers
ALTER TABLE public.student_absence_alerts DROP COLUMN IF EXISTS parent_phone;
