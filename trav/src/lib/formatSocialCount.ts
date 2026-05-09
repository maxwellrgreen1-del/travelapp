/** Lightweight counts for traveller stats — stays readable inside tight profile rows. */
export function formatSocialCount(value: number): string {
  if (value >= 1_000_000) {
    const compact = value / 1_000_000;
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}M`;
  }
  if (value >= 10_000) {
    const compact = value / 1000;
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}K`;
  }
  if (value >= 1000) {
    return value.toLocaleString();
  }

  return value.toString();
}
