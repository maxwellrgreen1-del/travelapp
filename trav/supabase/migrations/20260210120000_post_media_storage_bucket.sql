-- tript: public Storage bucket for post images + RLS on storage.objects
-- App constant: POST_MEDIA_BUCKET = 'post-media' (see src/lib/supabase/storage.ts)
-- Object paths: `{post_uuid}/{random}.{jpg|png|webp}` — first path segment must match posts.id for write policies.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read (bucket is public; URLs are embedded in post_media.media_url)
DROP POLICY IF EXISTS "post_media_public_select" ON storage.objects;
CREATE POLICY "post_media_public_select"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-media');

-- Only the post author may upload into `{their_post_id}/...`
DROP POLICY IF EXISTS "post_media_owner_insert" ON storage.objects;
CREATE POLICY "post_media_owner_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = split_part(name, '/', 1)::uuid
        AND p.author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "post_media_owner_update" ON storage.objects;
CREATE POLICY "post_media_owner_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-media'
    AND EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = split_part(name, '/', 1)::uuid
        AND p.author_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'post-media'
    AND EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = split_part(name, '/', 1)::uuid
        AND p.author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "post_media_owner_delete" ON storage.objects;
CREATE POLICY "post_media_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-media'
    AND EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = split_part(name, '/', 1)::uuid
        AND p.author_id = auth.uid()
    )
  );
