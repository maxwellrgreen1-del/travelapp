import type { TravelerAtlasPin } from "@/features/profile/mockTravelerProfile";

import { cx } from "@/lib/utils";

type TravelMapPreviewProps = {
  pins: TravelerAtlasPin[];
  headline?: string;
  body?: string;
  className?: string;
};

/**
 * Illustrated atlas slab with pulsating pings — drop-in until Map SDK wiring ships.
 */
export function TravelMapPreview({
  pins,
  headline = "Signals on the atlas",
  body = "Waypoints seeded from SOS Wi-Fi threads, skipper notes, and midnight voice memos.",
  className,
}: TravelMapPreviewProps) {
  return (
    <section aria-label={`${pins.length}-pin travel snapshot`} className={cx("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4 px-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/85">{headline}</p>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-700">{body}</p>
        </div>
        <CompassRosette pinCount={pins.length} />
      </div>

      <div className="relative isolate overflow-hidden rounded-[32px] border border-white/50 bg-neutral-950/10 shadow-inner shadow-neutral-950/25">
        <div
          className={cx(
            "relative aspect-[16/10] bg-gradient-to-br from-sky-200/90 via-teal-100/92 to-emerald-100",
            "[background-image:radial-gradient(circle_at_20%_-15%,rgba(255,255,255,0.55),transparent_55%),radial-gradient(circle_at_115%_90%,rgba(15,118,110,0.35),transparent_45%)]",
          )}
        >
          <svg className="absolute inset-x-[-10%] bottom-[-8%] h-[118%] w-[120%] text-white/55" fill="none" viewBox="0 0 900 560">
            <defs>
              <linearGradient id="travelShoreGlow" x1="0%" y1="15%" x2="100%" y2="95%">
                <stop offset="0%" stopColor="rgba(248,252,251,1)" />
                <stop offset="100%" stopColor="rgba(45,212,191,0.32)" />
              </linearGradient>
            </defs>
            <path
              d="M40 372c148-132 294-226 478-258 146-45 294 14 394 154S904 478 734 478c-128 0-240-116-394-154-214-76-356-94-482-118Z"
              fill="url(#travelShoreGlow)"
              opacity=".6"
            />
            <path
              d="M120 392c154-148 348-266 596-294 146-52 274 26 378 174s22 356-226 394c-196 24-394-154-596-294Z"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="17"
              strokeLinecap="round"
            />
          </svg>

          {pins.map((pin) => (
            <AtlasPing key={pin.id} pin={pin} />
          ))}
        </div>
      </div>

      <p className="px-2 text-sm text-neutral-600">
        <span className="font-semibold text-neutral-900">{pins.length} live pings</span> surfaced from archival draft
        notes — tapping a bead reads the gist aloud for screen travellers.
      </p>
    </section>
  );
}

function AtlasPing({ pin }: { pin: TravelerAtlasPin }) {
  return (
    <button
      type="button"
      className={cx(
        "group absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/95",
      )}
      style={{ top: `${pin.topPct}%`, left: `${pin.leftPct}%` }}
      aria-label={`${pin.label}, ${pin.caption}`}
    >
      <span className="absolute inset-[-10px] rounded-full bg-white/55 blur-xl motion-safe:animate-pulse" aria-hidden />
      <span
        aria-hidden
        className={cx(
          "relative flex size-8 items-center justify-center rounded-full",
          "border border-white bg-primary text-[10px] font-semibold uppercase tracking-[0.2em]",
          "text-white shadow-xl shadow-neutral-950/65 transition-transform",
          "group-hover:scale-[1.06] motion-safe:active:scale-95",
        )}
      >
        ●
      </span>
    </button>
  );
}

function CompassRosette({ pinCount }: { pinCount: number }) {
  return (
    <div aria-hidden className="shrink-0 rounded-[26px] border border-primary/30 bg-white/95 px-5 py-3 text-center shadow-md shadow-neutral-950/25">
      <div className="text-[11px] font-semibold uppercase tracking-[0.4em] text-neutral-900">bearing</div>
      <div className="mt-3 flex items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-900">
        <span>N</span>
        <span className="text-2xl text-primary drop-shadow-[0_0_12px_rgba(133,187,101,0.55)]">{pinCount}</span>
        <span>S</span>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600">signals</p>
    </div>
  );
}
