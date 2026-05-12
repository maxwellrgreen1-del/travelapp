import type { TravelFeedPost } from "@/types";

import { mockTravelPosts } from "@/features/feed/mockTravelPosts";
import { hydrateFeedEngagement } from "@/features/engagement/hydrateFeedEngagement";
import type { Database } from "@/lib/supabase/types";
import { groupPostMediaGalleriesByPostId } from "@/lib/media/groupPostMediaGalleries";
import { pickPrimaryMediaByPostId } from "@/lib/media/pickPrimaryMediaUrlByPost";
import { SUPABASE_TRAVEL_CARD_IMAGE_ALT, SUPABASE_TRAVEL_CARD_IMAGE_URL } from "@/lib/travelPostPlaceholders";
import { initialsFromProfile } from "@/lib/userDisplay";
import { createClient } from "@/lib/supabase/server";

/** Small first page — infinite scroll deliberately skipped for MVP. */
const FEED_LIMIT = 30;

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "username" | "display_name" | "avatar_url">;
type LocationRow = Pick<Database["public"]["Tables"]["post_locations"]["Row"], "post_id" | "name" | "sort_order">;

export type HomeFeedResult =
  | { type: "success"; posts: TravelFeedPost[]; usedMockFallback: boolean }
  | { type: "error"; message: string };

function groupPlacesByPostId(rows: LocationRow[] | null): Record<string, string[]> {
  const buckets: Record<string, string[]> = {};

  if (!rows?.length) {
    return buckets;
  }

  for (const row of rows) {
    if (!buckets[row.post_id]) {
      buckets[row.post_id] = [];
    }
    buckets[row.post_id]!.push(row.name);
  }

  return buckets;
}

/** First few stops surfaced on cards — capped for skim-friendly lines. */
const PLACES_PREVIEW_LIMIT = 4;

function rowToTravelFeedPost(
  post: PostRow,
  author: ProfileRow,
  orderedPlaceNames: string[],
  engagement: { likeCount: number; viewerHasLiked: boolean; viewerHasSaved: boolean },
  cardImage?: { url: string; alt: string },
  mediaGallery?: { url: string; alt: string }[],
): TravelFeedPost {
  const placesPreview =
    orderedPlaceNames.length > 0 ? orderedPlaceNames.slice(0, PLACES_PREVIEW_LIMIT) : undefined;

  const locationDisplay = post.location_display?.trim() || "Waypoint trail";

  return {
    id: post.id,
    username: author.username,
    userInitials: initialsFromProfile(author.username, author.display_name ?? null),
    avatarUrl: author.avatar_url?.trim() || undefined,
    locationDisplay,
    imageUrl: cardImage?.url ?? SUPABASE_TRAVEL_CARD_IMAGE_URL,
    imageAlt: cardImage?.alt ?? SUPABASE_TRAVEL_CARD_IMAGE_ALT,
    mediaGallery,
    title: post.title,
    description: post.description?.trim() ?? "",
    likesCount: engagement.likeCount,
    commentsCount: 0,
    viewerHasLiked: engagement.viewerHasLiked,
    viewerHasSaved: engagement.viewerHasSaved,
    destinationTags: [],
    postedAtISO: post.created_at,
    placesPreview,
  };
}

function friendlyFetchError(reason: unknown): string {
  if (reason && typeof reason === "object" && "message" in reason && typeof reason.message === "string") {
    const trimmed = reason.message.trim();
    if (trimmed.length) {
      return trimmed;
    }
  }
  return "We could not load the live trail yet — check your signal and retry.";
}

/**
 * Hydrates `/` with readable public posts, falling back to the curated mock runway when Postgres is quiet.
 */
