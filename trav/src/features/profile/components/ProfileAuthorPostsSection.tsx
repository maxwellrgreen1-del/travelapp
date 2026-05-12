"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";

import type { ProfileAuthorGridPost } from "@/features/profile/loadProfileAuthorPosts";
import { loadProfileAuthorPosts } from "@/features/profile/loadProfileAuthorPosts";

import { ProfilePostGrid } from "@/features/profile/components/ProfilePostGrid";

/** Lets the stats stripe stay honest while the masonry fetch races in. */
export type ProfileStoriesHydrationEvent =
  | { type: "loading" }
  | { type: "success"; totalPublished: number }
  | { type: "error" };

type ProfileAuthorPostsSectionProps = {
  authorId: string;
  /** Current session user — passed into tiles for owner-only edit/delete. */
  viewerId?: string | null;
  /** Bump from the parent when you need a hard refetch (optional). */
  reloadKey?: number;
  /** Fired whenever the Postgres round-trip crosses a UX milestone. */
  onStoriesHydration?: (event: ProfileStoriesHydrationEvent) => void;
};

/** Soft shimmer grid while Postgres stitches your recap wall. */
function ProfilePostGridSkeleton() {
  return (
    <ul className="grid grid-cols-3 gap-[6px] sm:gap-3" aria-busy="true" aria-label="Loading your trip thumbnails">
      {Array.from({ length: 9 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key -- static decorative skeleton slots
        <li key={`grid-skel-${index}`} className="aspect-square animate-pulse rounded-2xl bg-neutral-200/90 shadow-inner shadow-neutral-900/25" />
      ))}
    </ul>
  );
}

function ProfileTripGridIntro() {
  return (
    <div className="space-y-2 px-1">
      <h2 id="profile-trip-grid-heading" className="text-xs font-semibold uppercase tracking-[0.33em] text-primary">
        Field notes on the mantle
      </h2>
      <p className="text-sm leading-relaxed text-neutral-600">
        Tap any waypoint for your Supabase recap — newest logs surface first.
      </p>
    </div>
  );
}

/** Supabase-backed mantle for the traveller profile screen (map + dossier stay mocked for now). */
export function ProfileAuthorPostsSection({
  authorId,
  viewerId = null,
  reloadKey = 0,
  onStoriesHydration,
}: ProfileAuthorPostsSectionProps) {
  const bridgeRef = useRef(onStoriesHydration);
  bridgeRef.current = onStoriesHydration;

  const [supabase] = useState(() => createClient());
  const [posts, setPosts] = useState<ProfileAuthorGridPost[]>([]);
  const [retryTick, setRetryTick] = useState(0);
  const [gridReloadBump, setGridReloadBump] = useState(0);

  type FetchStatus = "loading" | "success" | "error";
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authorId) {
      return;
    }

    let cancelled = false;

    async function fetchPosts() {
      bridgeRef.current?.({ type: "loading" });
      setStatus("loading");
      setErrorMessage(null);

      const pack = await loadProfileAuthorPosts(supabase, authorId);

      if (cancelled) return;

      if (!pack.ok) {
        setStatus("error");
        setErrorMessage(pack.message);
        setPosts([]);
        bridgeRef.current?.({ type: "error" });
        return;
      }

      setStatus("success");
      setPosts(pack.posts);
      bridgeRef.current?.({ type: "success", totalPublished: pack.totalPublished });
    }

    void fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [authorId, reloadKey, retryTick, gridReloadBump, supabase]);

  if (status === "loading") {
    return (
      <section aria-labelledby="profile-trip-grid-heading" className="space-y-5">
        <ProfileTripGridIntro />
        <ProfilePostGridSkeleton />
      </section>
    );
  }

  if (status === "error") {
    return (
      <section aria-labelledby="profile-trip-grid-heading" className="space-y-5">
        <ProfileTripGridIntro />
        <EmptyState
          title="Logbook sync hiccuped"
          description={
            errorMessage ?? "We couldn’t hydrate your waypoint tiles yet — refresh or retry when bandwidth looks kinder."
          }
          action={
            <button
              type="button"
              className={buttonClassName({ variant: "outlinePrimary", size: "md", className: "min-w-[200px]" })}
              onClick={() => setRetryTick((tick) => tick + 1)}
            >
              Retry logbook sync
            </button>
          }
          className="rounded-[26px] border border-red-100/90 bg-white/94"
        />
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section aria-labelledby="profile-trip-grid-heading" className="space-y-5">
        <ProfileTripGridIntro />
        <EmptyState
          title="No field notes published yet"
          description="Spin up your first trip recap from Create — tiles land here newest-first once Supabase echoes the save."
          action={
            <Link href="/create" prefetch={false} className={buttonClassName({ variant: "primary", size: "md", className: "px-10" })}>
              Compose maiden trip log
            </Link>
          }
          className="rounded-[26px] border border-primary/35 bg-[#fcfbf9]/93"
        />
      </section>
    );
  }

  return (
    <ProfilePostGrid
      posts={posts}
      viewerId={viewerId}
      onPostDeleted={() => setGridReloadBump((n) => n + 1)}
    />
  );
}
