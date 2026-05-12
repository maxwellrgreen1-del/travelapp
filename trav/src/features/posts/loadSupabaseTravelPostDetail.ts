import type { TravelPostDetail } from "@/types";

import { loadCommentsForPost } from "@/features/posts/comments/loadCommentsForPost";
import { createClient } from "@/lib/supabase/server";
import { isPersistentPostId } from "@/lib/postIds";
import { SUPABASE_TRAVEL_CARD_IMAGE_ALT, SUPABASE_TRAVEL_CARD_IMAGE_URL } from "@/lib/travelPostPlaceholders";
import { initialsFromProfile } from "@/lib/userDisplay";

/**
 * When the URL does not resolve to a seeded mock ID, hydrate from Supabase (public posts readable to everyone;
 * private posts only when the SSR session owns the row — RLS enforces visibility).
 */
export async function loadSupabaseTravelPostDetail(requestedId: string): Promise<TravelPostDetail | null> {
  if (!isPersistentPostId(requestedId)) {
    return null;
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase.from("posts").select("*").eq("id", requestedId).maybeSingle();

  if (postError || !post) {
    return null;
  }

  const { data: author, error: authorError } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", post.author_id)
    .maybeSingle();

  if (authorError || !author) {
    return null;
  }

  const { data: stops, error: stopsError } = await supabase
    .from("post_locations")
    .select("name")
    .eq("post_id", requestedId)
    .order("sort_order", { ascending: true });

  if (stopsError) {
    return null;
  }

  const placesVisited = (stops ?? []).map((row) => row.name);

  const locationLine = post.location_display?.trim() || "Waypoint trail";

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const viewerId = authUser?.id ?? null;

  const totalLikesPromise = supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", requestedId);

  const emptyViewer = Promise.resolve({ data: null, error: null });

  const viewerLikePromise = viewerId
    ? supabase.from("likes").select("post_id").eq("post_id", requestedId).eq("user_id", viewerId).maybeSingle()
    : emptyViewer;

  const viewerSavePromise = viewerId
    ? supabase.from("saves").select("post_id").eq("post_id", requestedId).eq("user_id", viewerId).maybeSingle()
    : emptyViewer;

  const commentsPromise = loadCommentsForPost(supabase, requestedId);

  const postMediaPromise = supabase
    .from("post_media")
    .select("media_url, alt_text, sort_order")
    .eq("post_id", requestedId)
    .order("sort_order", { ascending: true });

  const [likesHead, viewerLikeRes, viewerSaveRes, commentsPack, postMediaRes] = await Promise.all([
    totalLikesPromise,
    viewerLikePromise,
    viewerSavePromise,
    commentsPromise,
    postMediaPromise,
  ]);

  const likesCount =
    likesHead.error || typeof likesHead.count !== "number" ? 0 : likesHead.count;

  const mediaRows = postMediaRes.error ? [] : (postMediaRes.data ?? []);
  const gallery = mediaRows
    .map((row) => {
      const url = row.media_url?.trim();
      if (!url) return null;
      return {
        url,
        alt: row.alt_text?.trim() || SUPABASE_TRAVEL_CARD_IMAGE_ALT,
      };
    })
    .filter((row): row is { url: string; alt: string } => Boolean(row));

  const heroUrl = gallery[0]?.url;
  const heroAlt = gallery[0]?.alt;

  const viewerIsAuthor = Boolean(viewerId && viewerId === post.author_id);

  return {
    id: post.id,
    authorId: post.author_id,
    viewerIsAuthor,
    username: author.username,
    userInitials: initialsFromProfile(author.username, author.display_name ?? null),
    avatarUrl: author.avatar_url?.trim() || undefined,
    locationDisplay: locationLine,
    imageUrl: heroUrl || SUPABASE_TRAVEL_CARD_IMAGE_URL,
    imageAlt: heroAlt || SUPABASE_TRAVEL_CARD_IMAGE_ALT,
    mediaGallery: gallery.length > 1 ? gallery : undefined,
    title: post.title,
    description: post.description ?? "",
    likesCount,
    commentsCount: commentsPack.count,
    viewerHasLiked: Boolean(viewerLikeRes.data),
    viewerHasSaved: Boolean(viewerSaveRes.data),
    destinationTags: [],
    postedAtISO: post.created_at,
    journal:
      post.journal?.trim() ??
      "No long-form journal block was saved yet — edit this recap soon or layer storage frames first.",
    placesVisited,
    restaurants: [],
    externalLinks: [],
    commentPreview: [],
    commentsFromDb: commentsPack.items,
    commentsLoadError: commentsPack.errorMessage,
  };
}
