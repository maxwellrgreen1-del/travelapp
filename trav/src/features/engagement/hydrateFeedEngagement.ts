import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

type LikeRow = Pick<Database["public"]["Tables"]["likes"]["Row"], "post_id" | "user_id">;
type SaveRow = Pick<Database["public"]["Tables"]["saves"]["Row"], "post_id">;

export type FeedEngagementSnapshot = {
  likeCounts: Record<string, number>;
  viewerLiked: Set<string>;
  viewerSaved: Set<string>;
};

/**
 * One likes scan builds public totals + discovers whether `viewerId` hearted each post.
 * Saves only hydrate for the viewer (strict RLS hides everyone else's bookmarks).
 */
export async function hydrateFeedEngagement(
  supabase: Client,
  postIds: string[],
  viewerId: string | null,
): Promise<{ ok: true; snapshot: FeedEngagementSnapshot } | { ok: false; error: unknown }> {
  if (!postIds.length) {
    return {
      ok: true,
      snapshot: {
        likeCounts: {},
        viewerLiked: new Set(),
        viewerSaved: new Set(),
      },
    };
  }

  const { data: likeRows, error: likesError } = await supabase
    .from("likes")
    .select("post_id, user_id")
    .in("post_id", postIds);

  if (likesError) {
    return { ok: false, error: likesError };
  }

  const likeCounts: Record<string, number> = {};
  const viewerLiked = new Set<string>();

  for (const row of (likeRows ?? []) as LikeRow[]) {
    likeCounts[row.post_id] = (likeCounts[row.post_id] ?? 0) + 1;
    if (viewerId && row.user_id === viewerId) {
      viewerLiked.add(row.post_id);
    }
  }

  let viewerSaved = new Set<string>();

  if (viewerId) {
    const { data: saveRows, error: savesError } = await supabase
      .from("saves")
      .select("post_id")
      .eq("user_id", viewerId)
      .in("post_id", postIds);

    if (savesError) {
      return { ok: false, error: savesError };
    }

    viewerSaved = new Set((saveRows as SaveRow[] | null)?.map((row) => row.post_id) ?? []);
  }

  return {
    ok: true,
    snapshot: {
      likeCounts,
      viewerLiked,
      viewerSaved,
    },
  };
}
