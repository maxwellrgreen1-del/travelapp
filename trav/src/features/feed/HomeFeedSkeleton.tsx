import { HomeFeedLayout } from "@/features/feed/HomeFeedLayout";
import { cx } from "@/lib/utils";

function PulseBlock({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-xl bg-neutral-200/85", className)} aria-hidden />;
}

function FeedCardSkeleton() {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[28px] border border-neutral-200/80 bg-white",
        "shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <PulseBlock className="size-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <PulseBlock className="h-3 w-28" />
          <PulseBlock className="h-2.5 w-40 max-w-full" />
        </div>
      </div>
      <PulseBlock className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 px-4 pb-5 pt-4">
        <div className="flex gap-4">
          <PulseBlock className="h-4 w-16" />
          <PulseBlock className="h-4 w-16" />
          <PulseBlock className="h-4 w-16" />
        </div>
        <PulseBlock className="h-4 w-full" />
        <PulseBlock className="h-4 w-[92%]" />
        <PulseBlock className="h-3 w-[75%]" />
      </div>
    </div>
  );
}

export function HomeFeedSkeleton() {
  return (
    <HomeFeedLayout subtitle="Pulling explorers and trip logs fresh from Postgres — hang tight.">
      <div className="space-y-5 px-3 pb-8 pt-4 sm:px-4">
        <div className="sticky top-[2px] z-20 space-y-3 pb-3">
          <PulseBlock className="h-[72px] w-full rounded-[22px] border border-neutral-200/60 bg-neutral-50/80" />
        </div>
        <div className="flex flex-col gap-9" aria-hidden>
          <FeedCardSkeleton />
          <FeedCardSkeleton />
        </div>
      </div>
    </HomeFeedLayout>
  );
}
