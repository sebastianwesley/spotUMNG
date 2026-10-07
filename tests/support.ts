/**
 * Shared test support for the Supabase-backed application flow.
 *
 * NOTE: nothing here touches production code. These helpers only exist so a
 * missing production module fails with a message that names the contract the
 * implementation still has to satisfy.
 */
import { expect } from "bun:test";

/** The deployed project the contract was verified against. */
export const SUPABASE_URL = "https://mkxmkcterzqezgksbxue.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GTtZqr7VAFNToAiVR4ChdQ_MC5hadXM"; // gitleaks:allow — publishable key, public by design

/**
 * `bun test` does not load `.env.local`, and `import.meta.env` mirrors
 * `process.env` at import time, so tests seed the two public Vite variables
 * before importing any module under test. Assignment (not `??=`) is deliberate:
 * test files share one process, so one suite must be able to restore the live
 * env after another ran against the offline host.
 */
export function seedSupabaseEnv(): void {
  process.env.VITE_SUPABASE_URL = SUPABASE_URL;
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
}

export function clearSupabaseEnv(): void {
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

/**
 * The service suite always injects a recording stub, so it must never be able to
 * reach the deployed project: should an implementation ignore the injected
 * client, requests fail fast against an unroutable host instead of mutating live
 * applicant data.
 */
export function seedOfflineSupabaseEnv(): void {
  process.env.VITE_SUPABASE_URL = "http://127.0.0.1:1";
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_offline_test_key";
}

/**
 * Imports a production module, failing with a message that states the missing
 * contract. A module that does not exist yet is the expected red for this suite.
 */
export async function loadModule<T = any>(specifier: string): Promise<T> {
  try {
    return (await import(specifier)) as T;
  } catch (error) {
    throw new Error(
      `Expected module "${specifier}" to exist and expose the documented contract, ` +
        `but it could not be loaded: ${(error as Error).message}`
    );
  }
}

/**
 * Memoized loader used inside each test: a file-level `await import()` would
 * abort the whole file, whereas calling this per test reports one failure per
 * behaviour, each naming the contract that is still missing.
 *
 * `prepare` runs once immediately before the module is first evaluated, which is
 * when a client derived from the environment would capture it.
 */
export function lazyModule<T = any>(specifier: string, prepare?: () => void): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => {
    if (!cached) {
      prepare?.();
      cached = loadModule<T>(specifier);
    }
    return cached;
  };
}

export function makeFile(name: string, type = "image/jpeg", bytes = 2_000): File {
  const size = Math.max(1, Math.round(bytes / 2));
  return new File(["a".repeat(size), "b".repeat(size)], name, { type });
}

/**
 * Configurable fake of `SupabaseClient` covering the surface the application
 * services are allowed to use (PostgREST builder, private storage bucket, auth).
 */
