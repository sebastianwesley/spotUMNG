import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Snapshot the Vite env once at import time. In `bun test`, `import.meta.env`
// mirrors `process.env`, so tests seed/clear the variables before loading each
// module instance.
const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** True only when both public env vars are present. */
export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * The shared Supabase client, or null when the app is deployed without the
 * Supabase env vars (importing this module must never throw; callers guard
 * with isSupabaseConfigured()).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
