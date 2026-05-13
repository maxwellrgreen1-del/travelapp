/** One row from `/api/location-suggest` — real coordinates from Nominatim, never fabricated. */
export type LocationSuggestion = {
  /** Stable id from Nominatim `place_id` when present, else index-based fallback. */
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** e.g. `place/city` from Nominatim `class` + `type` when available. */
  placeType: string | null;
};
