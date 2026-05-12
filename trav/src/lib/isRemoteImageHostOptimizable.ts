/**
 * Hosts allowed for `next/image` optimization — must stay in sync with `next.config.ts` `images.remotePatterns`.
 * Anything else (e.g. pasted Bing/Google redirect URLs in `avatar_url`) uses `<img>` so the app never crashes.
 */
export function isRemoteImageHostOptimizable(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    const host = url.hostname.toLowerCase();
    if (host === "images.unsplash.com") {
      return true;
    }
    if (host === "lh3.googleusercontent.com") {
      return true;
    }
    if (host.endsWith(".supabase.co")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
