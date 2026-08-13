-- Supabase Storage bucket and owner-only write policies.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "portfolio media owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "portfolio media owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "portfolio media owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
