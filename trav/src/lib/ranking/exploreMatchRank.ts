/**
 * Text relevance tiers for explore search (client-side ranking on top of ILIKE hits).
 *
 * Priority (best → weakest):
 * 1. Exact match (case-insensitive)
 * 2. Starts-with match
 * 3. Partial / substring on titles, handles, locations, waypoints
 * 4. Description or bio substring (weaker than structured fields)
 */

export type ExplorePostMatchField = "title" | "location" | "waypoint" | "description";
export type ExploreProfileMatchField = "username" | "display_name" | "bio";

export type ExplorePostTextRank = {
  tier: 1 | 2 | 3 | 4;
  field: ExplorePostMatchField;
};

export type ExploreProfileTextRank = {
  tier: 1 | 2 | 3 | 4;
  field: ExploreProfileMatchField;
};

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

/** Strong-field tiers (title, username, location, …) — caller attaches which field matched. */
function strictTextTier(needle: string, haystack: string | null | undefined): 1 | 2 | 3 | null {
  const h = norm(haystack);
  const n = needle.trim().toLowerCase();
  if (!n || !h) {
    return null;
  }
  if (h === n) {
    return 1;
  }
  if (h.startsWith(n)) {
    return 2;
  }
  if (h.includes(n)) {
    return 3;
  }
  return null;
}

/** Pick the strongest match across title / location line / description / waypoint hit. */
export function rankExplorePostTextMatch(
  needleRaw: string,
  row: { title: string | null; description: string | null; location_display: string | null },
  matchedWaypointName: boolean,
): ExplorePostTextRank {
  const needle = needleRaw.trim().toLowerCase();
  const defaultRank: ExplorePostTextRank = { tier: 4, field: "description" };

  if (!needle) {
    return defaultRank;
  }

  const candidates: ExplorePostTextRank[] = [];

  const titleTier = strictTextTier(needle, row.title);
  if (titleTier) {
    candidates.push({ tier: titleTier, field: "title" });
  }

  const locTier = strictTextTier(needle, row.location_display);
  if (locTier) {
    candidates.push({ tier: locTier, field: "location" });
  }

  const desc = norm(row.description);
  if (desc.includes(needle)) {
    candidates.push({ tier: 4, field: "description" });
  }

  if (matchedWaypointName) {
    candidates.push({ tier: 3, field: "waypoint" });
  }

  if (!candidates.length) {
    return defaultRank;
  }

  return candidates.reduce((best, cur) => (compareExplorePostTextRank(cur, best) < 0 ? cur : best));
}

const POST_FIELD_ORDER: Record<ExplorePostMatchField, number> = {
  title: 0,
  location: 1,
  waypoint: 2,
  description: 3,
};

/** Negative if `a` should sort before `b` (a is better). */
export function compareExplorePostTextRank(a: ExplorePostTextRank, b: ExplorePostTextRank): number {
  if (a.tier !== b.tier) {
    return a.tier - b.tier;
  }
  return POST_FIELD_ORDER[a.field] - POST_FIELD_ORDER[b.field];
}

export function rankExploreProfileTextMatch(
  needleRaw: string,
  row: { username: string | null; display_name: string | null; bio: string | null },
): ExploreProfileTextRank {
  const needle = needleRaw.trim().toLowerCase();
  const fallback: ExploreProfileTextRank = { tier: 4, field: "bio" };

  if (!needle) {
    return fallback;
  }

  const candidates: ExploreProfileTextRank[] = [];

  const u = strictTextTier(needle, row.username);
  if (u) {
    candidates.push({ tier: u, field: "username" });
  }

  const d = strictTextTier(needle, row.display_name);
  if (d) {
    candidates.push({ tier: d, field: "display_name" });
  }

  const bio = norm(row.bio);
  if (bio.includes(needle)) {
    candidates.push({ tier: 4, field: "bio" });
  }

  if (!candidates.length) {
    return fallback;
  }

  return candidates.reduce((best, cur) => (compareExploreProfileTextRank(cur, best) < 0 ? cur : best));
}

const PROFILE_FIELD_ORDER: Record<ExploreProfileMatchField, number> = {
  username: 0,
  display_name: 1,
  bio: 2,
};

export function compareExploreProfileTextRank(a: ExploreProfileTextRank, b: ExploreProfileTextRank): number {
  if (a.tier !== b.tier) {
    return a.tier - b.tier;
  }
  return PROFILE_FIELD_ORDER[a.field] - PROFILE_FIELD_ORDER[b.field];
}
