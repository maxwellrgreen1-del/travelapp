import { POST_MEDIA_BUCKET } from "@/lib/supabase/storage";

/**
 * Turns a public `post_media.media_url` back into a `{postId}/file.ext` path for `storage.remove`.
 * Returns null when the URL is not from our public bucket pattern (external URLs stay untouched).
 */
export function tryExtractPostMediaStoragePathFromUrl(mediaUrl: string): string | null {
  const url = mediaUrl.trim();
  if (!url) {
    return null;
  }

  const marker = `/object/public/${POST_MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) {
    return null;
  }

  const path = url.slice(idx + marker.length).split("?")[0]?.trim();
  return path?.length ? path : null;
}
