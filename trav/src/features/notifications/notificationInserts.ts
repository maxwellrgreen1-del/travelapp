import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

/**
 * Fire-and-forget inbox rows. Never throws — engagement should stay smooth if notify fails.
 * RLS requires `actor_id = auth.uid()` on insert; callers must use the signed-in client.
 */
export async function tryInsertLikeNotification(client: Client, actorId: string, postId: string): Promise<void> {
  const { data: post, error: postError } = await client.from("posts").select("author_id").eq("id", postId).maybeSingle();
  if (postError || !post) {
    return;
  }
  if (post.author_id === actorId) {
    return;
  }

  const { error } = await client.from("notifications").insert({
    recipient_id: post.author_id,
    actor_id: actorId,
    type: "like",
    post_id: postId,
    comment_id: null,
  });

  if (error) {
    return;
  }
}

export async function tryInsertCommentNotification(
  client: Client,
  params: { actorId: string; postId: string; commentId: string },
): Promise<void> {
  const { data: post, error: postError } = await client.from("posts").select("author_id").eq("id", params.postId).maybeSingle();
  if (postError || !post) {
    return;
  }
  if (post.author_id === params.actorId) {
    return;
  }

  const { error } = await client.from("notifications").insert({
    recipient_id: post.author_id,
    actor_id: params.actorId,
    type: "comment",
    post_id: params.postId,
    comment_id: params.commentId,
  });

  if (error) {
    return;
  }
}

export async function tryInsertFollowNotification(client: Client, followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) {
    return;
  }

  const { error } = await client.from("notifications").insert({
    recipient_id: followingId,
    actor_id: followerId,
    type: "follow",
    post_id: null,
    comment_id: null,
  });

  if (error) {
    return;
  }
}
