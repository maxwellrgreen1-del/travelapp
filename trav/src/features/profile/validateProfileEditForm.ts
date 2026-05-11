import { validateDisplayName, validateTrailUsername } from "@/features/auth/authValidation";

import { normalizeTrailUsername } from "@/features/profile/normalizeTrailUsername";

export type ProfileEditFieldErrors = Partial<Record<"displayName" | "username" | "bio" | "avatarUrl", string>>;

function validateOptionalAvatarUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Use an http or https image link.";
    }
    return null;
  } catch {
    return "That does not look like a valid URL.";
  }
}

export type ValidatedProfileEditForm = {
  fieldErrors: ProfileEditFieldErrors;
  normalizedUsername: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
};

/**
 * Client-side checks before we hit Supabase — keeps the screen component thin and testable.
 */
export function validateProfileEditForm(input: {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
}): ValidatedProfileEditForm {
  const fieldErrors: ProfileEditFieldErrors = {};

  const displayTrimmed = input.displayName.trim();
  if (!displayTrimmed) {
    fieldErrors.displayName = "Add a display name so friends recognize you.";
  } else {
    const displayErr = validateDisplayName(input.displayName);
    if (displayErr) {
      fieldErrors.displayName = displayErr;
    }
  }

  const normalizedUsername = normalizeTrailUsername(input.username);
  if (!normalizedUsername) {
    fieldErrors.username = "Pick a trail handle — it routes other tript travellers to you.";
  } else {
    const usernameErr = validateTrailUsername(normalizedUsername);
    if (usernameErr) {
      fieldErrors.username = usernameErr;
    }
  }

  const bioTrimmed = input.bio.trim();
  if (bioTrimmed.length > 500) {
    fieldErrors.bio = "Keep the bio under 500 characters for now.";
  }

  const avatarErr = validateOptionalAvatarUrl(input.avatarUrl);
  if (avatarErr) {
    fieldErrors.avatarUrl = avatarErr;
  }

  return {
    fieldErrors,
    normalizedUsername,
    displayName: displayTrimmed,
    bio: bioTrimmed ? bioTrimmed : null,
    avatarUrl: input.avatarUrl.trim() ? input.avatarUrl.trim() : null,
  };
}
