import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type ProfileFollowCounts = {
  followers: number;
  following: number;
};

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Could not load follow counts.";
}

/**
 * Follower tally = rows where `following_id` is this profile.
 * Following tally = rows where `follower_id` is this profile.
 */
export async function fetchProfileFollowCounts(
  client: Client,
  profileId: string,
): Promise<{ ok: true; counts: ProfileFollowCounts } | { ok: false; message: string }> {
  const [followersRes, followingRes] = await Promise.all([
    client.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId),
    client.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileId),
  ]);

  if (followersRes.error) {
    return { ok: false, message: tidyMessage(followersRes.error) };
  }
  if (followingRes.error) {
    return { ok: false, message: tidyMessage(followingRes.error) };
  }

  const followers = typeof followersRes.count === "number" ? followersRes.count : 0;
  const following = typeof followingRes.count === "number" ? followingRes.count : 0;

  return { ok: true, counts: { followers, following } };
}

/** True when the signed-in viewer already follows `targetProfileId`. */
export async function fetchViewerFollowsTarget(
  client: Client,
  viewerId: string,
  targetProfileId: string,
): Promise<{ ok: true; following: boolean } | { ok: false; message: string }> {
  if (viewerId === targetProfileId) {
    return { ok: true, following: false };
  }

  const { data, error } = await client
    .from("follows")
    .select("following_id")
    .eq("follower_id", viewerId)
    .eq("following_id", targetProfileId)
    .maybeSingle();

  if (error) {
    return { ok: false, message: tidyMessage(error) };
  }

  return { ok: true, following: Boolean(data) };
}
