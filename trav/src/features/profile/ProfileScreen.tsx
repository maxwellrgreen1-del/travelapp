"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { LogoutSection } from "@/features/auth/components/LogoutSection";
import { ProfileAuthorPostsSection, type ProfileStoriesHydrationEvent } from "@/features/profile/components/ProfileAuthorPostsSection";
import { DestinationPreviewCard } from "@/features/profile/components/DestinationPreviewCard";
import { ProfileFollowButton } from "@/features/profile/components/ProfileFollowButton";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileStats } from "@/features/profile/components/ProfileStats";
import { TravelMapPreview } from "@/features/profile/components/TravelMapPreview";
import { loadOrCreateProfileForUser } from "@/features/profile/loadOrCreateProfile";
import type { MockTravelerSocialProfile } from "@/features/profile/mockTravelerProfile";
import {
  mockAtlasPins,
  mockSavedDestinationBoard,
  mockTravelerSocial,
} from "@/features/profile/mockTravelerProfile";
import { toProfileHeaderViewModel, toPublicProfileHeaderViewModel } from "@/features/profile/profileAuthAdapter";
import { fetchProfileFollowCounts, fetchViewerFollowsTarget } from "@/features/social/fetchProfileFollowCounts";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { isPersistentPostId } from "@/lib/postIds";
import { createClient } from "@/lib/supabase/client";

type ProfileLoadState = "loading" | "ready" | "error";

