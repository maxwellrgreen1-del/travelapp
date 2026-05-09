import { Badge } from "@/components/ui/Badge";
import { cx } from "@/lib/utils";

type PlacesVisitedListProps = {
  places: string[];
  className?: string;
};

export function PlacesVisitedList({ places, className }: PlacesVisitedListProps) {
  if (!places.length) {
    return null;
  }

  return (
    <section aria-labelledby="places-visited-heading" className={cx("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <h2 id="places-visited-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
          Places visited
        </h2>
        <Badge tone="neutral" className="text-[10px] font-semibold">
          Anchors only — pinned maps tie to Supabase next.
        </Badge>
      </div>
      <ol className="space-y-[14px]" role="list">
        {places.map((spot, index) => (
          <li
            key={`${spot}-${index}`}
            className="flex gap-4 rounded-[20px] border border-neutral-200/90 bg-neutral-950/[0.02] px-[18px] py-[14px] shadow-inner shadow-neutral-950/10"
          >
            <span
              aria-hidden
              className="mt-[2px] flex size-[28px] shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-md shadow-primary/45"
            >
              {index + 1}
            </span>
            <p className="text-[15px] leading-relaxed text-neutral-800">{spot}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
