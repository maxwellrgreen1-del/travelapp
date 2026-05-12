"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { FeedCommentsSheet } from "@/features/feed/components/FeedCommentsSheet";
import { PostActions } from "@/features/feed/components/PostActions";
import { PostHeader } from "@/features/feed/components/PostHeader";
import { PostMedia } from "@/features/feed/components/PostMedia";
import { isPersistentPostId } from "@/lib/postIds";
import { cx } from "@/lib/utils";
import type { TravelFeedPost } from "@/types";

type PostCardProps = {
  post: TravelFeedPost;
};

/** Full-width vertical card resembling a distilled Instagram travel reel. */
export function PostCard({ post }: PostCardProps) {
  const detailHref = `/post/${post.id}`;
  const persist = isPersistentPostId(post.id);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liveCommentCount, setLiveCommentCount] = useState(post.commentsCount);

  useEffect(() => {
    setLiveCommentCount(post.commentsCount);
  }, [post.id, post.commentsCount]);

  const handleOpenCommentsInline = useCallback(() => {
    setCommentsOpen(true);
  }, []);

  const handleCommentCountFromThread = useCallback((next: number) => {
    setLiveCommentCount(next);
  }, []);

  return (
    <article
      aria-labelledby={`caption-${post.id}`}
      className={cx(
        "relative overflow-hidden rounded-[28px]",
        "border border-neutral-200/80 bg-white",
        "shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]",
        "motion-safe:transition motion-safe:active:translate-y-[0.5px] motion-safe:active:opacity-98",
      )}
    >
      <PostHeader post={post} />

      <Link
        href={detailHref}
        className={cx(
          "group block outline-none ring-inset ring-primary/0 transition",
          "focus-visible:ring-4 motion-safe:hover:brightness-[1.02]",
        )}
        prefetch={false}
      >
        <PostMedia imageUrl={post.imageUrl} imageAlt={post.imageAlt} gallery={post.mediaGallery} />
      </Link>

      <section className="space-y-3 px-4 pb-5 pt-3">
        <PostActions
          postId={post.id}
          initialLikeCount={post.likesCount}
          commentsCount={liveCommentCount}
          initialViewerHasLiked={post.viewerHasLiked}
          initialViewerHasSaved={post.viewerHasSaved}
          commentsInteraction={persist ? "inlineSheet" : "detailLink"}
          onOpenCommentsInline={persist ? handleOpenCommentsInline : undefined}
          commentsSheetOpen={persist ? commentsOpen : undefined}
        />

        <div className="space-y-3">
          <p id={`caption-${post.id}`} className="text-[15px] leading-6">
            <Link
              href={detailHref}
              prefetch={false}
              className="font-semibold tracking-tight text-neutral-950 outline-none ring-primary/40 ring-offset-2 ring-offset-white transition hover:text-primary hover:underline focus-visible:underline focus-visible:ring-4 rounded-sm"
            >
              {post.username}
            </Link>{" "}
            <span className="text-neutral-950">{post.title}</span>
          </p>

          <p className="text-[14px] leading-relaxed text-neutral-700">{post.description}</p>
        </div>

        {post.placesPreview && post.placesPreview.length ? (
          <div className="rounded-[18px] border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-white to-primary/[0.04] px-[14px] py-3 shadow-inner shadow-primary/15">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">Trail stops preview</p>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-neutral-800">{post.placesPreview.join(" → ")}</p>
          </div>
        ) : null}

        {post.destinationTags && post.destinationTags.length ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.destinationTags.map((tag) => (
              <Badge key={tag} tone="primary" className="text-[11px] font-semibold lowercase tracking-normal">
                #{tag.replace(/\s+/g, "").toLowerCase()}
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      {persist ? (
        <FeedCommentsSheet
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
          postId={post.id}
          postTitle={post.title}
          onCountChange={handleCommentCountFromThread}
        />
      ) : null}
    </article>
  );
}