export function ProfileScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [supabase] = useState(() => createClient());

  const visitParam = searchParams.get("visit");
  const visitUuid = useMemo(() => {
    if (!visitParam || !isPersistentPostId(visitParam)) {
      return null;
    }
    return visitParam;
  }, [visitParam]);

  const viewingOther = Boolean(user && visitUuid && visitUuid !== user.id);
  const targetProfileId = user ? (viewingOther && visitUuid ? visitUuid : user.id) : "";

  const [profileState, setProfileState] = useState<ProfileLoadState>("loading");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [traveler, setTraveler] = useState<MockTravelerSocialProfile>(mockTravelerSocial);
  const [retryTick, setRetryTick] = useState(0);
  const [storiesStat, setStoriesStat] = useState<{ pending: boolean; published: number }>({ pending: true, published: 0 });

  const [followFollowers, setFollowFollowers] = useState(0);
  const [followFollowing, setFollowFollowing] = useState(0);
  const [followSocialLoading, setFollowSocialLoading] = useState(true);
  const [followSocialError, setFollowSocialError] = useState<string | null>(null);
  const [viewerFollowsTarget, setViewerFollowsTarget] = useState(false);

  const handleStoriesHydration = useCallback((event: ProfileStoriesHydrationEvent) => {
    if (event.type === "loading") {
      setStoriesStat((prev) => ({ ...prev, pending: true }));
      return;
    }
    if (event.type === "success") {
      setStoriesStat({ pending: false, published: event.totalPublished });
      return;
    }
    setStoriesStat((prev) => ({ ...prev, pending: false }));
  }, []);

  const handleFollowersDelta = useCallback((delta: 1 | -1) => {
    setFollowFollowers((prev) => Math.max(0, prev + delta));
  }, []);

  useEffect(() => {
    if (!user?.id || !visitUuid || visitUuid !== user.id) {
      return;
    }
    router.replace("/profile", { scroll: false });
  }, [user?.id, visitUuid, router]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const authedUser = user;
    let cancelled = false;

    async function bootstrap() {
      setProfileState("loading");
      setProfileError(null);

      if (!viewingOther) {
        const result = await loadOrCreateProfileForUser(supabase, authedUser);
        if (cancelled) return;
        if (!result.ok) {
          setProfileState("error");
          setProfileError(result.error);
          return;
        }
        setTraveler(toProfileHeaderViewModel(result.row, authedUser));
        setProfileState("ready");
        return;
      }

      const subjectId = visitUuid as string;

      const { data: row, error } = await supabase.from("profiles").select("*").eq("id", subjectId).maybeSingle();

      if (cancelled) return;
      if (error || !row) {
        setProfileState("error");
        setProfileError("That explorer is not on tript or their profile is still private.");
        return;
      }

      setTraveler(toPublicProfileHeaderViewModel(row));
      setProfileState("ready");
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, supabase, retryTick, viewingOther, visitUuid]);

  useEffect(() => {
    if (profileState !== "ready" || !user || !targetProfileId) {
      return;
    }

    let cancelled = false;
    setFollowSocialLoading(true);
    setFollowSocialError(null);

    void (async () => {
      const countsPack = await fetchProfileFollowCounts(supabase, targetProfileId);
      if (cancelled) return;

      if (!countsPack.ok) {
        setFollowSocialError(countsPack.message);
        setFollowFollowers(0);
        setFollowFollowing(0);
      } else {
        setFollowFollowers(countsPack.counts.followers);
        setFollowFollowing(countsPack.counts.following);
      }

      if (viewingOther && visitUuid) {
        const edge = await fetchViewerFollowsTarget(supabase, user.id, visitUuid);
        if (!cancelled && edge.ok) {
          setViewerFollowsTarget(edge.following);
        }
      } else if (!cancelled) {
        setViewerFollowsTarget(false);
      }

      if (!cancelled) {
        setFollowSocialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileState, user, targetProfileId, viewingOther, visitUuid, supabase]);

  if (authLoading || profileState === "loading") {
    return (
      <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
        <main className="px-4 pb-28 pt-6 sm:px-5">
          <LoadingState message="Loading tript profile…" className="py-24" />
        </main>
      </div>
    );
  }

  if (profileState === "error") {
    return (
      <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
        <main className="px-4 pb-28 pt-6 sm:px-5">
          <EmptyState
            title="Profile temporarily out of range"
            description={profileError ?? "Please retry and we’ll attempt another sync from Supabase."}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                {viewingOther ? (
                  <Button type="button" variant="primary" onClick={() => router.replace("/profile")}>
                    Back to your profile
                  </Button>
                ) : null}
                <Button type="button" variant="outlinePrimary" onClick={() => setRetryTick((value) => value + 1)}>
                  Retry profile load
                </Button>
              </div>
            }
            className="mt-8"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
      <main className="space-y-9 px-4 pb-28 pt-6 sm:px-5">
        {viewingOther ? (
          <div className="px-1">
            <Link
              href="/profile"
              prefetch={false}
              className={buttonClassName({
                variant: "ghost",
                size: "sm",
                className: "text-neutral-800 hover:text-neutral-950",
              })}
            >
              ← Your tript profile
            </Link>
          </div>
        ) : null}

        <ProfileHeader
          traveler={traveler}
          variant={viewingOther ? "visitor" : "self"}
          visitorActions={
            viewingOther && user && visitUuid ? (
              followSocialLoading ? (
                <p className="text-sm font-medium text-white/85">Checking follow ribbon…</p>
              ) : (
                <ProfileFollowButton
                  key={visitUuid}
                  targetProfileId={visitUuid}
                  viewerId={user.id}
                  authLoading={authLoading}
                  initialFollowing={viewerFollowsTarget}
                  onFollowersDelta={handleFollowersDelta}
                />
              )
            ) : undefined
          }
        />

        {followSocialError ? (
          <Card padding="md" tone="muted" className="border-amber-200/90 bg-amber-50/95 text-sm font-medium text-amber-950">
            {followSocialError}
          </Card>
        ) : null}

        <ProfileStats
          stats={{
            followersCount: followFollowers,
            followingCount: followFollowing,
            postsPublished: storiesStat.published,
          }}
          postsPublishedPending={storiesStat.pending}
          followersFollowingPending={followSocialLoading}
          footnote={
            viewingOther
              ? "Live follow tallies + story counts from Supabase for this explorer."
              : "Stories + follow graph sync from Supabase — tap explorers in Search with “visit” to follow them here."
          }
        />

        <TravelMapPreview pins={mockAtlasPins} />

        {user ? (
          <ProfileAuthorPostsSection
            authorId={targetProfileId}
            viewerId={user.id}
            onStoriesHydration={handleStoriesHydration}
          />
        ) : null}

        <section aria-labelledby="saved-strip-heading" className="space-y-4 pb-8">
          <div className="space-y-1 px-2">
            <h2 id="saved-strip-heading" className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Saved destinations dossier
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-neutral-600">
              Pull-to-snap dossier mirrors what Instagram collections wish they felt like — cobalt coasts queued for remix.
            </p>
          </div>

          <div className="-mx-4 px-4 sm:-mx-5 sm:px-5">
            <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pl-1 pr-6">
              {mockSavedDestinationBoard.map((hub) => (
                <li key={hub.id} className="snap-start">
                  <DestinationPreviewCard destination={hub} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {!viewingOther ? <LogoutSection variant="profile" /> : null}
      </main>
    </div>
  );
}
