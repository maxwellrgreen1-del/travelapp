import { cx } from "@/lib/utils";
import type { ExploreCategoryChip } from "@/features/search/mockExploreData";

type DestinationChipProps = {
  category: ExploreCategoryChip;
  selected: boolean;
  onToggle: () => void;
};

/** Pinterest-esque pill filters that stack energy without leaving the carousel. */
export function DestinationChip({ category, selected, onToggle }: DestinationChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cx(
        "flex min-h-[112px] w-[146px] snap-start shrink-0 flex-col justify-between rounded-[26px] border px-[14px] py-4 text-left transition",
        "outline-none ring-primary/35 focus-visible:ring-4",
        selected
          ? "border-primary bg-primary/90 text-neutral-950 shadow-xl shadow-primary/45"
          : "border-neutral-200/95 bg-neutral-950/82 text-white shadow-lg shadow-neutral-950/45 hover:border-neutral-950/95",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.45em]" style={{ opacity: selected ? 0.75 : 0.86 }}>
        {category.subtitle}
      </span>
      <span className="mt-8 text-[16px] font-semibold leading-tight">{category.label}</span>
    </button>
  );
}
