import Link from "next/link";

import type { TravelerProfileGridPost } from "@/features/profile/mockTravelerProfile";
import { cx } from "@/lib/utils";

type ProfilePostGridProps = {
  posts: TravelerProfileGridPost[];
  title?: string;
  subtitle?: string;
};

/**
 * Thumb-forward collage that reads like a souvenir wall in a flatlay.
 */
export function ProfilePostGrid({
  posts,
  title = "Field notes on the mantle",
  subtitle = "Tap any tile for the long-form riff — seeded from mock itineraries for now.",
}: ProfilePostGridProps) {
  return (
    <section aria-labelledby="profile-trip-grid-heading" className="space-y-5">
      <div className="space-y-2 px-1">
        <h2 id="profile-trip-grid-heading" className="text-xs font-semibold uppercase tracking-[0.33em] text-primary">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">{subtitle}</p>
      </div>

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={`${post.title} recap thumbnail`}
                loading="lazy"
                className="h-full w-full object-cover motion-safe:transition motion-safe:duration-[650ms] motion-safe:group-hover:scale-[1.04]"
              />

              <div className="absolute inset-x-0 bottom-0 space-y-[7px] bg-gradient-to-t from-black via-black/45 to-transparent p-4 text-white opacity-[0.93] motion-safe:transition-opacity group-hover:opacity-100">
                <span className="inline-flex items-center rounded-full border border-white/45 bg-black/55 px-[10px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.32em] text-white backdrop-blur">
                  Trav log
                </span>
                <p id={`trail-${post.id}`} className="text-[14px] font-semibold leading-snug">{post.title}</p>
                <p className="text-[12px] text-white/82">{post.subtitle}</p>
              </div>
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl border border-white/15" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
