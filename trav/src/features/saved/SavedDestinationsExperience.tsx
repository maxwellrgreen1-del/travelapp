"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/ui/PageHeader";
import type { SavedDestinationCategoryId } from "@/features/saved/mockSavedDestinations";
import { mockSavedDestinationPins, savedDestinationCategoryOptions } from "@/features/saved/mockSavedDestinations";
import { SavedDestinationFilters } from "@/features/saved/components/SavedDestinationFilters";
import { SavedDestinationList } from "@/features/saved/components/SavedDestinationList";
import { blobMatchesExploreQuery } from "@/features/search/filterUtils";
import { cx } from "@/lib/utils";

/**
 * Saved tab client shell — vibes + lexical filters over the mock wish compass.
 */
export function SavedDestinationsExperience() {
  const totalCount = mockSavedDestinationPins.length;
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<SavedDestinationCategoryId | null>(null);

  const matchedPins = useMemo(() => {
    return mockSavedDestinationPins.filter((pin) => {
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
  }, [categoryId, query]);

  const filtersActive = query.trim().length > 0 || categoryId !== null;

  return (
    <main className="space-y-7 pb-28 pt-2 sm:pt-5">
      <PageHeader
        showBackNavigation={false}
        title="Saved destinations"
        subtitle={
          <span className="text-neutral-600">
            A living moodboard — every pin remembers why your thumb hovered before you booked anything.
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
              Showing <span className="text-primary">{matchedPins.length}</span>{" "}
              <span aria-hidden>/</span> <span>{totalCount}</span> escapes
            </>
          ) : (
            <>Showing all {matchedPins.length} escapes</>
          )}
        </p>
        {!filtersActive ? (
          <p className="text-xs font-medium italic text-neutral-500">Swipe cards open recaps or widen in Explore.</p>
        ) : null}
      </div>

      <SavedDestinationList
        pins={matchedPins}
        totalLibraryCount={totalCount}
        onClearFilters={() => {
          setQuery("");
          setCategoryId(null);
        }}
      />
    </main>
  );
}
