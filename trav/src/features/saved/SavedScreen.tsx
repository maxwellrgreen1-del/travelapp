import type { ReactNode } from "react";

export function SavedScreen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#f4fbf1] via-white to-[#fcfbf9] text-neutral-900">
      <div className="mx-auto max-w-lg px-4 sm:max-w-xl sm:px-5">{children}</div>
    </div>
  );
}
