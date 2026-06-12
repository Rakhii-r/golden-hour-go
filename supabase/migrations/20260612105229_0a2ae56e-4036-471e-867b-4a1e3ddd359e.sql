
-- Allow parents to insert documents for their own child
CREATE POLICY parent_insert_own_student_documents
ON public.student_documents FOR INSERT TO authenticated
WITH CHECK (
  is_parent(auth.uid())
  AND student_id = get_parent_student_id(auth.uid())
  AND uploaded_by = auth.uid()
);

-- Allow parents to upload files into student-documents bucket under their child's folder
CREATE POLICY "Parents can upload student documents files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'student-documents'
  AND EXISTS (
    SELECT 1 FROM public.parent_accounts pa
    JOIN public.students_or_clients s ON s.id = pa.student_id
    WHERE pa.user_id = auth.uid()
      AND ((storage.foldername(name))[1])::uuid = s.organization_id
      AND ((storage.foldername(name))[2])::uuid = pa.student_id
  )
);
