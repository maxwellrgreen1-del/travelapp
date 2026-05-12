import Link from "next/link";

import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import type { PopularExploreTrip } from "@/features/search/mockExploreData";
import { cx } from "@/lib/utils";

type ExplorePostGridProps = {
  posts: PopularExploreTrip[];
  headline?: string;
  subheading?: string;
};

/**
 * Two-column masonry wall — Pinterest rhythm with Instagram-esque captions.
 */
export function ExplorePostGrid({
  posts,
  headline = "Popular trip palettes",
  subheading = "Collaged from scouts you might vibe with · tap tiles for narration drafts.",
}: ExplorePostGridProps) {
  return (
    <section aria-labelledby="explore-masonry-heading" className="space-y-5 px-2">
      <div className="space-y-1">
        <h2 id="explore-masonry-heading" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
          {headline}
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">{subheading}</p>
      </div>

      <div className={cx("columns-2 gap-x-[10px] sm:gap-x-[14px]")}>
        {posts.map((post, index) => (
          <MasonryTripTile key={post.id} post={post} tall={index % 3 !== 1} />
        ))}
      </div>
    </section>
  );
}

function MasonryTripTile({ post, tall }: { post: PopularExploreTrip; tall: boolean }) {
  return (
    <div className="mb-[10px] break-inside-avoid sm:mb-[14px]">
      <Link
        prefetch={false}
        href={`/post/${post.id}`}
        className={cx(
          "group relative isolate block overflow-hidden rounded-[22px]",
          tall ? "min-h-[260px]" : "min-h-[200px]",
          "border border-white/85 bg-neutral-950/25 shadow-xl shadow-neutral-950/45 outline-none ring-primary/35",
          "motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:ring-4",
        )}
        aria-labelledby={`explore-trip-${post.id}`}
      >
        <TriptRemoteImage
          src={post.imageUrl}
          alt={`${post.title} trip palette`}
          fill
          sizes="(max-width: 640px) 48vw, 360px"
          loading="lazy"
          quality={78}
          className="object-cover transition duration-[700ms] group-hover:brightness-[1.05] motion-safe:group-hover:scale-[1.035]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/45 to-transparent p-5 text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">Recap ripple</span>
          <p id={`explore-trip-${post.id}`} className="mt-3 text-[16px] font-semibold leading-tight">{post.title}</p>
          <p className="mt-2 text-[13px] text-white/90">{post.subtitle}</p>
        </div>
        <span aria-hidden className="pointer-events-none absolute inset-2 rounded-[20px] border border-white/20" />
      </Link>
    </div>
  );
}
