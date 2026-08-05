-- 1) Attendance: teacher-scoped USING clause
DROP POLICY IF EXISTS "Teachers can update attendance (scheduled now)" ON public.attendance;
CREATE POLICY "Teachers can update attendance (scheduled now)"
ON public.attendance FOR UPDATE TO authenticated
USING (
  teacher_id = auth.uid()
  AND organization_id = get_user_organization(auth.uid())
  AND is_teacher_scheduled_now(class_name, subject)
)
WITH CHECK (
  teacher_id = auth.uid()
  AND organization_id = get_user_organization(auth.uid())
  AND is_teacher_scheduled_now(class_name, subject)
);

-- 2) Marks entries: restrict SELECT/UPDATE to assigned teachers, admins/principals, and the student's parent
DROP POLICY IF EXISTS "marks_entries_select" ON public.marks_entries;
CREATE POLICY "marks_entries_select"
ON public.marks_entries FOR SELECT TO authenticated
USING (
  (
    organization_id = get_user_organization(auth.uid())
    AND (
      is_super_admin(auth.uid())
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'principal'::app_role)
      OR teacher_id = auth.uid()
      OR teacher_has_marks_access(auth.uid(), organization_id, class_name, section, subject)
    )
  )
  OR student_id = get_parent_student_id(auth.uid())
);

DROP POLICY IF EXISTS "marks_entries_update" ON public.marks_entries;
CREATE POLICY "marks_entries_update"
ON public.marks_entries FOR UPDATE TO authenticated
USING (
  organization_id = get_user_organization(auth.uid())
  AND (
    is_super_admin(auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'principal'::app_role)
    OR teacher_id = auth.uid()
    OR teacher_has_marks_access(auth.uid(), organization_id, class_name, section, subject)
  )
)
WITH CHECK (
  organization_id = get_user_organization(auth.uid())
  AND (
    is_super_admin(auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'principal'::app_role)
    OR teacher_id = auth.uid()
    OR teacher_has_marks_access(auth.uid(), organization_id, class_name, section, subject)
  )
);

-- 3) Leave documents: cross-table consistency with the leaves delete window
DROP POLICY IF EXISTS "Users can delete own leave docs" ON public.leave_documents;
CREATE POLICY "Users can delete own leave docs"
ON public.leave_documents FOR DELETE TO authenticated
USING (
  leave_id IN (
    SELECT l.id FROM public.leaves l
    WHERE l.user_id = auth.uid()
      AND l.status = 'pending'
      AND l.created_at >= (now() - interval '1 hour')
  )
);

DROP POLICY IF EXISTS "Users can insert own leave docs" ON public.leave_documents;
CREATE POLICY "Users can insert own leave docs"
ON public.leave_documents FOR INSERT TO authenticated
WITH CHECK (
  leave_id IN (
    SELECT l.id FROM public.leaves l
    WHERE l.user_id = auth.uid() AND l.status = 'pending'
  )
);

-- 4) Profiles: remove broad accountant read (narrower payroll policy already exists)
DROP POLICY IF EXISTS "Authorized roles can view organization profiles" ON public.profiles;
CREATE POLICY "Authorized roles can view organization profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  organization_id = get_user_organization(auth.uid())
  AND (
    id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'principal'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR is_super_admin(auth.uid())
  )
);