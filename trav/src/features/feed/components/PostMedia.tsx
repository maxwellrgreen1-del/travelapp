import { ImageCarousel } from "@/components/media/ImageCarousel";
import { cx } from "@/lib/utils";

type PostMediaProps = {
  imageUrl: string;
  imageAlt: string;
  /** When two or more Supabase frames exist, swipe + dots appear. */
  gallery?: { url: string; alt: string }[];
  className?: string;
};

/** Large hero frame — single image or lightweight carousel for multi-photo trips. */
export function PostMedia({ imageUrl, imageAlt, gallery, className }: PostMediaProps) {
  const slides =
    gallery && gallery.length > 1
      ? gallery.map((g) => ({ src: g.url, alt: g.alt }))
      : [{ src: imageUrl, alt: imageAlt }];

  return (
    <figure className={cx("relative isolate aspect-[4/5] w-full overflow-hidden bg-neutral-100 md:aspect-[4/5]", className)}>
      <ImageCarousel
        slides={slides}
        sizes="(max-width: 768px) 100vw, 720px"
        frameClassName="absolute inset-0 h-full w-full"
        controlsVariant="feed"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24 bg-gradient-to-t from-black/35 to-transparent"
      />
      <figcaption className="sr-only">{imageAlt}</figcaption>
    </figure>
  );
}
