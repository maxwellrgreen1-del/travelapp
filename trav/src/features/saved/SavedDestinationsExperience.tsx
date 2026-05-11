"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/ui/PageHeader";
import type { SavedDestinationCategoryId, SavedDestinationPin } from "@/features/saved/mockSavedDestinations";
import { savedDestinationCategoryOptions } from "@/features/saved/mockSavedDestinations";
import { SavedDestinationFilters } from "@/features/saved/components/SavedDestinationFilters";
import { SavedDestinationList } from "@/features/saved/components/SavedDestinationList";
import { blobMatchesExploreQuery } from "@/features/search/filterUtils";
import { cx } from "@/lib/utils";

type SavedDestinationsExperienceProps = {
  /** Pins from Supabase saves — empty triggers the serene empty aisle with guidance toward the ribbon control. */
  initialPins: SavedDestinationPin[];
};

/**
 * Filters + tally row — swaps between an empty onboarding state and Postgres-backed recap cards seamlessly.
 */
export function SavedDestinationsExperience({ initialPins }: SavedDestinationsExperienceProps) {
  const totalCount = initialPins.length;
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<SavedDestinationCategoryId | null>(null);

  const matchedPins = useMemo(() => {
    return initialPins.filter((pin) => {
      if (categoryId && pin.categoryId !== categoryId) {
        return false;
      }

      const categoryLabel =
        savedDestinationCategoryOptions.find((chip) => chip.id === pin.categoryId)?.label ?? "";

      return blobMatchesExploreQuery(query, [
        pin.name,
        pin.countryRegion,
        pin.whySaved,
        ...pin.tags,
        categoryLabel,
      ]);
    });
  }, [initialPins, categoryId, query]);

  const filtersActive = query.trim().length > 0 || categoryId !== null;
  const hasRecaps = initialPins.some((pin) => pin.cardKind === "recap");

  return (
    <main className="space-y-7 pb-28 pt-2 sm:pt-5">
      <PageHeader
        showBackNavigation={false}
        title="Saved destinations"
        subtitle={
          <span className="text-neutral-600">
            {hasRecaps
              ? "These trail logs stay tied to Supabase bookmarks — ribbons you tap on the feed snap straight into this shelf."
              : "When a recap or explore tile stops your thumb, tuck it here — tides, ridges, ramen glow."}
          </span>
        }
        trailing={
          <div className={cx("rounded-[22px] border border-primary/30 bg-white/94 px-[14px] py-3 text-right shadow-lg shadow-primary/15")}>
            <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-primary">Shelved</p>
            <p className="tabular-nums text-[30px] font-semibold tracking-tighter text-neutral-950">{totalCount}</p>
          </div>
        }
      />

      <SavedDestinationFilters
        query={query}
        onQueryChange={setQuery}
        selectedCategoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={savedDestinationCategoryOptions}
      />

      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <p className="text-sm font-semibold text-neutral-800">
          {filtersActive ? (
            <>
              Showing <span className="text-primary">{matchedPins.length}</span> <span aria-hidden>/</span>{" "}
              <span>{totalCount}</span> escapes
            </>
          ) : (
            <>
              Showing all {matchedPins.length} {hasRecaps ? "saved recaps" : "escapes"}
            </>
          )}
        </p>
        {!filtersActive ? (
          <p className="text-xs font-medium italic text-neutral-500 sm:self-auto">
            {hasRecaps ? "Open a card to revisit the full journal — bookmarks stay sorted by newest save." : "Swipe cards open recaps or widen in Explore."}
          </p>
        ) : null}
      </div>

      <SavedDestinationList
        pins={matchedPins}
        totalLibraryCount={totalCount}
        onClearFilters={() => {
          setQuery("");
          setCategoryId(null);
        }}
        emptyExtra={
          totalCount === 0 ? (
            <p className="text-pretty leading-relaxed">
              Tap the ribbon on any recap in the feed or on a trip detail header — saves land here instantly via the same Supabase stash.
            </p>
          ) : undefined
        }
      />
    </main>
  );
}
