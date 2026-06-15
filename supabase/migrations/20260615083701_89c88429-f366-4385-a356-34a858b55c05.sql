
DROP POLICY IF EXISTS "Authenticated can read message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload message attachments to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update own message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete own message attachments" ON storage.objects;

CREATE POLICY "Authenticated can read message attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated can upload message attachments to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated can update own message attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated can delete own message attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
