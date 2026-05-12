import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import { cx } from "@/lib/utils";

type PostMediaProps = {
  imageUrl: string;
  imageAlt: string;
  className?: string;
};

/** Large hero frame with restrained motion so thumbs feel tactile on phones. */
export function PostMedia({ imageUrl, imageAlt, className }: PostMediaProps) {
  return (
    <figure className={cx("relative isolate aspect-[4/5] w-full overflow-hidden bg-neutral-100 md:aspect-[4/5]", className)}>
      <TriptRemoteImage
        src={imageUrl}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        loading="lazy"
        quality={80}
        className="object-cover transition duration-500 hover:scale-[1.01] active:brightness-95"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent"
      />
      <figcaption className="sr-only">{imageAlt}</figcaption>
    </figure>
  );
}
