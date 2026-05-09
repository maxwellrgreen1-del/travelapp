-- ============================================================================
-- tript — MVP Postgres schema for Supabase (public social trip posts)
-- Apply via Supabase SQL Editor or `supabase db push` after linking a project.
-- ============================================================================

-- Cryptographically random UUIDs (enabled by default on Supabase; safe if rerun).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper: keep updated_at in sync on UPDATE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS 'Sets updated_at to UTC now() before row UPDATE; attach to tables that track edits.';

-- ============================================================================
-- profiles
-- One row per auth user — public-facing handle + avatar + privacy toggle.
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  -- When false, only the owner should appear in strict “public directory” UIs;
  -- RLS still allows the owner (and necessary FK integrity) full access.
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT profiles_username_lower_ck CHECK (username = lower(username)),
  CONSTRAINT profiles_username_len_ck CHECK (char_length(username) >= 3)
);

CREATE UNIQUE INDEX profiles_username_unique ON public.profiles (username);

COMMENT ON TABLE public.profiles IS 'App identity keyed to auth.users — bio, avatar, discoverability.';

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================================
-- posts
-- Trip recap / journal entries owned by a profile.
-- ============================================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  journal TEXT,
  -- MVP visibility: public feeds vs owner-only drafts/private notes.
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  -- Denormalized line shown on cards; detailed stops live in post_locations.
  location_display TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.posts IS 'Feed units — title/teaser/journal plus visibility for RLS-aware reads.';

CREATE INDEX posts_feed_created_idx ON public.posts (created_at DESC);
CREATE INDEX posts_author_created_idx ON public.posts (author_id, created_at DESC);

CREATE TRIGGER posts_set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================================
-- post_media
-- Images/video references for a post (URLs or Storage paths as plain text MVP).
-- ============================================================================
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX post_media_post_sort_idx ON public.post_media (post_id, sort_order);

COMMENT ON TABLE public.post_media IS 'Ordered gallery rows for a post; cascade-deleted with parent post.';

-- ============================================================================
-- post_locations
-- Structured “places visited” lines attached to a post.
-- ============================================================================
CREATE TABLE public.post_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  note TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX post_locations_post_sort_idx ON public.post_locations (post_id, sort_order);

COMMENT ON TABLE public.post_locations IS 'Optional itinerary pins; MVP text-only (geo columns can be added later).';

-- ============================================================================
-- comments
-- Threaded discussion on posts (flat MVP — one level).
-- ============================================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT comments_body_len_ck CHECK (char_length(trim(body)) > 0)
);

CREATE INDEX comments_post_created_idx ON public.comments (post_id, created_at DESC);

COMMENT ON TABLE public.comments IS 'Comments on posts; removed if post or author profile is deleted.';