export function createSupabaseStub(overrides: {
  insertError?: unknown;
  selectRows?: unknown[];
  selectError?: unknown;
  updateError?: unknown;
  uploadError?: unknown;
  removeError?: unknown;
  sessionUser?: unknown;
  signInUser?: unknown;
  signInSession?: unknown;
  signInError?: unknown;
  probeError?: unknown;
}) {
  const uploads: Array<{ bucket: string; path: string; file: unknown; options?: unknown }> = [];
  const removedPaths: string[] = [];
  const publicUrlCalls: string[] = [];
  const signedUrlCalls: Array<{ path: string; expiresIn?: number }> = [];
  const authCalls: string[] = [];
  const inserts: Array<Record<string, unknown>> = [];
  const updates: Array<Record<string, unknown>> = [];
  const calls: Array<{ method: string; args: unknown[] }> = [];

  const record = (method: string, args: unknown[] = []) => calls.push({ method, args });
  /** Table the PostgREST builder is currently scoped to (insert/select/update). */
  let scope: "insert" | "select" | "update" | null = null;

  const tableBuilder: any = {
    insert(payload: Record<string, unknown>) {
      scope = "insert";
      inserts.push(payload);
      record("insert", [payload]);
      return tableBuilder;
    },
    update(payload: Record<string, unknown>) {
      scope = "update";
      updates.push(payload);
      record("update", [payload]);
      return tableBuilder;
    },
    select(columns?: string) {
      if (scope !== "insert") scope = "select";
      record("select", [columns]);
      return tableBuilder;
    },
    order(column?: string, options?: unknown) {
      record("order", [column, options]);
      return tableBuilder;
    },
    eq(column?: string, value?: unknown) {
      record("eq", [column, value]);
      return tableBuilder;
    },
    maybeSingle() {
      record("maybeSingle");
      return Promise.resolve({ data: null, error: null });
    },
    then(onFulfilled: any, onRejected: any) {
      let result: any = { data: null, error: null };
      if (scope === "insert") result = { data: null, error: overrides.insertError ?? null };
      else if (scope === "update") result = { data: null, error: overrides.updateError ?? null };
      else if (scope === "select") {
        result = { data: overrides.selectRows ?? [], error: overrides.selectError ?? null };
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
    catch(onRejected: any) {
      return this.then(undefined, onRejected);
    },
    finally(onFinally: any) {
      return Promise.resolve({ data: null, error: null }).finally(onFinally);
    },
  };

  const storageBucket = {
    upload(path: string, file: unknown, options?: unknown) {
      uploads.push({ bucket: "applicant-photos", path, file, options });
      record("upload", [path, file, options]);
      return Promise.resolve(
        overrides.uploadError ? { data: null, error: overrides.uploadError } : { data: { path }, error: null }
      );
    },
    getPublicUrl(path: string) {
      publicUrlCalls.push(path);
      return { data: { publicUrl: `${SUPABASE_URL}/storage/v1/object/public/applicant-photos/${path}` } };
    },
    remove(paths: string[]) {
      removedPaths.push(...paths);
      record("storage.remove", [paths]);
      return Promise.resolve(
        overrides.removeError ? { data: null, error: overrides.removeError } : { data: null, error: null }
      );
    },
    createSignedUrl(path: string, expiresIn?: number) {
      signedUrlCalls.push({ path, expiresIn });
      return Promise.resolve({ data: { signedUrl: `${SUPABASE_URL}/signed/${path}` }, error: null });
    },
  };

  const auth = {
    signInWithPassword(credentials: { email: string; password: string }) {
      authCalls.push("signInWithPassword");
      record("signInWithPassword", [credentials]);
      if (overrides.signInError) {
        return Promise.resolve({ data: { user: null, session: null }, error: overrides.signInError });
      }
      return Promise.resolve({
        data: {
          user: overrides.signInUser ?? {
            id: "admin-user-id",
            email: credentials.email,
            app_metadata: { admin: true },
          },
          session: overrides.signInSession ?? { access_token: "mock-access-token", user: overrides.signInUser },
        },
        error: null,
      });
    },
    async signOut() {
      authCalls.push("signOut");
      record("signOut", []);
      return { error: null };
    },
    async getSession() {
      authCalls.push("getSession");
      record("getSession", []);
      return {
        data: {
          session: {
            access_token: "mock-access-token",
            user: overrides.sessionUser ?? {
              id: "admin-user-id",
              email: "spotlightmng@outlook.com",
              app_metadata: { admin: true },
            },
          },
        },
        error: null,
      };
    },
    async getUser() {
      authCalls.push("getUser");
      record("getUser", []);
      return {
        data: { user: { id: "admin-user-id", email: "spotlightmng@outlook.com", app_metadata: { admin: true } } },
        error: null,
      };
    },
    async updateUser(attributes: { password?: string }) {
      authCalls.push("updateUser");
      record("updateUser", [attributes]);
      return { data: { user: { id: "admin-user-id", email: "spotlightmng@outlook.com" } }, error: null };
    },
  };

  const stub = {
    from(table: string) {
      scope = null;
      (stub as any).lastTable = table;
      record("from", [table]);
      return tableBuilder;
    },
    rpc(name: string, _args?: unknown) {
      scope = "select";
      (stub as any).lastRpc = name;
      record("rpc", [name]);
      return Promise.resolve(overrides.probeError ? { data: null, error: overrides.probeError } : { data: [], error: null });
    },
    storage: { from(bucket: string) {
      (stub as any).lastBucket = bucket;
      record("storage.from", [bucket]);
      return storageBucket;
    } },
    auth,
  };

  return { stub, uploads, removedPaths, publicUrlCalls, signedUrlCalls, authCalls, inserts, updates, calls };
}