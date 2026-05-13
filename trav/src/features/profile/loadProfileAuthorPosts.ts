import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { parseStoredMapCoordinatePair } from "@/lib/geo/parseStoredCoordinate";
import { pickPrimaryMediaByPostId } from "@/lib/media/pickPrimaryMediaUrlByPost";
import { SUPABASE_TRAVEL_CARD_IMAGE_ALT, SUPABASE_TRAVEL_CARD_IMAGE_URL } from "@/lib/travelPostPlaceholders";

type Client = SupabaseClient<Database>;

/** One masonry tile backing data — synced from Postgres, still photo-forward once media uploads land. */
export type ProfileAuthorGridPost = {
  id: string;
  /** Same as the profile being viewed — used for owner-only grid controls. */
  authorId: string;
  title: string;
  locationDisplay: string;
  imageUrl: string;
};

/** One geocoded recap for the interactive profile map. */
export type ProfileAuthorMapPin = {
  postId: string;
  lat: number;
  lng: number;
  title: string;
  locationName: string;
  imageUrl: string;
  captionSnippet: string;
};

export type ProfileAuthorPostsPack =
  | {
      ok: true;
      posts: ProfileAuthorGridPost[];
      mapPins: ProfileAuthorMapPin[];
      postsWithoutMapCoordinates: ProfileAuthorGridPost[];
      totalPublished: number;
      /** False when DB has no map columns yet (migration not applied) — all posts surface in the fallback list. */
      mapColumnsAvailable: boolean;
    }
  | { ok: false; message: string };

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const trimmed = error.message.trim();
    if (trimmed.length) return trimmed;
  }
  return "Could not sync your logs — retry in a blink.";
}

function isMissingMapColumnError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("map_latitude") || m.includes("map_longitude");
}

/** Largest grid we hydrate on profile; total count stays exact via `{ count: 'exact' }`. */
const PROFILE_GRID_LIMIT = 60;

const POST_SELECT_WITH_MAP =
  "id, author_id, title, location_display, description, map_latitude, map_longitude" as const;
const POST_SELECT_BASE = "id, author_id, title, location_display, description" as const;

type PostRowFull = {
  id: string;
  author_id: string;
  title: string | null;
  location_display: string | null;
  description: string | null;
  map_latitude: number | string | null;
  map_longitude: number | string | null;
};

type PostRowBase = Omit<PostRowFull, "map_latitude" | "map_longitude">;

function buildPackFromRows(
  rows: readonly (PostRowFull | PostRowBase)[],
  totalPublished: number,
  mapColumnsAvailable: boolean,
  mediaRows: { post_id: string; media_url: string; sort_order: number; alt_text: string | null }[],
): Extract<ProfileAuthorPostsPack, { ok: true }> {
  const primaryByPost = pickPrimaryMediaByPostId(mediaRows, SUPABASE_TRAVEL_CARD_IMAGE_ALT);

  const posts: ProfileAuthorGridPost[] = [];
  const mapPins: ProfileAuthorMapPin[] = [];
  const postsWithoutMapCoordinates: ProfileAuthorGridPost[] = [];

  for (const row of rows) {
    const hero = primaryByPost.get(row.id);
    const imageUrl = hero?.url ?? SUPABASE_TRAVEL_CARD_IMAGE_URL;
    const title = row.title?.trim() || "Untitled trail";
    const locationDisplay = row.location_display?.trim() || "Waypoint trail";
    const gridPost: ProfileAuthorGridPost = {
      id: row.id,
      authorId: row.author_id,
      title,
      locationDisplay,
      imageUrl,
    };
    posts.push(gridPost);

    let coords: { lat: number; lng: number } | null = null;
    if (mapColumnsAvailable && "map_latitude" in row && "map_longitude" in row) {
      coords = parseStoredMapCoordinatePair(row.map_latitude, row.map_longitude);
    }

    if (coords) {
      const desc = (row.description ?? "").trim();
      const snippet = desc.length > 100 ? `${desc.slice(0, 97)}…` : desc || title;
      mapPins.push({
        postId: row.id,
        lat: coords.lat,
        lng: coords.lng,
        title,
        locationName: locationDisplay,
        imageUrl,
        captionSnippet: snippet,
      });
    } else {
      postsWithoutMapCoordinates.push(gridPost);
    }
  }

  return { ok: true, posts, mapPins, postsWithoutMapCoordinates, totalPublished, mapColumnsAvailable };
}

/**
 * Loads an author's posts for the profile grid, interactive map pins, and the “no coordinates” fallback list.
 * If `map_*` columns are missing in Postgres, retries without them so the profile still loads.
 */
export async function loadProfileAuthorPosts(client: Client, authorId: string): Promise<ProfileAuthorPostsPack> {
  let mapColumnsAvailable = true;

  const withMap = await client
    .from("posts")
    .select(POST_SELECT_WITH_MAP, { count: "exact" })
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(PROFILE_GRID_LIMIT);

  let rows: (PostRowFull | PostRowBase)[] = [];
  let count: number | null | undefined = withMap.count;

  if (withMap.error) {
    const msg = withMap.error.message ?? "";
    if (isMissingMapColumnError(msg)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[loadProfileAuthorPosts] Map coordinate columns missing on `posts`. Run migrations (see supabase/migrations). Retrying without map fields.",
        );
      }
      mapColumnsAvailable = false;
      const base = await client
        .from("posts")
        .select(POST_SELECT_BASE, { count: "exact" })
        .eq("author_id", authorId)
        .order("created_at", { ascending: false })
        .limit(PROFILE_GRID_LIMIT);

      if (base.error) {
        return { ok: false, message: tidyMessage(base.error) };
      }
      rows = (base.data ?? []) as PostRowBase[];
      count = base.count;
    } else {
      return { ok: false, message: tidyMessage(withMap.error) };
    }
  } else {
    rows = (withMap.data ?? []) as PostRowFull[];
    count = withMap.count;
  }

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

  return buildPackFromRows(rows, totalPublished, mapColumnsAvailable, mediaRows);
}
