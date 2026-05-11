import Link from "next/link";

import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

import type { TravelPostDetail } from "@/types";

import { PostDetailContent } from "@/features/posts/components/PostDetailContent";
import { PostDetailHero } from "@/features/posts/components/PostDetailHero";
import { PostPublishMediaWarningBanner } from "@/features/posts/components/PostPublishMediaWarningBanner";

type PostDetailScreenProps = {
  requestedId: string;
  detail: TravelPostDetail | null;
};

export function PostDetailScreen({ requestedId, detail }: PostDetailScreenProps) {
  if (!detail) {
    return (
      <div className="flex min-h-[100vh] flex-col bg-gradient-to-b from-[#f7fdfa] via-white to-[#eaf4ea] px-5 pb-[120px] pt-14">
        <div className="mb-8 ml-[-4px]">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center rounded-2xl border border-neutral-200 bg-white px-4 py-[10px] text-sm font-semibold text-neutral-950 shadow-lg shadow-neutral-950/15 outline-none ring-primary/35 transition hover:border-primary/65 focus-visible:ring-4"
          >
            ← Back to feed
          </Link>
        </div>

        <EmptyState
          title="This travel tale isn’t reachable yet"
          description={
            <>
              Nothing in the seeded library or Supabase surfaced for{" "}
              <span className="font-semibold text-neutral-900">{requestedId}</span> — try another recap or compose a fresh log from{" "}
              <span className="font-semibold text-neutral-900">Create</span>.
            </>
          }
          action={
            <Link href="/create" prefetch={false} className={buttonClassName({ variant: "primary", size: "md", className: "px-10" })}>
              Open composer
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="min-h-[100vh] bg-gradient-to-b from-[#fbfaf7] via-white to-[#ecf4ea] pb-36 text-neutral-900">
      <PostDetailHero
        hero={{
          imageUrl: detail.imageUrl,
          imageAlt: detail.imageAlt,
          locationDisplay: detail.locationDisplay,
          title: detail.title,
        }}
      />

      <div className="relative z-20 px-5">
        <PostPublishMediaWarningBanner postId={detail.id} />
      </div>

      <PostDetailContent key={detail.id} detail={detail} />
    </article>
  );
}
