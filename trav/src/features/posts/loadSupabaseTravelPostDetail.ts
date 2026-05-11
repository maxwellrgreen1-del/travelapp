import type { TravelPostDetail } from "@/types";

import { createClient } from "@/lib/supabase/server";

/** Hero image when Storage-backed galleries are empty (matches tript moss / trail palette). */
const SUPABASE_POST_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&w=980&q=80&fit=crop";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function looksLikeUuid(id: string): boolean {
  return UUID_RE.test(id);
}

function initialsFromProfile(username: string, displayName: string | null): string {
  const name = displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

/**
 * When the URL does not resolve to a seeded mock ID, hydrate from Supabase (public posts readable to everyone;
 * private posts only when the SSR session owns the row — RLS enforces visibility).
 */
export async function loadSupabaseTravelPostDetail(requestedId: string): Promise<TravelPostDetail | null> {
  if (!looksLikeUuid(requestedId)) {
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

  return {
    id: post.id,
    username: author.username,
    userInitials: initialsFromProfile(author.username, author.display_name ?? null),
    avatarUrl: author.avatar_url?.trim() || undefined,
    locationDisplay: locationLine,
    imageUrl: SUPABASE_POST_PLACEHOLDER_IMAGE,
    imageAlt: "Travel journal collage placeholder until Supabase Storage frames land.",
    title: post.title,
    description: post.description ?? "",
    likesCount: 0,
    commentsCount: 0,
    destinationTags: [],
    postedAtISO: post.created_at,
    journal:
      post.journal?.trim() ??
      "No long-form journal block was saved yet — edit this recap soon or layer storage frames first.",
    placesVisited,
    restaurants: [],
    externalLinks: [],
    commentPreview: [],
  };
}