CREATE TRIGGER comments_set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================================
-- likes
-- One row per user ↔ post heart (idempotent toggle from the app).
-- ============================================================================
CREATE TABLE public.likes (
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX likes_post_idx ON public.likes (post_id);

COMMENT ON TABLE public.likes IS 'Post reactions; composite PK prevents duplicate likes.';

-- ============================================================================
-- saves
-- Bookmarks — same shape as likes, separate intent for product analytics later.
-- ============================================================================
CREATE TABLE public.saves (
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX saves_post_idx ON public.saves (post_id);

COMMENT ON TABLE public.saves IS 'User bookmark graph for revisiting trips later.';

-- ============================================================================
-- follows
-- Directed graph: follower follows following (no self-follow).
-- ============================================================================
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_no_self_ck CHECK (follower_id <> following_id)
);

CREATE INDEX follows_following_idx ON public.follows (following_id);

COMMENT ON TABLE public.follows IS 'Social graph edges for home feed ranking / notifications later.';

-- ============================================================================
-- notifications
-- In-app inbox rows (likes, comments, follows — actor summarised here).
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  post_id UUID REFERENCES public.posts (id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments (id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  -- Extra structured payload without schema churn (deep links, counts).
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX notifications_recipient_created_idx ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON public.notifications (recipient_id)
  WHERE read_at IS NULL;

COMMENT ON TABLE public.notifications IS 'Per-user activity inbox; actor may be null if account removed.';

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- --- Helpers (stable visibility checks for child tables) -----------------------

CREATE OR REPLACE FUNCTION public.post_is_readable(post_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_uuid
      AND (
        p.visibility = 'public'
        OR p.author_id = auth.uid()
      )
  );
$$;

COMMENT ON FUNCTION public.post_is_readable(UUID) IS 'RLS helper: public posts or owned by caller.';

CREATE OR REPLACE FUNCTION public.profile_is_readable(profile_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles pr
    WHERE pr.id = profile_uuid
      AND (
        pr.is_public = TRUE
        OR pr.id = auth.uid()
      )
  );
$$;

COMMENT ON FUNCTION public.profile_is_readable(UUID) IS 'RLS helper: public profiles or own row.';

CREATE OR REPLACE FUNCTION public.profile_exists(profile_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_uuid);
$$;

COMMENT ON FUNCTION public.profile_exists(UUID) IS 'RLS-safe existence check for FK targets (e.g. follow edges) without exposing private profile rows.';

-- --- profiles policies --------------------------------------------------------

CREATE POLICY "profiles_select_public_or_own"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (public.profile_is_readable(id));

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());

COMMENT ON POLICY "profiles_select_public_or_own" ON public.profiles IS 'Anyone can read discoverable profiles; owners always read themselves.';
COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 'Users bootstrap exactly one profile row tied to their auth uid.';
COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'Profile edits limited to the signed-in owner.';
COMMENT ON POLICY "profiles_delete_own" ON public.profiles IS 'Optional manual delete; normally cascade from auth.users removal.';

-- --- posts policies -----------------------------------------------------------

CREATE POLICY "posts_select_readable"
  ON public.posts
  FOR SELECT
  TO anon, authenticated
  USING (
    visibility = 'public'
    OR author_id = auth.uid()
  );

CREATE POLICY "posts_insert_author_is_self"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_update_author_only"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_delete_author_only"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

COMMENT ON POLICY "posts_select_readable" ON public.posts IS 'Public posts readable widely; private visible only to author.';
COMMENT ON POLICY "posts_insert_author_is_self" ON public.posts IS 'Authors publish under their profile id.';
COMMENT ON POLICY "posts_update_author_only" ON public.posts IS 'Only the owner edits their recap.';
COMMENT ON POLICY "posts_delete_author_only" ON public.posts IS 'Only the owner deletes their recap.';

-- --- post_media policies ------------------------------------------------------

CREATE POLICY "post_media_select_if_post_readable"
  ON public.post_media
  FOR SELECT
  TO anon, authenticated
  USING (public.post_is_readable(post_id));

CREATE POLICY "post_media_author_manage"
  ON public.post_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_media.post_id AND p.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_media.post_id AND p.author_id = auth.uid()
    )
  );

COMMENT ON POLICY "post_media_select_if_post_readable" ON public.post_media IS 'Gallery inherits visibility from parent post.';
COMMENT ON POLICY "post_media_author_manage" ON public.post_media IS 'Only post owner inserts/updates/deletes media rows.';

-- --- post_locations policies --------------------------------------------------

CREATE POLICY "post_locations_select_if_post_readable"
  ON public.post_locations
  FOR SELECT
  TO anon, authenticated
  USING (public.post_is_readable(post_id));

CREATE POLICY "post_locations_author_manage"
  ON public.post_locations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_locations.post_id AND p.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_locations.post_id AND p.author_id = auth.uid()
    )
  );

COMMENT ON POLICY "post_locations_select_if_post_readable" ON public.post_locations IS 'Places list inherits parent post visibility.';
COMMENT ON POLICY "post_locations_author_manage" ON public.post_locations IS 'Owner edits itinerary rows for their posts only.';

-- --- comments policies --------------------------------------------------------

