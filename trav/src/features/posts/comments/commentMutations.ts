import type { SupabaseClient } from "@supabase/supabase-js";

import { tryInsertCommentNotification } from "@/features/notifications/notificationInserts";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

type DbCommentRow = Database["public"]["Tables"]["comments"]["Row"];

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Request failed — try again.";
}

export async function insertPostComment(
  supabase: Client,
  fields: { postId: string; authorId: string; body: string },
): Promise<{ ok: true; row: Pick<DbCommentRow, "id" | "post_id" | "author_id" | "body" | "created_at"> } | { ok: false; message: string }> {
  const trimmed = fields.body.trim();
  if (!trimmed) {
    return { ok: false, message: "Add a sentence so trail mates know why you surfaced." };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: fields.postId,
      author_id: fields.authorId,
      body: trimmed,
    })
    .select("id, post_id, author_id, body, created_at")
    .single();

  if (error || !data) {
    return { ok: false, message: tidyMessage(error) };
  }

  void tryInsertCommentNotification(supabase, {
    actorId: fields.authorId,
    postId: fields.postId,
    commentId: data.id,
  });

  return { ok: true, row: data };
}

export async function deleteOwnComment(supabase: Client, params: { commentId: string; authorId: string }): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("comments").delete().eq("id", params.commentId).eq("author_id", params.authorId);

  if (error) {
    return { ok: false, message: tidyMessage(error) };
  }

  return { ok: true };
}
