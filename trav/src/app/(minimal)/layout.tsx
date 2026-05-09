import type { ReactNode } from "react";

export default function MinimalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-lg bg-white text-neutral-900">{children}</div>
  );
}
