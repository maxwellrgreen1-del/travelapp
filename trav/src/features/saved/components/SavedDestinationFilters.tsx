"use client";

import type { SavedDestinationCategoryId } from "@/features/saved/mockSavedDestinations";
import { SearchBar } from "@/features/search/components/SearchBar";
import { cx } from "@/lib/utils";

export type SavedDestinationFiltersProps = {
  query: string;
  onQueryChange: (next: string) => void;
  selectedCategoryId: SavedDestinationCategoryId | null;
  onCategoryChange: (next: SavedDestinationCategoryId | null) => void;
  categories: ReadonlyArray<{ id: SavedDestinationCategoryId; label: string }>;
};

/**
 * Capsule search + horizontally scrolling vibe chips (“quiet coast”, “spirit trail”, …).
 */
export function SavedDestinationFilters({
  query,
  onQueryChange,
  selectedCategoryId,
  onCategoryChange,
  categories,
}: SavedDestinationFiltersProps) {
  return (
    <div className="space-y-5">
      <SearchBar
        id="saved-destination-query"
        aria-label="Filter saved destinations by name, mood, tags, or memory"
        value={query}
        onChange={onQueryChange}
        onClear={() => onQueryChange("")}
        placeholder="Search pins, moods, cuisines, ridges…"
        hint="Matched against names, regions, memories, tags, and vibes."
      />

      <div className="space-y-2 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">Wishlist moods</p>
        <div
          className={cx(
            "flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]",
            "[&::-webkit-scrollbar]:hidden",
            "snap-x snap-mandatory motion-safe:-mx-4 motion-safe:px-4 md:mx-0 md:px-0",
          )}
          role="group"
          aria-label="Filter by category"
        >
          <FilterChip
            label="All"
            selected={selectedCategoryId === null}
            className="snap-start"
            onClick={() => onCategoryChange(null)}
          />

          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.label}
              selected={selectedCategoryId === category.id}
              className="snap-start"
              onClick={() =>
                onCategoryChange(selectedCategoryId === category.id ? null : category.id)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
  className,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "relative shrink-0 rounded-full px-[18px] py-2 text-[13px] font-semibold uppercase tracking-[0.15em]",
        "outline-none ring-primary/35 transition focus-visible:ring-4",
        "motion-safe:active:brightness-95",
        selected
          ? "border-2 border-primary bg-primary text-white shadow-[0_10px_32px_-8px_rgba(133,187,101,0.55)]"
          : "border border-neutral-300/95 bg-white/92 text-neutral-800 shadow-[0_6px_18px_-6px_rgba(15,15,22,0.18)] backdrop-blur-sm hover:border-primary/45",
        className,
      )}
    >
      {label}
      {selected ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[3px] -top-[3px] inline-flex size-2 rounded-full bg-white shadow-inner shadow-primary"
        />
      ) : null}
    </button>
  );
}
