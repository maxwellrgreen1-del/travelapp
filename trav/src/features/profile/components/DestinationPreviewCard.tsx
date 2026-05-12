import { Card } from "@/components/ui/Card";
import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import type { TravelerSavedSpot } from "@/features/profile/mockTravelerProfile";
import { cx } from "@/lib/utils";

type DestinationPreviewCardProps = {
  destination: TravelerSavedSpot;
  className?: string;
};

/** Horizontal snap tile with stacked glow + tactile footer CTA mimic. */
export function DestinationPreviewCard({ destination, className }: DestinationPreviewCardProps) {
  return (
    <Card padding="none" className={cx("w-[220px] shrink-0 overflow-hidden rounded-[26px] border-neutral-950/85 shadow-lg shadow-neutral-950/40", className)}>
      <article aria-label={`${destination.name}, ${destination.subtitle}`}>
        <div className="relative isolate aspect-[4/5] overflow-hidden rounded-t-[inherit] bg-neutral-100">
          <TriptRemoteImage
            src={destination.imageUrl}
            alt=""
            aria-hidden
            fill
            sizes="220px"
            loading="lazy"
            quality={72}
            className="object-cover motion-safe:transition motion-safe:duration-500 hover:brightness-[1.05]"
          />
          <span className="pointer-events-none absolute inset-0 rounded-t-[inherit] bg-gradient-to-b from-transparent via-transparent to-neutral-950/35" />

          <div className="absolute inset-x-0 top-0 flex justify-between px-4 py-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
            <span className="rounded-full bg-white/25 px-3 py-1 backdrop-blur">Saved</span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-white">{destination.mood}</span>
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-[20px] border border-white/45 bg-neutral-950/75 p-4 text-white shadow-2xl shadow-black/85 backdrop-blur-sm">
            <h3 className="text-[17px] font-semibold leading-tight">{destination.name}</h3>
            <p className="mt-2 text-sm text-white/85">{destination.subtitle}</p>
          </div>
        </div>
        <footer className="rounded-b-[inherit] bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-950">
          Open inside tript · soon
        </footer>
      </article>
    </Card>
  );
}
