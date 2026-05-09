/** JSON-compatible column values — echoed from Supabase typegen for consistency. */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Database shape for `@supabase/ssr` / `supabase-js` generics.
 * Replace by generating from your hosted project once tables exist:
 *
 * ```
 * npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > src/lib/supabase/types.ts
 * ```
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
