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
    <div className="min-h-[100vh] w-full min-w-0 max-w-full bg-gradient-to-b from-[#fafaf8] via-white to-neutral-50 text-neutral-900">
      <div className="sticky top-0 z-30 box-border w-full border-b border-neutral-100/70 bg-neutral-50/90 py-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(2rem,calc(env(safe-area-inset-right,0px)+1rem))] backdrop-blur-md sm:pl-6 sm:pr-10">
        <PageHeader
          title={
            <span className="inline-flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-primary/85">{APP_NAME}</span>
              <span className="text-3xl font-semibold tracking-tight text-neutral-950">For You</span>
            </span>
          }
          subtitle={subtitle}
          trailing={
            <div className="ms-3 shrink-0 sm:ms-4">
              <NotificationsBellLink />
            </div>
          }
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
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/95 bg-white/96 text-neutral-800 outline-none ring-offset-2 ring-offset-neutral-50 ring-primary/35 backdrop-blur transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/40 active:brightness-[0.98]"
    >
      <svg className="size-[22px] shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none">
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
