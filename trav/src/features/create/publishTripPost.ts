import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

type PostgrestishError = {
  code?: string;
  message?: string;
};

export type PublishTripPostInput = {
  authorId: string;
  title: string;
  /** Denormalised line for cards (`posts.location_display`). */
  locationDisplay: string;
  /** Short teaser (`posts.description`). */
  description: string;
  /** Long-form body (`posts.journal`) — empty string becomes null. */
  journal: string;
  visibility?: "public" | "private";
  /** Trimmed waypoint names inserted into `post_locations` in order. */
  placeNames: string[];
};

function friendlyPublishError(error: PostgrestishError | null): string {
  if (!error) {
    return "Could not publish this travel log. Please try again.";
  }
  if (error.code === "42501") {
    return "Your session could not publish — sign in again and retry.";
  }
  if (error.code === "23503") {
    return "Publishing needs a traveller profile row first — open Profile once so tript can finish setup.";
  }
  if (error.code === "PGRST116") {
    return "Something went sideways saving the recap — retry in a moment.";
  }

  const msg = error.message?.trim();
  return msg?.length ? msg : "Could not publish this travel log. Please try again.";
}

/**
 * Writes a recap to `posts` plus ordered rows in `post_locations`.
 * Rolls back the post row if waypoint inserts fail — keeps orphans out of Postgres.
 */
export async function publishTripPost(
  supabase: Client,
  input: PublishTripPostInput,
): Promise<{ ok: true; postId: string } | { ok: false; message: string }> {
  const visibility = input.visibility ?? "public";
  const journal = input.journal.trim() ? input.journal.trim() : null;
  const placeNames = input.placeNames.filter((name) => name.trim().length > 0).map((name) => name.trim());

  const { data: inserted, error: postError } = await supabase
    .from("posts")
    .insert({
      author_id: input.authorId,
      title: input.title.trim(),
      description: input.description.trim(),
      journal,
      visibility,
      location_display: input.locationDisplay.trim(),
    })
    .select("id")
    .single();

  if (postError || !inserted) {
    return { ok: false, message: friendlyPublishError(postError) };
  }

  const postId = inserted.id;

  if (placeNames.length > 0) {
    const locationRows = placeNames.map((name, index) => ({
      post_id: postId,
      name,
      note: null as string | null,
      sort_order: index,
    }));

    const { error: locationsError } = await supabase.from("post_locations").insert(locationRows);

    if (locationsError) {
      await supabase.from("posts").delete().eq("id", postId);
      return {
        ok: false,
        message: friendlyPublishError(locationsError),
      };
    }
  }

  return { ok: true, postId };
}
