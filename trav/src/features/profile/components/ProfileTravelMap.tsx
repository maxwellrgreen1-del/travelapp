"use client";

import "leaflet/dist/leaflet.css";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import type { ProfileAuthorMapPin } from "@/features/profile/loadProfileAuthorPosts";
import { cx } from "@/lib/utils";

type ProfileTravelMapProps = {
  pins: ProfileAuthorMapPin[];
  /** When false, the empty overlay explains “no posts yet”; when true, explains “posts exist but no pins”. */
  hasPublishedPosts: boolean;
  className?: string;
};

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeImageSrc(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function buildPopupHtml(pin: ProfileAuthorMapPin): string {
  const title = escapeHtml(pin.title);
  const loc = escapeHtml(pin.locationName);
  const caption = escapeHtml(pin.captionSnippet);
  const imgUrl = safeImageSrc(pin.imageUrl);
  const img =
    imgUrl != null
      ? `<img src="${escapeHtml(imgUrl)}" alt="" width="220" height="120" loading="lazy" decoding="async" style="object-fit:cover;border-radius:12px;margin-top:10px;width:100%;height:120px;display:block;" />`
      : "";
  const ctaHref = `/post/${encodeURIComponent(pin.postId)}`;
  return `
    <div class="tript-map-popup">
      <p class="tript-map-popup__title">${title}</p>
      <p class="tript-map-popup__loc">${loc}</p>
      <p class="tript-map-popup__cap">${caption}</p>
      ${img}
      <p class="tript-map-popup__cta-wrap">
        <a class="tript-map-popup__cta" href="${ctaHref}">View full post</a>
      </p>
    </div>
  `;
}

/** Drop pins outside WGS-84 or with non-finite coords so Leaflet never receives garbage. */
function sanitizePins(raw: readonly ProfileAuthorMapPin[]): ProfileAuthorMapPin[] {
  const out: ProfileAuthorMapPin[] = [];
  for (const pin of raw) {
    const lat = typeof pin.lat === "number" ? pin.lat : Number(pin.lat);
    const lng = typeof pin.lng === "number" ? pin.lng : Number(pin.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[ProfileTravelMap] Skipping pin with invalid coordinates for post:", pin.postId);
      }
      continue;
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[ProfileTravelMap] Skipping pin outside WGS-84 range for post:", pin.postId, { lat, lng });
      }
      continue;
    }
    out.push({
      ...pin,
      lat,
      lng,
    });
  }
  return out;
}

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM_EMPTY = 2;
const DEFAULT_ZOOM_SINGLE = 6;

/**
 * OSM tiles + one marker per geocoded post. MVP: no clustering, no fly-to animations.
 */
export function ProfileTravelMap({ pins: pinsProp, hasPublishedPosts, className }: ProfileTravelMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  const pins = useMemo(() => sanitizePins(pinsProp), [pinsProp]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      if (cancelled || !hostRef.current) {
        return;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const prefersCoarsePointer =
        typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

      const map = L.map(hostRef.current, {
        /** On phones, wheel zoom steals scroll; pinch-zoom still works. */
        scrollWheelZoom: !prefersCoarsePointer,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.divIcon({
        className: "tript-leaflet-div-icon",
        html: `<span aria-hidden="true" style="display:flex;width:28px;height:28px;align-items:center;justify-content:center;border-radius:9999px;background:#85bb65;color:#fff;font-size:14px;border:2px solid #fff;box-shadow:0 8px 18px rgba(15,23,42,0.35);">●</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 26],
      });

      for (const pin of pins) {
        try {
          const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
          marker.bindPopup(buildPopupHtml(pin), { maxWidth: 300, minWidth: 220, className: "tript-map-popup-wrap" });
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[ProfileTravelMap] Failed to add marker for post:", pin.postId, error);
          }
        }
      }

      try {
        if (pins.length === 1) {
          map.setView([pins[0].lat, pins[0].lng], DEFAULT_ZOOM_SINGLE);
        } else if (pins.length > 1) {
          const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
          if (typeof bounds.isValid === "function" && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
          } else {
            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM_EMPTY);
          }
        } else {
          map.setView(DEFAULT_CENTER, DEFAULT_ZOOM_EMPTY);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[ProfileTravelMap] Failed to set map view; using default.", error);
        }
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM_EMPTY);
      }

      mapRef.current = map;

      requestAnimationFrame(() => {
        if (cancelled || !mapRef.current) {
          return;
        }
        mapRef.current.invalidateSize();
        /** Second pass helps mobile flex layouts after fonts load. */
        window.setTimeout(() => {
          if (!cancelled && mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 250);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pins]);

  const emptyOverlayMessage = hasPublishedPosts
    ? "No pins on the map yet — try a clearer city or region in your destination or first waypoint. Your posts still appear in the list below and in the photo grid."
    : "When you publish a trip, we try to drop a pin from your destination or first waypoint. Your photo grid will fill in here too.";

  return (
    <section aria-label="Travel map" className={cx("space-y-3", className)}>
      <div className="px-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/85">Travel map</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-700">
          Places you&apos;ve posted from — tap a pin for a quick preview, then open the full recap.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-neutral-200/90 bg-neutral-100 shadow-inner shadow-neutral-950/15">
        <div ref={hostRef} className="isolate z-0 h-[min(52vh,420px)] min-h-[260px] w-full sm:min-h-[280px]" />

        {pins.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/85 px-5 text-center sm:px-8">
            <p className="max-w-md text-sm font-medium leading-relaxed text-neutral-800">{emptyOverlayMessage}</p>
          </div>
        ) : null}
      </div>

      <p className="px-1 text-xs leading-relaxed text-neutral-500">
        Map © OpenStreetMap contributors · Search data via{" "}
        <Link href="https://nominatim.openstreetmap.org/" className="font-semibold text-primary underline-offset-2 hover:underline" prefetch={false}>
          Nominatim
        </Link>{" "}
        (server-side only from this app).
      </p>
    </section>
  );
}
