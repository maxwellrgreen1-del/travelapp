"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { useAuthSession } from "@/features/auth/AuthSessionProvider";
import { deleteTripPost } from "@/features/posts/deleteTripPost";
import { createClient } from "@/lib/supabase/client";
import { isPersistentPostId } from "@/lib/postIds";

type PostDetailOwnerActionsProps = {
  postId: string;
};

/**
 * Stewardship strip for Supabase recaps — only mount when `viewerIsAuthor` is already true from SSR.
 */
export function PostDetailOwnerActions({ postId }: PostDetailOwnerActionsProps) {
  const router = useRouter();
  const { user } = useAuthSession();
  const [supabase] = useState(() => createClient());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isPersistentPostId(postId) || !user) {
    return null;
  }

  const authorId = user.id;

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteTripPost(supabase, { postId, authorId });
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">Your log</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/post/${postId}/edit`}
          prefetch={false}
          className={buttonClassName({
            variant: "secondary",
            size: "sm",
            className: "border-white/40 bg-white text-neutral-900",
          })}
        >
          Edit recap
        </Link>
        <button
          type="button"
          className={buttonClassName({
            variant: "secondary",
            size: "sm",
            className: "border-red-200/80 bg-red-50 text-red-900",
          })}
          aria-expanded={confirmOpen}
          onClick={() => {
            setDeleteError(null);
            setConfirmOpen((open) => !open);
          }}
        >
          Delete
        </button>
      </div>

      {confirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="rounded-2xl border border-red-100/90 bg-white p-4 text-neutral-900 shadow-lg"
        >
          <p className="text-sm font-semibold leading-snug">Delete this travel log from Supabase?</p>
          <p className="mt-1 text-xs text-neutral-600">Comments, likes, and saves are removed with it. You will return to your profile.</p>
          {deleteError ? (
            <p className="mt-2 text-xs font-medium text-red-800" role="alert">
              {deleteError}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClassName({ variant: "ghost", size: "sm", className: "text-neutral-800" })}
              disabled={deleting}
              onClick={() => {
                setConfirmOpen(false);
                setDeleteError(null);
              }}
            >
              Keep log
            </button>
            <button
              type="button"
              className={buttonClassName({
                variant: "primary",
                size: "sm",
                className: "bg-red-700 hover:brightness-95",
              })}
              disabled={deleting}
              aria-busy={deleting}
              onClick={() => void handleConfirmDelete()}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
