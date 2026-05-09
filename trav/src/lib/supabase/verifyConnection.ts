import { tryGetPublicSupabaseConfig } from "./env";

export type SupabaseConnectivityOk = { ok: true; status: number; latencyMs: number };

export type SupabaseConnectivityErr = {
  ok: false;
  reason: string;
};

export type SupabaseConnectivityResult = SupabaseConnectivityOk | SupabaseConnectivityErr;

/** Calls PostgREST’s OpenAPI handshake — no tables required yet. Uses only anon key + HTTPS. */
async function handshakePostgrest(baseUrl: string, anonKey: string): Promise<SupabaseConnectivityOk | SupabaseConnectivityErr> {
  try {
    const root = `${baseUrl.replace(/\/$/, "")}/rest/v1/`;
    const started = Date.now();

    const response = await fetch(root, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "*/*",
      },
      cache: "no-store",
    });

    const latencyMs = Date.now() - started;

    if (!response.ok) {
      return { ok: false, reason: `PostgREST responded with HTTP ${response.status}` };
    }

    return { ok: true, status: response.status, latencyMs };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected network error.";
    return { ok: false, reason: message };
  }
}

/**
 * Small smoke test wired for scripts or debug routes — does not authenticate users.
 * Never log anon keys — only booleans/status codes belong in console output.
 */
export async function verifySupabaseConnection(): Promise<SupabaseConnectivityResult> {
  const config = tryGetPublicSupabaseConfig();

  if (!config) {
    return {
      ok: false,
      reason:
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — copy `.env.local.example`, create `.env.local`, then rerun.",
    };
  }

  return handshakePostgrest(config.url, config.anonKey);
}
