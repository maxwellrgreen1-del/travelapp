import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { pickPrimaryMediaByPostId } from "@/lib/media/pickPrimaryMediaUrlByPost";
import { SUPABASE_TRAVEL_CARD_IMAGE_ALT, SUPABASE_TRAVEL_CARD_IMAGE_URL } from "@/lib/travelPostPlaceholders";

type Client = SupabaseClient<Database>;

/** One masonry tile backing data — synced from Postgres, still photo-forward once media uploads land. */
export type ProfileAuthorGridPost = {
  id: string;
  title: string;
  locationDisplay: string;
  imageUrl: string;
};

export type ProfileAuthorPostsPack =
  | { ok: true; posts: ProfileAuthorGridPost[]; totalPublished: number }
  | { ok: false; message: string };

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const trimmed = error.message.trim();
    if (trimmed.length) return trimmed;
  }
  return "Could not sync your logs — retry in a blink.";
}

/** Largest grid we hydrate on profile; total count stays exact via `{ count: 'exact' }`. */
const PROFILE_GRID_LIMIT = 60;

/**
 * Loads the signed-in author's posts for the mantle grid plus the full tally for the stats stripe.
 */
export async function loadProfileAuthorPosts(client: Client, authorId: string): Promise<ProfileAuthorPostsPack> {
  const { data, error, count } = await client
    .from("posts")
    .select("id, title, location_display", { count: "exact" })
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(PROFILE_GRID_LIMIT);

  if (error) {
    return { ok: false, message: tidyMessage(error) };
  }

  const rows = data ?? [];
  const totalPublished = typeof count === "number" ? count : rows.length;

  const postIds = rows.map((row) => row.id);

  let mediaRows: { post_id: string; media_url: string; sort_order: number; alt_text: string | null }[] = [];
  if (postIds.length > 0) {
    const { data, error: mediaError } = await client
      .from("post_media")
      .select("post_id, media_url, sort_order, alt_text")
      .in("post_id", postIds);

    if (mediaError) {
      return { ok: false, message: tidyMessage(mediaError) };
    }
    mediaRows = data ?? [];
  }

  const primaryByPost = pickPrimaryMediaByPostId(mediaRows, SUPABASE_TRAVEL_CARD_IMAGE_ALT);

  const posts: ProfileAuthorGridPost[] = rows.map((row) => {
    const hero = primaryByPost.get(row.id);
    return {
      id: row.id,
      title: row.title?.trim() || "Untitled trail",
      locationDisplay: row.location_display?.trim() || "Waypoint trail",
      imageUrl: hero?.url ?? SUPABASE_TRAVEL_CARD_IMAGE_URL,
    };
  });

  return { ok: true, posts, totalPublished };
}
