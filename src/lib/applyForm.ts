/**
 * Pure validation for the public "Become a Model" form. Required: firstName,
 * lastName, email (valid format), age (integer >= 16, matching the DB CHECK
 * `age >= 16`), height, location, and explicit consent (true). Optional:
 * instagram, about, and photo fields. Never throws on hostile input.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationErrors = Record<string, string>;

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrors;
}

const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "");

/** Validates an application payload; blank optional fields are ignored. */
export function validateApplication(payload: unknown): ValidationResult {
  const errors: ValidationErrors = {};
  const data = (payload ?? {}) as Record<string, unknown>;

  if (isBlank(data.firstName)) errors.firstName = "First name is required.";
  if (isBlank(data.lastName)) errors.lastName = "Last name is required.";

  if (isBlank(data.email)) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(String(data.email).trim())) {
    errors.email = "Enter a valid email address.";
  }

  const age = Number(data.age);
  if (isBlank(data.age) || Number.isNaN(age)) {
    errors.age = "Age is required.";
  } else if (age < 16) {
    errors.age = "You must be at least 16 years old.";
  }

  if (isBlank(data.height)) errors.height = "Height is required.";
  if (isBlank(data.location)) errors.location = "Location is required.";

  if (data.consent !== true) {
    errors.consent = "You must agree to the terms and conditions.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
