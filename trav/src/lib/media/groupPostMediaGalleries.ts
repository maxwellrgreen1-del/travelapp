import type { PostMediaRow } from "@/lib/media/pickPrimaryMediaUrlByPost";

export type GallerySlide = { url: string; alt: string };

/**
 * Groups `post_media` rows per post, ordered by `sort_order` ascending (feed + detail carousels).
 */
export function groupPostMediaGalleriesByPostId(rows: PostMediaRow[], fallbackAlt: string): Map<string, GallerySlide[]> {
  const buckets = new Map<string, { url: string; alt: string; sort_order: number }[]>();

  for (const row of rows) {
    const url = row.media_url?.trim();
    if (!url) {
      continue;
    }
    const alt = row.alt_text?.trim() || fallbackAlt;
    const list = buckets.get(row.post_id) ?? [];
    list.push({ url, alt, sort_order: row.sort_order });
    buckets.set(row.post_id, list);
  }

  const out = new Map<string, GallerySlide[]>();
  for (const [postId, list] of buckets) {
    list.sort((a, b) => a.sort_order - b.sort_order);
    out.set(
      postId,
      list.map(({ url, alt }) => ({ url, alt })),
    );
  }
  return out;
}
