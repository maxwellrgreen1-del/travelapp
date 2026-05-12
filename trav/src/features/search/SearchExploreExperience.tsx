"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { DestinationChip } from "@/features/search/components/DestinationChip";
import { ExplorePostGrid } from "@/features/search/components/ExplorePostGrid";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SuggestedTravelerCard } from "@/features/search/components/SuggestedTravelerCard";
import { TrendingDestinationCard } from "@/features/search/components/TrendingDestinationCard";
import { EXPLORE_LIVE_SEARCH_MIN_CHARS, fetchExploreLiveResults, shouldRunLiveExploreSearch } from "@/features/search/exploreLiveSearch";
import { blobMatchesExploreQuery, normalizeExploreQuery } from "@/features/search/filterUtils";
import type { ExploreCategoryId, PopularExploreTrip, SuggestedExplorer } from "@/features/search/mockExploreData";
import {
  exploreCategoryCatalog,
  popularExplorePosts,
  suggestedTravelExplorers,
  trendingExplorePlaces,
} from "@/features/search/mockExploreData";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

function categorySearchBlob(cat: ExploreCategoryId) {
  const match = exploreCategoryCatalog.find((entry) => entry.id === cat);

  return [cat, match?.label ?? "", match?.subtitle ?? ""].join(" ");
}

