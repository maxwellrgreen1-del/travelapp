import type { AuthError } from "@supabase/supabase-js";

/**
 * Turns Supabase Auth error codes into short copy trippers actually read.
 */
export function mapSupabaseAuthError(error: AuthError | null | undefined): string {
  if (!error?.message) {
    return "Something went sideways — try again in a moment.";
  }

  const msg = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return "That email or password doesn’t match our records — double-check both fields.";
  }

  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
    return "Confirm your email from the inbox link we sent, then log in again.";
  }

  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "That email already has a tript passport — try logging in instead.";
  }

  if (msg.includes("password") && msg.includes("least")) {
    return "Supabase wants a longer passphrase — bump it to match your project’s minimum.";
  }

  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many tries — sip some water, then try again in a minute.";
  }

  return error.message;
}
