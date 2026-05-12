-- Allow authenticated users to read follow edges where the followee has a public profile.
-- Needed for follower counts on other travellers’ profiles without leaking private-account edges.
-- OR-combines with existing "follows_select_participants" policy.

CREATE POLICY "follows_select_public_followee_edges"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = follows.following_id
        AND p.is_public IS TRUE
    )
  );

COMMENT ON POLICY "follows_select_public_followee_edges" ON public.follows IS
  'Authenticated clients can aggregate followers for public profiles; private followees stay participant-only.';
