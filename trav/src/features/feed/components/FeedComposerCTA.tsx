import Link from "next/link";

import { buttonClassName } from "@/components/ui/Button";

/**
 * Loud-but-friendly prompt that mirrors Instagram’s reels composer affordance without leaving tript’s palette.
 */
export function FeedComposerCTA() {
  return (
    <aside className="relative isolate overflow-hidden rounded-[26px] border border-white/70 bg-neutral-950/90 p-[1px] shadow-[0_18px_50px_-30px_rgba(21,94,239,0.35)] backdrop-blur">
      <div className="absolute inset-px rounded-[26px] bg-linear-to-br from-primary/90 via-teal-500/80 to-emerald-600/95 opacity-[0.22]" />

      <div className="relative flex flex-wrap items-center gap-4 px-5 py-4">
        <div className="min-w-[56px] flex-1 basis-[180px] text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/85">Composer</p>
          <p className="mt-2 text-xl font-semibold leading-tight tracking-tight">Log your next waypoint</p>
          <p className="mt-2 text-sm text-white/80">
            Share photos, captions, pinned maps—instantly surfaced to explorers who roam like you do.
          </p>
        </div>
        <div className="flex min-w-[220px] flex-1 flex-col items-stretch gap-2">
          <Link
            href="/create"
            className={buttonClassName({
              variant: "primary",
              size: "lg",
              fullWidth: true,
              className:
                "!bg-white !text-emerald-900 !shadow-lg !shadow-emerald-900/15 hover:!brightness-105 focus-visible:ring-white/70",
            })}
          >
            <span aria-hidden className="text-xl leading-none">
              +
            </span>
            Compose travel log
          </Link>
          <Link
            href="/search"
            className="rounded-2xl border border-white/30 px-5 py-2 text-center text-sm font-semibold text-white/95 outline-none ring-white/50 transition hover:bg-white/10 focus-visible:ring-4"
          >
            Find destination tags
          </Link>
        </div>
      </div>
    </aside>
  );
}
