-- Parent read access to student_documents + storage buckets for documents/circulars
CREATE POLICY "parent_select_own_student_documents"
ON public.student_documents FOR SELECT
USING (
  is_parent(auth.uid())
  AND student_id = get_parent_student_id(auth.uid())
);

CREATE POLICY "Parents can read their child's student documents files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents'
  AND EXISTS (
    SELECT 1 FROM public.student_documents sd
    JOIN public.parent_accounts pa ON pa.student_id = sd.student_id
    WHERE pa.user_id = auth.uid()
      AND sd.file_url = objects.name
  )
);

CREATE POLICY "Parents can read circular attachment files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'circulars'
  AND EXISTS (
    SELECT 1 FROM public.circulars c
    JOIN public.parent_accounts pa ON pa.organization_id = c.organization_id
    WHERE pa.user_id = auth.uid()
      AND c.attachment_url = objects.name
      AND c.status = 'sent'
      AND ('parent' = ANY(c.target_roles) OR 'all' = ANY(c.target_roles))
  )
);