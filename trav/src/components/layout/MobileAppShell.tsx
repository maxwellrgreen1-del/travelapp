import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/BottomNav";

type MobileAppShellProps = {
  children: ReactNode;
};

/**
 * Holds the scrolling page content plus the fixed-like bottom navigation.
 * `max-w-lg` keeps the MVP feeling phone-first on wider screens without extra tooling.
 *
 * The shell is viewport-tall with `overflow-hidden` so only the middle column scrolls;
 * the tab bar stays pinned above the home indicator like a native tab bar.
 */
export function MobileAppShell({ children }: MobileAppShellProps) {
  return (
    <div className="mx-auto flex h-dvh min-h-0 w-full min-w-0 max-w-lg flex-col overflow-hidden bg-white text-neutral-900">
      {/** `min-w-0` lets phone-column layouts shrink instead of overflowing past `max-w-lg` (e.g. wide feed headers). */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip overflow-y-auto pb-24 [scrollbar-gutter:stable]">
        {children}
      </div>
      <div className="shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
