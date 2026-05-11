/**
 * Mirrors the database rule `username = lower(username)` before writes.
 */
export function normalizeTrailUsername(raw: string): string {
  return raw.trim().toLowerCase();
}
