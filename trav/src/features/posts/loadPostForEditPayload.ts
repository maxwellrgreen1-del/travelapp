import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type PostForEditPayload = {
  title: string;
  locationDisplay: string;
  description: string;
  journal: string;
  placeNames: string[];
  /** Existing map pin from `posts` when present — seeds autocomplete coordinate lock. */
  mapLatitude: number | null;
  mapLongitude: number | null;
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

  const latRaw = post.map_latitude;
  const lngRaw = post.map_longitude;
  const mapLatitude =
    latRaw != null && Number.isFinite(Number(latRaw)) && Math.abs(Number(latRaw)) <= 90 ? Number(latRaw) : null;
  const mapLongitude =
    lngRaw != null && Number.isFinite(Number(lngRaw)) && Math.abs(Number(lngRaw)) <= 180 ? Number(lngRaw) : null;

  return {
    kind: "ok",
    data: {
      title: post.title?.trim() || "",
      locationDisplay: post.location_display?.trim() || "",
      description: post.description?.trim() || "",
      journal: post.journal?.trim() || "",
      placeNames: placeNames.length ? placeNames : [""],
      mapLatitude,
      mapLongitude,
    },
  };
}
