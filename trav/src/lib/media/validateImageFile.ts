/** Browser `File.type` values we accept (plus common `image/jpg` alias). */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/** ~5 MB — comfortable for mobile signal without hammering Storage egress. */
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Broad `accept` list so Windows / Edge reliably open the picker.
 * Allowed formats are still enforced in `validateImageFile` / `validateImageFileAsync`.
 */
export const BROWSER_FILE_ACCEPT_IMAGES = "image/jpeg,image/jpg,image/png,image/webp,image/*,.jpg,.jpeg,.jfif,.jpe,.png,.webp";

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
  if (lower === "image/jpeg" || lower === "image/jpg" || lower === "image/pjpeg") return "image/jpeg";
  if (lower === "image/png") return "image/png";
  if (lower === "image/webp") return "image/webp";
  return null;
}

/** Windows often omits MIME, uses `application/octet-stream`, or saves as `.jfif` / `.jpe`. */
function inferContentTypeFromFileName(fileName: string): ImageValidationSuccess["contentType"] | null {
  const lower = fileName.trim().toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot + 1) : "";
  if (ext === "jpg" || ext === "jpeg" || ext === "jfif" || ext === "jpe") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}

function resolveContentType(file: File): ImageValidationSuccess["contentType"] | null {
  const fromMime = normaliseContentType(file.type);
  if (fromMime) {
    return fromMime;
  }
  const rawType = file.type.trim().toLowerCase();
  if (rawType === "" || rawType === "application/octet-stream") {
    return inferContentTypeFromFileName(file.name);
  }
  return inferContentTypeFromFileName(file.name);
}

/**
 * Reads the first bytes of the file — catches JPEG/PNG/WebP when Windows gives no useful `type` or extension.
 */
export async function sniffImageContentTypeFromBytes(file: File): Promise<ImageValidationSuccess["contentType"] | null> {
  if (file.size < 3) {
    return null;
  }
  try {
    const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      return "image/jpeg";
    }
    if (
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    ) {
      return "image/png";
    }
    if (
      buf.length >= 12 &&
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50
    ) {
      return "image/webp";
    }
    return null;
  } catch {
    return null;
  }
}

const TYPE_REJECT_MESSAGE =
  "Use JPG, PNG, or WebP. If this already is one, Windows may not have sent the file type — we will try to detect it from the file contents when you pick again.";

/**
 * Client-side gate before touching Supabase Storage — MIME allow-list + byte cap (sync only).
 * Prefer `validateImageFileAsync` in UI pickers when Windows may omit metadata.
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!(file instanceof File)) {
    return { ok: false, message: "Pick a real image file from your device." };
  }

  if (file.size <= 0) {
    return { ok: false, message: "That file looks empty — try another photo." };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    const maxMb = Math.round(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024));
    return { ok: false, message: `Keep each photo under ${maxMb} MB so uplinks stay kind to travellers on spotty Wi-Fi.` };
  }

  const contentType = resolveContentType(file);
  if (!contentType) {
    return {
      ok: false,
      message: TYPE_REJECT_MESSAGE,
    };
  }

  return { ok: true, contentType, sizeBytes: file.size };
}

/**
 * Same rules as `validateImageFile`, plus magic-byte detection for stubborn Windows `File` metadata.
 */
export async function validateImageFileAsync(file: File): Promise<ImageValidationResult> {
  if (!(file instanceof File)) {
    return { ok: false, message: "Pick a real image file from your device." };
  }

  if (file.size <= 0) {
    return { ok: false, message: "That file looks empty — try another photo." };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    const maxMb = Math.round(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024));
    return { ok: false, message: `Keep each photo under ${maxMb} MB so uplinks stay kind to travellers on spotty Wi-Fi.` };
  }

  let contentType = resolveContentType(file);
  if (!contentType) {
    contentType = await sniffImageContentTypeFromBytes(file);
  }
  if (!contentType) {
    return {
      ok: false,
      message: TYPE_REJECT_MESSAGE,
    };
  }

  return { ok: true, contentType, sizeBytes: file.size };
}
