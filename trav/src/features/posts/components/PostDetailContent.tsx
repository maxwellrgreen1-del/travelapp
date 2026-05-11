"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

import type { TravelPostDetail } from "@/types";

import { PostActions } from "@/features/feed/components/PostActions";
import { PostCommentsSection } from "@/features/posts/comments/PostCommentsSection";
import { CommentPreviewList } from "@/features/posts/components/CommentPreviewList";
import { ExternalLinksList } from "@/features/posts/components/ExternalLinksList";
import { PlacesVisitedList } from "@/features/posts/components/PlacesVisitedList";
import { RestaurantRecommendationList } from "@/features/posts/components/RestaurantRecommendationList";

import { formatRelativeTime } from "@/lib/formatRelativeTime";

type PostDetailContentProps = {
  detail: TravelPostDetail;
};

export function PostDetailContent({ detail }: PostDetailContentProps) {
  const [liveCommentCount, setLiveCommentCount] = useState(detail.commentsCount);

  useEffect(() => {
    setLiveCommentCount(detail.commentsCount);
  }, [detail.id, detail.commentsCount]);

  const postedPhrase = formatRelativeTime(new Date(detail.postedAtISO));
  const usesSupabaseThread = detail.commentsFromDb !== undefined;

  return (
    <div className="relative z-30 -mt-14 space-y-8 rounded-t-[42px] border border-transparent bg-[#fcfbf9] px-6 pb-24 pt-[36px] shadow-[0_-30px_60px_-25px_rgba(15,23,42,0.45)] sm:rounded-t-[48px] sm:pb-28 sm:pt-10 lg:-mt-[4.5rem]">
      <Card
        padding="none"
        tone="muted"
        className="rounded-[34px] border-neutral-950/94 bg-neutral-950/95 p-[2px] text-white shadow-2xl shadow-neutral-950/55"
      >
        <section className="space-y-[18px] rounded-[inherit] px-6 py-8 sm:px-[30px] sm:py-9">
          <div className="flex flex-wrap items-start gap-6">
            <Avatar
              size="lg"
              className="size-[78px] border-[4px] border-white shadow-lg shadow-neutral-950/55"
              src={detail.avatarUrl}
              initials={detail.userInitials}
              alt={`${detail.username} portrait`}
            />
            <div className="flex min-w-[180px] flex-1 flex-col gap-[10px] text-white">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-[26px] font-semibold tracking-tight">@{detail.username}</span>
                <time className="text-[13px] font-semibold uppercase tracking-[0.3em] text-white/82" dateTime={detail.postedAtISO}>
                  Posted · {postedPhrase}
                </time>
              </div>
              <p className="text-[17px] font-semibold uppercase tracking-[0.28em] text-primary drop-shadow">{detail.locationDisplay}</p>
              <PostActions
                postId={detail.id}
                initialLikeCount={detail.likesCount}
                commentsCount={liveCommentCount}
                initialViewerHasLiked={detail.viewerHasLiked}
                initialViewerHasSaved={detail.viewerHasSaved}
              />
            </div>
          </div>
        </section>
      </Card>

      <Card padding="lg" className="space-y-7 rounded-[32px] border-neutral-950/93 bg-white/98 shadow-xl shadow-neutral-950/55">
        <header className="space-y-[10px]">
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-neutral-950">{detail.title}</h1>
          <p className="text-[17px] leading-relaxed text-neutral-600">{detail.description}</p>
        </header>

        {detail.destinationTags && detail.destinationTags.length ? (
          <div className="flex flex-wrap gap-[10px]">
            {detail.destinationTags.map((tag) => (
              <Badge key={tag} tone="primary" className="rounded-full px-4 py-[5px] text-[12px] font-semibold lowercase">
                #{tag.replace(/\s+/g, "").toLowerCase()}
              </Badge>
            ))}
          </div>
        ) : null}

        <article className="space-y-[18px]" aria-label="Trip journal excerpt">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.38em] text-primary">Trail journal thread</h2>
          <p className="whitespace-pre-line text-[17px] leading-[1.8] text-neutral-900">{detail.journal}</p>
        </article>
      </Card>

      <PlacesVisitedList places={detail.placesVisited} />
      <RestaurantRecommendationList restaurants={detail.restaurants} />
      <ExternalLinksList links={detail.externalLinks} />

      {usesSupabaseThread ? (
        <PostCommentsSection
          postId={detail.id}
          initialComments={detail.commentsFromDb ?? []}
          initialTotalCount={detail.commentsCount}
          loadError={detail.commentsLoadError ?? null}
          onCountChange={setLiveCommentCount}
        />
      ) : (
        <CommentPreviewList
          comments={detail.commentPreview}
          tone={`${detail.commentsCount} scouts chimed globally`}
        />
      )}
    </div>
  );
}
