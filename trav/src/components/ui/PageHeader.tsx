import Link from "next/link";
import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

export type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned actions (notifications, Done, menus). Great for thumbs on mobile. */
  trailing?: ReactNode;
  /** Renders an arrow linking back when you drill into detail screens later. */
  backHref?: string;
  /** Visually hides the eyebrow/back row when unnecessary. */
  showBackNavigation?: boolean;
  className?: string;
};

/**
 * Opinionated top-of-screen header for Trav — title column + optional trailing region.
 */
export function PageHeader({
  title,
  subtitle,
  trailing,
  backHref,
  showBackNavigation = true,
  className,
}: PageHeaderProps) {
  const showBack = showBackNavigation && Boolean(backHref);

  return (
    <header className={cx("space-y-4", className)}>
      {showBack && backHref ? (
        <div className="-ml-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-primary underline-offset-4 outline-none ring-primary/30 hover:underline focus-visible:ring-4"
          >
            <ChevronLeftIcon className="-mt-0.5 shrink-0" aria-hidden />
            Back
          </Link>
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-balance text-2xl font-semibold leading-tight tracking-tight text-neutral-900 [&_*]:tracking-tight">
            {title}
          </div>
          {subtitle ? <div className="text-sm leading-6 text-neutral-600">{subtitle}</div> : null}
        </div>
        {trailing ? <div className="shrink-0 pt-1">{trailing}</div> : null}
      </div>
    </header>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="m14 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
