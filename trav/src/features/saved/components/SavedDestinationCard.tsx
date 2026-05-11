import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { SavedDestinationPin } from "@/features/saved/mockSavedDestinations";
import { savedDestinationCategoryOptions } from "@/features/saved/mockSavedDestinations";
import { cx } from "@/lib/utils";

export type SavedDestinationCardProps = {
  destination: SavedDestinationPin;
  className?: string;
};

function formatSavedBookmarkDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Editorial wishlist strip: hero imagery, remembrance copy, tactile CTAs into tript’s graph.
 */
export function SavedDestinationCard({ destination, className }: SavedDestinationCardProps) {
  const vibeLabel =
    savedDestinationCategoryOptions.find((category) => category.id === destination.categoryId)?.label ?? "Pinned";

  return (
    <Card
      padding="none"
      tone="muted"
      className={cx(
        "overflow-hidden rounded-[30px] border border-white/95 bg-gradient-to-br from-white/98 via-white to-[#f4fbf0]/90 shadow-xl shadow-neutral-950/18 ring-1 ring-neutral-950/12",
        className,
      )}
    >
      <article className="flex flex-col" aria-labelledby={`saved-name-${destination.id}`}>
        <div className="relative isolate overflow-hidden rounded-t-[28px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={destination.imageUrl}
            alt={destination.imageAlt}
            loading="lazy"
            className="aspect-[16/11] h-full w-full object-cover motion-safe:transition motion-safe:duration-700 hover:brightness-[1.03]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/55 via-transparent to-neutral-950/15" />

          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-white">
            <span className="rounded-full bg-primary/92 px-[12px] py-[6px] text-[10px] font-bold tracking-[0.2em] text-white shadow-[0_6px_18px_-4px_rgba(0,0,0,0.45)]">
              {destination.cardKind === "recap" ? "Trail recap" : "Wish compass"}
            </span>
            <span className="rounded-full bg-black/52 px-[12px] py-[6px] text-[10px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-sm">
              {vibeLabel}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <h2 id={`saved-name-${destination.id}`} className="text-xl font-semibold leading-tight text-neutral-950">
                  {destination.name}
                </h2>
                <p className="text-sm font-medium text-neutral-600">{destination.countryRegion}</p>
              </div>
              <span className="shrink-0 rounded-2xl border border-primary/30 bg-primary/10 px-[12px] py-2 text-right text-[11px] font-semibold text-primary shadow-inner shadow-white/95">
                <span className="block text-[10px] font-bold uppercase tracking-[0.34em] text-primary/95">
                  {destination.cardKind === "recap" ? "Saved" : "Pinned"}
                </span>
                <span className="tabular-nums text-neutral-950">{formatSavedBookmarkDate(destination.savedAtISO)}</span>
              </span>
            </div>

            <div className="rounded-[22px] border border-neutral-200/90 bg-neutral-950/[0.02] p-[18px] shadow-inner shadow-white/92">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/90">Why I saved this</p>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-neutral-800">{destination.whySaved}</p>
            </div>

            <div className="flex flex-wrap gap-[7px]" aria-label="Related tags">
              {destination.tags.map((tag) => (
                <Badge key={tag} tone="outline" className="rounded-full border-primary/35 bg-white/94 px-[12px] py-[5px] text-[11px] font-semibold lowercase">
                  #{tag.replace(/\s+/g, "")}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[10px] sm:flex-row sm:flex-wrap">
            {destination.relatedPostId ? (
              <Link
                href={`/post/${destination.relatedPostId}`}
                prefetch={false}
                className={buttonClassName({
                  variant: "outlinePrimary",
                  size: "md",
                  className: "inline-flex shrink-0",
                })}
              >
                {destination.cardKind === "recap" ? "Open saved recap" : "View related recap"}
              </Link>
            ) : (
              <p className="self-center px-2 text-[13px] font-medium italic text-neutral-500 sm:self-auto">
                No tript recap pinned yet · explore picks up the slack below.
              </p>
            )}

            <Link
              href="/search"
              prefetch={false}
              className={buttonClassName({
                variant: "primary",
                size: "md",
                className: "min-h-11 shrink-0",
              })}
            >
              Explore more like this
            </Link>
          </div>
        </div>
      </article>
    </Card>
  );
}
