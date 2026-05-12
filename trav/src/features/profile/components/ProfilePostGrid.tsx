import Link from "next/link";

import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import type { ProfileAuthorGridPost } from "@/features/profile/loadProfileAuthorPosts";
import { cx } from "@/lib/utils";

type ProfilePostGridProps = {
  posts: ProfileAuthorGridPost[];
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
                <p id={`trail-${post.id}`} className="text-[14px] font-semibold leading-snug">{post.title}</p>
                <p className="text-[12px] text-white/82">{post.locationDisplay}</p>
              </div>
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl border border-white/15" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
