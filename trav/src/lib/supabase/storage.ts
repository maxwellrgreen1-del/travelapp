import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

/**
 * Public bucket for post images — URLs are written to `post_media.media_url`.
 * Create this bucket in the Supabase dashboard (or via migration); see `supabase/STORAGE_SETUP.md`.
 */
export const POST_MEDIA_BUCKET = "post-media";

/** Object path inside the bucket: `{postId}/{unique}.{ext}` — first segment must equal post UUID for RLS policies. */
export function buildPostMediaStoragePath(postId: string, uniqueFileName: string): string {
  const safePost = postId.trim();
  const safeFile = uniqueFileName.replace(/\\/g, "").replace(/^\/+/, "");
  return `${safePost}/${safeFile}`;
}

function tidyStorageError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Storage request failed — try again.";
}

export type UploadPostMediaImageOk = {
  ok: true;
  /** Path inside `POST_MEDIA_BUCKET` (not a full URL). */
  storagePath: string;
  /** Public CDN URL when the bucket is public — same string stored in `post_media.media_url`. */
  publicUrl: string;
};

export type UploadPostMediaImageFail = { ok: false; message: string };

export type UploadPostMediaImageResult = UploadPostMediaImageOk | UploadPostMediaImageFail;

/**
 * Uploads raw bytes to the post-media bucket and returns the stable public URL.
 * Caller must enforce auth + `validateImageFile` before invoking.
 */
export async function uploadPostMediaImage(
  client: Client,
  params: {
    storagePath: string;
    body: ArrayBuffer | Blob | File;
    contentType: string;
    /** Set true when replacing the same path (rare — prefer fresh UUID filenames). */
    upsert?: boolean;
  },
): Promise<UploadPostMediaImageResult> {
  const { storagePath, body, contentType, upsert = false } = params;

  const { error } = await client.storage.from(POST_MEDIA_BUCKET).upload(storagePath, body, {
    contentType,
    upsert,
    cacheControl: "3600",
  });

  if (error) {
    return { ok: false, message: tidyStorageError(error) };
  }

  const { data } = client.storage.from(POST_MEDIA_BUCKET).getPublicUrl(storagePath);
  const publicUrl = data.publicUrl?.trim();
  if (!publicUrl) {
    return { ok: false, message: "Upload succeeded but public URL could not be resolved — check bucket visibility." };
  }

  return { ok: true, storagePath, publicUrl };
}

/** Builds the browser/CDN URL for an object already stored at `storagePath`. */
export function getPostMediaPublicUrl(client: Client, storagePath: string): string {
  const { data } = client.storage.from(POST_MEDIA_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export type RemoveStorageObjectsResult = { ok: true } | { ok: false; message: string };

/** Deletes objects by full path inside the bucket (e.g. `["uuid/file.jpg"]`). */
export async function removePostMediaObjects(client: Client, paths: string[]): Promise<RemoveStorageObjectsResult> {
  if (!paths.length) {
    return { ok: true };
  }

  const { error } = await client.storage.from(POST_MEDIA_BUCKET).remove(paths);
  if (error) {
    return { ok: false, message: tidyStorageError(error) };
  }
  return { ok: true };
}

export type ListPostMediaFolderResult =
  | { ok: true; names: string[] }
  | { ok: false; message: string };

/**
 * Lists immediate children under `{postId}/` so we can clear them before a replacement upload.
 */
export async function listPostMediaObjectNamesInPostFolder(
  client: Client,
  postId: string,
): Promise<ListPostMediaFolderResult> {
  const folder = postId.trim();
  const { data, error } = await client.storage.from(POST_MEDIA_BUCKET).list(folder, { limit: 100 });

  if (error) {
    return { ok: false, message: tidyStorageError(error) };
  }

  const names = (data ?? []).map((entry) => entry.name).filter(Boolean);
  return { ok: true, names };
}
