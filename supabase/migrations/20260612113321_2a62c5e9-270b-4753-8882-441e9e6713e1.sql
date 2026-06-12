
DROP POLICY IF EXISTS "Parents can upload student documents files" ON storage.objects;

CREATE POLICY "Parents can upload student documents files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-documents'
  AND EXISTS (
    SELECT 1
    FROM parent_accounts pa
    JOIN students_or_clients s ON s.id = pa.student_id
    WHERE pa.user_id = auth.uid()
      AND (storage.foldername(objects.name))[1] = s.organization_id::text
      AND (storage.foldername(objects.name))[2] = pa.student_id::text
  )
);
