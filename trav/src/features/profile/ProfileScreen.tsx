"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { LogoutSection } from "@/features/auth/components/LogoutSection";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { createClient } from "@/lib/supabase/client";
import { DestinationPreviewCard } from "@/features/profile/components/DestinationPreviewCard";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfilePostGrid } from "@/features/profile/components/ProfilePostGrid";
import { ProfileStats } from "@/features/profile/components/ProfileStats";
import { TravelMapPreview } from "@/features/profile/components/TravelMapPreview";
import type { MockTravelerSocialProfile } from "@/features/profile/mockTravelerProfile";
import {
  mockAtlasPins,
  mockProfileTrailPosts,
  mockSavedDestinationBoard,
  mockTravelerSocial,
} from "@/features/profile/mockTravelerProfile";
import { loadOrCreateProfileForUser } from "@/features/profile/loadOrCreateProfile";
import { toProfileHeaderViewModel } from "@/features/profile/profileAuthAdapter";

type ProfileLoadState = "loading" | "ready" | "error";

export function ProfileScreen() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [supabase] = useState(() => createClient());
  const [profileState, setProfileState] = useState<ProfileLoadState>("loading");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [traveler, setTraveler] = useState<MockTravelerSocialProfile>(mockTravelerSocial);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    const authedUser = user;

    let cancelled = false;

    async function loadProfile() {
      setProfileState("loading");
      setProfileError(null);

      const result = await loadOrCreateProfileForUser(supabase, authedUser);

      if (!cancelled) {
        if (!result.ok) {
          setProfileState("error");
          setProfileError(result.error);
          return;
        }
        setTraveler(toProfileHeaderViewModel(result.row, authedUser));
        setProfileState("ready");
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, supabase, retryTick]);

  if (authLoading || profileState === "loading") {
    return (
      <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
        <main className="px-4 pb-28 pt-6 sm:px-5">
          <LoadingState message="Loading your tript profile…" className="py-24" />
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
              <Button type="button" variant="outlinePrimary" onClick={() => setRetryTick((value) => value + 1)}>
                Retry profile load
              </Button>
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
        <ProfileHeader traveler={traveler} />

        <ProfileStats
          stats={{
            followersCount: mockTravelerSocial.followersCount,
            followingCount: mockTravelerSocial.followingCount,
            postsPublished: mockTravelerSocial.postsPublished,
          }}
          footnote="Feed, follower, and publishing totals stay mocked while profile identity comes from Supabase."
        />

        <TravelMapPreview pins={mockAtlasPins} />

        <ProfilePostGrid posts={mockProfileTrailPosts} />

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

        <LogoutSection variant="profile" />
      </main>
    </div>
  );
}
