export type GeocodeHit = { lat: number; lng: number };

const MAX_QUERY_LEN = 200;

type NominatimRow = {
  lat?: string;
  lon?: string;
};

/**
 * Forward-geocode a free-text place using OSM Nominatim (server-side only — respects their usage policy).
 *
 * Uses the **first parseable row** in the API response. Nominatim already orders results by relevance for `q`;
 * picking the row with the numerically largest `importance` often promoted **broad regions** (countries) over the
 * intended city/POI and moved pins hundreds of km away — do not reorder by importance here.
 *
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export async function nominatimGeocode(query: string): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q || q.length > MAX_QUERY_LEN) {
    return null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "8");
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("q", q);

  const response = await fetch(url.toString(), {
    headers: {
      /** Policy: identify the application. */
      "User-Agent": "TriptTravelApp/1.0",
      Accept: "application/json",
      /** Hint for regional ranking when the query is ambiguous. */
      "Accept-Language": "en-US,en;q=0.9",
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

  /** First valid hit preserves Nominatim relevance ordering (do not swap lat/lon: OSM uses `lat` + `lon`). */
  for (let i = 0; i < payload.length; i++) {
    const row = payload[i] as NominatimRow;
    const lat = Number(row.lat);
    const lng = Number(row.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      continue;
    }
    return { lat, lng };
  }

  return null;
}
