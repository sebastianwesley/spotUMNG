/**
 * SpotlightU — Supabase persistence + admin dashboard contract tests.
 *
 * Boundary under test: the Supabase client module (`src/lib/supabaseClient.ts`)
 * is mocked at the module boundary, then the real services are driven through it.
 * No browser/DOM is required and no dependency beyond `bun:test` is used.
 *
 * History: this suite originally targeted the `src/services/*` tree, which was
 * deleted in favour of `src/lib/*` (single source of truth). Its assertions were
 * re-pointed at the shipping modules rather than dropped, except for two that
 * only existed to prove the old tree's internals:
 *  - "exposes the persistence and upload surface" — the `fetchApplications`
 *    surface assertion duplicated `tests/applicationService.test.ts`'s
 *    "exposes the applicant + admin operations".
 *  - "isAdminUser is strictly true" — the old authService helper no longer
 *    exists; the identical claim logic is covered by the
 *    `signInAdmin` + `getAdminSession` claim tests in the lib suite.
 */
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// Supabase boundary mock
// ---------------------------------------------------------------------------

type RecordedCall = { method: string; args: unknown[] };

const calls: RecordedCall[] = [];
let currentTable: string | null = null;

function resetCalls() {
  calls.length = 0;
  currentTable = null;
}

function callsOf(method: string): RecordedCall[] {
  return calls.filter((c) => c.method === method);
}

function firstCall(method: string): RecordedCall | undefined {
  return calls.find((c) => c.method === method);
}

/** Chainable, awaitable PostgREST builder stub that records every call. */
function createQueryBuilder(): any {
  const result = { data: null, error: null, count: null, status: 201 };
  const builder: any = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === "then") {
          return (onFulfilled: any, onRejected: any) =>
            Promise.resolve(result).then(onFulfilled, onRejected);
        }
        if (prop === "catch") {
          return (onRejected: any) => Promise.resolve(result).catch(onRejected);
        }
        if (prop === "finally") {
          return (onFinally: any) => Promise.resolve(result).finally(onFinally);
        }
        return (...args: unknown[]) => {
          calls.push({ method: prop, args });
          return builder;
        };
      },
    }
  );
  return builder;
}

function createStorageMock() {
  return {
    from(bucket: string) {
      calls.push({ method: "storage.from", args: [bucket] });
      return {
        upload(path: string, file: unknown, options: unknown) {
          calls.push({ method: "upload", args: [path, file, options] });
          return Promise.resolve({ data: { path }, error: null });
        },
        getPublicUrl(path: string) {
          calls.push({ method: "getPublicUrl", args: [path] });
          return {
            data: {
              publicUrl: `https://mkxmkcterzqezgksbxue.supabase.co/storage/v1/object/public/${bucket}/${path}`,
            },
          };
        },
        createSignedUrl(path: string, expiresIn: unknown) {
          calls.push({ method: "createSignedUrl", args: [path, expiresIn] });
          return Promise.resolve({
            data: {
              signedUrl: `https://mkxmkcterzqezgksbxue.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=mock`,
            },
            error: null,
          });
        },
        remove(paths: unknown) {
          calls.push({ method: "storage.remove", args: [paths] });
          return Promise.resolve({ data: null, error: null });
        },
      };
    },
  };
}

const supabaseStub = {
  from(table: string) {
    calls.push({ method: "from", args: [table] });
    currentTable = table;
    return createQueryBuilder();
  },
  storage: createStorageMock(),
  auth: {
    signInWithPassword(credentials: unknown) {
      calls.push({ method: "auth.signInWithPassword", args: [credentials] });
      return Promise.resolve({
        data: {
          user: {
            id: "admin-user-id",
            email: "spotlightmng@outlook.com",
            app_metadata: { admin: true },
          },
          session: { access_token: "mock-token" },
        },
        error: null,
      });
    },
    signOut() {
      calls.push({ method: "auth.signOut", args: [] });
      return Promise.resolve({ error: null });
    },
    getSession() {
      calls.push({ method: "auth.getSession", args: [] });
      return Promise.resolve({
        data: {
          session: {
            user: {
              id: "admin-user-id",
              email: "spotlightmng@outlook.com",
              app_metadata: { admin: true },
            },
          },
        },
        error: null,
      });
    },
    updateUser(attributes: unknown) {
      calls.push({ method: "auth.updateUser", args: [attributes] });
      return Promise.resolve({ data: { user: { id: "admin-user-id" } }, error: null });
    },
  },
};

