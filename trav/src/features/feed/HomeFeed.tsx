"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedComposerCTA } from "@/features/feed/components/FeedComposerCTA";
import type { HomeFeedResult } from "@/features/feed/loadHomeFeedPayload";
import { HomeFeedLayout } from "@/features/feed/HomeFeedLayout";
import { PostCard } from "@/features/feed/components/PostCard";
import { APP_NAME } from "@/lib/constants";

type HomeFeedProps = {
  result: HomeFeedResult;
};

/** Client shell so readers can gently retry Postgres hiccups without leaving home. */
export function HomeFeed({ result }: HomeFeedProps) {
  const router = useRouter();

  if (result.type === "error") {
    return (
      <HomeFeedLayout subtitle="Fresh trip recaps stream from Supabase when the wind cooperates — try reconnecting once.">
        <div className="px-3 pb-8 pt-4 sm:px-4">
          <EmptyState
            title="The live feed hit turbulence"
            description={result.message}
            action={
              <Button type="button" variant="primary" size="lg" className="px-8" onClick={() => router.refresh()}>
                Retry feed load
              </Button>
            }
            className="mt-4"
          />
        </div>
      </HomeFeedLayout>
    );
  }

  const { posts, usedMockFallback } = result;

  return (
    <HomeFeedLayout
      subtitle={
        usedMockFallback
          ? `Seeded itineraries from ${APP_NAME} lore stand in until the first explorers publish publicly — Compose when you touch down.`
          : "Fresh public trails from explorers on tript surface here first — seeded lore stays dormant while Postgres hums."
      }
    >
      <div className="space-y-5 px-3 pb-8 pt-4 sm:px-4">
        <div className="sticky top-[2px] z-20 space-y-3 pb-3">
          <FeedComposerCTA />

          {usedMockFallback ? (
            <Card
              tone="muted"
              padding="sm"
              className="border-dashed border-primary/35 bg-white/95 text-[13px] leading-relaxed text-neutral-700"
            >
              <p className="font-semibold text-neutral-950">Practice runway mode</p>
              <p>
                Postgres did not surface any readable public logs yet — you are scrolling the lovingly mocked catalog. Publish from{" "}
                <strong className="text-primary">Create</strong> to light up Supabase-backed cards for everyone signed in as your audience.
              </p>
            </Card>
          ) : null}
        </div>

        <ol className="flex list-none flex-col gap-9" aria-label={`${APP_NAME} travel feed timeline`}>
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ol>
      </div>
    </HomeFeedLayout>
  );
}
