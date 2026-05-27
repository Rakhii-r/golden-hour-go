CREATE POLICY "Parents can read their child's assignment files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignments'
  AND EXISTS (
    SELECT 1
    FROM public.assignments a
    JOIN public.parent_accounts pa ON pa.organization_id = a.organization_id
    JOIN public.students_or_clients s ON s.id = pa.student_id
    WHERE a.file_url = storage.objects.name
      AND pa.user_id = auth.uid()
      AND a.class_name = s.class
      AND (a.section_name IS NULL OR a.section_name = s.section)
  )
);