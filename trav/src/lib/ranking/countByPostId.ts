/**
 * Build `{ [postId]: n }` tallies from Supabase rows that carry a `post_id`.
 * Used for lightweight engagement counts without SQL GROUP BY.
 */
export function countByPostId(rows: { post_id: string }[] | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!rows?.length) {
    return out;
  }
  for (const row of rows) {
    out[row.post_id] = (out[row.post_id] ?? 0) + 1;
  }
  return out;
}

/** Count public posts per author — lightweight “active profile” signal for search ranking. */
export function countByAuthorId(rows: { author_id: string }[] | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!rows?.length) {
    return out;
  }
  for (const row of rows) {
    out[row.author_id] = (out[row.author_id] ?? 0) + 1;
  }
  return out;
}
