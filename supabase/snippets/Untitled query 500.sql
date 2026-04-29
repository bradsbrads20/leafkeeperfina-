BEGIN;
-- Allow public read access to the bucket
CREATE POLICY "Public read access for flower-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'flower-images');

-- Allow public uploads to the bucket
CREATE POLICY "Public uploads to flower-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'flower-images');
COMMIT;