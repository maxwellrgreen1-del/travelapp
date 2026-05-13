export type GeocodeHit = { lat: number; lng: number };

const MAX_QUERY_LEN = 200;

/**
 * Forward-geocode a free-text place using OSM Nominatim (server-side only — respects their usage policy).
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export async function nominatimGeocode(query: string): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q || q.length > MAX_QUERY_LEN) {
    return null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", q);

  const response = await fetch(url.toString(), {
    headers: {
      /** Policy: identify the application. */
      "User-Agent": "TriptTravelApp/1.0",
      Accept: "application/json",
    },
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const first = payload[0] as { lat?: string; lon?: string };
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}