/** Pinterest + IG discovery layering — Postgres-backed text search + local mood-board fallbacks. */
export function SearchExploreExperience() {
  const [supabase] = useState(() => createClient());
  const [query, setQuery] = useState("");
  const [focusCategory, setFocusCategory] = useState<ExploreCategoryId | null>(null);

  const [livePosts, setLivePosts] = useState<PopularExploreTrip[]>([]);
  const [liveProfiles, setLiveProfiles] = useState<SuggestedExplorer[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = normalizeExploreQuery(query);

    if (!shouldRunLiveExploreSearch(trimmed)) {
      setLivePosts([]);
      setLiveProfiles([]);
      setLiveLoading(false);
      setLiveError(null);
      return;
    }

    let cancelled = false;
    setLiveLoading(true);
    setLiveError(null);

    const handle = window.setTimeout(() => {
      void (async () => {
        const pack = await fetchExploreLiveResults(supabase, trimmed);
        if (cancelled) return;
        setLiveLoading(false);
        if (!pack.ok) {
          setLiveError(pack.message);
          setLivePosts([]);
          setLiveProfiles([]);
          return;
        }
        setLivePosts(pack.posts);
        setLiveProfiles(pack.profiles);
      })();
    }, 360);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query, supabase]);

  const trendingMatches = useMemo(() => {
    return trendingExplorePlaces.filter((destination) => {
      if (focusCategory && !destination.categories.includes(focusCategory)) {
        return false;
      }

      return blobMatchesExploreQuery(query, [
        destination.title,
        destination.country,
        destination.subtitle,
        destination.categories.flatMap(categorySearchBlob).join(" "),
      ]);
    });
  }, [query, focusCategory]);

  const explorerMatches = useMemo(() => {
    return suggestedTravelExplorers.filter((traveler) => {
      if (focusCategory && !traveler.signatureTags.includes(focusCategory)) {
        return false;
      }

      const categoryBlob = traveler.signatureTags.map(categorySearchBlob).join(" ");

      return blobMatchesExploreQuery(query, [
        traveler.displayName,
        traveler.username,
        traveler.tagline,
        traveler.followersLabel,
        categoryBlob,
      ]);
    });
  }, [query, focusCategory]);

  const postMatches = useMemo(() => {
    return popularExplorePosts.filter((post) => {
      if (focusCategory && !post.categories.includes(focusCategory)) {
        return false;
      }

      return blobMatchesExploreQuery(query, [
        post.title,
        post.subtitle,
        post.categories.flatMap(categorySearchBlob).join(" "),
      ]);
    });
  }, [query, focusCategory]);

  const filtersActive = query.trim().length > 0 || focusCategory !== null;
  const hasLiveHits = livePosts.length > 0 || liveProfiles.length > 0;
  const discoveryEmpty =
    filtersActive &&
    !liveLoading &&
    !hasLiveHits &&
    trendingMatches.length === 0 &&
    explorerMatches.length === 0 &&
    postMatches.length === 0;

  const searchHint = useMemo(() => {
    if (discoveryEmpty && filtersActive) {
      return `No hits for "${query.trim() || "current filters"}" in tript or the local mood boards — try another word.`;
    }
    const n = normalizeExploreQuery(query).length;
    if (n > 0 && n < EXPLORE_LIVE_SEARCH_MIN_CHARS) {
      return `Type at least ${EXPLORE_LIVE_SEARCH_MIN_CHARS} letters to query live trip logs and travellers in Postgres.`;
    }
    return "Live search reads trip titles, teasers, locations, waypoint names, usernames, and display names — mood boards below stay as inspiration.";
  }, [discoveryEmpty, filtersActive, query]);

  function clearFilters() {
    setQuery("");
    setFocusCategory(null);
  }

  function toggleCategory(next: ExploreCategoryId) {
    setFocusCategory((previous) => (previous === next ? null : next));
  }

  return (
    <div className={cx("min-h-[100vh] bg-gradient-to-b from-[#f9fbfb] via-white to-[#eef5ee] pb-28 text-neutral-900")}>
      <header className="sticky top-0 z-30 bg-gradient-to-b from-white/94 via-[#f7fff7]/93 to-transparent px-5 pb-[18px] pt-8 backdrop-blur-md">
        <div className="space-y-[10px]">
          <div className="space-y-[6px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-primary/92">Explore / Search</p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-[220px] flex-1">
                <h1 className="text-[34px] font-semibold tracking-tight text-neutral-950">Where next?</h1>
                <p className="text-sm leading-relaxed text-neutral-600">
                  Fuse Pinterest boards with traveller IG tabs — riff on hues, itineraries, moods.
                </p>
              </div>
              {filtersActive ? (
                <Button type="button" variant="ghost" size="sm" className="-mb-3 text-neutral-950" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>

          <SearchBar value={query} onChange={(next) => setQuery(next)} onClear={() => setQuery("")} hint={searchHint} />

          {liveError ? (
            <Card padding="md" tone="muted" className="border-red-200/90 bg-red-50/95 text-sm font-medium text-red-900 shadow-sm">
              {liveError}
            </Card>
          ) : null}

          <div className="-mx-4 px-1">
            <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-6 pl-5 pr-[28px]" aria-label="Destination categories">
              {exploreCategoryCatalog.map((category) => (
                <li key={category.id} className="snap-start">
                  <DestinationChip
                    category={category}
                    selected={focusCategory === category.id}
                    onToggle={() => toggleCategory(category.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="space-y-[48px] px-5 pb-12 pt-[10px]">
        {liveLoading && shouldRunLiveExploreSearch(normalizeExploreQuery(query)) ? (
          <LoadingState message="Scanning public trips and traveller profiles in Supabase…" className="py-10" />
        ) : null}

        {discoveryEmpty ? (
          <EmptyState
            icon={<RadarGlyph aria-hidden className="text-primary drop-shadow-[0_6px_20px_rgba(133,187,101,0.45)]" />}
            title="No pins matched that vibe yet"
            description={
              <>
                Nothing surfaced from Postgres or the curated mood boards — broaden your search, drop a category chip, or reset filters.
              </>
            }
            action={
              <Button type="button" variant="primary" className="px-12" onClick={clearFilters}>
                Reset explorers
              </Button>
            }
          />
        ) : null}

        {!discoveryEmpty && hasLiveHits ? (
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">Live from tript</p>
        ) : null}

        {!discoveryEmpty && livePosts.length > 0 ? (
          <ExplorePostGrid
            headline="Trip logs on tript"
            subheading="Public recaps that match your text — tap through to the full journal."
            posts={livePosts}
          />
        ) : null}

        {!discoveryEmpty && liveProfiles.length > 0 ? (
          <section aria-labelledby="live-travellers-heading" className="space-y-6">
            <div className="space-y-[6px] px-3">
              <h2 id="live-travellers-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
                Travellers on tript
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Discoverable profiles matching your sieve · {liveProfiles.length} explorer
                {liveProfiles.length === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="-mx-8 px-[10px]">
              <ul className="flex snap-x gap-6 overflow-x-auto pb-[10px] pl-10 pr-12" role="list">
                {liveProfiles.map((traveler) => (
                  <li key={traveler.id} className="snap-start">
                    <SuggestedTravelerCard
                      traveler={traveler}
                      profileHref={`/profile?visit=${encodeURIComponent(traveler.id)}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {!discoveryEmpty && trendingMatches.length > 0 ? (
          <section aria-labelledby="trending-dest-heading" className="space-y-6">
            <div className="space-y-[6px] px-3">
              <h2 id="trending-dest-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
                Trending destinations
              </h2>
              <p className="text-[15px] text-neutral-600">
                Curated mood boards (local) · spotlighting{" "}
                <span className="font-semibold text-neutral-950">{trendingMatches.length}</span> palettes
                {hasLiveHits ? " alongside your live hits" : " right now"}.
              </p>
            </div>
            <div className="-mx-6 px-2">
              <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-[18px] pl-10 pr-[22px]" role="list">
                {trendingMatches.map((destination) => (
                  <li key={destination.id} className="snap-start">
                    <TrendingDestinationCard destination={destination} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {!discoveryEmpty && explorerMatches.length > 0 ? (
          <section aria-labelledby="suggested-travelers-heading" className="space-y-6">
            <div className="space-y-[6px] px-3">
              <h2 id="suggested-travelers-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
                Suggested explorers
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Seeded dossiers riffing IG story cadence · {explorerMatches.length} scouts match your sieve.
              </p>
            </div>
            <div className="-mx-8 px-[10px]">
              <ul className="flex snap-x gap-6 overflow-x-auto pb-[10px] pl-10 pr-12" role="list">
                {explorerMatches.map((traveler) => (
                  <li key={traveler.id} className="snap-start">
                    <SuggestedTravelerCard traveler={traveler} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {!discoveryEmpty && postMatches.length > 0 ? (
          <ExplorePostGrid
            headline="Mood-board trip tiles"
            subheading="Seeded palettes inspired by traveller scrapbooks — tap tiles for narration drafts."
            posts={postMatches}
          />
        ) : null}
      </div>
    </div>
  );
}

function RadarGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="44" height="44" fill="none" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="4" opacity="0.4" />
      <path d="M32 4v56M4 32h56" stroke="currentColor" strokeWidth="4" opacity="0.28" strokeLinecap="round" />
      <path d="M32 44a16 16 0 1 1 13-25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
