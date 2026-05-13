/**
 * Parses map coordinates from Postgres (number) or legacy/string JSON values.
 * Returns null if missing or not a usable WGS-84 point for Leaflet.
 */
export function parseStoredMapCoordinatePair(
  latitude: unknown,
  longitude: unknown,
): { lat: number; lng: number } | null {
  const lat = typeof latitude === "number" ? latitude : Number(latitude);
  const lng = typeof longitude === "number" ? longitude : Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return { lat, lng };
}
