import { Badge } from "@/components/ui/Badge";
import { cx } from "@/lib/utils";

type RestaurantRecommendationListProps = {
  restaurants: string[];
  className?: string;
};

export function RestaurantRecommendationList({ restaurants, className }: RestaurantRecommendationListProps) {
  if (!restaurants.length) {
    return null;
  }

  return (
    <section aria-labelledby="restaurant-recs-heading" className={cx("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <h2 id="restaurant-recs-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
          Restaurant snapshots
        </h2>
        <Badge tone="outline" className="text-[10px] font-semibold">
          Tasting notes crib sheet
        </Badge>
      </div>
      <ul className="space-y-[12px]" role="list">
        {restaurants.map((bite, index) => (
          <li
            key={`${bite}-${index}`}
            className="relative overflow-hidden rounded-[18px] border border-dashed border-primary/45 bg-white px-[18px] py-[13px]"
          >
            <span className="absolute inset-y-5 left-[10px] w-[3px] rounded-full bg-primary/70" aria-hidden />
            <p className="pl-5 text-[15px] leading-relaxed text-neutral-900">{bite}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
