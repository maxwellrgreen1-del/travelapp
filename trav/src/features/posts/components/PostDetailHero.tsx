import Link from "next/link";

import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import type { TravelFeedPost } from "@/types";
import { cx } from "@/lib/utils";

type PostDetailHeroProps = {
  hero: Pick<TravelFeedPost, "imageUrl" | "imageAlt" | "locationDisplay" | "title">;
  backHref?: string;
  className?: string;
};

export function PostDetailHero({ hero, backHref = "/", className }: PostDetailHeroProps) {
  return (
    <div className={cx("relative isolate w-full bg-neutral-950 text-white shadow-2xl shadow-neutral-950/55", className)}>
      <div className="absolute inset-x-0 top-[18px] z-20 px-6">
        <Link
          href={backHref}
          prefetch={false}
          className={cx(
            "inline-flex items-center justify-center rounded-[18px] border border-white/60 bg-neutral-950/70 px-[18px] py-[11px] text-[12px] font-semibold uppercase tracking-[0.32em]",
            "text-white shadow-lg shadow-neutral-950/55 outline-none ring-white/90 transition hover:bg-white hover:text-neutral-950 focus-visible:ring-4",
          )}
        >
          ← Back to feed
        </Link>
      </div>

      <div className="relative aspect-[5/8] overflow-hidden rounded-b-[42px] sm:aspect-[4/6] lg:aspect-[16/10] lg:rounded-b-[48px]">
        <TriptRemoteImage
          src={hero.imageUrl}
          alt={hero.imageAlt}
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-[32px] z-10 flex flex-col justify-end px-8 pb-[6px] text-[15px] text-white">
          <div className="space-y-[8px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-primary drop-shadow">{hero.locationDisplay}</p>
            <p className="text-[21px] font-semibold leading-tight tracking-tight drop-shadow-md">{hero.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