export async function loadHomeFeedPayload(): Promise<HomeFeedResult> {
  const supabase = await createClient();

  const postsResponse = await supabase
    .from("posts")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);

  if (postsResponse.error) {
    return {
      type: "error",
      message: friendlyFetchError(postsResponse.error),
    };
  }

  const postRows = postsResponse.data ?? [];

  if (!postRows.length) {
    return {
      type: "success",
      posts: mockTravelPosts,
      usedMockFallback: true,
    };
  }

  const authorIds = [...new Set(postRows.map((row) => row.author_id))];
  const postIds = postRows.map((row) => row.id);

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const viewerId = authUser?.id ?? null;

  async function fetchOrderedLocations(): Promise<{ data: LocationRow[] | null; error: unknown | null }> {
    if (!postIds.length) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("post_locations")
      .select("post_id, name, sort_order")
      .in("post_id", postIds)
      .order("post_id", { ascending: true })
      .order("sort_order", { ascending: true });

    return { data, error };
  }

  async function fetchPrimaryPostMedia(): Promise<{
    data: { post_id: string; media_url: string; sort_order: number; alt_text: string | null }[] | null;
    error: unknown | null;
  }> {
    if (!postIds.length) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("post_media")
      .select("post_id, media_url, sort_order, alt_text")
      .in("post_id", postIds);

    return { data, error };
  }

  const [profilesResponse, locationsResponse, engagementBundle, mediaResponse] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", authorIds),
    fetchOrderedLocations(),
    hydrateFeedEngagement(supabase, postIds, viewerId),
    fetchPrimaryPostMedia(),
  ]);

  if (profilesResponse.error) {
    return {
      type: "error",
      message: friendlyFetchError(profilesResponse.error),
    };
  }

  if (locationsResponse.error) {
    return {
      type: "error",
      message: friendlyFetchError(locationsResponse.error),
    };
  }

  if (!engagementBundle.ok) {
    return {
      type: "error",
      message: friendlyFetchError(engagementBundle.error),
    };
  }

  if (mediaResponse.error) {
    return {
      type: "error",
      message: friendlyFetchError(mediaResponse.error),
    };
  }

  const { likeCounts, viewerLiked, viewerSaved } = engagementBundle.snapshot;

  const primaryImageByPost = pickPrimaryMediaByPostId(mediaResponse.data ?? [], SUPABASE_TRAVEL_CARD_IMAGE_ALT);
  const galleriesByPost = groupPostMediaGalleriesByPostId(mediaResponse.data ?? [], SUPABASE_TRAVEL_CARD_IMAGE_ALT);

  const profilesById: Record<string, ProfileRow> = {};
  for (const profile of profilesResponse.data ?? []) {
    profilesById[profile.id] = profile as ProfileRow;
  }

  const locationBuckets = groupPlacesByPostId(locationsResponse.data);

  const feedPosts: TravelFeedPost[] = [];

  for (const post of postRows) {
    const author = profilesById[post.author_id];
    if (!author) {
      /** Skip orphaned rows politely — FK should prevent this, but keeps SSR resilient. */
      continue;
    }
    const stops = locationBuckets[post.id] ?? [];
    const orderedGallery = galleriesByPost.get(post.id);
    const cardImage =
      orderedGallery && orderedGallery.length > 0
        ? { url: orderedGallery[0]!.url, alt: orderedGallery[0]!.alt }
        : primaryImageByPost.get(post.id);
    const mediaGallery = orderedGallery && orderedGallery.length > 1 ? orderedGallery : undefined;
    feedPosts.push(
      rowToTravelFeedPost(post, author, stops, {
        likeCount: likeCounts[post.id] ?? 0,
        viewerHasLiked: viewerLiked.has(post.id),
        viewerHasSaved: viewerSaved.has(post.id),
      }, cardImage, mediaGallery),
    );
  }

  /** If filtering removed everything, degrade to mock instead of printing an empty feed. */
  if (!feedPosts.length) {
    return {
      type: "success",
      posts: mockTravelPosts,
      usedMockFallback: true,
    };
  }

  return {
    type: "success",
    posts: feedPosts,
    usedMockFallback: false,
  };
}
