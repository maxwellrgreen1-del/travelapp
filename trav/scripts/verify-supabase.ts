/**
 * Sanity check that HTTPS + anon key can handshake with PostgREST.
 * Loads `.env.local` keys when npm runs outside Next runtime.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { verifySupabaseConnection } from "../src/lib/supabase/verifyConnection";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    return;
  }

  const text = readFileSync(path, "utf8");

  for (let line of text.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

async function main() {
  const result = await verifySupabaseConnection();

  if (!result.ok) {
    console.error(`[Trav × Supabase] Connection check failed: ${result.reason}`);
    process.exit(1);
    return;
  }

  console.log(
    `[Trav × Supabase] OK ✓ handshake HTTP ${result.status} in ${result.latencyMs}ms (never printed secrets!)`,
  );
}

void main();
