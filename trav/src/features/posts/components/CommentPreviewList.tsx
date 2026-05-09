import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { TravelPostCommentPreview } from "@/types";
import { cx } from "@/lib/utils";

type CommentPreviewListProps = {
  comments: TravelPostCommentPreview[];
  tone?: string;
  className?: string;
};

export function CommentPreviewList({ comments, tone, className }: CommentPreviewListProps) {
  if (!comments.length) {
    return null;
  }

  return (
    <section id="comments" aria-labelledby="comment-preview-heading" className={cx("space-y-4", className)}>
      <div className="px-2">
        <h2 id="comment-preview-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
          Comment pulse
        </h2>
        {tone ? (
          <p className="mt-[6px] text-sm leading-relaxed text-neutral-600">
            Showing {tone} — Supabase realtime threads dock here soon.
          </p>
        ) : (
          <p className="mt-[6px] text-sm leading-relaxed text-neutral-600">Muted preview ribbons — realtime threads dock here soon.</p>
        )}
      </div>
      <ul className="space-y-[12px]" role="list">
        {comments.map((comment) => (
          <li key={comment.id}>
            <Card padding="lg" tone="muted" className="border-neutral-950/92 bg-white shadow-lg shadow-neutral-950/35">
              <div className="flex gap-[14px]">
                <Avatar size="sm" initials={comment.authorInitials} alt={`${comment.authorUsername} avatar stub`} />
                <div className="space-y-[6px] text-sm leading-relaxed text-neutral-800">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-semibold text-neutral-950">@{comment.authorUsername}</p>
                    <time className="text-[12px] font-semibold uppercase tracking-[0.2em] text-neutral-400" dateTime={comment.postedAtISO}>
                      {formatRelativeTime(new Date(comment.postedAtISO))}
                    </time>
                  </div>
                  <p className="text-[14px] text-neutral-800">{comment.excerpt}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
