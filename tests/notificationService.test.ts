/**
 * Contract: `src/services/notificationService.ts`
 *
 * Fire-and-forget email alert when a new model application lands. The service
 * hands the payload to the `notify-new-application` Edge Function via the
 * injected Supabase client; all email/webhook credentials stay server-side.
 *
 * Testability seam: `notifyNewApplication(application, client)` accepts an
 * injected Supabase client as its last argument, defaulting to the shared one.
 * Tests pass the recording stub from support.ts, so no network is involved.
 */
import { test, describe, expect } from "bun:test";
import { createSupabaseStub, seedOfflineSupabaseEnv } from "./support.ts";
import { notifyNewApplication } from "../src/services/notificationService.ts";

// Hermetic: the shared client points at an unroutable host so an implementation
// that ignores the injected stub cannot touch the deployed project.
seedOfflineSupabaseEnv();

const APPLICATION = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  age: 21,
  height: "5'9\"",
  location: "Lagos",
};

describe("notificationService / notifyNewApplication", () => {
  test("returns { ok: false, error: 'supabase not configured' } when the client is null", async () => {
    const result = await notifyNewApplication(APPLICATION, null);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("supabase not configured");
  });

  test("invokes the notify-new-application Edge Function with the application fields as body", async () => {
    const { stub, functionInvocations } = createSupabaseStub({});

    const result = await notifyNewApplication(APPLICATION, stub as any);

    expect(result.ok).toBe(true);
    expect(functionInvocations).toHaveLength(1);
    expect(functionInvocations[0].name).toBe("notify-new-application");
    expect(functionInvocations[0].body).toEqual(APPLICATION);
  });

  test("returns ok: false instead of throwing when the Edge Function call fails", async () => {
    const { stub } = createSupabaseStub({
      functionsInvoke: () => {
        throw new Error("edge function down");
      },
    });

    const result = await notifyNewApplication(APPLICATION, stub as any);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("edge function down");
  });
});
