import { createClient } from "@supabase/supabase-js";

import { tryGetPublicSupabaseConfig } from "./env";
import type { Database } from "./types";

export type SupabaseConnectivityOk = {
  ok: true;
  latencyMs: number;
  /** `true` when a stored/refreshed session exists — unrelated to anonymous reachability checks. */
  hasSession: boolean;
};

export type SupabaseConnectivityErr = {
  ok: false;
  reason: string;
};

export type SupabaseConnectivityResult = SupabaseConnectivityOk | SupabaseConnectivityErr;

/** Light checks so mis-copied URLs/keys fail before any network noise. */

function validateProjectUrl(candidate: string): string | null {
  const trimmed = candidate.trim();

  if (!trimmed) {
    return "NEXT_PUBLIC_SUPABASE_URL is empty after trimming — paste the HTTPS Project URL exactly from Supabase Dashboard → Settings → API.";
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "https:") {
      return "NEXT_PUBLIC_SUPABASE_URL must use https:// — Supabase project URLs never ship without TLS.";
    }

    if (!url.hostname) {
      return "NEXT_PUBLIC_SUPABASE_URL is missing a hostname — confirm you copied https://xyzcompany.supabase.co without wrapping quotes.";
    }

    return null;
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL is not a valid absolute URL — it should resemble https://<project-ref>.supabase.co (no stray quotes inside the key).";
  }
}

/** Supabase anon keys are JWTs (three dotted segments); catch halfway copy/pastes early. */

function validateAnonKey(candidate: string): string | null {
  const trimmed = candidate.trim();

  if (!trimmed) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY is empty — paste the long anon/public key from Dashboard → Settings → API.";
  }

  const segments = trimmed.split(".");

  if (segments.length < 3) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY does not resemble a JWT (expects three dotted segments). Re-copy from Supabase and ensure no wrapping quotes linger in `.env.local`.";
  }

  return null;
}

/**
 * Connects via the official Supabase client and reads current auth metadata.
 *
 * Anonymous projects still answer `auth.getSession()` without requiring PostgREST schema/RLS to exist,
 * avoiding spurious REST 401s from unconfigured tables.
 */

export async function verifySupabaseConnection(): Promise<SupabaseConnectivityResult> {
  const config = tryGetPublicSupabaseConfig();

  if (!config) {
    return {
      ok: false,
      reason:
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy `.env.local.example` → `.env.local`, paste both dashboard values on single lines (`KEY=value`, no trailing spaces), then rerun `npm run verify:supabase`.",
    };
  }

  const urlFault = validateProjectUrl(config.url);
  if (urlFault) {
    return { ok: false, reason: urlFault };
  }

  const keyFault = validateAnonKey(config.anonKey);
  if (keyFault) {
    return { ok: false, reason: keyFault };
  }

  /** Ephemeral CLI client — skips storage + refresh timers that can fight short-lived Node scripts on Windows. */
  const supabase = createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const started = Date.now();

    const { error, data } = await supabase.auth.getSession();

    const latencyMs = Date.now() - started;

    if (error) {
      return {
        ok: false,
        reason: formatAuthEndpointError(error),
      };
    }

    return {
      ok: true,
      latencyMs,
      hasSession: Boolean(data.session),
    };
  } catch (error) {
    return {
      ok: false,
      reason: wrapUnexpectedConnectivityError(error),
    };
  } finally {
    /**
     * Tear down the dormant Realtime websocket so short Node processes on Windows
     * exit without transport assertions during process teardown.
     */
    try {
      await supabase.realtime.disconnect();
    } catch {
      // ignore — verification outcome already decided above
    }
  }
}

function formatAuthEndpointError(error: { message?: string; name?: string }): string {
  const snippet = typeof error.message === "string" && error.message.trim() ? error.message.trim() : "Unknown Auth API error.";
  const name = typeof error.name === "string" && error.name.trim() ? ` (${error.name})` : "";

  const tail =
    snippet.toLowerCase().includes("jwt") || snippet.toLowerCase().includes("invalid")
      ? " Re-open Supabase Dashboard → Settings → API and regenerate the anon key if you recently rotated secrets."
      : " Confirm the Supabase project is running (paused projects stall here) or that antivirus/VPN proxies are not rewriting HTTPS responses.";

  return `Supabase Auth answered with an error${name}: ${snippet}.${tail}`;
}

function wrapUnexpectedConnectivityError(error: unknown): string {
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return `Network transport failed (${error.message}). Double-check NEXT_PUBLIC_SUPABASE_URL, outbound HTTPS access, VPN/proxy tooling, then retry.`;
  }

  if (error instanceof Error && error.message) {
    return `Unexpected client bootstrap error — ${error.message}. If secrets were rotated, regenerate keys in Dashboard → Settings → API.`;
  }

  return "Unexpected client bootstrap error — run with NODE_DEBUG=request for deeper traces (secrets still never logged).";
}
