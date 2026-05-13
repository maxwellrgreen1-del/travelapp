import Link from "next/link";

import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import { buttonClassName } from "@/components/ui/Button";
import type { ProfileAuthorGridPost } from "@/features/profile/loadProfileAuthorPosts";

type ProfilePostsWithoutMapFallbackProps = {
  posts: ProfileAuthorGridPost[];
  /** True when at least one other post already has a map pin — copy explains this is the “not on map” subset. */
  mapHasPins: boolean;
};

/**
 * Compact list for recaps we could not geocode — still one tap away from the full post page.
 */
export function ProfilePostsWithoutMapFallback({ posts, mapHasPins }: ProfilePostsWithoutMapFallbackProps) {
  if (posts.length === 0) {
    return null;
  }

  const title = mapHasPins ? "Not on the map yet" : "Posts without a map pin";
  const description = mapHasPins
    ? "These logs don’t have coordinates yet — open one to tweak the destination or first waypoint, then save again. They’re still in your photo grid below."
    : "We couldn’t place these on the map yet — try a city or region in the destination line or first waypoint when you edit. They’re still in your photo grid below.";

  return (
    <section aria-labelledby="profile-no-map-posts-heading" className="space-y-3 rounded-[26px] border border-amber-200/90 bg-amber-50/50 px-4 py-5 sm:px-5">
      <div className="space-y-1 px-0.5">
        <h2 id="profile-no-map-posts-heading" className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-950/90">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-neutral-800">{description}</p>
      </div>

      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/post/${post.id}`}
              prefetch={false}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-2.5 shadow-sm shadow-neutral-950/10 outline-none ring-primary/25 transition hover:border-primary/45 focus-visible:ring-4"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                <TriptRemoteImage src={post.imageUrl} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-950">{post.title}</p>
                <p className="truncate text-xs font-medium text-neutral-600">{post.locationDisplay}</p>
              </div>
              <span className={buttonClassName({ variant: "outlinePrimary", size: "sm", className: "shrink-0 px-3 text-xs" })}>
                Open
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
