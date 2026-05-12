"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { deleteFollowEdge, insertFollowEdge } from "@/features/social/followMutations";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

type ProfileFollowButtonProps = {
  targetProfileId: string;
  viewerId: string | undefined;
  authLoading: boolean;
  initialFollowing: boolean;
  /** Bump the profile’s follower stat on screen (optimistic). */
  onFollowersDelta: (delta: 1 | -1) => void;
};

/** Primary follow / unfollow control — requires auth; anonymous users route to `/login`. */
export function ProfileFollowButton({
  targetProfileId,
  viewerId,
  authLoading,
  initialFollowing,
  onFollowersDelta,
}: ProfileFollowButtonProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  async function handleClick() {
    if (authLoading) return;
    if (!viewerId) {
      router.push("/login");
      return;
    }
    if (viewerId === targetProfileId) {
      return;
    }

    setBusy(true);
    setError(null);

    const nextFollowing = !following;
    const delta: 1 | -1 = nextFollowing ? 1 : -1;

    setFollowing(nextFollowing);
    onFollowersDelta(delta);

    const result = nextFollowing
      ? await insertFollowEdge(supabase, { followerId: viewerId, followingId: targetProfileId })
      : await deleteFollowEdge(supabase, { followerId: viewerId, followingId: targetProfileId });

    if (!result.ok) {
      setFollowing(!nextFollowing);
      onFollowersDelta((-delta) as 1 | -1);
      setError(result.message);
    }

    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={following ? "outlinePrimary" : "primary"}
        size="md"
        disabled={busy || authLoading || viewerId === targetProfileId}
        aria-busy={busy}
        aria-pressed={following}
        className={cx("min-w-[148px]", viewerId === targetProfileId ? "opacity-60" : "")}
        onClick={() => void handleClick()}
      >
        {viewerId === targetProfileId ? "This is you" : busy ? "Saving…" : following ? "Following" : "Follow"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
