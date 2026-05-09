/**
 * Reads public Supabase Web keys from Next.js runtime env vars.
 *
 * These values arrive through `NEXT_PUBLIC_*` naming and ship to the browser on purpose —
 * pairing them with Row Level Security is how Supabase guards data at rest. Never hardcode secrets.
 */

export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function tryGetPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  const config = tryGetPublicSupabaseConfig();

  if (!config) {
    throw new Error(
      "Missing Supabase env vars. Copy `.env.local.example` → `.env.local`, then paste dashboard → Settings → API keys.",
    );
  }

  return config;
}
