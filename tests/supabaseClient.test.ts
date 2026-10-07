/**
 * Contract: `src/lib/supabaseClient.ts`
 *
 * Exposes the single configured Supabase client for the app plus a guard the UI
 * can call before using it. Env comes from `VITE_SUPABASE_URL` /
 * `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase publishable key replaces the legacy
 * anon key for this project).
 *
 * `bun test` does not load `.env.local`, so each test seeds the public Vite
 * variables. Each concern loads its *own* module instance (a distinct specifier)
 * so one case's environment cannot leak into another through the module cache.
 *
 * These tests are RED until the module exists.
 */
import { test, describe, expect } from "bun:test";
import {
  SUPABASE_URL,
  clearSupabaseEnv,
  lazyModule,
  seedSupabaseEnv,
} from "./support.ts";

const MODULE = "../src/lib/supabaseClient.ts";

const loadConfigured = lazyModule<any>(`${MODULE}?case=configured`, seedSupabaseEnv);
const loadUnconfigured = lazyModule<any>(`${MODULE}?case=unconfigured`, clearSupabaseEnv);

describe("supabaseClient / configured client", () => {
  test("exposes a `supabase` client with the query, auth and storage surfaces", async () => {
    const { supabase: client } = await loadConfigured();

    expect(client).toBeDefined();
    expect(client).not.toBeNull();
    expect(typeof client.from).toBe("function");
    expect(typeof client.auth?.signInWithPassword).toBe("function");
    expect(typeof client.auth?.getSession).toBe("function");
    expect(typeof client.storage?.from).toBe("function");
  });

  test("the client is pointed at the deployed project URL from the environment", async () => {
    const { supabase: client } = await loadConfigured();

    expect(client.supabaseUrl).toBe(SUPABASE_URL);
  });

  test("isSupabaseConfigured() returns true when the env vars are present", async () => {
    const { isSupabaseConfigured } = await loadConfigured();

    expect(typeof isSupabaseConfigured).toBe("function");
    expect(isSupabaseConfigured()).toBe(true);
  });

  test("isSupabaseConfigured() returns false when the env vars are absent", async () => {
    try {
      // Graceful degradation: the module must still import without env vars, and
      // report that it is unusable rather than throwing during render.
      const module = await loadUnconfigured();

      expect(typeof module.isSupabaseConfigured).toBe("function");
      expect(module.isSupabaseConfigured()).toBe(false);
    } finally {
      seedSupabaseEnv();
    }
  });
});