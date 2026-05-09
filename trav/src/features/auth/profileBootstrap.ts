import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type ProfileBootstrapFields = {
  userId: string;
  username: string;
  displayName: string;
};

/**
 * Creates the `profiles` row right after signup (session present) or fills gaps after email confirmation.
 */
export async function insertProfileRow(supabase: Client, fields: ProfileBootstrapFields) {
  const username = fields.username.trim().toLowerCase();

  const { error } = await supabase.from("profiles").insert({
    id: fields.userId,
    username,
    display_name: fields.displayName.trim(),
    is_public: true,
  });

  return { error };
}

/**
 * If the traveller verified email before the profile insert ran, hydrate from `user_metadata`
 * (set during `signUp`) on the next login.
 */
export async function ensureProfileFromUserMetadata(
  supabase: Client,
  user: { id: string; user_metadata?: Record<string, unknown>; email?: string | null },
) {
  const meta = user.user_metadata ?? {};
  const rawUsername = typeof meta.username === "string" ? meta.username : null;
  const rawDisplay = typeof meta.display_name === "string" ? meta.display_name : null;

  if (!rawUsername?.trim()) {
    return { skipped: true as const };
  }

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    return { error: selectError };
  }

  if (existing) {
    return { skipped: false as const, alreadyHadProfile: true };
  }

  const displayName =
    rawDisplay?.trim() ||
    user.email?.split("@")[0] ||
    rawUsername.trim();

  const { error } = await insertProfileRow(supabase, {
    userId: user.id,
    username: rawUsername,
    displayName,
  });

  return error ? { error } : { skipped: false as const, created: true as const };
}
