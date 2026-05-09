import Link from "next/link";
import type { ReactNode } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SavedDestinationPin } from "@/features/saved/mockSavedDestinations";

import { SavedDestinationCard } from "./SavedDestinationCard";

export type SavedDestinationListProps = {
  pins: SavedDestinationPin[];
  totalLibraryCount: number;
  /** Filters currently hiding every pin — show reset affordance. */
  onClearFilters: () => void;
  emptyExtra?: ReactNode;
};

export function SavedDestinationList({
  pins,
  totalLibraryCount,
  onClearFilters,
  emptyExtra,
}: SavedDestinationListProps) {
  if (pins.length === 0) {
    const defaultDescription =
      totalLibraryCount === 0
        ? "When a recap or explore tile stops your thumb, tuck it here — tides, ridges, ramen glow."
        : "Nothing in this slice matches yet — loosen filters or widen the compass.";

    return (
      <EmptyState
        title={totalLibraryCount === 0 ? "Serene emptiness ahead" : "No pins in this braid"}
        description={
          <>
            <p>{defaultDescription}</p>
            {emptyExtra ? <div className="mt-4 space-y-2 text-sm text-neutral-600">{emptyExtra}</div> : null}
          </>
        }
        icon={<WishlistBloom aria-hidden />}
        action={
          totalLibraryCount === 0 ? (
            <Link href="/search" prefetch={false} className={buttonClassName({ variant: "primary", size: "md" })}>
              Browse explore
            </Link>
          ) : (
            <Button type="button" variant="outlinePrimary" onClick={onClearFilters}>
              Clear filters
            </Button>
          )
        }
      />
    );
  }

  return (
    <ul className="space-y-9">
      {pins.map((pin) => (
        <li key={pin.id}>
          <SavedDestinationCard destination={pin} />
        </li>
      ))}
    </ul>
  );
}

function WishlistBloom({ className }: { className?: string }) {
  return (
    <svg className={className} width="46" height="46" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        opacity="0.18"
        d="M11.995 21a1.62 1.62 0 0 1-1.12-.449l-.08-.086-5.93-7.058a6.52 6.52 0 0 1 8.93-9.478 6.519 6.519 0 0 1 8.924 9.473l-.008.013-5.93 7.052a1.62 1.62 0 0 1-1.216.683Z"
      />
      <path
        fill="currentColor"
        opacity="0.55"
        d="M13.62 17.62c-.62.618-1.62.617-2.239 0 0 0-4.93-6.068-5.93-8.068a6.519 6.519 0 0 1 8.924-9.478 6.519 6.519 0 1 1-8.93 14.068l-.005-.063Z"
      />
    </svg>
  );
}
