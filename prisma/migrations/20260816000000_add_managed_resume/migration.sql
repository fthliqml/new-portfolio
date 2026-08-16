-- Store one managed resume and provision a PDF-only public Storage bucket.
CREATE TABLE "cms"."resume_assets" (
    "id" VARCHAR(32) NOT NULL DEFAULT 'primary',
    "bucket" VARCHAR(100) NOT NULL DEFAULT 'portfolio-files',
    "object_path" VARCHAR(1024) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "resume_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "resume_assets_object_path_key"
ON "cms"."resume_assets"("object_path");

CREATE INDEX "resume_assets_created_by_idx"
ON "cms"."resume_assets"("created_by");

ALTER TABLE "cms"."resume_assets"
ADD CONSTRAINT "resume_assets_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "cms"."admin_users"("user_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-files',
  'portfolio-files',
  true,
  5242880,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "portfolio files owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "portfolio files owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portfolio-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "portfolio files owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
