import { Suspense } from "react";

import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { ProfileScreenSkeleton } from "@/features/profile/ProfileScreenSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<ProfileScreenSkeleton />}>
      <ProfileScreen />
    </Suspense>
  );
}
