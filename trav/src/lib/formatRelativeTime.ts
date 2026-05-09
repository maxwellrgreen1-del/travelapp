/**
 * Lightweight “Instagram-style” timestamps for mocked feeds only.
 */

export function formatRelativeTime(postedDate: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - postedDate.getTime();
  if (diffMs < 0 || Number.isNaN(diffMs)) {
    return "just now";
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;

  return postedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
