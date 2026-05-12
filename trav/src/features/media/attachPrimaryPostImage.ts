import type { SupabaseClient } from "@supabase/supabase-js";

import { buildUniqueImageObjectName } from "@/lib/media/buildUniqueImageObjectName";
import { validateImageFileAsync } from "@/lib/media/validateImageFile";
import type { Database } from "@/lib/supabase/types";
import {
  buildPostMediaStoragePath,
  listPostMediaObjectNamesInPostFolder,
  removePostMediaObjects,
  uploadPostMediaImage,
} from "@/lib/supabase/storage";

type Client = SupabaseClient<Database>;

export type AttachPrimaryPostImageOk = {
  ok: true;
  publicUrl: string;
  storagePath: string;
};

export type AttachPrimaryPostImageFail = { ok: false; message: string };

export type AttachPrimaryPostImageResult = AttachPrimaryPostImageOk | AttachPrimaryPostImageFail;

function tidyDbError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Could not save the image link to your post.";
}

/**
 * End-to-end “one hero image per post” pipeline:
 * validates → clears prior Storage objects under the post prefix → uploads → replaces `post_media` rows.
 *
 * Wire this from **Create Post** (after `publishTripPost` returns `postId`) or an edit screen later.
 * `authorId` is unused in-app today but documents the expected owner for RLS-aligned reviews.
 */
export async function attachPrimaryPostImageFromFile(
  client: Client,
  params: {
    postId: string;
    /** Post owner — must match `posts.author_id` for Storage RLS; reserved for future audit logging. */
    authorId: string;
    file: File;
    altText?: string | null;
  },
): Promise<AttachPrimaryPostImageResult> {
  const { postId, authorId, file, altText } = params;

  const { data: ownerRow, error: ownerErr } = await client.from("posts").select("author_id").eq("id", postId).maybeSingle();
  if (ownerErr || !ownerRow || ownerRow.author_id !== authorId) {
    return { ok: false, message: "That recap isn’t yours — open your own post and try again." };
  }

  const validated = await validateImageFileAsync(file);
  if (!validated.ok) {
    return { ok: false, message: validated.message };
  }

  const listed = await listPostMediaObjectNamesInPostFolder(client, postId);
  if (!listed.ok) {
    return { ok: false, message: listed.message };
  }
  if (listed.names.length > 0) {
    const paths = listed.names.map((name) => buildPostMediaStoragePath(postId, name));
    const removed = await removePostMediaObjects(client, paths);
    if (!removed.ok) {
      return { ok: false, message: removed.message };
    }
  }

  const { error: deleteMediaError } = await client.from("post_media").delete().eq("post_id", postId);
  if (deleteMediaError) {
    return { ok: false, message: tidyDbError(deleteMediaError) };
  }

  const objectName = buildUniqueImageObjectName(validated.contentType);
  const storagePath = buildPostMediaStoragePath(postId, objectName);

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return { ok: false, message: "Could not read that file — try another photo." };
  }

  const uploaded = await uploadPostMediaImage(client, {
    storagePath,
    body: buffer,
    contentType: validated.contentType,
    upsert: false,
  });

  if (!uploaded.ok) {
    return uploaded;
  }

  const { error: insertError } = await client.from("post_media").insert({
    post_id: postId,
    media_url: uploaded.publicUrl,
    sort_order: 0,
    alt_text: altText?.trim() || null,
  });

  if (insertError) {
    await removePostMediaObjects(client, [storagePath]);
    return { ok: false, message: tidyDbError(insertError) };
  }

  return { ok: true, publicUrl: uploaded.publicUrl, storagePath };
}
