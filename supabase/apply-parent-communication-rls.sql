-- =============================================================================
-- APPLY THIS IN: Supabase Dashboard → SQL Editor → Run
-- =============================================================================
-- Parent Communication Module — All Required RLS Policies
-- Run this once to enable teacher discovery + messaging for parents.
-- Safe to re-run (uses CREATE POLICY ... IF NOT EXISTS where possible,
-- otherwise uses DO $$ blocks to skip if policy already exists).
-- =============================================================================

-- ── Helper: skip policy creation if it already exists ──────────────────────
CREATE OR REPLACE FUNCTION _create_policy_if_missing(
  pol_name text, table_name text, ddl text
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = pol_name
      AND tablename  = table_name
  ) THEN
    EXECUTE ddl;
  END IF;
END;
$$;

-- =============================================================================
-- 1. PROFILES — parents can read staff profiles in their org
--    (Required for teacher name/avatar display. Also fixes timetable teacher names.)
-- =============================================================================
SELECT _create_policy_if_missing(
  'parent_select_staff_profiles', 'profiles',
  $$CREATE POLICY parent_select_staff_profiles ON public.profiles
      FOR SELECT TO authenticated
      USING (
        is_parent(auth.uid())
        AND organization_id = get_parent_org_id(auth.uid())
      )$$
);

-- =============================================================================
-- 2. TIMETABLES — parents can read timetable entries in their org
--    (Required for teacher discovery via the timetable module)
-- =============================================================================
SELECT _create_policy_if_missing(
  'parent_select_timetables', 'timetables',
  $$CREATE POLICY parent_select_timetables ON public.timetables
      FOR SELECT TO authenticated
      USING (
        is_parent(auth.uid())
        AND organization_id = get_parent_org_id(auth.uid())
      )$$
);

-- =============================================================================
-- 3. TIMETABLE_TIME_SLOTS — parents can read time slot definitions
--    (Required for the parent timetable page to show period times)
-- =============================================================================
SELECT _create_policy_if_missing(
  'parent_select_timetable_time_slots', 'timetable_time_slots',
  $$CREATE POLICY parent_select_timetable_time_slots ON public.timetable_time_slots
      FOR SELECT TO authenticated
      USING (
        is_parent(auth.uid())
        AND organization_id = get_parent_org_id(auth.uid())
      )$$
);

-- =============================================================================
-- 4. CLASS_TEACHERS — parents can read class teacher assignments
-- =============================================================================
SELECT _create_policy_if_missing(
  'parent_select_class_teachers', 'class_teachers',
  $$CREATE POLICY parent_select_class_teachers ON public.class_teachers
      FOR SELECT TO authenticated
      USING (
        is_parent(auth.uid())
        AND organization_id = get_parent_org_id(auth.uid())
      )$$
);

-- =============================================================================
-- 5. TEACHER_CLASS_ASSIGNMENTS — parents can read subject assignments
-- =============================================================================
SELECT _create_policy_if_missing(
  'parent_select_teacher_class_assignments', 'teacher_class_assignments',
  $$CREATE POLICY parent_select_teacher_class_assignments ON public.teacher_class_assignments
      FOR SELECT TO authenticated
      USING (
        is_parent(auth.uid())
        AND organization_id = get_parent_org_id(auth.uid())
      )$$
);

-- =============================================================================
-- 6. CONVERSATIONS — parents can view and update their conversations
-- =============================================================================
SELECT _create_policy_if_missing(
  'conv_select_parent', 'conversations',
  $$CREATE POLICY conv_select_parent ON public.conversations
      FOR SELECT TO authenticated
      USING (parent_id = auth.uid())$$
);

SELECT _create_policy_if_missing(
  'conv_update_parent', 'conversations',
  $$CREATE POLICY conv_update_parent ON public.conversations
      FOR UPDATE TO authenticated
      USING (parent_id = auth.uid())
      WITH CHECK (parent_id = auth.uid())$$
);

-- =============================================================================
-- 7. MESSAGES — parents can read, send, and mark messages as read
-- =============================================================================
SELECT _create_policy_if_missing(
  'msg_select_parent', 'messages',
  $$CREATE POLICY msg_select_parent ON public.messages
      FOR SELECT TO authenticated
      USING (
        conversation_id IN (
          SELECT id FROM public.conversations WHERE parent_id = auth.uid()
        )
      )$$
);

SELECT _create_policy_if_missing(
  'msg_insert_parent', 'messages',
  $$CREATE POLICY msg_insert_parent ON public.messages
      FOR INSERT TO authenticated
      WITH CHECK (
        sender_id = auth.uid()
        AND sender_role = 'parent'
        AND organization_id = get_parent_org_id(auth.uid())
        AND conversation_id IN (
          SELECT id FROM public.conversations WHERE parent_id = auth.uid()
        )
      )$$
);

SELECT _create_policy_if_missing(
  'msg_update_read_parent', 'messages',
  $$CREATE POLICY msg_update_read_parent ON public.messages
      FOR UPDATE TO authenticated
      USING (
        receiver_id = auth.uid()
        AND receiver_role = 'parent'
        AND conversation_id IN (
          SELECT id FROM public.conversations WHERE parent_id = auth.uid()
        )
      )
      WITH CHECK (
        receiver_id = auth.uid()
        AND receiver_role = 'parent'
        AND conversation_id IN (
          SELECT id FROM public.conversations WHERE parent_id = auth.uid()
        )
      )$$
);

-- =============================================================================
-- 8. STORAGE — message-attachments bucket
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments', 'message-attachments', false, 10485760,
  ARRAY['image/jpeg','image/png','image/gif','image/webp',
        'application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

SELECT _create_policy_if_missing(
  'Parents upload own message attachments', 'objects',
  $$CREATE POLICY "Parents upload own message attachments" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'message-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )$$
);

SELECT _create_policy_if_missing(
  'Participants read message attachments', 'objects',
  $$CREATE POLICY "Participants read message attachments" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'message-attachments'
        AND (
          (storage.foldername(name))[1] = auth.uid()::text
          OR EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON c.id = m.conversation_id
            WHERE m.attachment_url LIKE '%' || storage.objects.name || '%'
              AND (c.parent_id = auth.uid() OR c.teacher_id = auth.uid())
          )
        )
      )$$
);

-- =============================================================================
-- CLEANUP helper function
-- =============================================================================
DROP FUNCTION IF EXISTS _create_policy_if_missing(text, text, text);

-- =============================================================================
-- DIAGNOSTIC: Check what class_names exist in timetables for your org
-- (Run this query separately to verify the class_name format being used)
-- =============================================================================
-- SELECT DISTINCT class_name, count(*) as entries
-- FROM public.timetables
-- WHERE organization_id = '<your-org-id>'
-- GROUP BY class_name
-- ORDER BY class_name;
