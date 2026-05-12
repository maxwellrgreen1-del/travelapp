import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

type PostgrestishError = {
  code?: string;
  message?: string;
};

export type UpdateTripPostInput = {
  postId: string;
  authorId: string;
  title: string;
  locationDisplay: string;
  description: string;
  journal: string;
  placeNames: string[];
};

function friendlyError(error: PostgrestishError | null): string {
  if (!error) {
    return "Could not save changes — try again.";
  }
  if (error.code === "42501") {
    return "Your session could not update this log — sign in again.";
  }
  const msg = error.message?.trim();
  return msg?.length ? msg : "Could not save changes — try again.";
}

/**
 * Updates `posts` text fields and replaces `post_locations` rows (delete + insert) like `publishTripPost`.
 */
export async function updateTripPost(
  supabase: Client,
  input: UpdateTripPostInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const journal = input.journal.trim() ? input.journal.trim() : null;
  const placeNames = input.placeNames.filter((name) => name.trim().length > 0).map((name) => name.trim());

  const { error: updateError } = await supabase
    .from("posts")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      journal,
      location_display: input.locationDisplay.trim(),
    })
    .eq("id", input.postId)
    .eq("author_id", input.authorId);

  if (updateError) {
    return { ok: false, message: friendlyError(updateError) };
  }

  const { error: deleteLocError } = await supabase.from("post_locations").delete().eq("post_id", input.postId);

  if (deleteLocError) {
    return { ok: false, message: friendlyError(deleteLocError) };
  }

  if (placeNames.length > 0) {
    const locationRows = placeNames.map((name, index) => ({
      post_id: input.postId,
      name,
      note: null as string | null,
      sort_order: index,
    }));

    const { error: insertLocError } = await supabase.from("post_locations").insert(locationRows);

    if (insertLocError) {
      return { ok: false, message: friendlyError(insertLocError) };
    }
  }

  return { ok: true };
}
