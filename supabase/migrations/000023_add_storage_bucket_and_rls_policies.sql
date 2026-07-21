-- Ensure the receipts bucket exists in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload/insert files to their own family_id folder in the receipts bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to family receipts folder" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to family receipts folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = (
    SELECT family_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Allow authenticated users to select/read files under their own family_id folder in the receipts bucket
DROP POLICY IF EXISTS "Allow authenticated read of family receipts folder" ON storage.objects;
CREATE POLICY "Allow authenticated read of family receipts folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = (
    SELECT family_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Allow authenticated users to delete files under their own family_id folder in the receipts bucket
DROP POLICY IF EXISTS "Allow authenticated delete of family receipts folder" ON storage.objects;
CREATE POLICY "Allow authenticated delete of family receipts folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = (
    SELECT family_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);
