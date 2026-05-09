import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseConfig } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser Supabase client for Client Components.
 *
 * Instantiate per interaction (cheap) rather than stuffing one global singleton on `window`:
 * Expo-style apps sometimes wrap hooks — tript keeps factories explicit for clarity.
 */
export function createClient() {
  const { url, anonKey } = getPublicSupabaseConfig();

  return createBrowserClient<Database>(url, anonKey);
}
