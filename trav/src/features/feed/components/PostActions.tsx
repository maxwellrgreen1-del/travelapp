"use client";

import Link from "next/link";
import { useState } from "react";

import { cx } from "@/lib/utils";

type PostActionsProps = {
  postId: string;
  initialLikeCount: number;
  commentsCount: number;
  /** Share an anchor with the eventual comments rail. */
  commentHrefFragment?: string;
};

/**
 * Thumb-scale controls with optimistic-ish counts for mocked posts.
 */
export function PostActions({
  postId,
  initialLikeCount,
  commentsCount,
  commentHrefFragment = "comments",
}: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const commentHref = `/post/${postId}#${commentHrefFragment}`;

  function toggleLike() {
    setLiked((current) => {
      const next = !current;
      setLikeCount((count) => Math.max(0, count + (next ? 1 : -1)));
      return next;
    });
  }

  function toggleSave() {
    setSaved((value) => !value);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={toggleLike}
            className="-m-2 rounded-xl p-2 outline-none ring-primary/30 transition hover:bg-primary/10 active:scale-[0.96] focus-visible:ring-4"
            aria-pressed={liked}
            aria-label={liked ? "Unlike itinerary" : "Like itinerary"}
          >
            <HeartIcon filled={liked} className={liked ? "text-primary drop-shadow-[0_0_6px_rgba(133,187,101,0.55)]" : "text-neutral-800"} />
          </button>

          <Link
            href={commentHref}
            className="-m-2 rounded-xl p-2 text-neutral-800 outline-none ring-primary/30 transition hover:bg-primary/10 hover:text-neutral-950 active:scale-[0.96] focus-visible:ring-4"
            prefetch={false}
            aria-label={`Open comments · ${commentsCount} notes`}
          >
            <BubbleIcon aria-hidden />
          </Link>
        </div>

        <span className="flex-1" aria-hidden />

        <button
          type="button"
          onClick={toggleSave}
          className="-m-2 rounded-xl p-2 outline-none ring-primary/30 transition hover:bg-primary/10 active:scale-[0.96] focus-visible:ring-4"
          aria-pressed={saved}
          aria-label={saved ? "Remove from tript saves" : "Save itinerary"}
        >
          <RibbonIcon bookmarked={saved} className={saved ? "text-primary" : "text-neutral-800"} />
        </button>
      </div>

      <div className="space-y-2 text-sm leading-relaxed text-neutral-900">
        {likeCount > 0 ? (
          <p className="font-semibold tracking-tight text-neutral-900">
            <span className="tabular-nums">{likeCount.toLocaleString()}</span>
            <span className="font-normal text-neutral-600"> explorers cheered</span>
            {liked ? <span className="ml-1 text-[13px] font-medium text-primary">· you tapped in</span> : null}
          </p>
        ) : (
          <p className="text-neutral-500">Be first to cheer this leg of the trail.</p>
        )}

        {commentsCount > 0 ? (
          <Link
            href={commentHref}
            className="inline-flex text-neutral-600 outline-none ring-primary/30 transition hover:text-neutral-950 focus-visible:ring-4"
          >
            View all {commentsCount.toLocaleString()} comments
          </Link>
        ) : (
          <p className="text-neutral-500 text-xs">Trail notes open once friends comment.</p>
        )}
      </div>
    </div>
  );
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg className={cx("size-8", className)} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21.35l-1.45-1.32C5.4 14.74 2 11.61 2 7.93 2 5.63 3.93 4 6.42 4c1.71 0 3.43 1.02 5.58 3.06C13.93 5.02 15.71 4 17.52 4 20.09 4 22 5.71 22 8.53c0 3.73-3.53 7-8.93 11.92L12 21.35Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill={filled ? "currentColor" : "transparent"}
      />
    </svg>
  );
}

function BubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={cx("size-8", className)} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 13a9 9 0 1 0-3.93 8.54L21 22l-.6-6.54A9 9 0 0 0 21 13Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RibbonIcon({ bookmarked, className }: { bookmarked: boolean; className?: string }) {
  return (
    <svg className={cx("size-8", className)} viewBox="0 0 24 24" fill="none">
      <path
        d="M7 5h10v16l-5-4-5 4V5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill={bookmarked ? "currentColor" : "transparent"}
      />
    </svg>
  );
}
