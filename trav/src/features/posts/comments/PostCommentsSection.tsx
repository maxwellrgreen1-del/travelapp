"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { deleteOwnComment, insertPostComment } from "@/features/posts/comments/commentMutations";
import { useAuthSession } from "@/features/auth/AuthSessionProvider";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { createClient } from "@/lib/supabase/client";
import { initialsFromProfile } from "@/lib/userDisplay";
import { cx } from "@/lib/utils";
import type { TravelPostComment } from "@/types";

type ViewerProfileMini = Pick<TravelPostComment, "username" | "displayName" | "avatarUrl" | "initials">;

type CountUpdater = number | ((previous: number) => number);

type PostCommentsSectionProps = {
  postId: string;
  initialComments: TravelPostComment[];
  /** Total comments on the waypoint (includes rows past the SSR cap when applicable). */
  initialTotalCount: number;
  loadError: string | null;
  /** Keeps hero `PostActions` counts aligned with campfire adds/removals. */
  onCountChange: (nextTotal: number) => void;
  /** Tighter layout for the feed bottom sheet vs the full post page. */
  variant?: "default" | "sheet";
  /** When set (e.g. feed sheet), retry re-fetches comments instead of `router.refresh()`. */
  onRetrySync?: () => void;
};

const MAX_CHARS = 2000;