CREATE POLICY "comments_select_if_post_readable"
  ON public.comments
  FOR SELECT
  TO anon, authenticated
  USING (public.post_is_readable(post_id));

CREATE POLICY "comments_insert_authenticated_on_readable_post"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND public.post_is_readable(post_id)
  );

CREATE POLICY "comments_update_own"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_delete_own"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

COMMENT ON POLICY "comments_select_if_post_readable" ON public.comments IS 'Threads visible when the underlying post is readable.';
COMMENT ON POLICY "comments_insert_authenticated_on_readable_post" ON public.comments IS 'Logged-in users reply only as themselves on open posts.';
COMMENT ON POLICY "comments_update_own" ON public.comments IS 'Authors edit their own comments.';
COMMENT ON POLICY "comments_delete_own" ON public.comments IS 'Authors delete their own comments.';

-- --- likes policies -----------------------------------------------------------

CREATE POLICY "likes_select_visible_posts"
  ON public.likes
  FOR SELECT
  TO anon, authenticated
  USING (public.post_is_readable(post_id));

CREATE POLICY "likes_insert_self_on_readable"
  ON public.likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.post_is_readable(post_id)
  );

CREATE POLICY "likes_delete_own"
  ON public.likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON POLICY "likes_select_visible_posts" ON public.likes IS 'Supports counts/hearts on anything in the open feed.';
COMMENT ON POLICY "likes_insert_self_on_readable" ON public.likes IS 'Authenticated users heart readable posts as themselves.';
COMMENT ON POLICY "likes_delete_own" ON public.likes IS 'Unlike = delete own like row.';

-- --- saves policies -----------------------------------------------------------

CREATE POLICY "saves_select_own"
  ON public.saves
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "saves_insert_self_on_readable"
  ON public.saves
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.post_is_readable(post_id)
  );

CREATE POLICY "saves_delete_own"
  ON public.saves
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON POLICY "saves_select_own" ON public.saves IS 'Bookmarks are private — only owner lists their saves.';
COMMENT ON POLICY "saves_insert_self_on_readable" ON public.saves IS 'Save readable posts into personal stash.';
COMMENT ON POLICY "saves_delete_own" ON public.saves IS 'Remove bookmark rows you created.';

-- --- follows policies ---------------------------------------------------------

CREATE POLICY "follows_select_participants"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (
    follower_id = auth.uid()
    OR following_id = auth.uid()
  );

CREATE POLICY "follows_insert_self_as_follower"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    follower_id = auth.uid()
    AND follower_id <> following_id
    AND public.profile_exists(following_id)
  );

CREATE POLICY "follows_delete_self_as_follower"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());

COMMENT ON POLICY "follows_select_participants" ON public.follows IS 'Users see edges where they are follower or followee.';
COMMENT ON POLICY "follows_insert_self_as_follower" ON public.follows IS 'Follow only as yourself; target profile must exist (private accounts can still be followed when surfaced).';
COMMENT ON POLICY "follows_delete_self_as_follower" ON public.follows IS 'Unfollow your own outgoing edges.';

-- --- notifications policies ---------------------------------------------------

CREATE POLICY "notifications_select_own_inbox"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "notifications_insert_as_actor"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND recipient_id <> auth.uid()
    AND public.profile_exists(recipient_id)
  );

CREATE POLICY "notifications_update_own_read_state"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

COMMENT ON POLICY "notifications_select_own_inbox" ON public.notifications IS 'Inbox is private per recipient.';
COMMENT ON POLICY "notifications_insert_as_actor" ON public.notifications IS 'Actors enqueue notifications for others (like/follow); refine with Edge Functions later.';
COMMENT ON POLICY "notifications_update_own_read_state" ON public.notifications IS 'Recipients mark rows read / dismissed.';

-- ----------------------------------------------------------------------------
-- Grants: RLS helper RPCs must be callable from PostgREST under anon/auth JWTs
-- ----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.post_is_readable(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.profile_is_readable(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.profile_exists(UUID) TO authenticated;
