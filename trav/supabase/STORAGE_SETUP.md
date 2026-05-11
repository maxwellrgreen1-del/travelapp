# Supabase Storage — post images (`post-media`)

Tript stores **one hero image per post** (MVP) in a **public** Storage bucket and records the **public URL** in `public.post_media.media_url`. Upload code lives in `src/lib/supabase/storage.ts`, validation in `src/lib/media/`, and the orchestration helper `attachPrimaryPostImageFromFile` in `src/features/media/`.

## 1. Create the bucket (dashboard)

1. Open your project → **Storage** → **New bucket**.
2. **Name:** `post-media` (must match `POST_MEDIA_BUCKET` in `src/lib/supabase/storage.ts`).
3. **Public bucket:** **On** — the app uses `getPublicUrl()` and stores that URL in Postgres so the feed and post detail can render `<img src="…">` without signed URLs.
4. Optional: set **File size limit** to **5 MB** and restrict MIME types to **image/jpeg**, **image/png**, **image/webp** (the app validates the same client-side).

## 2. Apply Storage policies (SQL Editor or migration)

Policies must allow:

| Action | Who | Rule |
| --- | --- | --- |
| **SELECT** | Everyone (incl. anonymous) | `bucket_id = 'post-media'` so public cards can load thumbnails. |
| **INSERT / UPDATE / DELETE** | Authenticated post authors only | Object key must be `{post_id}/{filename}` where `post_id` is a row in `public.posts` with `author_id = auth.uid()`. |

**Recommended:** run the migration file (idempotent `DROP POLICY IF EXISTS` + `CREATE POLICY`):

```bash
# From repo root `trav/`, linked to your project
supabase db push
# or paste supabase/migrations/20260210120000_post_media_storage_bucket.sql into the SQL Editor and execute once.
```

The migration also **inserts/updates** the `storage.buckets` row for `post-media` with a **5 MB** cap and allowed image MIME types.

## 3. Why paths look like `{post_id}/{uuid}.jpg`

Storage RLS policies use `split_part(name, '/', 1)::uuid` to read the **first path segment** and join to `posts.id`. That keeps random users from writing into another traveller’s prefix.

The browser client uploads **after** the post row exists (so `post_id` is known). See `attachPrimaryPostImageFromFile` in `src/features/media/attachPrimaryPostImage.ts`.

## 4. Wiring Create Post (next step)

After `publishTripPost` returns `{ postId }`:

```ts
import { attachPrimaryPostImageFromFile } from "@/features/media";

const imageResult = await attachPrimaryPostImageFromFile(supabase, {
  postId: result.postId,
  authorId: user.id,
  file: pickedFile,
});
```

If the user did not pick a file, skip this call — the feed keeps using the scenic placeholder until a row exists in `post_media`.

## 5. Troubleshooting

- **`new row violates row-level security policy`** on Storage: policies not applied, wrong bucket id, or object path does not start with a post UUID you own.
- **Empty public URL**: bucket is not public, or `getPublicUrl` path does not match the uploaded object path.
- **`post_media` insert denied**: table RLS already requires post ownership (`post_media_author_manage` in `schema.sql`) — stay logged in as the author who created the post.
