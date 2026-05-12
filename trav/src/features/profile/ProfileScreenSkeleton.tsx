import { cx } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-xl bg-neutral-200/90", className)} aria-hidden />;
}

/**
 * Mirrors the profile shell (header band + stats row + trip grid) without replacing real copy later.
 */
export function ProfileScreenSkeleton() {
  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
      <main className="space-y-9 px-4 pb-28 pt-6 sm:px-5">
        <div className="overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 px-6 pb-8 pt-10 shadow-2xl shadow-neutral-950/45">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <Pulse className="size-[88px] shrink-0 rounded-[28px]" />
              <div className="min-w-0 flex-1 space-y-3 pt-1">
                <Pulse className="h-4 w-40 bg-white/25" />
                <Pulse className="h-7 w-56 max-w-full bg-white/30" />
                <Pulse className="h-3 w-full max-w-md bg-white/20" />
              </div>
            </div>
            <Pulse className="h-11 w-36 shrink-0 rounded-2xl bg-white/20" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[24px] border border-neutral-200/80 bg-white/90 p-4 shadow-sm">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 text-center">
              <Pulse className="mx-auto h-6 w-12" />
              <Pulse className="mx-auto h-3 w-20" />
            </div>
          ))}
        </div>

        <Pulse className="h-[140px] w-full rounded-[28px]" />

        <div className="space-y-3 px-1">
          <Pulse className="h-3 w-48" />
          <Pulse className="h-3 w-full max-w-lg" />
        </div>
        <ul className="grid grid-cols-3 gap-[6px] sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Pulse className="aspect-square w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
