
-- =====================================================================
-- Parent Messaging Module — RLS Policies
-- Enables parent ↔ teacher communication via the parent portal.
-- =====================================================================

-- ── 1. Profiles: allow parents to read staff profiles in their org ──
-- This also fixes the timetable teacher-name resolution that was
-- silently returning null due to the restrictive own-profile policy.
CREATE POLICY parent_select_staff_profiles ON public.profiles
  FOR SELECT TO authenticated
  USING (
    is_parent(auth.uid())
    AND organization_id = get_parent_org_id(auth.uid())
  );

-- ── 2. Conversations: parent can view their own conversations ─────────
CREATE POLICY conv_select_parent ON public.conversations
  FOR SELECT TO authenticated
  USING (parent_id = auth.uid());

-- ── 3. Conversations: parent can reset their own unread count ─────────
CREATE POLICY conv_update_parent ON public.conversations
  FOR UPDATE TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- ── 4. Messages: parent can read messages in their conversations ──────
CREATE POLICY msg_select_parent ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE parent_id = auth.uid()
    )
  );

-- ── 5. Messages: parent can send messages in their conversations ──────
CREATE POLICY msg_insert_parent ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'parent'
    AND organization_id = get_parent_org_id(auth.uid())
    AND conversation_id IN (
      SELECT id FROM public.conversations WHERE parent_id = auth.uid()
    )
  );

-- ── 6. Messages: parent can mark received messages as read ───────────
CREATE POLICY msg_update_read_parent ON public.messages
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
  );

-- ── 7. Storage: message attachments bucket ───────────────────────────
-- Parents can upload and read attachments in their own folder.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760, -- 10 MB
  ARRAY['image/jpeg','image/png','image/gif','image/webp',
        'application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Parents upload own message attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Participants read message attachments" ON storage.objects
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
  );
