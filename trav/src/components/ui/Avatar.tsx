import Image from "next/image";

import { TRIPT_REMOTE_IMAGE_BLUR_DATA_URL } from "@/lib/imagePlaceholders";
import { isRemoteImageHostOptimizable } from "@/lib/isRemoteImageHostOptimizable";
import { cx } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-10 text-xs",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
};

const imagePixels: Record<AvatarSize, number> = {
  sm: 40,
  md: 48,
  lg: 64,
};

export type AvatarProps = {
  src?: string;
  alt?: string;
  /** Fallback letters when no `src` is provided yet. Usually two initials like "TJ". */
  initials?: string;
  /** Visual diameter preset. */
  size?: AvatarSize;
  className?: string;
};

/**
 * Rounded avatar with initials fallback until profile photos arrive from Supabase.
 */
export function Avatar({ src, alt = "", initials, size = "md", className }: AvatarProps) {
  const safeInitials = initials?.trim().slice(0, 2).toUpperCase() || "?";
  const trimmed = src?.trim();
  const px = imagePixels[size];

  if (!trimmed) {
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

  const isHttp = trimmed.startsWith("https://") || trimmed.startsWith("http://");

  if (!isHttp || !isRemoteImageHostOptimizable(trimmed)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- non-http or host not in next/image allowlist
      <img
        src={trimmed}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={px}
        height={px}
        className={cx(
          "inline-block shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={trimmed}
      alt={alt}
      width={px}
      height={px}
      sizes={`${px}px`}
      placeholder="blur"
      blurDataURL={TRIPT_REMOTE_IMAGE_BLUR_DATA_URL}
      loading="lazy"
      className={cx(
        "inline-block shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm",
        sizeClasses[size],
        className,
      )}
    />
  );
}