/** Live campfire thread wired to Postgres — flat list MVP (no nesting yet). */
export function PostCommentsSection({
  postId,
  initialComments,
  initialTotalCount,
  loadError,
  onCountChange,
  variant = "default",
  onRetrySync,
}: PostCommentsSectionProps) {
  const router = useRouter();
  const headingId = useId();
  const { user, isLoading: authLoading } = useAuthSession();
  const [supabase] = useState(() => createClient());

  const [comments, setComments] = useState<TravelPostComment[]>(() => [...initialComments]);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const totalSnapshotRef = useRef(initialTotalCount);

  useEffect(() => {
    totalSnapshotRef.current = totalCount;
  }, [totalCount]);

  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);

  const [viewerProfile, setViewerProfile] = useState<ViewerProfileMini | null>(null);

  useEffect(() => {
    setComments([...initialComments]);
    setTotalCount(initialTotalCount);
    setSectionError(loadError);
    setDeletingId(null);
    setDraft("");
    setSubmitting(false);
  }, [postId, initialComments, initialTotalCount, loadError]);

  useEffect(() => {
    if (!user) {
      setViewerProfile(null);
      return;
    }

    let cancelled = false;

    async function hydrateViewer() {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();

      if (!cancelled && !error && data) {
        const username = data.username ?? "traveler";
        const displayName = data.display_name ?? null;
        setViewerProfile({
          username,
          displayName,
          avatarUrl: data.avatar_url?.trim() || undefined,
          initials: initialsFromProfile(username, displayName),
        });
      }
    }

    void hydrateViewer();

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  /** Atomic counter updates keep `PostActions` and this section moving in tandem. */
  const bumpTotalCount = useCallback(
    (updater: CountUpdater) => {
      setTotalCount((previous) => {
        const next = typeof updater === "function" ? updater(previous) : updater;
        const safe = Math.max(0, next);
        onCountChange(safe);
        return safe;
      });
    },
    [onCountChange],
  );

  const handleSubmitComment = useCallback(async () => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }

    const trimmed = draft.trim();
    if (!trimmed) {
      setSectionError("Scribble something first — explorers read every line.");
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setSectionError(`Keep it within ${MAX_CHARS} characters — perfect for campfire blurbs.`);
      return;
    }

    if (!viewerProfile) {
      setSectionError("Still loading your profile — give it half a heartbeat and retry.");
      return;
    }

    setSubmitting(true);
    setSectionError(null);

    const tempId =
      typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto
        ? `optimistic-${globalThis.crypto.randomUUID()}`
        : `optimistic-${Date.now()}`;

    const optimistic: TravelPostComment = {
      id: tempId,
      authorId: user.id,
      username: viewerProfile.username,
      displayName: viewerProfile.displayName,
      avatarUrl: viewerProfile.avatarUrl,
      initials: viewerProfile.initials,
      body: trimmed,
      postedAtISO: new Date().toISOString(),
    };

    setComments((prev) => [optimistic, ...prev]);
    bumpTotalCount((count) => count + 1);
    setDraft("");

    const result = await insertPostComment(supabase, {
      postId,
      authorId: user.id,
      body: trimmed,
    });

    if (!result.ok) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      bumpTotalCount((count) => count - 1);
      setSectionError(result.message);
      setSubmitting(false);
      return;
    }

    const finalized: TravelPostComment = {
      id: result.row.id,
      authorId: user.id,
      username: viewerProfile.username,
      displayName: viewerProfile.displayName,
      avatarUrl: viewerProfile.avatarUrl,
      initials: viewerProfile.initials,
      body: result.row.body,
      postedAtISO: result.row.created_at,
    };

    setComments((prev) => prev.map((item) => (item.id === tempId ? finalized : item)));
    setSubmitting(false);
  }, [
    authLoading,
    bumpTotalCount,
    draft,
    postId,
    router,
    supabase,
    user,
    viewerProfile,
  ]);

  const handleDeleteComment = useCallback(
    async (commentId: string, authorId: string) => {
      if (!user || authorId !== user.id) {
        return;
      }

      const isOptimistic = commentId.startsWith("optimistic-");
      if (isOptimistic) {
        return;
      }

      setDeletingId(commentId);

      const snapshotComments = [...comments];
      const countBeforeDelete = totalSnapshotRef.current;

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      bumpTotalCount(countBeforeDelete - 1);
      setSectionError(null);

      const result = await deleteOwnComment(supabase, { commentId, authorId: user.id });

      if (!result.ok) {
        setComments(snapshotComments);
        bumpTotalCount(countBeforeDelete);
        setSectionError(result.message);
      }

      setDeletingId(null);
    },
    [bumpTotalCount, comments, supabase, user],
  );

  const isSheet = variant === "sheet";

  return (
    <section
      id={isSheet ? undefined : "comments"}
      aria-labelledby={headingId}
      className={cx("space-y-6", isSheet && "space-y-4")}
    >
      <div className={cx("px-2", isSheet && "px-1")}>
        <h2
          id={headingId}
          className={cx(
            "font-semibold uppercase tracking-[0.35em] text-primary",
            isSheet ? "text-[10px] tracking-[0.28em]" : "text-[11px]",
          )}
        >
          Trail chatter
        </h2>
        <p className={cx("mt-[6px] leading-relaxed text-neutral-600", isSheet ? "text-[13px]" : "text-sm")}>
          Newest scouts surface first · {totalCount === 1 ? `1 traveler chimed in` : `${totalCount} travelers chimed in`}
        </p>
      </div>

      {sectionError ? (
        <Card padding="lg" tone="muted" className="border-red-200/90 bg-red-50/92 text-sm leading-relaxed text-red-900">
          <p className="font-semibold">Thread stutter</p>
          <p className="mt-1">{sectionError}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outlinePrimary"
              size="sm"
              onClick={() => {
                if (onRetrySync) {
                  onRetrySync();
                  return;
                }
                router.refresh();
              }}
            >
              Retry sync
            </Button>
            {draft.trim() ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setSectionError(null)}>
                Dismiss banner
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card
        padding="lg"
        className={cx(
          "rounded-[26px] border-neutral-950/93 bg-white/98 shadow-lg shadow-neutral-950/55",
          isSheet && "rounded-[22px] shadow-md shadow-neutral-950/25",
        )}
      >
        {authLoading ? (
          <p className="text-sm text-neutral-500">Connecting your campfire badge…</p>
        ) : user ? (
          <div className="space-y-3">
            <Textarea
              label="Cheer · question · riff"
              hint={
                isSheet
                  ? `As @${viewerProfile?.username ?? "your handle"} · synced to this post.`
                  : `Logged in as @${viewerProfile?.username ?? "your handle"} — taps stay synced to Postgres.`
              }
              placeholder="Lay a scouting note beside this trail…"
              rows={isSheet ? 3 : 4}
              value={draft}
              maxLength={MAX_CHARS}
              disabled={submitting || !viewerProfile}
              onChange={(event) => setDraft(event.target.value)}
              className="text-base leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-neutral-500">
                <span className="tabular-nums">{draft.trim().length}</span>/{MAX_CHARS} characters
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={submitting || !viewerProfile || !draft.trim()}
                aria-busy={submitting}
                onClick={() => void handleSubmitComment()}
              >
                {submitting ? "Posting…" : "Post comment"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm leading-relaxed text-neutral-700">
            <p className="font-semibold text-neutral-950">Sign in to join the chatter</p>
            <p>You can read explorers below — posting your own note needs a signed-in Tript account.</p>
            <Textarea
              label="Drop a note (login required)"
              readOnly
              placeholder="Tap here to head to login and claim this textarea…"
              rows={3}
              className="cursor-pointer text-base leading-relaxed"
              onFocus={() => router.push("/login")}
            />
            <Link
              href="/login"
              prefetch={false}
              className="inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/85"
            >
              Go to login
            </Link>
          </div>
        )}
      </Card>

      {comments.length === 0 ? (
        <p className="px-3 text-center text-sm leading-relaxed text-neutral-500">
          Quieter ridge than usual — snag the textarea above once you want to shout into the campfire.
        </p>
      ) : (
        <ul className="space-y-[12px]" role="list">
          {comments.map((comment) => {
            const viewerOwnComment = Boolean(user?.id === comment.authorId && user);
            const isBusyDelete = deletingId === comment.id;

            return (
              <li key={comment.id}>
                <Card
                  padding={isSheet ? "md" : "lg"}
                  tone="muted"
                  className={cx(
                    "border-neutral-950/92 bg-white shadow-lg shadow-neutral-950/35",
                    isSheet && "rounded-[20px] shadow-md shadow-neutral-950/20",
                  )}
                >
                  <div className="flex gap-[14px]">
                    <Avatar
                      size="sm"
                      src={comment.avatarUrl}
                      initials={comment.initials}
                      alt={`${comment.displayName ?? comment.username} portrait`}
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-[6px] text-sm leading-relaxed text-neutral-800">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate font-semibold text-neutral-950">
                            {comment.displayName?.trim() || `@${comment.username}`}
                          </p>
                          {comment.displayName?.trim() ? (
                            <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                              @{comment.username}
                            </p>
                          ) : null}
                        </div>
                        <time
                          dateTime={comment.postedAtISO}
                          className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.2em] text-neutral-400"
                        >
                          {formatRelativeTime(new Date(comment.postedAtISO))}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{comment.body}</p>
                      {viewerOwnComment && !comment.id.startsWith("optimistic-") ? (
                        <div className="pt-1">
                          <button
                            type="button"
                            className={cx(
                              "text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-400 underline-offset-4 transition hover:text-red-700 hover:underline",
                              isBusyDelete ? "opacity-65" : "",
                            )}
                            disabled={isBusyDelete}
                            aria-busy={isBusyDelete}
                            onClick={() => void handleDeleteComment(comment.id, comment.authorId)}
                          >
                            {isBusyDelete ? "Removing…" : "Remove my note"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
