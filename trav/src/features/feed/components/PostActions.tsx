"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/features/auth/AuthSessionProvider";
import { likePost, savePost, unlikePost, unsavePost } from "@/features/engagement/supabaseLikeSave";
import { isPersistentPostId } from "@/lib/postIds";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

type PostActionsProps = {
  postId: string;
  initialLikeCount: number;
  commentsCount: number;
  /** Hydrated on the server for Supabase UUID posts; mock slugs omit these. */
  initialViewerHasLiked?: boolean;
  initialViewerHasSaved?: boolean;
  /** Share an anchor with the eventual comments rail (detail page). */
  commentHrefFragment?: string;
  /** Feed: open inline sheet instead of navigating to `/post/[id]#comments`. */
  commentsInteraction?: "detailLink" | "inlineSheet";
  /** Required when `commentsInteraction` is `inlineSheet`. */
  onOpenCommentsInline?: () => void;
  /** When the inline sheet is open (feed only) — drives `aria-expanded` on the comment control. */
  commentsSheetOpen?: boolean;
};

/**
 * Feed + detail controls: mock slugs stay purely local, UUID posts sync likes/saves through Supabase with optimistic counts.
 */
export function PostActions({
  postId,
  initialLikeCount,
  commentsCount,
  initialViewerHasLiked = false,
  initialViewerHasSaved = false,
  commentHrefFragment = "comments",
  commentsInteraction = "detailLink",
  onOpenCommentsInline,
  commentsSheetOpen,
}: PostActionsProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthSession();
  const [supabase] = useState(() => createClient());

  const persistEngagement = useMemo(() => isPersistentPostId(postId), [postId]);

  const [liked, setLiked] = useState(initialViewerHasLiked);
  const [saved, setSaved] = useState(initialViewerHasSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setLiked(initialViewerHasLiked);
    setSaved(initialViewerHasSaved);
    setActionError(null);
    setLikeBusy(false);
    setSaveBusy(false);
  }, [postId, initialLikeCount, initialViewerHasLiked, initialViewerHasSaved]);

  useEffect(() => {
    if (!actionError) {
      return;
    }
    const t = window.setTimeout(() => setActionError(null), 7000);
    return () => window.clearTimeout(t);
  }, [actionError]);

  const commentHref = `/post/${postId}#${commentHrefFragment}`;

  const useInlineCommentsSheet = commentsInteraction === "inlineSheet" && typeof onOpenCommentsInline === "function";

  const openComments = useCallback(() => {
    if (useInlineCommentsSheet) {
      onOpenCommentsInline?.();
    }
  }, [onOpenCommentsInline, useInlineCommentsSheet]);

  const likeControlDisabled = persistEngagement && (authLoading || likeBusy);
  const saveControlDisabled = persistEngagement && (authLoading || saveBusy);

  const toggleLikeMock = useCallback(() => {
    setLiked((current) => {
      const next = !current;
      setLikeCount((count) => Math.max(0, count + (next ? 1 : -1)));
      return next;
    });
  }, []);

  const handleToggleLike = useCallback(async () => {
    if (!persistEngagement) {
      toggleLikeMock();
      return;
    }
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }
    if (likeBusy) {
      return;
    }

    const nextLiked = !liked;
    const rollbackLiked = liked;
    const rollbackCount = likeCount;

    setLikeBusy(true);
    setActionError(null);
    setLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    const result = nextLiked ? await likePost(supabase, user.id, postId) : await unlikePost(supabase, user.id, postId);

    setLikeBusy(false);

    if (!result.ok) {
      setLiked(rollbackLiked);
      setLikeCount(rollbackCount);
      setActionError(result.message);
    }
  }, [persistEngagement, authLoading, user, likeBusy, liked, likeCount, router, supabase, postId, toggleLikeMock]);

  const handleToggleSave = useCallback(async () => {
    if (!persistEngagement) {
      setSaved((value) => !value);
      return;
    }
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }
    if (saveBusy) {
      return;
    }

    const nextSaved = !saved;
    const rollbackSaved = saved;

    setSaveBusy(true);
    setActionError(null);
    setSaved(nextSaved);

    const result = nextSaved ? await savePost(supabase, user.id, postId) : await unsavePost(supabase, user.id, postId);

    setSaveBusy(false);

    if (!result.ok) {
      setSaved(rollbackSaved);
      setActionError(result.message);
    }
  }, [persistEngagement, authLoading, user, saveBusy, saved, router, supabase, postId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => void handleToggleLike()}
            disabled={likeControlDisabled}
            className={cx(
              "-m-2 rounded-xl p-2 outline-none ring-primary/30 transition hover:bg-primary/10 active:scale-[0.96] focus-visible:ring-4",
              likeControlDisabled ? "opacity-55" : "",
            )}
            aria-pressed={liked}
            aria-busy={likeBusy}
            aria-label={liked ? "Unlike itinerary" : "Like itinerary"}
          >
            <HeartIcon filled={liked} className={liked ? "text-primary drop-shadow-[0_0_6px_rgba(133,187,101,0.55)]" : "text-neutral-800"} />
          </button>

          {useInlineCommentsSheet ? (
            <button
              type="button"
              onClick={openComments}
              className="-m-2 rounded-xl p-2 text-neutral-800 outline-none ring-primary/30 transition hover:bg-primary/10 hover:text-neutral-950 active:scale-[0.96] focus-visible:ring-4"
              aria-label={`Open comments · ${commentsCount} notes`}
              aria-expanded={commentsSheetOpen === true}
            >
              <BubbleIcon aria-hidden />
            </button>
          ) : (
            <Link
              href={commentHref}
              className="-m-2 rounded-xl p-2 text-neutral-800 outline-none ring-primary/30 transition hover:bg-primary/10 hover:text-neutral-950 active:scale-[0.96] focus-visible:ring-4"
              prefetch={false}
              aria-label={`Open comments · ${commentsCount} notes`}
            >
              <BubbleIcon aria-hidden />
            </Link>
          )}
        </div>

        <span className="flex-1" aria-hidden />

        <button
          type="button"
          onClick={() => void handleToggleSave()}
          disabled={saveControlDisabled}
          className={cx(
            "-m-2 rounded-xl p-2 outline-none ring-primary/30 transition hover:bg-primary/10 active:scale-[0.96] focus-visible:ring-4",
            saveControlDisabled ? "opacity-55" : "",
          )}
          aria-pressed={saved}
          aria-busy={saveBusy}
          aria-label={saved ? "Remove from tript saves" : "Save itinerary"}
        >
          <RibbonIcon bookmarked={saved} className={saved ? "text-primary" : "text-neutral-800"} />
        </button>
      </div>

      {actionError ? (
        <p role="alert" className="text-xs font-medium leading-relaxed text-red-600">
          {actionError}
        </p>
      ) : null}

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

        {persistEngagement && saved ? (
          <p className="text-[13px] font-semibold text-primary">Pinned privately — only you see this bookmark row in Supabase for now.</p>
        ) : null}

        {commentsCount > 0 ? (
          useInlineCommentsSheet ? (
            <button
              type="button"
              onClick={openComments}
              className="inline-flex text-left text-neutral-600 outline-none ring-primary/30 transition hover:text-neutral-950 focus-visible:ring-4"
            >
              View all {commentsCount.toLocaleString()} comments
            </button>
          ) : (
            <Link
              href={commentHref}
              className="inline-flex text-neutral-600 outline-none ring-primary/30 transition hover:text-neutral-950 focus-visible:ring-4"
              prefetch={false}
            >
              View all {commentsCount.toLocaleString()} comments
            </Link>
          )
        ) : useInlineCommentsSheet ? (
          <button
            type="button"
            onClick={openComments}
            className="text-left text-xs text-neutral-500 outline-none ring-primary/30 transition hover:text-neutral-700 focus-visible:ring-4"
          >
            Be first to leave a trail note here.
          </button>
        ) : (
          <p className="text-xs text-neutral-500">Trail notes open once friends comment.</p>
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
