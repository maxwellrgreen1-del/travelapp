import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/ui/PageHeader";
import { APP_NAME } from "@/lib/constants";

type HomeFeedLayoutProps = {
  subtitle: ReactNode;
  children: ReactNode;
};

export function HomeFeedLayout({ subtitle, children }: HomeFeedLayoutProps) {
  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#fafaf8] via-white to-neutral-50 text-neutral-900">
      <div className="sticky top-0 z-30 border-b border-neutral-100/70 bg-neutral-50/90 px-4 py-4 backdrop-blur-md">
        <PageHeader
          title={
            <span className="inline-flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-primary/85">{APP_NAME}</span>
              <span className="text-3xl font-semibold tracking-tight text-neutral-950">For You</span>
            </span>
          }
          subtitle={subtitle}
          trailing={<NotificationsBellLink />}
          showBackNavigation={false}
        />
      </div>

      {children}
    </div>
  );
}

function NotificationsBellLink() {
  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="rounded-xl bg-white/90 p-2 text-neutral-800 shadow-sm shadow-neutral-950/15 outline-none ring-primary/30 backdrop-blur transition hover:bg-primary/10 hover:text-primary focus-visible:ring-4"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4a6 6 0 0 1 6 6v3.382l3 4.118H3l3-4.118V10a6 6 0 0 1 6-6Z"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinejoin="round"
        />
        <path d="M9 19a3 3 0 1 0 6 0" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
