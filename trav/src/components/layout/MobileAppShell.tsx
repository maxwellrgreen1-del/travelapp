import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/BottomNav";

type MobileAppShellProps = {
  children: ReactNode;
};

/**
 * Holds the scrolling page content plus the fixed-like bottom navigation.
 * `max-w-lg` keeps the MVP feeling phone-first on wider screens without extra tooling.
 */
export function MobileAppShell({ children }: MobileAppShellProps) {
  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-lg flex-col bg-white text-neutral-900">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <BottomNav />
    </div>
  );
}
