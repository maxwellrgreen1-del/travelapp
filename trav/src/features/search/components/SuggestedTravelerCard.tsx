import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ExploreCategoryId } from "@/features/search/mockExploreData";
import type { SuggestedExplorer } from "@/features/search/mockExploreData";
import { cx } from "@/lib/utils";

const categoryTone: Partial<Record<ExploreCategoryId, "primary" | "outline" | "neutral">> = {
  mountains: "neutral",
  coast: "neutral",
  city: "outline",
  culture: "primary",
  wildlife: "primary",
  trail: "neutral",
};

type SuggestedTravelerCardProps = {
  traveler: SuggestedExplorer;
};

/** Compact roster row that hints at traveller POV arcs + social proof. */
export function SuggestedTravelerCard({ traveler }: SuggestedTravelerCardProps) {
  const profilePeek = `/profile` as const;

  return (
    <Card tone="muted" padding="lg" className={cx("w-[280px] shrink-0 rounded-[26px] border-neutral-200/95 bg-white/98 shadow-xl shadow-neutral-950/25")}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Avatar
            size="md"
            className="size-[68px] border-4 border-neutral-950/92 shadow-xl shadow-neutral-950/65"
            src={traveler.avatarUrl}
            initials={traveler.initials}
            alt={`Portrait of ${traveler.displayName}`}
          />

          <div className="min-w-0 flex-1 space-y-1 pt-2">
            <Link
              prefetch={false}
              href={profilePeek}
              className={cx(
                "block truncate text-[17px] font-semibold text-neutral-950 outline-none ring-primary/40 transition hover:text-primary hover:underline",
                "focus-visible:underline focus-visible:ring-4 rounded-sm",
              )}
            >
              {traveler.displayName}
            </Link>
            <p className="truncate text-[14px] font-semibold tracking-tight text-primary">@{traveler.username}</p>
          </div>
        </div>

        {traveler.signatureTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {traveler.signatureTags.map((slug) => (
              <Badge key={`${traveler.id}-${slug}`} tone={categoryTone[slug] ?? "neutral"} className="text-[11px] font-semibold">
                #{slug}
              </Badge>
            ))}
          </div>
        ) : null}

        <p className="text-sm leading-relaxed text-neutral-600">{traveler.tagline}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-neutral-950">{traveler.followersLabel}</p>
          <Button type="button" variant="primary" disabled className="sm:ml-auto" fullWidth={false}>
            Follow soon
          </Button>
        </div>
      </div>
    </Card>
  );
}
