import { describe, expect, it } from "bun:test";
import {
  filterApplications,
  formatExactTime,
  formatRelativeTime,
  getStatusCounts,
  parseHeightValue,
  sortApplications,
} from "../src/lib/adminFilters";
import type { Application } from "../src/lib/applicationService";

const mockApplications: Application[] = [
  {
    id: "app-1",
    first_name: "Bella",
    last_name: "Hadid",
    email: "bella@models.com",
    age: 27,
    height: "5'9\"",
    location: "New York",
    instagram: "@bellahadid",
    about: "High fashion runway model",
    headshot_url: "applications/headshot-1.jpg",
    fullbody_url: "applications/fullbody-1.jpg",
    profile_url: null,
    additional_urls: null,
    status: "new",
    notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-2",
    first_name: "Adut",
    last_name: "Akech",
    email: "adut@vogue.com",
    age: 24,
    height: "6'",
    location: "London",
    instagram: "@adutakech",
    about: "Editorial specialist in London",
    headshot_url: "applications/headshot-2.jpg",
    fullbody_url: null,
    profile_url: null,
    additional_urls: null,
    status: "reviewing",
    notes: "Review for Milan casting",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-3",
    first_name: "Gigi",
    last_name: "Hadid",
    email: "gigi@agency.com",
    age: 29,
    height: "175cm",
    location: "Los Angeles",
    instagram: "@gigihadid",
    about: "Commercial and campaign talent",
    headshot_url: null,
    fullbody_url: null,
    profile_url: null,
    additional_urls: null,
    status: "accepted",
    notes: "Accepted into main board",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-4",
    first_name: "Kendall",
    last_name: "Jenner",
    email: "kendall@calabasas.com",
    age: 28,
    height: "5'10.5\"",
    location: "Los Angeles",
    instagram: null,
    about: null,
    headshot_url: null,
    fullbody_url: null,
    profile_url: null,
    additional_urls: null,
    status: "declined",
    notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updated_at: new Date().toISOString(),
  },
];

