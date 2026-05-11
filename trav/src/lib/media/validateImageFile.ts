/** Browser `File.type` values we accept (plus common `image/jpg` alias). */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/** ~5 MB — comfortable for mobile signal without hammering Storage egress. */
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Pass to `<input type="file" accept={…} />` so the picker matches server-side validation. */
export const BROWSER_FILE_ACCEPT_IMAGES = "image/jpeg,image/jpg,image/png,image/webp";

export type ImageValidationSuccess = {
  ok: true;
  /** Normalised MIME for `Content-Type` on upload (maps `image/jpg` → `image/jpeg`). */
  contentType: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes: number;
};

export type ImageValidationFailure = {
  ok: false;
  message: string;
};

export type ImageValidationResult = ImageValidationSuccess | ImageValidationFailure;

function normaliseContentType(raw: string): ImageValidationSuccess["contentType"] | null {
  const lower = raw.trim().toLowerCase();
  if (lower === "image/jpeg" || lower === "image/jpg") return "image/jpeg";
  if (lower === "image/png") return "image/png";
  if (lower === "image/webp") return "image/webp";
  return null;
}

/**
 * Client-side gate before touching Supabase Storage — MIME allow-list + byte cap.
 * Call again server-side if you add an API route later (never trust the browser alone).
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!(file instanceof File)) {
    return { ok: false, message: "Pick a real image file from your device." };
  }

  const contentType = normaliseContentType(file.type);
  if (!contentType) {
    return {
      ok: false,
      message: "Use JPG, PNG, or WebP — other formats stay parked until tript adds converters.",
    };
  }

  if (file.size <= 0) {
    return { ok: false, message: "That file looks empty — try another photo." };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    const maxMb = Math.round(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024));
    return { ok: false, message: `Keep each photo under ${maxMb} MB so uplinks stay kind to travellers on spotty Wi-Fi.` };
  }

  return { ok: true, contentType, sizeBytes: file.size };
}