const supabaseModuleFactory = () => ({ supabase: supabaseStub });

// The lib tree imports the client only through the `@/` alias.
mock.module("@/lib/supabaseClient", supabaseModuleFactory);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadModule<T = any>(specifier: string): Promise<T> {
  try {
    return (await import(specifier)) as T;
  } catch (error) {
    throw new Error(
      `Expected module "${specifier}" to exist and expose the documented contract, ` +
        `but it could not be loaded: ${(error as Error).message}`
    );
  }
}

const SRC_DIR = resolve(import.meta.dir, "..", "src");
const readSource = (relativePath: string) => readFileSync(resolve(SRC_DIR, relativePath), "utf8");

const applicationServicePath = "@/lib/applicationService";
const authServicePath = "@/lib/applicationService";

const validApplication = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  age: 21,
  height: "5'9\"",
  location: "Lagos",
  instagram: "@janedoe",
  about: "Aspiring runway model.",
  headshotUrl: "applications/headshot-headshot.jpg",
  fullbodyUrl: "applications/fullbody-fullbody.jpg",
  profileUrl: "applications/profile-profile.jpg",
  additionalUrls: [],
};

beforeEach(resetCalls);

// ---------------------------------------------------------------------------

describe("Application service contract", () => {
  test("submitApplication writes to model_applications with snake_case columns and omits empty photo fields", async () => {
    const { submitApplication } = await loadModule(applicationServicePath);

    await submitApplication(
      {
        ...validApplication,
        fullbodyUrl: "",
        additionalUrls: [],
      },
      supabaseStub
    );

    expect(currentTable).toBe("model_applications");

    const insert = firstCall("insert");
    expect(insert).toBeDefined();

    const payload = insert!.args[0] as Record<string, unknown>;

    // No form-style camelCase key may leak into the database payload.
    expect(Object.keys(payload).filter((key) => /[A-Z]/.test(key))).toEqual([]);

    expect(payload.first_name).toBe("Jane");
    expect(payload.last_name).toBe("Doe");
    expect(payload.email).toBe("jane@example.com");
    // The age column is an integer; accept either a numeric or a DOM string value.
    expect(Number(payload.age)).toBe(21);
    expect(payload.height).toBe("5'9\"");
    expect(payload.location).toBe("Lagos");
    expect(payload.instagram).toBe("@janedoe");
    expect(payload.about).toBe("Aspiring runway model.");
    expect(payload.headshot_url).toBe("applications/headshot-headshot.jpg");
    expect(payload.profile_url).toBe("applications/profile-profile.jpg");

    // Empty photo inputs must be omitted, not written as empty strings/arrays.
    expect(payload).not.toHaveProperty("fullbody_url");
    expect(payload).not.toHaveProperty("additional_urls");
  });

  test("submitApplication requests minimal representation so the anonymous insert never reads rows back", async () => {
    const { submitApplication } = await loadModule(applicationServicePath);

    await submitApplication(validApplication, supabaseStub);

    const insertIndex = calls.findIndex((c) => c.method === "insert");
    expect(insertIndex).toBeGreaterThanOrEqual(0);

    // `.select()` after `.insert()` is what switches PostgREST to
    // Prefer: return=representation — forbidden for the anon role by RLS.
    const selectAfterInsert = calls.slice(insertIndex).find((c) => c.method === "select");
    expect(selectAfterInsert).toBeUndefined();
  });

  test("listApplications reads model_applications ordered by created_at descending", async () => {
    const { listApplications } = await loadModule(applicationServicePath);

    await listApplications(supabaseStub);

    expect(currentTable).toBe("model_applications");

    const order = firstCall("order");
    expect(order).toBeDefined();
    expect(order!.args[0]).toBe("created_at");
    expect((order!.args[1] as { ascending?: boolean } | undefined)?.ascending).toBe(false);
  });

  test("updateApplicationStatus rejects status values outside new|reviewing|accepted|declined", async () => {
    const { updateApplicationStatus } = await loadModule(applicationServicePath);

    for (const invalid of ["", "pending", "approved", "ACCEPTED", "archived"]) {
      await expect(
        updateApplicationStatus("4f1d2c3b-0000-0000-0000-000000000000", invalid, undefined, supabaseStub)
      ).rejects.toThrow();
    }

    // A rejected status must not reach the database.
    expect(callsOf("update")).toHaveLength(0);
  });

  test("updateApplicationStatus writes the new status to model_applications", async () => {
    const { updateApplicationStatus } = await loadModule(applicationServicePath);

    await updateApplicationStatus(
      "4f1d2c3b-0000-0000-0000-000000000000",
      "reviewing",
      undefined,
      supabaseStub
    );

    expect(currentTable).toBe("model_applications");

    const update = firstCall("update");
    expect(update).toBeDefined();
    expect((update!.args[0] as { status?: string }).status).toBe("reviewing");
  });

  test("uploadApplicantPhoto stores into the private applicant-photos bucket under applications/<kind>-<timestamp>-<name>", async () => {
    const { uploadApplicantPhoto } = await loadModule(applicationServicePath);

    const file = new File(["fake-image-bytes"], "headshot.jpg", { type: "image/jpeg" });
    const url = await uploadApplicantPhoto(file, "headshot", supabaseStub);

    const storageFrom = firstCall("storage.from");
    expect(storageFrom).toBeDefined();
    expect(storageFrom!.args[0]).toBe("applicant-photos");

    const upload = firstCall("upload");
    expect(upload).toBeDefined();

    const path = upload!.args[0] as string;
    // Path carries a monotonic suffix so same-millisecond uploads can't collide.
    expect(path).toMatch(/^applications\/headshot-\d+-\d+-headshot\.jpg$/);

    // Private bucket: the caller gets the storage path back, not a URL.
    expect(typeof url).toBe("string");
    expect(url).toBe(path);
  });
});

