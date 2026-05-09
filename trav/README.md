# Trav

Travel-first itineraries, saved pins, and community recaps rendered with the Next.js App Router (mock-heavy today, Supabase-ready).

## Local development

```bash
cd trav
npm install
npm run dev
```

Browse [http://localhost:3000](http://localhost:3000). Hot reload behaves like any Next.js 16 workspace.

Common scripts:

| Script | Meaning |
| --- | --- |
| `npm run dev` | Turbopack dev server |
| `npm run lint` | ESLint (Next preset) |
| `npm run build` | Production build + type-check |
| `npm run verify:supabase` | Spins `@supabase/supabase-js`, calls Auth `getSession()` |

## Supabase bootstrap

Supabase splits concerns across **clients** shipped in-app (anon/public key only) versus **privileged service keys** that must stay on the server. Trav currently wires **only public env vars**:

| Env var | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon / public |

### Wire env files without leaking secrets

1. Duplicate `.env.local.example` into `.env.local` (already git-ignored).

   ```bash
   cp .env.local.example .env.local   # Unix shells
   copy .env.local.example .env.local # Windows shells
   ```

2. Paste the two values exactly as Supabase prints them (`https://` project URL plus the long JWT-style anon token).

3. Restart `npm run dev` whenever `.env.local` changes — Next reads env vars on boot.

4. Run `npm run verify:supabase` once keys are filled. Successful output resembles `HTTP 200 … latency …` **without exposing keys**.

Implementation map for beginners:

```
src/lib/supabase/
├── client.ts     # Browser / Client Components (createBrowserClient)
├── server.ts     # Async server helper (cookies from next/headers)
├── env.ts        # Shared env accessors with friendly throws
├── types.ts      # Database generics (stub until codegen)
└── verifyConnection.ts → disposable `@supabase/supabase-js` client + harmless `auth.getSession()` probe
```

> **Auth note:** Middleware and Supabase cookie refresh helpers are deliberately **not** part of Trav yet — add them when `/login` swaps from mock rehearsal to OAuth/email flows.

### Generate real `Database` types

After designing tables inside Supabase:

```bash
npx supabase gen types typescript \
  --project-id <YOUR_PROJECT_REF> \
  --schema public \
  > src/lib/supabase/types.ts
```

Re-run generators whenever schemas change — the stub file is intentionally empty so TypeScript stays honest until codegen exists.

### Useful documentation

- [Supabase + Next.js App Router SSR guide](https://supabase.com/docs/guides/auth/server-side/nextjs)

## Troubleshooting checklist

| Symptom | Fix |
| --- | --- |
| `Missing NEXT_PUBLIC_*` thrown in UI | Populate `.env.local`, restart dev server |
| `verify:supabase` times out / fetch errors | Project paused, flaky VPN/antivirus proxies, or bad URL — revive in dashboard or relax interceptors |
| `setAll` errors in console only | Expected during Server Components; fix with middleware when auth launches |

---

This project inherits the stock Next.js ergonomics documented at [nextjs.org/docs](https://nextjs.org/docs). Deploy previews work on Vercel when environment variables mirror `.env.local` in Project Settings → Environment Variables.
