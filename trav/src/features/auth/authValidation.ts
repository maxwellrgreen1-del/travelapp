/** Lightweight checks for mocked auth — swaps cleanly for schema validation later. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function trimmedLength(value: string): number {
  return value.trim().length;
}

/** Returns a field-level error label, or `null` when valid. */
export function validateEmailFormat(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return null;
  }
  if (!EMAIL_RE.test(trimmed)) {
    return "That email doesn't look voyage-ready yet — double-check the @ and domain.";
  }
  return null;
}

/** Signup passwords: basic length gate until Supabase rules land. */
const MIN_PASSWORD = 8;

export function validatePasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD) {
    return `Use at least ${MIN_PASSWORD} characters so your suitcase stays locked.`;
  }
  return null;
}

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length < 2) {
    return "Add at least two characters — future trip mates like knowing who swung the hammock.";
  }
  return null;
}

const USERNAME_RE = /^[a-zA-Z0-9._]+$/;

export function validateTrailUsername(username: string): string | null {
  const trimmed = username.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length < 3) {
    return "Trail names wander best after three characters — tighten the handle.";
  }
  if (!USERNAME_RE.test(trimmed)) {
    return "Use letters, digits, dots, or underscores — no spaced layovers mid-handle.";
  }
  return null;
}
