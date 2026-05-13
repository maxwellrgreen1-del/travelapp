import type { LocationSuggestion } from "@/lib/geo/locationSuggestion";

const MAX_Q = 200;
const MAX_RESULTS = 5;

type NominatimSearchRow = {
  place_id?: number | string;
  display_name?: string;
  lat?: string;
  lon?: string;
  class?: string;
  type?: string;
};

function placeTypeLabel(row: NominatimSearchRow): string | null {
  const c = row.class?.trim();
  const t = row.type?.trim();
  if (c && t) {
    return `${c}/${t}`;
  }
  if (c) {
    return c;
  }
  if (t) {
    return t;
  }
  return null;
}

/**
 * Server-only: returns a short list of forward-search hits for autocomplete (Nominatim `search`).
 */
export async function nominatimSearchSuggestions(query: string): Promise<LocationSuggestion[]> {
  const q = query.trim();
  if (q.length < 3 || q.length > MAX_Q) {
    return [];
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(MAX_RESULTS));
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("q", q);

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "TriptTravelApp/1.0",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return [];
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  const out: LocationSuggestion[] = [];
  let fallbackIndex = 0;

  for (const entry of payload) {
    if (out.length >= MAX_RESULTS) {
      break;
    }
    const row = entry as NominatimSearchRow;
    const lat = Number(row.lat);
    const lng = Number(row.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      continue;
    }
    const label = row.display_name?.trim();
    if (!label) {
      continue;
    }
    const id =
      row.place_id !== undefined && row.place_id !== null && String(row.place_id).length > 0
        ? `osm:${row.place_id}`
        : `row:${fallbackIndex}`;
    fallbackIndex += 1;
    out.push({
      id,
      label,
      lat,
      lng,
      placeType: placeTypeLabel(row),
    });
  }

  return out;
}
