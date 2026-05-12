import { SavedScreen } from "@/features/saved/SavedScreen";
import { cx } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-2xl bg-neutral-200/90", className)} aria-hidden />;
}

export default function SavedLoading() {
  return (
    <SavedScreen>
      <div className="space-y-8 py-8" aria-busy="true" aria-label="Loading saved destinations">
        <div className="space-y-3">
          <Pulse className="h-9 w-56 max-w-full" />
          <Pulse className="h-4 w-full max-w-md" />
        </div>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[30px] border border-neutral-200/80 bg-white shadow-lg">
            <Pulse className="aspect-[16/11] w-full rounded-none" />
            <div className="space-y-4 p-6">
              <Pulse className="h-6 w-[66%] max-w-xs" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-[90%]" />
              <Pulse className="h-11 w-full rounded-xl" />
            </div>
          </div>
          <div className="overflow-hidden rounded-[30px] border border-neutral-200/80 bg-white shadow-lg">
            <Pulse className="aspect-[16/11] w-full rounded-none" />
            <div className="space-y-4 p-6">
              <Pulse className="h-6 w-[50%] max-w-xs" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </SavedScreen>
  );
}
