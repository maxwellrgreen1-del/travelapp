import { Suspense } from "react";

import { HomeFeedSection } from "@/features/feed/HomeFeedSection";
import { HomeFeedSkeleton } from "@/features/feed/HomeFeedSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<HomeFeedSkeleton />}>
      <HomeFeedSection />
    </Suspense>
  );
}
