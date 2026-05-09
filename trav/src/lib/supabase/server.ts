import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicSupabaseConfig } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Supabase singleton for Server Components / Route handlers / Server Actions on the Next.js App Router.
 *
 * `cookies()` is async in Next.js 15+ (`Promise<ReadonlyRequestCookies>`) — awaiting keeps types honest.
 *
 * Important: Writes inside `setAll` can fail inside pure Server Components. When auth lands, mirror the
 * middleware pattern from `@supabase/ssr` docs to refresh expired sessions gracefully.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /**
           * `setAll` emits when Supabase tries to refresh cookie-backed sessions mid-render.
           * Middleware + Route handlers are the safest write surfaces — swallowing avoids noisy SSR crashes for now.
           */
        }
      },
    },
  });
}
