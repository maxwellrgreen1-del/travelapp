import type { ImgHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-10 text-xs",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
};

export type AvatarProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Fallback letters when no `src` is provided yet. Usually two initials like "TJ". */
  initials?: string;
  /** Visual diameter preset (distinct from `<img>` native attributes). */
  size?: AvatarSize;
};

/**
 * Rounded avatar with initials fallback until profile photos arrive from Supabase.
 */
export function Avatar({ src, alt = "", initials, size = "md", className, ...props }: AvatarProps) {
  const safeInitials = initials?.trim().slice(0, 2).toUpperCase() || "?";

  if (!src) {
    return (
      <div
        className={cx(
          "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary/20 font-semibold text-primary ring-2 ring-white",
          sizeClasses[size],
          className,
        )}
        role="img"
        aria-label={alt || `Avatar: ${safeInitials}`}
      >
        {safeInitials}
      </div>
    );
  }

  return (
    // Trav allows remote Supabase uploads later — swap to `next/image` once URLs are gated in `remotePatterns`.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cx(
        "inline-block shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
