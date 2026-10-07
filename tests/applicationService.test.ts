/**
 * Contract: `src/lib/applicationService.ts`
 *
 * Drives the deployed backend contract (table `model_applications`, private
 * bucket `applicant-photos`, admin JWT claim `app_metadata.admin === true`).
 *
 * Testability seam: every exported service accepts an injected Supabase client
 * as its last argument (`client`, defaulting to the shared client). Tests pass a
 * recording fake, so no network/DOM is involved and no external collaborator is
 * mocked away.
 *
 * These tests are RED until the module exists.
 */
import { test, describe, expect } from "bun:test";
import { createSupabaseStub, lazyModule, makeFile, seedOfflineSupabaseEnv } from "./support.ts";

const MODULE = "../src/lib/applicationService.ts";

// Hermetic: the shared client points at an unroutable host so an implementation
// that ignores the injected stub cannot touch the deployed project.
seedOfflineSupabaseEnv();

/** Returns the service module; every test awaits it so each fails on its own. */
const loadService = lazyModule<any>(MODULE);

const VALID_PAYLOAD = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  age: 21,
  height: "5'9\"",
  location: "Lagos",
  instagram: "@janedoe",
  about: "Aspiring runway model.",
  consent: true,
};

const PHOTO_PAYLOAD = {
  ...VALID_PAYLOAD,
  headshotUrl: "applications/headshot-1.jpg",
  fullbodyUrl: "applications/fullbody-1.jpg",
  profileUrl: "applications/profile-1.jpg",
  additionalUrls: ["applications/extra-1.jpg"],
};

const ADMIN_ID = "4f1d2c3b-0000-0000-0000-000000000000";

const callIndex = (calls: Array<{ method: string }>, method: string) =>
  calls.findIndex((call) => call.method === method);

describe("applicationService / exported surface", () => {
  test("exposes the applicant + admin operations", async () => {
    const service = await loadService();
    const expected = [
      "submitApplication",
      "uploadApplicantPhoto",
      "listApplications",
      "updateApplicationStatus",
      "signInAdmin",
      "signOutAdmin",
      "getAdminSession",
      "changeAdminPassword",
    ];
    const missing = expected.filter((name) => typeof (service as any)?.[name] !== "function");
    expect(missing, "expected exported functions").toEqual([]);
  });
});

describe("applicationService / submitApplication", () => {
  test("returns a null id and a null error on a successful anonymous insert", async () => {
    const service = await loadService();
    const { stub } = createSupabaseStub({});

    const result = await service.submitApplication(VALID_PAYLOAD, stub);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: null });
  });

  test("maps camelCase input to snake_case columns and omits blank optional values", async () => {
    const service = await loadService();
    const { stub, inserts, calls } = createSupabaseStub({});

    await service.submitApplication(
      {
        ...PHOTO_PAYLOAD,
        fullbodyUrl: "",
        instagram: "",
        additionalUrls: [],
      } as any,
      stub
    );

    expect(stub.lastTable).toBe("model_applications");
    expect(inserts).toHaveLength(1);

    const payload = inserts[0];
    // No form-style camelCase key may leak into the database payload.
    expect(Object.keys(payload).filter((key) => /[A-Z]/.test(key))).toEqual([]);

    expect(payload.first_name).toBe("Jane");
    expect(payload.last_name).toBe("Doe");
    expect(payload.email).toBe("jane@example.com");
    expect(Number(payload.age)).toBe(21);
    expect(payload.height).toBe("5'9\"");
    expect(payload.location).toBe("Lagos");
    expect(payload.headshot_url).toBe("applications/headshot-1.jpg");
    expect(payload.profile_url).toBe("applications/profile-1.jpg");

    // Blank inputs must be omitted rather than stored as empty strings/arrays.
    expect(payload).not.toHaveProperty("fullbody_url");
    expect(payload).not.toHaveProperty("instagram");
    expect(payload).not.toHaveProperty("additional_urls");

    // The anon role may INSERT but not read rows back, so the insert must be
    // sent with Prefer: return=minimal.
    const insertIndex = callIndex(calls, "insert");
    expect(insertIndex).toBeGreaterThanOrEqual(0);
    const selectIndex = calls.findIndex((call, index) => index > insertIndex && call.method === "select");
    expect(selectIndex, "insert must not chain .select() (return=representation)").toBe(-1);
  });

  test("returns the error instead of throwing when the insert is rejected by RLS/setup", async () => {
    const service = await loadService();
    // Mirrors the code PostgREST returns when the anon role cannot insert.
    const failure = { code: "42501", message: "permission denied for table model_applications" };
    const { stub } = createSupabaseStub({ insertError: failure });

    const result = await service.submitApplication(VALID_PAYLOAD, stub);

    // The failure must surface as a value, not as a rejection.
    expect(result.error).toBeDefined();
    const detail = result.error?.message || result.error?.code || "";
    expect(typeof detail).toBe("string");
    expect(detail.length, "the error must carry a reason, not an empty placeholder").toBeGreaterThan(0);
    expect(result.data == null || result.data.id == null).toBe(true);
  });

  test("returns the error instead of throwing when the client is missing/unconfigured", async () => {
    const service = await loadService();
    const net = (globalThis as any).fetch?.bind?.(globalThis);
    let fetchCalls = 0;
    if (net) {
      (globalThis as any).fetch = (...args: unknown[]) => {
        fetchCalls += 1;
        return net(...args);
      };
    }

    try {
      const result = await service.submitApplication(VALID_PAYLOAD, null);
      expect(result.error).toBeDefined();
      expect(typeof result.error.message).toBe("string");
      expect(fetchCalls, "an unconfigured client must not attempt a network request").toBe(0);
    } finally {
      if (net) (globalThis as any).fetch = net;
    }
  });
});

