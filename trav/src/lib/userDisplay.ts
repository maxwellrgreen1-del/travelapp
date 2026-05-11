/**
 * Two-letter initials for avatars derived from profiles.display_name fallbacking to username.
 */
export function initialsFromProfile(username: string, displayName: string | null): string {
  const name = displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}
