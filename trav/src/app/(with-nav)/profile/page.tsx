import { Suspense } from "react";

import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileScreen } from "@/features/profile/ProfileScreen";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState message="Opening profile…" className="min-h-[50vh] py-20" />}>
      <ProfileScreen />
    </Suspense>
  );
}