describe("Admin auth contract", () => {
  test("exposes the admin authentication surface", async () => {
    const auth = await loadModule(authServicePath);

    expect(typeof auth.signInAdmin).toBe("function");
    expect(typeof auth.signOutAdmin).toBe("function");
    expect(typeof auth.getAdminSession).toBe("function");
    expect(typeof auth.changeAdminPassword).toBe("function");
  });

  test("signInAdmin signs out a signed-in user whose token has no admin claim", async () => {
    const { signInAdmin } = await loadModule(authServicePath);

    const nonAdminStub = {
      ...supabaseStub,
      auth: {
        ...supabaseStub.auth,
        signInWithPassword(credentials: unknown) {
          calls.push({ method: "auth.signInWithPassword", args: [credentials] });
          return Promise.resolve({
            data: {
              user: { id: "regular-user", email: "someone@example.com", app_metadata: {} },
              session: { access_token: "regular-token" },
            },
            error: null,
          });
        },
      },
    };

    const result = await signInAdmin("someone@example.com", "hunter2", nonAdminStub);

    expect(result.error?.message).toBe("Not authorized as admin");
    expect(result.user).toBeNull();
    expect(callsOf("auth.signOut")).toHaveLength(1);
  });
});

describe("Admin route gating", () => {
  test("AdminGuard module exposes a default export component", async () => {
    const guard = await loadModule("../src/components/AdminGuard.tsx");

    expect(guard.default).toBeDefined();
    expect(["function", "object"]).toContain(typeof guard.default);
  });

  test("App declares /admin and /admin/login routes", () => {
    const appSource = readSource("App.tsx");
    const declaresRoute = (path: string) =>
      appSource.includes(`path="${path}"`) || appSource.includes(`path='${path}'`);

    expect(declaresRoute("/admin")).toBe(true);
    expect(declaresRoute("/admin/login")).toBe(true);
  });
});

describe("Image optimization", () => {
  test("ApplySection no longer imports the Camera icon from lucide-react", () => {
    const applySectionSource = readSource("components/ApplySection.tsx");

    const lucideImport = applySectionSource.match(
      /import\s*\{([^}]*)\}\s*from\s*["']lucide-react["']/
    );
    expect(lucideImport).not.toBeNull();
    expect(lucideImport![1]).not.toContain("Camera");
  });

  test("ApplySection no longer uses the camera emoji", () => {
    const applySectionSource = readSource("components/ApplySection.tsx");

    expect(applySectionSource).not.toContain("📸");
  });

  test("imageOptimization exposes optimizeImage(file, opts)", async () => {
    const imageOptimization = await loadModule("../src/lib/imageOptimization.ts");

    expect(typeof imageOptimization.optimizeImage).toBe("function");
  });
});

describe("Notifications", () => {
  test("notificationService exposes notifyNewApplication(application)", async () => {
    const notifications = await loadModule("../src/services/notificationService.ts");

    expect(typeof notifications.notifyNewApplication).toBe("function");
  });
});
