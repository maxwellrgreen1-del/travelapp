/** Matches Postgres `gen_random_uuid()` style ids used in `public.posts`. */
const PERSISTENT_POST_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True when this id can exist in Supabase `posts` (vs seeded string slugs on the mock runway). */
export function isPersistentPostId(postId: string): boolean {
  return PERSISTENT_POST_ID_RE.test(postId);
}
