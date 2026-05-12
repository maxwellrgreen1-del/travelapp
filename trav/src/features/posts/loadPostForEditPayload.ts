import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type PostForEditPayload = {
  title: string;
  locationDisplay: string;
  description: string;
  journal: string;
  placeNames: string[];
};

export type LoadPostForEditResult =
  | { kind: "ok"; data: PostForEditPayload }
  | { kind: "not_found" }
  | { kind: "forbidden" };

/**
 * Loads editable fields for a post when the caller is the author (RLS also enforces reads).
 */
export async function loadPostForEditPayload(
  supabase: Client,
  postId: string,
  viewerId: string,
): Promise<LoadPostForEditResult> {
  const { data: post, error: postError } = await supabase.from("posts").select("*").eq("id", postId).maybeSingle();

  if (postError || !post) {
    return { kind: "not_found" };
  }

  if (post.author_id !== viewerId) {
    return { kind: "forbidden" };
  }

  const { data: stops, error: stopsError } = await supabase
    .from("post_locations")
    .select("name")
    .eq("post_id", postId)
    .order("sort_order", { ascending: true });

  if (stopsError) {
    return { kind: "not_found" };
  }

  const placeNames = (stops ?? []).map((row) => row.name.trim()).filter(Boolean);

  return {
    kind: "ok",
    data: {
      title: post.title?.trim() || "",
      locationDisplay: post.location_display?.trim() || "",
      description: post.description?.trim() || "",
      journal: post.journal?.trim() || "",
      placeNames: placeNames.length ? placeNames : [""],
    },
  };
}
