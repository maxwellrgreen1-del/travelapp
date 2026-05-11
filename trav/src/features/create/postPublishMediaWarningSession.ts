const SESSION_KEY = "tript:post_media_upload_warn";

type StashedPayload = {
  postId: string;
  message: string;
};

/** Called after a successful post save when the hero image upload fails — read back on the post detail screen. */
export function stashPostMediaUploadWarning(postId: string, message: string): void {
  try {
    const payload: StashedPayload = { postId, message };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* private / disabled storage — post still exists */
  }
}

/** Returns the warning once for this `postId`, then clears the stash so refreshes stay quiet. */
export function consumePostMediaUploadWarning(expectedPostId: string): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(SESSION_KEY);
    const parsed = JSON.parse(raw) as Partial<StashedPayload>;
    if (parsed.postId === expectedPostId && typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
    return null;
  } catch {
    return null;
  }
}
