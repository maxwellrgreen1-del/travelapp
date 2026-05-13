"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";

import type { ProfileAuthorGridPost, ProfileAuthorMapPin } from "@/features/profile/loadProfileAuthorPosts";
import { loadProfileAuthorPosts } from "@/features/profile/loadProfileAuthorPosts";

import { ProfilePostGrid } from "@/features/profile/components/ProfilePostGrid";
import { ProfilePostsWithoutMapFallback } from "@/features/profile/components/ProfilePostsWithoutMapFallback";
import { ProfileTravelMap } from "@/features/profile/components/ProfileTravelMap";

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
        Newest recaps first — your travel map above highlights posts we could place on the globe.
      </p>
    </div>
  );
}

/** Supabase-backed profile map + grid for an author’s published recaps. */
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
  const [mapPins, setMapPins] = useState<ProfileAuthorMapPin[]>([]);
  const [postsWithoutMapCoordinates, setPostsWithoutMapCoordinates] = useState<ProfileAuthorGridPost[]>([]);
  const [mapColumnsAvailable, setMapColumnsAvailable] = useState(true);
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
        setMapPins([]);
        setPostsWithoutMapCoordinates([]);
        setMapColumnsAvailable(true);
        bridgeRef.current?.({ type: "error" });
        return;
      }

      setStatus("success");
      setPosts(pack.posts);
      setMapPins(pack.mapPins);
      setPostsWithoutMapCoordinates(pack.postsWithoutMapCoordinates);
      setMapColumnsAvailable(pack.mapColumnsAvailable);
      bridgeRef.current?.({ type: "success", totalPublished: pack.totalPublished });
    }

    void fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [authorId, reloadKey, retryTick, gridReloadBump, supabase]);

  if (status === "loading") {
    return (
      <div className="space-y-8">
        <div className="space-y-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/85">Travel map</h2>
          <div className="h-[min(52vh,420px)] min-h-[260px] animate-pulse rounded-[28px] bg-neutral-200/90 shadow-inner shadow-neutral-900/20 sm:min-h-[280px]" aria-hidden />
        </div>
        <section aria-labelledby="profile-trip-grid-heading" className="space-y-5">
          <ProfileTripGridIntro />
          <ProfilePostGridSkeleton />
        </section>
      </div>
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
      <div className="space-y-8">
        <ProfileTravelMap pins={[]} hasPublishedPosts={false} />

        {!mapColumnsAvailable ? (
          <p className="rounded-[22px] border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950">
            Map pins need the latest tript migration on your Supabase project. Everything else here still works — publish
            trips as usual.
          </p>
        ) : null}

        <section aria-labelledby="profile-trip-grid-heading" className="space-y-5">
          <ProfileTripGridIntro />
          <EmptyState
            title="No trips to show yet"
            description="Publish your first recap from Create — a travel map and photo grid will show up here once your stories land in Supabase."
            action={
              <Link href="/create" prefetch={false} className={buttonClassName({ variant: "primary", size: "md", className: "px-10" })}>
                Compose your first trip log
              </Link>
            }
            className="rounded-[26px] border border-primary/35 bg-[#fcfbf9]/93"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!mapColumnsAvailable ? (
        <p className="rounded-[22px] border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950">
          Map pins need the latest tript migration on your Supabase project (`posts.map_latitude` / `map_longitude`). Your
          posts and grid below still load normally.
        </p>
      ) : null}

      <ProfileTravelMap pins={mapPins} hasPublishedPosts />

      <ProfilePostsWithoutMapFallback posts={postsWithoutMapCoordinates} mapHasPins={mapPins.length > 0} />

      <section aria-labelledby="profile-trip-grid-heading" className="space-y-5">
        <ProfileTripGridIntro />
        <ProfilePostGrid
          posts={posts}
          viewerId={viewerId}
          onPostDeleted={() => setGridReloadBump((n) => n + 1)}
          showHeading={false}
        />
      </section>
    </div>
  );
}
