/**
 * Home feed ranking — small weighted blend of recency + public engagement.
 *
 * Note: `saves` rows are private under RLS (only your bookmarks are visible), so we
 * cannot rank by global save counts without schema/RLS changes. We still reward
 * `viewerHasSaved` so posts you bookmarked stay slightly easier to rediscover.
 */

export type HomeFeedRankInputs = {
  /** `posts.created_at` ISO string */
  createdAtISO: string;
  likeCount: number;
  commentCount: number;
  /** Signed-in viewer follows the author (always false for guests). */
  viewerFollowsAuthor: boolean;
  viewerHasSaved: boolean;
  /** Pass `Date.now()` from the server handler so scores stay stable within one response. */
  nowMs: number;
};

/** Pull more rows than we return so older-but-lively posts can bubble up. */
export const HOME_FEED_CANDIDATE_LIMIT = 100;
export const HOME_FEED_OUTPUT_LIMIT = 30;

/** Recency half-life — after this many hours, the recency term drops by ~half. */
const RECENCY_HALF_LIFE_HOURS = 52;
const RECENCY_WEIGHT = 58;
const LIKE_LOG_WEIGHT = 11;
const COMMENT_LOG_WEIGHT = 16;
/** Multiplier when you follow the author (social proximity). */
const FOLLOWING_MULTIPLIER = 1.24;
/** Small nudge when the viewer bookmarked the post (only signal we have for “saves”). */
const VIEWER_SAVED_BONUS = 10;

export function scoreHomeFeedPost(input: HomeFeedRankInputs): number {
  const createdMs = new Date(input.createdAtISO).getTime();
  const ageHours = Math.max(0, (input.nowMs - createdMs) / 3_600_000);

  const recency = RECENCY_WEIGHT * Math.exp(-ageHours / RECENCY_HALF_LIFE_HOURS);
  const engagement =
    LIKE_LOG_WEIGHT * Math.log1p(Math.max(0, input.likeCount)) +
    COMMENT_LOG_WEIGHT * Math.log1p(Math.max(0, input.commentCount));

  let score = recency + engagement;
  if (input.viewerFollowsAuthor) {
    score *= FOLLOWING_MULTIPLIER;
  }
  if (input.viewerHasSaved) {
    score += VIEWER_SAVED_BONUS;
  }
  return score;
}
