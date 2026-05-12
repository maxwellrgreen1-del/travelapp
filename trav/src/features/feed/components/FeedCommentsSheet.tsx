"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PostCommentsSection } from "@/features/posts/comments/PostCommentsSection";
import type { CommentsLoadPack } from "@/features/posts/comments/loadCommentsForPost";
import { loadCommentsForPost } from "@/features/posts/comments/loadCommentsForPost";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

type FeedCommentsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  /** Shown in the sheet header for context. */
  postTitle: string;
  /** Keeps the feed card count in sync with the thread. */
  onCountChange: (nextTotal: number) => void;
};

/**
 * Bottom sheet (mobile) / compact dialog (desktop) for trail chatter without leaving the feed.
 *
 * Portals to `document.body` so `position: fixed` is not trapped by the feed card’s
 * `overflow-hidden` / `transform` (e.g. `active:translate-y`), which otherwise clips the scrim
 * or leaves an invisible layer blocking taps after commenting.
 */
export function FeedCommentsSheet({ open, onOpenChange, postId, postTitle, onCountChange }: FeedCommentsSheetProps) {
  const [supabase] = useState(() => createClient());
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<CommentsLoadPack | null>(null);
  const [threadKey, setThreadKey] = useState(0);

  const openRef = useRef(open);
  openRef.current = open;

  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const loadThread = useCallback(async () => {
    setLoading(true);
    const next = await loadCommentsForPost(supabase, postId);
    if (!openRef.current) {
      setLoading(false);
      return;
    }
    setPack(next);
    onCountChangeRef.current(next.count);
    setLoading(false);
  }, [supabase, postId]);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      setPack(null);
      setLoading(false);
      return;
    }
    const raf = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    void loadThread();
  }, [open, postId, loadThread]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const dismiss = useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  useEffect(() => {
    if (open && entered && !loading && closeRef.current) {
      closeRef.current.focus();
    }
  }, [open, entered, loading]);

  const handleRetrySync = useCallback(() => {
    setThreadKey((key) => key + 1);
    void loadThread();
  }, [loadThread]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const heading = postTitle.trim() || "This trail";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end sm:items-center sm:justify-center sm:p-5"
      role="presentation"
    >
      <button
        type="button"
        className={cx(
          "absolute inset-0 z-0 bg-neutral-950/45 transition-opacity duration-200 motion-reduce:transition-none",
          entered ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="Close comments"
        onClick={dismiss}
      />

      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className={cx(
          "relative z-10 flex max-h-[min(88dvh,900px)] w-full flex-col overflow-hidden border border-neutral-200/90 bg-[#fcfbf9] shadow-[0_-24px_80px_-20px_rgba(15,23,42,0.55)] motion-reduce:transition-none",
          "rounded-t-[28px] sm:max-h-[min(80vh,720px)] sm:max-w-lg sm:rounded-[28px] sm:shadow-2xl",
          "max-sm:transition-transform max-sm:duration-300 max-sm:ease-out",
          "sm:transition-[transform,opacity] sm:duration-300 sm:ease-out",
          entered ? "pointer-events-auto max-sm:translate-y-0 sm:translate-y-0 sm:scale-100 sm:opacity-100" : "pointer-events-none max-sm:translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0",
        )}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-neutral-200/80 px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p id={titleId} className="truncate text-[15px] font-semibold tracking-tight text-neutral-950">
              Trail notes
            </p>
            <p className="truncate text-xs font-medium text-neutral-500">{heading}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="relative z-20 shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-600 outline-none ring-primary/30 transition hover:bg-neutral-200/60 hover:text-neutral-950 focus-visible:ring-4"
            onClick={dismiss}
          >
            Close
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
          {loading || !pack ? (
            <div className="space-y-3 px-1 py-6">
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-neutral-200/90" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-neutral-200/80" />
              <div className="h-24 animate-pulse rounded-[22px] bg-neutral-200/70" />
              <p className="text-center text-sm text-neutral-500">Gathering the campfire thread…</p>
            </div>
          ) : (
            <PostCommentsSection
              key={`${postId}-${threadKey}`}
              postId={postId}
              initialComments={pack.items}
              initialTotalCount={pack.count}
              loadError={pack.errorMessage}
              onCountChange={(n) => onCountChangeRef.current(n)}
              variant="sheet"
              onRetrySync={handleRetrySync}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
