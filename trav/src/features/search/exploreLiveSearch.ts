import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExploreCategoryId, PopularExploreTrip, SuggestedExplorer } from "@/features/search/mockExploreData";
import { pickPrimaryMediaByPostId } from "@/lib/media/pickPrimaryMediaUrlByPost";
import { countByAuthorId, countByPostId } from "@/lib/ranking/countByPostId";
import {
  compareExplorePostTextRank,
  compareExploreProfileTextRank,
  rankExplorePostTextMatch,
  rankExploreProfileTextMatch,
} from "@/lib/ranking/exploreMatchRank";
import type { Database } from "@/lib/supabase/types";
import { SUPABASE_TRAVEL_CARD_IMAGE_ALT, SUPABASE_TRAVEL_CARD_IMAGE_URL } from "@/lib/travelPostPlaceholders";
import { initialsFromProfile } from "@/lib/userDisplay";

type Client = SupabaseClient<Database>;

/** Avoid noisy single-character scans and accidental wildcard injection in ILIKE. */
export const EXPLORE_LIVE_SEARCH_MIN_CHARS = 2;

const MAX_POST_ROWS = 30;
const MAX_PROFILE_ROWS = 20;
const MAX_LOCATION_PROBE_ROWS = 60;

function sanitizeIlikeNeedle(raw: string): string {
  /** Commas break PostgREST `or=(...)` parsing; `%` / `_` are LIKE wildcards. */
  return raw.trim().replace(/%/g, "").replace(/_/g, " ").replace(/,/g, " ").slice(0, 80);
}

export function shouldRunLiveExploreSearch(raw: string): boolean {
  return sanitizeIlikeNeedle(raw).length >= EXPLORE_LIVE_SEARCH_MIN_CHARS;
}

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Search hit a snag — try again in a moment.";
}

type PostSearchRow = Pick<
  Database["public"]["Tables"]["posts"]["Row"],
  "id" | "title" | "description" | "location_display" | "created_at"
>;

type ProfileSearchRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "username" | "display_name" | "avatar_url" | "bio"
>;

/**
 * Postgres ILIKE search across public posts (title, description, location line, waypoint names)
 * plus discoverable profiles (username, display name, bio). Results are re-ranked in-app for
 * match quality (exact → starts-with → partial → description/bio) and light popularity signals.
 */
export async function fetchExploreLiveResults(
  client: Client,
  rawQuery: string,
): Promise<
  | { ok: true; posts: PopularExploreTrip[]; profiles: SuggestedExplorer[] }
  | { ok: false; message: string }
