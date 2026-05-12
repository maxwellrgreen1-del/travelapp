import type { SupabaseClient } from "@supabase/supabase-js";

import { tryInsertLikeNotification } from "@/features/notifications/notificationInserts";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

function tidyError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const msg = error.message.trim();
    if (msg.length) return msg;
  }
  return "Something went wrong — try again.";
}

/** Heart a readable post as the signed-in traveller. */
export async function likePost(supabase: Client, userId: string, postId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("likes").insert({ user_id: userId, post_id: postId });
  if (error) {
    return { ok: false, message: tidyError(error) };
  }
  void tryInsertLikeNotification(supabase, userId, postId);
  return { ok: true };
}

/** Remove this traveller's cheer row. */
export async function unlikePost(supabase: Client, userId: string, postId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("likes").delete().eq("user_id", userId).eq("post_id", postId);
  if (error) {
    return { ok: false, message: tidyError(error) };
  }
  return { ok: true };
}

/** Bookmark a readable post privately (counts stay hidden — only your row persists). */
export async function savePost(supabase: Client, userId: string, postId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("saves").insert({ user_id: userId, post_id: postId });
  if (error) {
    return { ok: false, message: tidyError(error) };
  }
  return { ok: true };
}

export async function unsavePost(supabase: Client, userId: string, postId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("saves").delete().eq("user_id", userId).eq("post_id", postId);
  if (error) {
    return { ok: false, message: tidyError(error) };
  }
  return { ok: true };
}
