import { LoadingState } from "@/components/ui/LoadingState";

export default function SavedLoading() {
  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#f4fbf1] via-white to-[#fcfbf9] text-neutral-900">
      <div className="mx-auto max-w-lg px-4 sm:max-w-xl sm:px-5">
        <LoadingState message="Opening your tucked-away trails…" className="py-24" />
      </div>
    </div>
  );
}
