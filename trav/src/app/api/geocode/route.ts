import { NextResponse } from "next/server";

import { nominatimGeocode } from "@/lib/geo/nominatimGeocode";

/**
 * Server-only geocode proxy — the browser must never call Nominatim directly (policy + CORS).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > 200) {
    return NextResponse.json({ ok: false as const, error: "missing_query" }, { status: 400 });
  }

  const hit = await nominatimGeocode(q);
  if (!hit) {
    return NextResponse.json({ ok: false as const, error: "not_found" });
  }

  return NextResponse.json({ ok: true as const, lat: hit.lat, lng: hit.lng });
}
