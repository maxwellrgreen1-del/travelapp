import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Could not update follow — try again.";
}

export async function insertFollowEdge(
  client: Client,
  fields: { followerId: string; followingId: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (fields.followerId === fields.followingId) {
    return { ok: false, message: "You cannot follow yourself on tript." };
  }

  const { error } = await client.from("follows").insert({
    follower_id: fields.followerId,
    following_id: fields.followingId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    return { ok: false, message: tidyMessage(error) };
  }

  return { ok: true };
}

export async function deleteFollowEdge(
  client: Client,
  fields: { followerId: string; followingId: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await client
    .from("follows")
    .delete()
    .eq("follower_id", fields.followerId)
    .eq("following_id", fields.followingId);

  if (error) {
    return { ok: false, message: tidyMessage(error) };
  }

  return { ok: true };
}
