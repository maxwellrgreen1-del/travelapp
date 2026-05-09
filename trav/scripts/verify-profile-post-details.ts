/**
 * One-shot check: every profile grid post ID must resolve in travelPostDetailModel.
 * Run: npx tsx scripts/verify-profile-post-details.ts
 */
import { mockProfileTrailPosts } from "../src/features/profile/mockTravelerProfile";
import { resolveTravelPostDetail } from "../src/features/posts/travelPostDetailModel";

const missing: string[] = [];
for (const post of mockProfileTrailPosts) {
  if (!resolveTravelPostDetail(post.id)) {
    missing.push(post.id);
  }
}

if (missing.length > 0) {
  console.error("Post detail resolver missing for profile grid IDs:", missing.join(", "));
  process.exit(1);
}

console.log(`OK — ${mockProfileTrailPosts.length} profile grid posts resolve to Post Detail.`);
