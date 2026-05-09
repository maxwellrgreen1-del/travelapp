import type { ReactNode } from "react";

import { MobileAppShell } from "@/components/layout/MobileAppShell";

export default function WithNavLayout({ children }: { children: ReactNode }) {
  return <MobileAppShell>{children}</MobileAppShell>;
}
