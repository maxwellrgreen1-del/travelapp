import type { ImageValidationSuccess } from "@/lib/media/validateImageFile";

const extByContentType: Record<ImageValidationSuccess["contentType"], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Collision-resistant object key tail (`{uuid}.jpg`) — prefix with `postId/` in storage helpers.
 */
export function buildUniqueImageObjectName(contentType: ImageValidationSuccess["contentType"]): string {
  const ext = extByContentType[contentType];
  const id =
    typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${id}.${ext}`;
}
