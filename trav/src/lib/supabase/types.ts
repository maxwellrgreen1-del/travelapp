/** JSON-compatible column values — echoed from Supabase typegen for consistency. */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Database shape for `@supabase/ssr` / `supabase-js` generics.
 * Hand-maintained MVP slice — regenerate once full schema ships:
 *
 * ```
 * npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > src/lib/supabase/types.ts
 * ```
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
