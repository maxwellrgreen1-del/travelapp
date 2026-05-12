import type { User } from "@supabase/supabase-js";

import type { MockTravelerSocialProfile } from "@/features/profile/mockTravelerProfile";
import { mockTravelerSocial } from "@/features/profile/mockTravelerProfile";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function cleanHandleFragment(input: string): string {
  const cleaned = input.toLowerCase().replace(/[^a-z0-9._]/g, "").replace(/\.+/g, ".");
  if (cleaned.length >= 3) return cleaned;
  return `${cleaned}tript`.slice(0, 16).padEnd(3, "t");
}

export function deriveUsernameFromUser(user: User): string {
  const rawMeta = user.user_metadata;
  const fromMetadata =
    typeof rawMeta?.username === "string" && rawMeta.username.trim().length > 0
      ? rawMeta.username.trim()
      : null;
  const fromEmail = user.email?.split("@")[0] ?? null;
  const fallback = `tripper_${user.id.slice(0, 6)}`;

  return cleanHandleFragment(fromMetadata ?? fromEmail ?? fallback);
}

export function deriveDisplayNameFromUser(user: User): string {
  const rawMeta = user.user_metadata;
  const fromMetadata =
    typeof rawMeta?.display_name === "string" && rawMeta.display_name.trim().length > 0
      ? rawMeta.display_name.trim()
      : null;
  const fromEmail = user.email?.split("@")[0] ?? null;
  return fromMetadata ?? fromEmail ?? "tript explorer";
}

function deriveInitials(displayName: string): string {
  const chunks = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (chunks.length === 0) return "TT";
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
  return `${chunks[0][0] ?? "T"}${chunks[chunks.length - 1][0] ?? "T"}`.toUpperCase();
}

function deriveMemberSince(user: User, fallbackIso: string): string {
  const candidate = user.created_at || fallbackIso;
  const year = new Date(candidate).getFullYear();
  if (!Number.isFinite(year)) return "Wayfinder since 2026";
  return `Wayfinder since ${year}`;
}

export function toPublicProfileHeaderViewModel(row: ProfileRow): MockTravelerSocialProfile {
  const displayName = row.display_name?.trim() || row.username;
  const username = row.username.trim().toLowerCase();
  const year = new Date(row.created_at).getFullYear();

  return {
    ...mockTravelerSocial,
    displayName,
    username,
    avatarUrl: row.avatar_url?.trim() || mockTravelerSocial.avatarUrl,
    avatarAlt: `${displayName} profile photo`,
    bio: row.bio?.trim() || "This explorer is still drafting their tript bio — say hello from their next recap.",
    initialsFallback: deriveInitials(displayName),
    memberSinceCopy: Number.isFinite(year) ? `Explorer since ${year}` : "Explorer on tript",
    followersCount: 0,
    followingCount: 0,
    postsPublished: 0,
  };
}

export function toProfileHeaderViewModel(row: ProfileRow, user: User): MockTravelerSocialProfile {
  const displayName = row.display_name?.trim() || deriveDisplayNameFromUser(user);
  const username = row.username.trim().toLowerCase();

  return {
    ...mockTravelerSocial,
    displayName,
    username,
    avatarUrl: row.avatar_url?.trim() || mockTravelerSocial.avatarUrl,
    avatarAlt: `${displayName} profile photo`,
    bio:
      row.bio?.trim() ||
      "New tript traveler in motion — profile bio coming soon with their first stitched journey notes.",
    initialsFallback: deriveInitials(displayName),
    memberSinceCopy: deriveMemberSince(user, row.created_at),
  };
}
