import { LoadingState } from "@/components/ui/LoadingState";

import { HomeFeedLayout } from "@/features/feed/HomeFeedLayout";

export function HomeFeedSkeleton() {
  return (
    <HomeFeedLayout subtitle="Pulling explorers and trip logs fresh from Postgres — hang tight.">
      <div className="space-y-5 px-3 pb-8 pt-4 sm:px-4">
        <LoadingState message="Stitching the live trail…" className="py-24" />
      </div>
    </HomeFeedLayout>
  );
}
