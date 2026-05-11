import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

/**
 * Returns whether another profile already owns this normalized username (excluding the signed-in traveller).
 */
export async function isUsernameTakenByOtherUser(
  supabase: Client,
  normalizedUsername: string,
  currentUserId: string,
): Promise<{ taken: boolean; queryError?: string }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalizedUsername)
    .neq("id", currentUserId)
    .maybeSingle();

  if (error) {
    return { taken: false, queryError: "Could not verify if that handle is free — try again in a moment." };
  }

  return { taken: Boolean(data) };
}
