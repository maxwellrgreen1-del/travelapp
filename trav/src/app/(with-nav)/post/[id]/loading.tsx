import { cx } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-2xl bg-neutral-200/90", className)} aria-hidden />;
}

export default function PostDetailLoading() {
  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#fbfaf7] via-white to-[#ecf4ea] pb-36 text-neutral-900">
      <div className="relative isolate w-full bg-neutral-950 shadow-2xl shadow-neutral-950/55">
        <div className="absolute inset-x-0 top-[18px] z-20 px-6">
          <Pulse className="h-10 w-[140px] rounded-[18px] border border-white/20 bg-white/10" />
        </div>
        <div className="relative aspect-[5/8] overflow-hidden rounded-b-[42px] sm:aspect-[4/6] lg:aspect-[16/10] lg:rounded-b-[48px]">
          <Pulse className="absolute inset-0 rounded-b-[inherit] bg-neutral-800/95" />
          <div className="absolute inset-x-0 bottom-[32px] z-10 space-y-3 px-8">
            <Pulse className="h-3 w-32 bg-white/25" />
            <Pulse className="h-8 w-[min(100%,280px)] bg-white/30" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-5 pt-8">
        <Pulse className="h-4 w-[75%] max-w-md" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-[88%]" />
        <div className="grid gap-3 pt-4 sm:grid-cols-2">
          <Pulse className="h-24 w-full" />
          <Pulse className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
