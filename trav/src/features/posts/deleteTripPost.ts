import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { tryExtractPostMediaStoragePathFromUrl } from "@/lib/supabase/postMediaUrlToStoragePath";
import { listPostMediaObjectNamesInPostFolder, removePostMediaObjects } from "@/lib/supabase/storage";

type Client = SupabaseClient<Database>;

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Could not delete this travel log.";
}

/**
 * Deletes the post row (cascade cleans comments, likes, saves, locations, media rows, notifications).
 * Best-effort removal of objects in the `post-media` bucket for this post id.
 */
export async function deleteTripPost(
  supabase: Client,
  params: { postId: string; authorId: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { postId, authorId } = params;

  const { data: ownerRow, error: ownerErr } = await supabase.from("posts").select("id, author_id").eq("id", postId).maybeSingle();

  if (ownerErr || !ownerRow || ownerRow.author_id !== authorId) {
    return { ok: false, message: "That recap isn’t yours — open your own post to delete it." };
  }

  const { data: mediaRows, error: mediaErr } = await supabase.from("post_media").select("media_url").eq("post_id", postId);

  if (mediaErr) {
    return { ok: false, message: tidyMessage(mediaErr) };
  }

  const pathsFromDb = new Set<string>();
  for (const row of mediaRows ?? []) {
    const url = row.media_url?.trim();
    if (!url) continue;
    const path = tryExtractPostMediaStoragePathFromUrl(url);
    if (path) {
      pathsFromDb.add(path);
    }
  }

  const folderList = await listPostMediaObjectNamesInPostFolder(supabase, postId);
  if (folderList.ok) {
    for (const name of folderList.names) {
      pathsFromDb.add(`${postId}/${name}`);
    }
  }

  const { error: deletePostError } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", authorId);

  if (deletePostError) {
    return { ok: false, message: tidyMessage(deletePostError) };
  }

  const paths = [...pathsFromDb];
  if (paths.length > 0) {
    const removed = await removePostMediaObjects(supabase, paths);
    if (!removed.ok) {
      /** Post is already gone — orphan files are acceptable; surface a soft note only if you add telemetry. */
    }
  }

  return { ok: true };
}
