/**
 * Loads `.env.local`, builds a disposable Supabase client, and pings Auth via `getSession()`
 * — friendlier than raw PostgREST when tables/RLS are not seeded yet.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { verifySupabaseConnection } from "../src/lib/supabase/verifyConnection";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    console.warn(
      "[tript × Supabase] No `.env.local` found beside package.json — create it from `.env.local.example`, or inject env vars through your shell/CI harness.",
    );
    return;
  }

  const text = readFileSync(envPath, "utf8");

  for (const rawLine of text.split(/\r?\n/)) {
    const lineWithoutBom = rawLine.replace(/^\uFEFF/, "");
    const trimmed = lineWithoutBom.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    /** Never override values already pinned by CI or forwarded shells — `.env.local` is the default only. */

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

function printFailure(message: string) {
  console.error(`[tript × Supabase] Connection check failed — ${message}`);
}

async function verifyAndReport() {
  const result = await verifySupabaseConnection();

  if (!result.ok) {
    printFailure(result.reason);
    process.exitCode = 1;
    return;
  }

  const hint = result.hasSession
    ? "Supabase surfaced a hydrated session artifact (likely harmless for anonymous checks)."
    : "Anonymous reachability succeeded (no traveller session persisted).";

  console.log(`[tript × Supabase] OK ✓ client booted · auth#getSession completed in ${result.latencyMs}ms — ${hint}`);
}

verifyAndReport().catch((error: unknown) => {
  if (error instanceof Error && error.message) {
    printFailure(error.message);
  } else if (typeof error === "string") {
    printFailure(error);
  } else {
    printFailure("Unhandled verifier exception — rerun with NODE_OPTIONS=--trace-uncaught for depth (never prints secrets).");
  }

  process.exitCode = 1;
});
