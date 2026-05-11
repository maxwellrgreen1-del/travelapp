import type { SupabaseClient } from "@supabase/supabase-js";

import type { TravelPostComment } from "@/types";
import type { Database } from "@/lib/supabase/types";
import { initialsFromProfile } from "@/lib/userDisplay";

type Client = SupabaseClient<Database>;

/** Mirrors the SSR thread cap until pagination ships. */
const THREAD_LIMIT = 150;

export type CommentsLoadPack = {
  items: TravelPostComment[];
  count: number;
  errorMessage: string | null;
};

/**
 * Hydrates readable comments for one post plus the total tally (handles rows beyond `THREAD_LIMIT`).
 */
export async function loadCommentsForPost(supabase: Client, postId: string): Promise<CommentsLoadPack> {
  const head = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", postId);

  if (head.error) {
    return { items: [], count: 0, errorMessage: head.error.message || "Comments did not sync from Supabase yet." };
  }

  const { data: rows, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(THREAD_LIMIT);

  if (error) {
    return {
      items: [],
      count: typeof head.count === "number" ? head.count : 0,
      errorMessage: error.message || "Could not stitch the campfire thread.",
    };
  }

  const list = rows ?? [];
  if (!list.length) {
    return { items: [], count: typeof head.count === "number" ? head.count : 0, errorMessage: null };
  }

  const authorIds = [...new Set(list.map((r) => r.author_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", authorIds);

  if (profilesError) {
    return {
      items: [],
      count: typeof head.count === "number" ? head.count : 0,
      errorMessage: profilesError.message || "Comment authors vanished mid-sync — retry shortly.",
    };
  }

  const profMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const items: TravelPostComment[] = list.map((row) => {
    const profile = profMap[row.author_id];
    const username = profile?.username ?? "explorer";
    const displayName = profile?.display_name ?? null;

    return {
      id: row.id,
      authorId: row.author_id,
      username,
      displayName,
      avatarUrl: profile?.avatar_url?.trim() || undefined,
      initials: initialsFromProfile(username, displayName),
      body: row.body,
      postedAtISO: row.created_at,
    };
  });

  return {
    items,
    count: typeof head.count === "number" ? head.count : items.length,
    errorMessage: null,
  };
}
