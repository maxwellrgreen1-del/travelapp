"use client";

import type { TouchEvent } from "react";
import { useCallback, useRef, useState } from "react";

import { TriptRemoteImage } from "@/components/media/TriptRemoteImage";
import { cx } from "@/lib/utils";

export type ImageCarouselSlide = { src: string; alt: string };

type ImageCarouselProps = {
  slides: ImageCarouselSlide[];
  /** `next/image` sizes attribute for responsive loading. */
  sizes: string;
  /** First slide LCP on detail hero. */
  priority?: boolean;
  /** Frame positioning / rounding (often `absolute inset-0` inside an aspect parent). */
  frameClassName: string;
  /** Dots + optional arrows (only when `slides.length > 1`). */
  controlsVariant?: "feed" | "hero";
};

/**
 * Stacked fades + swipe + dot / chevron navigation — shared by feed cards and post detail hero.
 */
export function ImageCarousel({ slides, sizes, priority = false, frameClassName, controlsVariant = "feed" }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  if (!slides.length) {
    return null;
  }

  const last = slides.length - 1;
  const showControls = slides.length > 1;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((prev) => {
        const next = prev + dir;
        if (next < 0) return last;
        if (next > last) return 0;
        return next;
      });
    },
    [last],
  );

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const start = touchStartXRef.current;
      touchStartXRef.current = null;
      if (start == null) return;
      const endX = e.changedTouches[0]?.clientX ?? start;
      const dx = endX - start;
      if (Math.abs(dx) < 48) return;
      if (dx < 0) go(1);
      else go(-1);
    },
    [go],
  );

  const dotBottom = controlsVariant === "hero" ? "bottom-[100px] z-[15]" : "bottom-3 z-20";

  return (
    <div
      className={cx("relative isolate w-full touch-pan-y overflow-hidden bg-neutral-100", frameClassName)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={`${slide.src}-${i}`}
          className={cx(
            "absolute inset-0 transition-opacity duration-500 ease-out",
            i === index ? "z-[1] opacity-100" : "z-0 opacity-0 pointer-events-none",
          )}
          aria-hidden={i !== index}
        >
          <TriptRemoteImage
            src={slide.src}
            alt={slide.alt}
            fill
            sizes={sizes}
            loading={i === 0 && priority ? "eager" : "lazy"}
            priority={priority && i === 0}
            quality={controlsVariant === "hero" ? 85 : 80}
            className="object-cover"
          />
        </div>
      ))}

      {showControls ? (
        <>
          <div className={cx("pointer-events-none absolute inset-x-0 flex justify-center gap-1.5", dotBottom)} role="tablist" aria-label="Trip photos">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Photo ${i + 1} of ${slides.length}`}
                className={cx(
                  "pointer-events-auto size-2 rounded-full transition outline-none ring-white/70 focus-visible:ring-4",
                  i === index ? "bg-white shadow-sm" : "bg-white/45 hover:bg-white/70",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
              />
            ))}
          </div>

          {controlsVariant === "hero" ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                className={cx(
                  "absolute left-3 top-1/2 z-[18] -translate-y-1/2 rounded-full border border-white/55 bg-neutral-950/55 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white",
                  "outline-none ring-white/80 transition hover:bg-white hover:text-neutral-950 focus-visible:ring-4",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  go(-1);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                className={cx(
                  "absolute right-3 top-1/2 z-[18] -translate-y-1/2 rounded-full border border-white/55 bg-neutral-950/55 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white",
                  "outline-none ring-white/80 transition hover:bg-white hover:text-neutral-950 focus-visible:ring-4",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  go(1);
                }}
              >
                ›
              </button>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
