import type { SupabaseClient, User } from "@supabase/supabase-js";

import { insertProfileRow } from "@/features/auth/profileBootstrap";
import { deriveDisplayNameFromUser, deriveUsernameFromUser } from "@/features/profile/profileAuthAdapter";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type Client = SupabaseClient<Database>;

export type LoadOrCreateProfileResult =
  | { ok: true; row: ProfileRow }
  | { ok: false; error: string };

function isDuplicateConflict(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "23505") return true;
  return error.message?.toLowerCase().includes("duplicate") ?? false;
}

/**
 * Loads `public.profiles` for the signed-in traveller, inserting a bootstrap row when missing (same behaviour as `/profile`).
 */
export async function loadOrCreateProfileForUser(supabase: Client, authedUser: User): Promise<LoadOrCreateProfileResult> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", authedUser.id).maybeSingle();

  if (error) {
    return { ok: false, error: "Could not load your profile from Supabase — check your connection and try again." };
  }

  let row = data;

  if (!row) {
    const username = deriveUsernameFromUser(authedUser);
    const displayName = deriveDisplayNameFromUser(authedUser);
    const { error: insertError } = await insertProfileRow(supabase, {
      userId: authedUser.id,
      username,
      displayName,
    });

    if (insertError && !isDuplicateConflict(insertError)) {
      return {
        ok: false,
        error: "Could not create your profile row yet. If your email is confirmed, retry in a few seconds.",
      };
    }

    const followup = await supabase.from("profiles").select("*").eq("id", authedUser.id).maybeSingle();
    if (followup.error || !followup.data) {
      return { ok: false, error: "Profile bootstrap is delayed — tap retry on the surrounding screen." };
    }

    row = followup.data;
  }

  return { ok: true, row };
}
