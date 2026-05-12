import Image, { type ImageProps } from "next/image";

import { TRIPT_REMOTE_IMAGE_BLUR_DATA_URL } from "@/lib/imagePlaceholders";
import { isRemoteImageHostOptimizable } from "@/lib/isRemoteImageHostOptimizable";
import { cx } from "@/lib/utils";

export type TriptRemoteImageProps = Omit<ImageProps, "src" | "placeholder" | "blurDataURL"> & {
  src: string;
};

/**
 * `next/image` for allowlisted HTTPS hosts with a shared blur placeholder.
 * Other HTTP(S) URLs and blob:/data: use `<img>` so arbitrary profile/media links never break the feed.
 */
export function TriptRemoteImage({ src, alt, className, ...rest }: TriptRemoteImageProps) {
  const isHttp = src.startsWith("https://") || src.startsWith("http://");

  if (!isHttp) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- blob:/data: previews are not optimized by Next
      <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />
    );
  }

  if (!isRemoteImageHostOptimizable(src)) {
    const { fill, width, height, priority, loading } = rest;
    const eager = Boolean(priority) || loading === "eager";

    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- host not in next/image remotePatterns
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={cx("absolute inset-0 h-full w-full object-cover", className)}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element -- host not in next/image remotePatterns
      <img
        src={src}
        alt={alt}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      placeholder="blur"
      blurDataURL={TRIPT_REMOTE_IMAGE_BLUR_DATA_URL}
      {...rest}
    />
  );
}
