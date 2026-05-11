/** One row from `post_media` — enough to resolve a hero thumbnail per post. */
export type PostMediaRow = {
  post_id: string;
  media_url: string;
  sort_order: number;
  alt_text?: string | null;
};

export type PrimaryMediaCard = {
  url: string;
  alt: string;
};

/**
 * Chooses the lowest `sort_order` row per post (MVP: single hero at `0`).
 */
export function pickPrimaryMediaByPostId(rows: PostMediaRow[], fallbackAlt: string): Map<string, PrimaryMediaCard> {
  const best = new Map<string, { sort: number; url: string; alt: string }>();

  for (const row of rows) {
    const url = row.media_url?.trim();
    if (!url) continue;

    const alt = row.alt_text?.trim() || fallbackAlt;
    const prev = best.get(row.post_id);
    if (!prev || row.sort_order < prev.sort) {
      best.set(row.post_id, { sort: row.sort_order, url, alt });
    }
  }

  return new Map([...best.entries()].map(([postId, payload]) => [postId, { url: payload.url, alt: payload.alt }]));
}