describe("adminFilters - filterApplications", () => {
  it("returns all items when query is empty and status is 'all'", () => {
    const result = filterApplications(mockApplications, "", "all");
    expect(result.length).toBe(4);
  });

  it("filters correctly by status", () => {
    const resultNew = filterApplications(mockApplications, "", "new");
    expect(resultNew.length).toBe(1);
    expect(resultNew[0].first_name).toBe("Bella");

    const resultReviewing = filterApplications(mockApplications, "", "reviewing");
    expect(resultReviewing.length).toBe(1);
    expect(resultReviewing[0].first_name).toBe("Adut");
  });

  it("supports multi-word search matching across name and location", () => {
    const result = filterApplications(mockApplications, "Adut London", "all");
    expect(result.length).toBe(1);
    expect(result[0].first_name).toBe("Adut");
  });

  it("supports diacritics normalization", () => {
    const appWithDiacritic: Application = {
      ...mockApplications[0],
      first_name: "José",
    };
    const result = filterApplications([appWithDiacritic], "jose", "all");
    expect(result.length).toBe(1);
  });

  it("handles null or invalid applications array gracefully", () => {
    expect(filterApplications(null as any, "test", "all")).toEqual([]);
    expect(filterApplications(undefined as any, "test", "all")).toEqual([]);
  });

  it("does not crash on sparse applications with null or undefined fields", () => {
    const sparseApp: Application = {
      id: "sparse-1",
      first_name: "",
      last_name: "",
      email: "",
      age: 20,
      height: "",
      location: "",
      instagram: null,
      about: null,
      headshot_url: null,
      fullbody_url: null,
      profile_url: null,
      additional_urls: null,
      status: "new",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(() => filterApplications([sparseApp], "test", "all")).not.toThrow();
  });
});

describe("adminFilters - parseHeightValue", () => {
  it("parses whole feet correctly without dropping inches", () => {
    const heightCm = parseHeightValue("6'");
    expect(heightCm).toBeCloseTo(182.88, 1);
  });

  it("parses decimal feet (e.g., 5.5ft)", () => {
    const heightCm = parseHeightValue("5.5ft");
    expect(heightCm).toBeCloseTo(167.64, 1);
  });

  it("parses meters variations (1.80m, 1.8 meters)", () => {
    expect(parseHeightValue("1.80m")).toBeCloseTo(180, 1);
    expect(parseHeightValue("1.8 meters")).toBeCloseTo(180, 1);
  });

  it("parses explicit inches (e.g., 70 in, 70\")", () => {
    expect(parseHeightValue('70"')).toBeCloseTo(177.8, 1);
    expect(parseHeightValue("70 in")).toBeCloseTo(177.8, 1);
  });

  it("parses bare numbers and null/undefined safely", () => {
    expect(parseHeightValue("175")).toBe(175);
    expect(parseHeightValue(null)).toBe(0);
    expect(parseHeightValue(undefined)).toBe(0);
    expect(parseHeightValue(180)).toBe(180);
  });

  it("rejects negative heights safely", () => {
    expect(parseHeightValue("-5'11\"")).toBe(0);
    expect(parseHeightValue("-175")).toBe(0);
  });

  it("handles curly quotes in imperial height notation", () => {
    expect(parseHeightValue("5’11”")).toBeCloseTo(180.34, 1);
    expect(parseHeightValue("6’")).toBeCloseTo(182.88, 1);
  });

  it("handles implausible meter values by falling through to centimeters", () => {
    // "175m" is a typo for 175cm; should not parse as 17500cm
    expect(parseHeightValue("175m")).toBe(175);
    // Plausible meter value
    expect(parseHeightValue("1.80m")).toBe(180);
  });

  it("normalizes mixed units so 175cm sorts before 5'11\" and 6'", () => {
    const cm175 = parseHeightValue("175cm");
    const ft511 = parseHeightValue("5'11\"");
    const ft6 = parseHeightValue("6'");

    expect(cm175).toBeLessThan(ft511);
    expect(ft511).toBeLessThan(ft6);
  });
});

describe("adminFilters - sortApplications", () => {
  it("sorts by date descending (newest first)", () => {
    const result = sortApplications(mockApplications, "date", "desc");
    expect(result.map((a) => a.first_name)).toEqual(["Bella", "Adut", "Gigi", "Kendall"]);
  });

  it("handles null or NaN created_at safely when sorting by date", () => {
    const appBadDate: Application = {
      ...mockApplications[0],
      created_at: "invalid-date",
    };
    expect(() => sortApplications([appBadDate, mockApplications[1]], "date", "desc")).not.toThrow();
  });

  it("sorts by name ascending (A-Z)", () => {
    const result = sortApplications(mockApplications, "name", "asc");
    expect(result.map((a) => a.first_name)).toEqual(["Adut", "Bella", "Gigi", "Kendall"]);
  });

  it("sorts by height ascending with unified metric conversion", () => {
    const result = sortApplications(mockApplications, "height", "asc");
    expect(result.map((a) => a.first_name)).toEqual(["Gigi", "Bella", "Kendall", "Adut"]);
  });
});

describe("adminFilters - getStatusCounts", () => {
  it("computes accurate counts for all and individual statuses", () => {
    const counts = getStatusCounts(mockApplications);
    expect(counts.all).toBe(4);
    expect(counts.new).toBe(1);
    expect(counts.reviewing).toBe(1);
    expect(counts.accepted).toBe(1);
    expect(counts.declined).toBe(1);
  });

  it("is safe against prototype pollution status keys", () => {
    const pollutedApp = {
      ...mockApplications[0],
      status: "__proto__" as any,
    };
    const counts = getStatusCounts([pollutedApp]);
    expect(counts.all).toBe(1);
    expect(counts.new).toBe(0);
  });
});

describe("adminFilters - formatRelativeTime & formatExactTime", () => {
  it("formats very recent timestamps as 'Just now'", () => {
    const nowIso = new Date().toISOString();
    expect(formatRelativeTime(nowIso)).toBe("Just now");
  });

  it("formats future dates with localized date instead of clamping to Just now", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
    expect(formatRelativeTime(futureDate)).not.toBe("Just now");
  });

  it("handles invalid dates gracefully", () => {
    expect(formatRelativeTime("invalid-date")).toBe("—");
    expect(formatExactTime("invalid-date")).toBe("invalid-date");
  });
});
