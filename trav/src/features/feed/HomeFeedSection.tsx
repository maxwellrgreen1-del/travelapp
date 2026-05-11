import { HomeFeed } from "@/features/feed/HomeFeed";
import { loadHomeFeedPayload } from "@/features/feed/loadHomeFeedPayload";

/** Async server parcel so the suspense boundary wraps only the feed fetch surface. */
export async function HomeFeedSection() {
  const result = await loadHomeFeedPayload();
  return <HomeFeed result={result} />;
}
