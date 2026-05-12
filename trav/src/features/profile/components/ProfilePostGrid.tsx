import type { ProfileAuthorGridPost } from "@/features/profile/loadProfileAuthorPosts";
import { ProfilePostTile } from "@/features/profile/components/ProfilePostTile";

type ProfilePostGridProps = {
  posts: ProfileAuthorGridPost[];
  /** Signed-in user id — tiles compare against `post.authorId` for edit/delete chrome. */
  viewerId?: string | null;
  /** Called after the owner deletes a tile so the parent can refetch the grid. */
  onPostDeleted?: () => void;
  title?: string;
  subtitle?: string;
  /** Turn off when a parent wraps the same heading outside (loading / empty shells). */
  showHeading?: boolean;
};

/**
 * Thumb-forward collage that reads like a souvenir wall in a flatlay.
 */
export function ProfilePostGrid({
  posts,
  viewerId = null,
  onPostDeleted,
  title = "Field notes on the mantle",
  subtitle = "Tap any waypoint for your Supabase recap — newest logs surface first.",
  showHeading = true,
}: ProfilePostGridProps) {
  return (
    <section aria-labelledby={showHeading ? "profile-trip-grid-heading" : undefined} className="space-y-5">
      {showHeading ? (
        <div className="space-y-2 px-1">
          <h2 id="profile-trip-grid-heading" className="text-xs font-semibold uppercase tracking-[0.33em] text-primary">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">{subtitle}</p>
        </div>
      ) : null}

      <ul className="grid grid-cols-3 gap-[6px] sm:gap-3">
        {posts.map((post) => (
          <li key={post.id}>
            <ProfilePostTile post={post} viewerId={viewerId ?? null} onPostDeleted={onPostDeleted} />
          </li>
        ))}
      </ul>
    </section>
  );
}
