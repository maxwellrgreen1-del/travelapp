export function normalizeExploreQuery(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Returns true when the needle is blank or appears inside blob (case-folded). */
export function blobMatchesExploreQuery(needle: string, blobParts: Array<string | undefined | null>): boolean {
  const q = normalizeExploreQuery(needle);
  if (!q) return true;

  const haystack = blobParts.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(q);
}