> {
  const needle = sanitizeIlikeNeedle(rawQuery);
  if (needle.length < EXPLORE_LIVE_SEARCH_MIN_CHARS) {
    return { ok: true, posts: [], profiles: [] };
  }

  const pattern = `%${needle}%`;

  const postSelect = "id, title, description, location_display, created_at" as const;

  const [titleRes, descRes, locLineRes, locationIdsRes, userRes, displayRes, bioRes] = await Promise.all([
    client.from("posts").select(postSelect).eq("visibility", "public").ilike("title", pattern).order("created_at", { ascending: false }).limit(MAX_POST_ROWS),
    client
      .from("posts")
      .select(postSelect)
      .eq("visibility", "public")
      .ilike("description", pattern)
      .order("created_at", { ascending: false })
      .limit(MAX_POST_ROWS),
    client
      .from("posts")
      .select(postSelect)
      .eq("visibility", "public")
      .ilike("location_display", pattern)
      .order("created_at", { ascending: false })
      .limit(MAX_POST_ROWS),
    client.from("post_locations").select("post_id").ilike("name", pattern).limit(MAX_LOCATION_PROBE_ROWS),
    client.from("profiles").select("id, username, display_name, avatar_url, bio").eq("is_public", true).ilike("username", pattern).limit(MAX_PROFILE_ROWS),
    client
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .eq("is_public", true)
      .ilike("display_name", pattern)
      .limit(MAX_PROFILE_ROWS),
    client.from("profiles").select("id, username, display_name, avatar_url, bio").eq("is_public", true).ilike("bio", pattern).limit(MAX_PROFILE_ROWS),
  ]);

  for (const res of [titleRes, descRes, locLineRes, locationIdsRes, userRes, displayRes, bioRes]) {
    if (res.error) {
      return { ok: false, message: tidyMessage(res.error) };
    }
  }

  const fromColumns = [...(titleRes.data ?? []), ...(descRes.data ?? []), ...(locLineRes.data ?? [])] as PostSearchRow[];
  const locationPostIds = [...new Set((locationIdsRes.data ?? []).map((row) => row.post_id))];

  let fromWaypoints: PostSearchRow[] = [];
  if (locationPostIds.length > 0) {
    const waypointPosts = await client
      .from("posts")
      .select("id, title, description, location_display, created_at")
      .eq("visibility", "public")
      .in("id", locationPostIds)
      .order("created_at", { ascending: false })
      .limit(MAX_POST_ROWS);

    if (waypointPosts.error) {
      return { ok: false, message: tidyMessage(waypointPosts.error) };
    }
    fromWaypoints = (waypointPosts.data ?? []) as PostSearchRow[];
  }

  const merged = new Map<string, PostSearchRow>();
  for (const row of [...fromColumns, ...fromWaypoints]) {
    merged.set(row.id, row);
  }

  const mergedPosts = [...merged.values()];
  const postIds = mergedPosts.map((p) => p.id);
  const waypointHitSet = new Set((locationIdsRes.data ?? []).map((row) => row.post_id));

  const likeCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: likeRows, error: likesError } = await client.from("likes").select("post_id").in("post_id", postIds);
    if (likesError) {
      return { ok: false, message: tidyMessage(likesError) };
    }
    Object.assign(likeCounts, countByPostId(likeRows));
  }

  const orderedPosts = mergedPosts
    .sort((a, b) => {
      const ra = rankExplorePostTextMatch(needle, a, waypointHitSet.has(a.id));
      const rb = rankExplorePostTextMatch(needle, b, waypointHitSet.has(b.id));
      const tierCmp = compareExplorePostTextRank(ra, rb);
      if (tierCmp !== 0) {
        return tierCmp;
      }
      const likeA = Math.log1p(likeCounts[a.id] ?? 0);
      const likeB = Math.log1p(likeCounts[b.id] ?? 0);
      if (likeB !== likeA) {
        return likeB - likeA;
      }
      return a.created_at < b.created_at ? 1 : -1;
    })
    .slice(0, MAX_POST_ROWS);

  const rankedPostIds = orderedPosts.map((p) => p.id);
  const primaryImageByPost = new Map<string, string>();

  if (rankedPostIds.length > 0) {
    const { data: mediaRows, error: mediaError } = await client
      .from("post_media")
      .select("post_id, media_url, sort_order, alt_text")
      .in("post_id", rankedPostIds);

    if (mediaError) {
      return { ok: false, message: tidyMessage(mediaError) };
    }

    for (const [postId, card] of pickPrimaryMediaByPostId(mediaRows ?? [], SUPABASE_TRAVEL_CARD_IMAGE_ALT)) {
      primaryImageByPost.set(postId, card.url);
    }
  }

  const emptyCategories: ExploreCategoryId[] = [];

  const posts: PopularExploreTrip[] = orderedPosts.map((row) => ({
    id: row.id,
    title: row.title?.trim() || "Untitled trail",
    subtitle: (row.description?.trim() || row.location_display?.trim() || "Waypoint recap").slice(0, 140),
    imageUrl: primaryImageByPost.get(row.id) ?? SUPABASE_TRAVEL_CARD_IMAGE_URL,
    categories: emptyCategories,
  }));

  const profileMap = new Map<string, ProfileSearchRow>();
  for (const row of [...(userRes.data ?? []), ...(displayRes.data ?? []), ...(bioRes.data ?? [])]) {
    profileMap.set(row.id, row);
  }

  const profileRows = [...profileMap.values()];
  const profileIds = profileRows.map((row) => row.id);

  let publicPostsByAuthor: Record<string, number> = {};
  if (profileIds.length > 0) {
    const { data: authorPostRows, error: authorPostsError } = await client
      .from("posts")
      .select("author_id")
      .eq("visibility", "public")
      .in("author_id", profileIds);

    if (authorPostsError) {
      return { ok: false, message: tidyMessage(authorPostsError) };
    }
    publicPostsByAuthor = countByAuthorId(authorPostRows);
  }

  const sortedProfiles = [...profileRows].sort((a, b) => {
    const ra = rankExploreProfileTextMatch(needle, a);
    const rb = rankExploreProfileTextMatch(needle, b);
    const tierCmp = compareExploreProfileTextRank(ra, rb);
    if (tierCmp !== 0) {
      return tierCmp;
    }
    const postsA = publicPostsByAuthor[a.id] ?? 0;
    const postsB = publicPostsByAuthor[b.id] ?? 0;
    if (postsB !== postsA) {
      return postsB - postsA;
    }
    return (a.username ?? "").localeCompare(b.username ?? "");
  });

  const profiles: SuggestedExplorer[] = sortedProfiles.map((row) => {
    const username = row.username?.trim() || "traveler";
    const displayName = row.display_name?.trim() || username;
    const publicCount = publicPostsByAuthor[row.id] ?? 0;
    return {
      id: row.id,
      displayName,
      username,
      initials: initialsFromProfile(username, row.display_name ?? null),
      avatarUrl: row.avatar_url?.trim() || undefined,
      tagline: row.bio?.trim() || "Explorer on tript — say hi from their next recap.",
      followersLabel: publicCount > 0 ? `${publicCount} public tript logs` : "Public profile",
      signatureTags: emptyCategories,
    };
  });

  return { ok: true, posts, profiles };
}
