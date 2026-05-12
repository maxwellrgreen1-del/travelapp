"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import { deleteTripPost } from "@/features/posts/deleteTripPost";
import type { ProfileAuthorGridPost } from "@/features/profile/loadProfileAuthorPosts";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

type ProfilePostTileProps = {
  post: ProfileAuthorGridPost;
  /** When set and equals `post.authorId`, owner edit/delete chrome appears. */
  viewerId: string | null;
  onPostDeleted?: () => void;
};

/**
 * One profile-grid cell: tap-through recap link plus owner-only stewardship controls.
 */
export function ProfilePostTile({ post, viewerId, onPostDeleted }: ProfilePostTileProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOwner = Boolean(viewerId && post.authorId === viewerId);

  async function handleConfirmDelete() {
    if (!viewerId) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteTripPost(supabase, { postId: post.id, authorId: viewerId });
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }
    setConfirmOpen(false);
    onPostDeleted?.();
    router.refresh();
  }

  return (
    <div className="relative isolate">
      <Link
        href={`/post/${post.id}`}
        prefetch={false}
        className={cx(
          "group relative isolate block aspect-square overflow-hidden rounded-2xl border border-transparent bg-neutral-950/15 shadow-xl shadow-neutral-950/55 outline-none ring-primary/35",
          "motion-safe:active:brightness-95 motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:ring-4",
        )}
        aria-labelledby={`trail-${post.id}`}
      >
        <TriptRemoteImage
          src={post.imageUrl}
          alt={`${post.title} recap thumbnail`}
          fill
          sizes="(max-width: 640px) 33vw, 200px"
          loading="lazy"
          quality={75}
          className="object-cover motion-safe:transition motion-safe:duration-[650ms] motion-safe:group-hover:scale-[1.04]"
        />

        <div className="absolute inset-x-0 bottom-0 space-y-[7px] bg-gradient-to-t from-black via-black/45 to-transparent p-4 text-white opacity-[0.93] motion-safe:transition-opacity group-hover:opacity-100">
          <span className="inline-flex items-center rounded-full border border-white/45 bg-black/55 px-[10px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.32em] text-white backdrop-blur">
            tript log
          </span>
          <p id={`trail-${post.id}`} className="text-[14px] font-semibold leading-snug">
            {post.title}
          </p>
          <p className="text-[12px] text-white/82">{post.locationDisplay}</p>
        </div>
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl border border-white/15" />
      </Link>

      {isOwner ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-2">
          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <div className="flex gap-1.5 rounded-2xl border border-white/35 bg-black/60 p-1.5 shadow-lg shadow-black/40 backdrop-blur-md">
              <Link
                href={`/post/${post.id}/edit`}
                prefetch={false}
                className={buttonClassName({
                  variant: "secondary",
                  size: "sm",
                  className: "min-h-8 border-white/25 bg-white/95 px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-900",
                })}
              >
                Edit
              </Link>
              <button
                type="button"
                className={buttonClassName({
                  variant: "secondary",
                  size: "sm",
                  className: "min-h-8 border-red-200/80 bg-red-50 px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-red-900",
                })}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDeleteError(null);
                  setConfirmOpen((open) => !open);
                }}
                aria-expanded={confirmOpen}
              >
                Delete
              </button>
            </div>

            {confirmOpen ? (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`delete-confirm-${post.id}`}
                className="max-w-[min(100%,220px)] rounded-2xl border border-red-100/90 bg-white/98 p-3 text-left shadow-xl shadow-red-950/20"
              >
                <p id={`delete-confirm-${post.id}`} className="text-xs font-semibold leading-snug text-neutral-900">
                  Remove this log from Supabase? Comments and likes go with it.
                </p>
                {deleteError ? (
                  <p className="mt-2 text-xs font-medium text-red-800" role="alert">
                    {deleteError}
                  </p>
                ) : null}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className={buttonClassName({ variant: "ghost", size: "sm", className: "min-h-8 text-xs" })}
                    disabled={deleting}
                    onClick={() => {
                      setConfirmOpen(false);
                      setDeleteError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={buttonClassName({
                      variant: "primary",
                      size: "sm",
                      className: "min-h-8 bg-red-700 text-xs hover:brightness-95",
                    })}
                    disabled={deleting}
                    aria-busy={deleting}
                    onClick={() => void handleConfirmDelete()}
                  >
                    {deleting ? "Deleting…" : "Delete log"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