describe("applicationService / uploadApplicantPhoto", () => {
  test("uploads into applicant-photos/applications/ and returns the storage path, not a public URL", async () => {
    const service = await loadService();
    const { stub, uploads, publicUrlCalls, calls } = createSupabaseStub({});
    const file = makeFile("portrait.JPG", "image/jpeg");

    const result = await service.uploadApplicantPhoto(file, "headshot", stub);

    expect(calls.find((call) => call.method === "storage.from")?.args[0]).toBe("applicant-photos");
    expect(uploads).toHaveLength(1);

    const path = uploads[0].path;
    expect(typeof path).toBe("string");
    expect(path.startsWith("applications/")).toBe(true);
    expect(path.length).toBeGreaterThan("applications/".length);
    expect(path.endsWith(".JPG") || path.endsWith(".jpg")).toBe(true);
    expect(path.includes("headshot")).toBe(true);

    // The bucket is private: the caller must store the path, never a public URL.
    expect(typeof result).toBe("string");
    expect(result).toBe(path);
    expect(result).not.toContain("http");
    expect(result).not.toContain("/object/public/");
    expect(publicUrlCalls).toHaveLength(0);
  });

  test("generates a unique object path per upload of the same file", async () => {
    const service = await loadService();
    const file = makeFile("portrait.jpg");

    const { stub, uploads } = createSupabaseStub({});
    await service.uploadApplicantPhoto(file, "headshot", stub);
    await service.uploadApplicantPhoto(file, "headshot", stub);

    expect(uploads).toHaveLength(2);
    expect(uploads[0].path).not.toBe(uploads[1].path);
  });
});

describe("applicationService / deleteApplicantPhotos", () => {
  test("removes the given paths from the applicant-photos bucket", async () => {
    const service = await loadService();
    const { stub, calls } = createSupabaseStub({});
    const paths = ["applications/headshot-1.jpg", "applications/fullbody-2.jpg"];

    await service.deleteApplicantPhotos(paths, stub);

    expect(stub.lastBucket).toBe("applicant-photos");
    const remove = calls.find((call) => call.method === "storage.remove");
    expect((remove as any)?.args[0]).toEqual(paths);
  });

  test("never throws — swallows storage failures and empty path lists", async () => {
    const service = await loadService();
    const { stub } = createSupabaseStub({ removeError: { message: "storage down" } });

    await expect(service.deleteApplicantPhotos(["applications/x.jpg"], stub)).resolves.toBeUndefined();
    await expect(service.deleteApplicantPhotos([], stub)).resolves.toBeUndefined();
    await expect(service.deleteApplicantPhotos([], null)).resolves.toBeUndefined();
  });
});

describe("applicationService / listApplications (admin-only)", () => {
  test("selects from model_applications ordered by created_at descending", async () => {
    const service = await loadService();
    const rows = [
      { id: ADMIN_ID, status: "new", created_at: "2026-10-07T00:00:00Z" },
      { id: "5f1d2c3b-0000-0000-0000-000000000000", status: "reviewing", created_at: "2026-10-06T00:00:00Z" },
    ];
    const { stub, calls } = createSupabaseStub({ selectRows: rows });

    const { data } = await service.listApplications(stub);

    expect(stub.lastTable).toBe("model_applications");

    const order = calls.find((call) => call.method === "order");
    expect(order?.args[0]).toBe("created_at");
    expect((order?.args[1] as { ascending?: boolean } | undefined)?.ascending).toBe(false);

    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe(ADMIN_ID);
  });

  test("returns { data: [], error } instead of an empty list when the query fails", async () => {
    const service = await loadService();
    // Mirrors the code PostgREST returns when the admin role cannot read rows.
    const failure = { code: "42501", message: "permission denied for table model_applications" };
    const { stub } = createSupabaseStub({ selectError: failure });

    const result = await service.listApplications(stub);

    expect(result.data).toEqual([]);
    expect(result.error?.message).toBe("permission denied for table model_applications");
  });
});

