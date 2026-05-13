/** Nominatim `q` max length — keep under their abuse-prevention expectations. */
export const PROFILE_MAP_GEOCODE_QUERY_MAX = 200;

/**
 * Single-token waypoints ("Downtown", "Hostel") geocode poorly alone.
 * When `location_display` looks like a fuller line (commas / several words), lead with it so Nominatim gets context first.
 */
function isShortSingleToken(name: string): boolean {
  const t = name.trim();
  if (t.length < 2) {
    return true;
  }
  if (t.includes(",") || /\s/.test(t)) {
    return false;
  }
  return t.length <= 18;
}

function locationDisplayLooksStructured(loc: string): boolean {
  const t = loc.trim();
  if (t.length < 8) {
    return false;
  }
  if (t.includes(",")) {
    return true;
  }
  return t.split(/\s+/).filter(Boolean).length >= 3;
}

/**
 * Builds a single geocode string from ordered waypoint names + the card destination line.
 * Prefers the most specific usable text: combine first waypoint with `location_display` when both exist,
 * ordering segments so vague single-word waypoints do not dominate the query.
 */
export function buildProfileMapGeocodeQuery(locationDisplay: string, placeNames: string[]): string {
  const firstPlace = placeNames.map((name) => name.trim()).find(Boolean) ?? "";
  const loc = locationDisplay.trim();

  let joined: string;
  if (firstPlace && loc && loc.toLowerCase() !== firstPlace.toLowerCase()) {
    const vagueFirst = isShortSingleToken(firstPlace);
    const richLoc = locationDisplayLooksStructured(loc);
    if (vagueFirst && richLoc) {
      joined = `${loc}, ${firstPlace}`;
    } else {
      joined = `${firstPlace}, ${loc}`;
    }
  } else if (firstPlace) {
    joined = firstPlace;
  } else {
    joined = loc;
  }

  const trimmed = joined.trim();
  const out = trimmed.length > PROFILE_MAP_GEOCODE_QUERY_MAX ? trimmed.slice(0, PROFILE_MAP_GEOCODE_QUERY_MAX) : trimmed;

  if (!out) {
    return "";
  }
  return out;
}
