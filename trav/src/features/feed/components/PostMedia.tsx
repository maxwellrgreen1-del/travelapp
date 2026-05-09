import { cx } from "@/lib/utils";

type PostMediaProps = {
  imageUrl: string;
  imageAlt: string;
  className?: string;
};

/** Large hero frame with restrained motion so thumbs feel tactile on phones. */
export function PostMedia({ imageUrl, imageAlt, className }: PostMediaProps) {
  return (
    <figure className={cx("relative isolate w-full overflow-hidden bg-neutral-100", className)}>
      {/* Remote scenic placeholders until uploads + Supabase land. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={imageAlt}
        width={880}
        height={1100}
        loading="lazy"
        decoding="async"
        className="aspect-[4/5] h-auto w-full object-cover transition duration-500 hover:scale-[1.01] active:brightness-95 md:aspect-[4/5]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent"
      />
      <figcaption className="sr-only">{imageAlt}</figcaption>
    </figure>
  );
}
