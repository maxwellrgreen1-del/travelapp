import type { SavedDestinationPin } from "@/features/saved/mockSavedDestinations";
import type { Database } from "@/lib/supabase/types";
import { SUPABASE_TRAVEL_CARD_IMAGE_ALT, SUPABASE_TRAVEL_CARD_IMAGE_URL } from "@/lib/travelPostPlaceholders";
import type { SupabaseClient } from "@supabase/supabase-js";

type Client = SupabaseClient<Database>;
type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type ProfilePick = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "username" | "display_name">;
type SaveRow = Pick<Database["public"]["Tables"]["saves"]["Row"], "post_id" | "created_at">;
type LocRow = Pick<Database["public"]["Tables"]["post_locations"]["Row"], "post_id" | "name" | "sort_order">;

const RECAP_CATEGORY: SavedDestinationPin["categoryId"] = "from-feed";

function authorSubtitle(author: ProfilePick | undefined): string {
  if (!author) {
    return "Traveller on tript";
  }
  const display = author.display_name?.trim();
  if (display) {
    return `${display} · @${author.username}`;
  }
  return `@${author.username}`;
}

function buildWhySaved(description: string | null, places: string[]): string {
  const teaser = description?.trim();
  const placeLine =
    places.length > 0 ? `Stops you bookmarked: ${places.slice(0, 5).join(" → ")}${places.length > 5 ? " …" : ""}.` : null;

  if (teaser && placeLine) {
    return `${teaser}\n\n${placeLine}`;
  }
  if (teaser) {
    return teaser;
  }
  if (placeLine) {
    return placeLine;
  }
  return "You saved this recap from tript — open it for the full trail journal.";
}

function groupLocations(rows: LocRow[] | null): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  if (!rows?.length) {
    return map;
  }
  for (const row of rows) {
    if (!map[row.post_id]) {
      map[row.post_id] = [];
    }
    map[row.post_id]!.push(row.name);
  }
  return map;
}

function friendlyError(reason: unknown): string {
  if (reason && typeof reason === "object" && "message" in reason && typeof reason.message === "string") {
    const m = reason.message.trim();
    if (m.length) return m;
  }
  return "Could not load your saved posts — check your connection and try again.";
}

export type LoadSavedPinsResult =
  | { ok: true; pins: SavedDestinationPin[] }
  | { ok: false; message: string };

/**
 * Pulls the signed-in traveller's `saves` rows (newest bookmark first) and stitches post, author, and waypoint text.
 */
export async function loadSavedDestinationPinsForUser(supabase: Client, userId: string): Promise<LoadSavedPinsResult> {
  const { data: saves, error: savesError } = await supabase
    .from("saves")
    .select("post_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savesError) {
    return { ok: false, message: friendlyError(savesError) };
  }

  const saveRows = (saves ?? []) as SaveRow[];
  if (!saveRows.length) {
    return { ok: true, pins: [] };
  }

  const postIds = [...new Set(saveRows.map((s) => s.post_id))];

  const { data: posts, error: postsError } = await supabase.from("posts").select("*").in("id", postIds);

  if (postsError) {
    return { ok: false, message: friendlyError(postsError) };
  }

  const postById: Record<string, PostRow> = {};
  for (const post of posts ?? []) {
    postById[post.id] = post as PostRow;
  }

  const authorIds = [...new Set(Object.values(postById).map((p) => p.author_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", authorIds);

  if (profilesError) {
    return { ok: false, message: friendlyError(profilesError) };
  }

  const profileById: Record<string, ProfilePick> = {};
  for (const row of profiles ?? []) {
    profileById[row.id] = row as ProfilePick;
  }

  const { data: locationRows, error: locError } = await supabase
    .from("post_locations")
    .select("post_id, name, sort_order")
    .in("post_id", postIds)
    .order("post_id", { ascending: true })
    .order("sort_order", { ascending: true });

  if (locError) {
    return { ok: false, message: friendlyError(locError) };
  }

  const placesByPost = groupLocations(locationRows as LocRow[] | null);

  const pins: SavedDestinationPin[] = [];

  for (const save of saveRows) {
    const post = postById[save.post_id];
    if (!post) {
      /** RLS hid the row or it was deleted — bookmarks self-heal quietly. */
      continue;
    }

    const profile = profileById[post.author_id];
    const places = placesByPost[post.id] ?? [];
    const locationLine = post.location_display?.trim() || "Trail waypoint";

    const tags = places.length ? places.slice(0, 8) : [];

    pins.push({
      id: post.id,
      name: post.title,
      countryRegion: `${locationLine} · ${authorSubtitle(profile)}`,
      imageUrl: SUPABASE_TRAVEL_CARD_IMAGE_URL,
      imageAlt: SUPABASE_TRAVEL_CARD_IMAGE_ALT,
      whySaved: buildWhySaved(post.description, places),
      savedAtISO: save.created_at,
      tags,
      categoryId: RECAP_CATEGORY,
      relatedPostId: post.id,
      cardKind: "recap",
    });
  }

  return { ok: true, pins };
}
