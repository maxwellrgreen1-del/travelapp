# Supabase schema (tript)

This folder holds the **declarative MVP schema** for the tript app: profiles, posts, media, locations, engagement (likes, saves, comments, follows), and notifications — with **Row Level Security** tuned for public reads and owner-only writes.

The canonical definition lives in **`schema.sql`**.

## Prerequisites

- A Supabase project ([dashboard](https://supabase.com/dashboard)).
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli) for local Postgres and migrations (`supabase --version`).

## Apply `schema.sql` on hosted Supabase (fastest)

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the full contents of `schema.sql`.
3. Run once on an **empty** `public` schema (new project or after reset — see below).

If tables already exist from an older experiment, drop them first or use a fresh project so FK order and policies stay clean.

## Use the Supabase CLI (local dev + repeatable deploys)

From the repo root (`trav/`):

```bash
# Link CLI to your project (one-time)
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

### Run the schema against the linked remote database

```bash
# Executes schema.sql via psql plumbing — handy for quick iteration
supabase db execute --file supabase/schema.sql
```

Or start local stack and push:

```bash
supabase init   # if you have not created config.toml yet — adds supabase/config.toml
supabase start
supabase db reset   # replays migrations / seed; see reset section below
```

> **Note:** The CLI’s migration workflow usually stores files under `supabase/migrations/*.sql`. This repo currently ships a single **`schema.sql`** snapshot you can paste or execute; you can `supabase migration new tript_mvp` and copy `schema.sql` into that file if you want versioned migrations.

## Reset local schema later

**Local Docker stack** (after `supabase start`):

```bash
supabase db reset
```

That tears down the local database volume, reapplies migrations from `supabase/migrations/`, and runs `supabase/seed.sql` if present.

**Hosted project:** there is no one-click “reset” — use the dashboard **SQL Editor** to `DROP` objects in careful order (children before parents) or create a **new Supabase project** and re-run `schema.sql`.

## Generate TypeScript types for `src/lib/supabase/types.ts`

After the schema is applied (hosted or local):

```bash
# Hosted project — needs personal access token with project read scope
npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > src/lib/supabase/types.ts
```

```bash
# Local Supabase (CLI running)
npx supabase gen types typescript --local --schema public > src/lib/supabase/types.ts
```

Replace `src/lib/supabase/types.ts` in this repo so `@supabase/ssr` clients pick up typed tables.

## Quick sanity checks

- Sign up a test user → insert a row into `profiles` with `id = auth.uid()`.
- Create a `posts` row with `author_id = auth.uid()`.
- Confirm anon key can `select` public posts; other user cannot `update` your rows.

## Files

| File | Purpose |
| --- | --- |
| `schema.sql` | Tables, indexes, triggers, RLS policies, helper functions |
| `migrations/20260210120000_post_media_storage_bucket.sql` | Storage bucket `post-media` + object policies for post images |
| `STORAGE_SETUP.md` | Dashboard steps + policy explanation for tript media uploads |

No frontend code reads this folder automatically — wire queries when you replace mock data.
