import type { SupabaseClient } from "@supabase/supabase-js";

import { buildUniqueImageObjectName } from "@/lib/media/buildUniqueImageObjectName";
import { validateImageFileAsync } from "@/lib/media/validateImageFile";
import type { Database } from "@/lib/supabase/types";
import {
  buildPostMediaStoragePath,
  removePostMediaObjects,
  uploadPostMediaImage,
} from "@/lib/supabase/storage";

type Client = SupabaseClient<Database>;

function tidyDbError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Could not save an image link to your post.";
}

export type GalleryImageFailure = {
  /** 1-based slot in the traveller’s original pick order. */
  slot: number;
  message: string;
};

export type AttachPostGalleryImagesResult = {
  /** How many images ended up in `post_media` after this run. */
  uploadedCount: number;
  failures: GalleryImageFailure[];
};

/**
 * After `publishTripPost` returns, uploads each file in order and inserts `post_media` with contiguous `sort_order`.
 * Failures are collected per slot — the post row is never deleted.
 */
export async function attachPostGalleryImagesFromFiles(
  client: Client,
  params: {
    postId: string;
    authorId: string;
    files: File[];
    altText?: string | null;
  },
): Promise<AttachPostGalleryImagesResult> {
  const { postId, authorId, files, altText } = params;
  const failures: GalleryImageFailure[] = [];
  let uploadedCount = 0;

  const { data: ownerRow, error: ownerErr } = await client.from("posts").select("author_id").eq("id", postId).maybeSingle();
  if (ownerErr || !ownerRow || ownerRow.author_id !== authorId) {
    return {
      uploadedCount: 0,
      failures: [{ slot: 1, message: "That recap isn’t yours — open your own post and try again." }],
    };
  }

  const alt = altText?.trim() || null;

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const slot = i + 1;

    const validated = await validateImageFileAsync(file);
    if (!validated.ok) {
      failures.push({ slot, message: validated.message });
      continue;
    }

    let buffer: ArrayBuffer;
    try {
      buffer = await file.arrayBuffer();
    } catch {
      failures.push({ slot, message: "Could not read that file — try another photo." });
      continue;
    }

    const objectName = buildUniqueImageObjectName(validated.contentType);
    const storagePath = buildPostMediaStoragePath(postId, objectName);

    const uploaded = await uploadPostMediaImage(client, {
      storagePath,
      body: buffer,
      contentType: validated.contentType,
      upsert: false,
    });

    if (!uploaded.ok) {
      failures.push({ slot, message: uploaded.message });
      continue;
    }

    const { error: insertError } = await client.from("post_media").insert({
      post_id: postId,
      media_url: uploaded.publicUrl,
      sort_order: uploadedCount,
      alt_text: alt,
    });

    if (insertError) {
      await removePostMediaObjects(client, [storagePath]);
      failures.push({ slot, message: tidyDbError(insertError) });
      continue;
    }

    uploadedCount += 1;
  }

  return { uploadedCount, failures };
}