describe("applicationService / updateApplicationStatus", () => {
  test("patches status (and notes) for a single application id", async () => {
    const service = await loadService();
    const { stub, updates, calls } = createSupabaseStub({});

    await service.updateApplicationStatus(ADMIN_ID, "reviewing", "Looks promising", stub);

    expect(stub.lastTable).toBe("model_applications");
    expect(updates).toHaveLength(1);
    expect(updates[0].status).toBe("reviewing");
    expect(updates[0].notes).toBe("Looks promising");

    const eq = calls.find((call) => call.method === "eq");
    expect(eq?.args[0]).toBe("id");
    expect(eq?.args[1]).toBe(ADMIN_ID);
  });

  test("rejects status values outside new|reviewing|accepted|declined without touching the database", async () => {
    const service = await loadService();
    const { stub, updates } = createSupabaseStub({});

    for (const invalid of ["", "pending", "approved", "ACCEPTED", "archived"]) {
      await expect(service.updateApplicationStatus(ADMIN_ID, invalid, undefined, stub)).rejects.toThrow();
    }

    expect(updates).toHaveLength(0);
  });
});

describe("applicationService / signInAdmin", () => {
  test("returns { user, session, error: null } for an admin JWT claim", async () => {
    const service = await loadService();
    const { stub } = createSupabaseStub({});

    const result = await service.signInAdmin("spotlightmng@outlook.com", "SpotlightAdmin2026!", stub);

    expect(result.error).toBeNull();
    expect(result.session).toBeTruthy();
    expect(result.user?.app_metadata?.admin).toBe(true);
  });

  test("rejects a signed-in user whose token has no admin claim and signs them out", async () => {
    const service = await loadService();
    const { stub, authCalls } = createSupabaseStub({
      signInUser: { id: "regular-user", email: "someone@example.com", app_metadata: {} },
      signInSession: { access_token: "regular-token" },
      // Whichever admin probe the implementation uses (rpc("is_admin") or an
      // admin-only select) must come back permission-denied for this token.
      probeError: { code: "42501", message: "permission denied for table model_applications" },
      selectError: { code: "42501", message: "permission denied for table model_applications" },
    });

    const result = await service.signInAdmin("someone@example.com", "hunter2", stub);

    // Observable outcome: no session is handed out, the caller is told why, and
    // the rejected session does not linger in the client.
    expect(result.error).toBeDefined();
    expect(typeof result.error.message).toBe("string");
    expect(result.session == null).toBe(true);
    expect(result.user == null).toBe(true);
    expect(authCalls).toContain("signOut");
  });

  test("returns the auth error instead of throwing for invalid credentials", async () => {
    const service = await loadService();
    const { stub } = createSupabaseStub({
      // Mirrors the shape supabase-js raises for a bad password: `message === code`.
      signInError: {
        name: "AuthApiError",
        status: 400,
        code: "invalid_credentials",
        message: "invalid_credentials",
      },
    });

    const result = await service.signInAdmin("spotlightmng@outlook.com", "wrong-password", stub);

    expect(result.error).toBeDefined();
    expect(typeof result.error.message).toBe("string");
    expect(result.error.message.length).toBeGreaterThan(0);
    expect(result.session == null).toBe(true);
  });
});

describe("applicationService / session + password", () => {
  // FIX 1 spec update: getAdminSession is now admin-claim gated (app_metadata
  // .admin === true), matching signInAdmin and the AdminGuard/AdminLogin flow.
  test("getAdminSession returns the current session only when the user carries the admin claim", async () => {
    const service = await loadService();
    const { stub } = createSupabaseStub({});

    const result = await service.getAdminSession(stub);

    expect(result.session).toBeTruthy();
    expect(result.session.user?.email).toBe("spotlightmng@outlook.com");
    expect(result.session.user?.app_metadata?.admin).toBe(true);
    expect(result.error).toBeNull();
  });

  test("getAdminSession returns a null session for a user without the admin claim", async () => {
    const service = await loadService();
    const { stub } = createSupabaseStub({
      sessionUser: { id: "regular-user", email: "someone@example.com", app_metadata: {} },
    });

    const result = await service.getAdminSession(stub);

    expect(result.session).toBeNull();
    expect(result.error).toBeNull();
  });

  test("changeAdminPassword sends the new password through auth.updateUser", async () => {
    const service = await loadService();
    const { stub, authCalls, calls } = createSupabaseStub({});

    await service.changeAdminPassword("BrandNewPassw0rd!", stub);

    const update = calls.find((call) => call.method === "updateUser");
    expect(update, "expected auth.updateUser to be called").toBeDefined();
    expect((update as any).args[0]).toMatchObject({ password: "BrandNewPassw0rd!" });
    expect(authCalls).toContain("updateUser");
  });

  test("signOutAdmin clears the session", async () => {
    const service = await loadService();
    const { stub, authCalls } = createSupabaseStub({});

    await service.signOutAdmin(stub);

    expect(authCalls).toContain("signOut");
  });
});