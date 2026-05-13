import type { SupabaseClient } from "@supabase/supabase-js";

import { buildProfileMapGeocodeQuery } from "@/lib/geo/buildProfileMapGeocodeQuery";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type SyncPostMapCoordinatesInput = {
  postId: string;
  authorId: string;
  /** `posts.location_display` — used when there are no waypoint names. */
  locationDisplay: string;
  /** Ordered waypoint labels from `post_locations` (first is combined with `location_display` when helpful). */
  placeNames: string[];
};

function devWarn(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.warn("[syncPostMapCoordinates]", ...args);
  }
}

/**
 * Best-effort: geocode a composed place string and store on `posts` for profile map pins.
 * Never throws. Geocode/network failures **leave existing coordinates unchanged** (no silent wipe on bad HTTP / empty body).
 * Coordinates are cleared only when there is no usable query string (author removed place context).
 *
 * Storage matches Nominatim: `lat` → `map_latitude`, `lon` (exposed as `lng` in JSON) → `map_longitude`.
 */
export async function syncPostMapCoordinates(
  supabase: Client,
  input: SyncPostMapCoordinatesInput,
): Promise<void> {
  const query = buildProfileMapGeocodeQuery(input.locationDisplay, input.placeNames);

  if (!query) {
    const { error } = await supabase
      .from("posts")
      .update({ map_latitude: null, map_longitude: null })
      .eq("id", input.postId)
      .eq("author_id", input.authorId);
    if (error) {
      devWarn("Could not clear map coordinates:", error.message);
    }
    return;
  }

  let response: Response;
  try {
    response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  } catch (error) {
    devWarn("Geocode request failed; keeping any existing map coordinates.", error);
    return;
  }

  if (!response.ok) {
    devWarn(`Geocode HTTP ${response.status}; keeping existing map coordinates.`);
    return;
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    devWarn("Geocode response was not JSON; keeping existing map coordinates.");
    return;
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("ok" in body) ||
    body.ok !== true ||
    !("lat" in body) ||
    !("lng" in body)
  ) {
    devWarn("Geocoder returned no coordinates for query:", query.slice(0, 80));
    return;
  }

  const lat = Number((body as { lat: unknown }).lat);
  const lng = Number((body as { lng: unknown }).lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    devWarn("Geocoder returned non-finite lat/lng; keeping existing map coordinates.");
    return;
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    devWarn("Geocoder returned out-of-range lat/lng; keeping existing map coordinates.", { lat, lng });
    return;
  }

  const { error } = await supabase
    .from("posts")
    .update({ map_latitude: lat, map_longitude: lng })
    .eq("id", input.postId)
    .eq("author_id", input.authorId);

  if (error) {
    devWarn("Supabase update of map coordinates failed:", error.message);
  }
}
