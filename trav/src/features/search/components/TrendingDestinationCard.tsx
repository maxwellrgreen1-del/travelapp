import { Card } from "@/components/ui/Card";
import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import { formatSocialCount } from "@/lib/formatSocialCount";
import type { TrendingExploreDestination } from "@/features/search/mockExploreData";

/**
 * Tall travel tile resembling Pinterest editorial boards ahead of deeplinking.
 */
export function TrendingDestinationCard({ destination }: { destination: TrendingExploreDestination }) {
  return (
    <Card padding="none" tone="muted" className="w-[200px] shrink-0 rounded-[30px] border-neutral-950/95 shadow-2xl shadow-neutral-950/55">
      <article className="relative isolate h-[300px] overflow-hidden rounded-[inherit] text-white">
        <TriptRemoteImage
          src={destination.imageUrl}
          alt=""
          aria-hidden
          fill
          sizes="200px"
          loading="lazy"
          quality={75}
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-transparent" />

        <div className="absolute inset-x-[22px] top-[22px] flex items-start justify-between text-[11px] font-semibold uppercase tracking-[0.35em] text-white">
          <span className="inline-flex items-center gap-3">
            <span className="size-3 rounded-full bg-primary shadow-[0_0_10px_rgba(133,187,101,1)] motion-safe:animate-pulse" />
            Trending pulse
          </span>
          <span className="text-white/90">{destination.country}</span>
        </div>

        <div className="absolute inset-x-[22px] bottom-[26px] space-y-[14px] text-white shadow-[inset_0_-32px_50px_-20px_rgba(0,0,0,0.55)]">
          <div>
            <h3 className="text-[21px] font-semibold leading-tight tracking-tight drop-shadow">{destination.title}</h3>
            <p className="mt-2 text-sm text-white/90">{destination.subtitle}</p>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
            Momentum × {formatSocialCount(destination.heatScore)} saves
          </p>
        </div>
      </article>
    </Card>
  );
}
