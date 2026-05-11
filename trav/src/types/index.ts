/**
 * Shared domain types will live here.
 * Mock-friendly shapes evolve into Sup-backed models later.
 */

export type Id = string;

export type TravelFeedPost = {
  id: Id;
  username: string;
  userInitials: string;
  /** Optional staged portrait URLs before Supabase media lands. */
  avatarUrl?: string;
  /** Display place string like "Laguna Llaca · Peru". */
  locationDisplay: string;
  /** Scenic preview for the itinerary card — becomes multi-media later. */
  imageUrl: string;
  imageAlt: string;
  title: string;
  /** Short teaser under the headline. */
  description: string;
  likesCount: number;
  commentsCount: number;
  /** Present on Supabase-backed cards when the session is known during SSR. */
  viewerHasLiked?: boolean;
  viewerHasSaved?: boolean;
  /** Hashtagged city or region vibes. */
  destinationTags?: string[];
  /** Up to a few waypoint names for the feed teaser (maps from `post_locations`). */
  placesPreview?: string[];
  postedAtISO: string;
};

export type TravelPostCommentPreview = {
  id: Id;
  authorUsername: string;
  authorInitials: string;
  excerpt: string;
  postedAtISO: string;
};

/** Full traveller log once detail views hydrate richer copy than timeline cards allow. */
export type TravelPostDetail = TravelFeedPost & {
  journal: string;
  placesVisited: string[];
  restaurants: string[];
  externalLinks: { label: string; url: string }[];
  commentPreview: TravelPostCommentPreview[];
};
