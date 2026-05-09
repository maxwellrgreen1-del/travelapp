import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { cx } from "@/lib/utils";
import type { TravelFeedPost } from "@/types";

type PostHeaderProps = {
  post: TravelFeedPost;
  /** Optional tweak for dense layouts (multi-image carousels later). */
  className?: string;
};

/** Instagram-style traveler row plus timestamp and low-friction overflow affordance. */
export function PostHeader({ post, className }: PostHeaderProps) {
  const postedDisplay = formatRelativeTime(new Date(post.postedAtISO));

  return (
    <header className={cx("flex items-center gap-3 border-b border-neutral-100 px-4 py-3", className)}>
      <Avatar
        src={post.avatarUrl}
        initials={post.userInitials}
        alt={`${post.username} avatar`}
        size="sm"
        className="ring-2 ring-neutral-100"
      />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="truncate text-[15px] font-semibold text-neutral-950">{post.username}</p>
          <span aria-hidden className="text-neutral-300">
            •
          </span>
          <p className="truncate text-[13px] font-medium uppercase tracking-[0.12em] text-primary/90">
            {post.locationDisplay}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 text-right">
        <time dateTime={post.postedAtISO} className="text-[12px] font-medium text-neutral-400">
          {postedDisplay}
        </time>
        <button
          type="button"
          className="rounded-lg p-1 text-neutral-400 outline-none ring-primary/30 transition hover:bg-neutral-50 hover:text-neutral-700 active:scale-95 focus-visible:ring-4"
          aria-label="More options (coming soon)"
        >
          <MoreIcon aria-hidden />
        </button>
      </div>
    </header>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
