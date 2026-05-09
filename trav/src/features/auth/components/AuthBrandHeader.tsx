import Link from "next/link";
import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

export type AuthBrandHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  className?: string;
};

/**
 * Shared compass-led masthead used on mocked login + signup sails.
 */
export function AuthBrandHeader({ eyebrow, title, subtitle, className }: AuthBrandHeaderProps) {
  return (
    <header className={cx("space-y-6 px-[18px] text-center text-neutral-900", className)}>
      <div className="-ml-3 flex justify-center">
        <Link
          href="/"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-primary underline-offset-4 outline-none ring-primary/30 hover:underline focus-visible:ring-4"
        >
          <HomeArrowGlyph className="-mt-[1px] shrink-0" aria-hidden />
          Back to feed
        </Link>
      </div>

      <div className="space-y-5">
        <div className="mx-auto inline-flex rounded-[34px] border border-primary/30 bg-white/93 p-[26px] shadow-[0_18px_54px_-32px_rgba(34,71,52,0.55)] backdrop-blur">
          <span className="sr-only">Trav brand compass emblem</span>
          <DecorCompassBadge aria-hidden className="text-primary drop-shadow-[0_8px_20px_rgba(133,187,101,0.35)]" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.45em] text-primary">{eyebrow}</p>
        <div className="space-y-[14px]">
          <h1 className="text-balance text-[30px] font-semibold leading-tight tracking-tight text-neutral-950">{title}</h1>
          <p className="mx-auto max-w-[34ch] text-sm leading-relaxed text-neutral-600">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}

function HomeArrowGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m14 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DecorCompassBadge({ className }: { className?: string }) {
  return (
    <svg width="88" height="88" viewBox="0 0 96 96" fill="none" className={className}>
      <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="5" opacity="0.22" />
      <line x1="48" y1="11" x2="48" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
      <line x1="11" y1="48" x2="85" y2="48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
      <path d="M48 14 60 74H36L48 14Z" fill="currentColor" opacity="0.92" />
      <circle cx="48" cy="48" r="6.5" fill="white" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}
