/**
 * Contract: `src/lib/applyForm.ts`
 *
 * Pure validation for the public "Become a Model" form. Required: firstName,
 * lastName, email (valid format), age (integer >= 16, matching the DB CHECK
 * `age >= 16`), height, location, and explicit consent (true). Optional:
 * instagram, about, and photo fields.
 *
 * These tests are RED until the module exists.
 */
import { test, describe, expect } from "bun:test";
import { lazyModule } from "./support.ts";

const MODULE = "../src/lib/applyForm.ts";

const loadApplyForm = lazyModule<any>(MODULE);

const COMPLETE = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  age: 21,
  height: "5'9\"",
  location: "Lagos",
  consent: true,
};

describe("applyForm / validateApplication", () => {
  test("is exported as a function", async () => {
    const { validateApplication } = await loadApplyForm();

    expect(typeof validateApplication).toBe("function");
  });

  test("rejects an empty payload and reports every required field", async () => {
    const { validateApplication } = await loadApplyForm();

    const result = validateApplication({});

    expect(result.valid).toBe(false);
    for (const field of ["firstName", "lastName", "email", "age", "height", "location", "consent"]) {
      expect(result.errors[field], `expected an error for "${field}"`).toBeTruthy();
    }
  });

  test("accepts a complete payload", async () => {
    const { validateApplication } = await loadApplyForm();

    const result = validateApplication(COMPLETE);

    expect(result.errors).toEqual({});
    expect(result.valid).toBe(true);
  });

  test("requires consent to be explicitly true", async () => {
    const { validateApplication } = await loadApplyForm();

    for (const consent of [false, undefined, null, ""]) {
      const result = validateApplication({ ...COMPLETE, consent });
      expect(result.valid, `consent=${JSON.stringify(consent)} must be invalid`).toBe(false);
      expect(result.errors.consent).toBeTruthy();
    }
  });

  test("rejects an age below 16 and accepts 16", async () => {
    const { validateApplication } = await loadApplyForm();

    expect(validateApplication({ ...COMPLETE, age: 15 }).valid).toBe(false);
    expect(validateApplication({ ...COMPLETE, age: 15 }).errors.age).toBeTruthy();

    expect(validateApplication({ ...COMPLETE, age: 16 }).valid).toBe(true);
  });

  test("rejects a malformed email", async () => {
    const { validateApplication } = await loadApplyForm();

    for (const email of ["not-an-email", "jane@", "@example.com", "jane@example", "jane doe@example.com"]) {
      const result = validateApplication({ ...COMPLETE, email });
      expect(result.valid, `email "${email}" must be invalid`).toBe(false);
      expect(result.errors.email).toBeTruthy();
    }
  });

  test("ignores blank optional fields", async () => {
    const { validateApplication } = await loadApplyForm();

    const result = validateApplication({ ...COMPLETE, instagram: "", about: "", headshot: null, additionalUrls: [] });

    expect(result.valid).toBe(true);
  });

  test("never throws on hostile input", async () => {
    const { validateApplication } = await loadApplyForm();

    expect(() => validateApplication(null)).not.toThrow();
    expect(() => validateApplication(undefined)).not.toThrow();
    expect(validateApplication(null as any).valid).toBe(false);
  });
});