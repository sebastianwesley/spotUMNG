import type { Application, ApplicationStatus } from "./applicationService";

export type SortField = "date" | "name" | "age" | "height";
export type SortOrder = "asc" | "desc";

/**
 * Remove diacritics for search normalization (e.g., 'José' -> 'jose').
 */
function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Filter applications by multi-word search query and status safely handling any missing fields.
 */
export function filterApplications(
  applications: Application[],
  query: string,
  status: ApplicationStatus | "all"
): Application[] {
  if (!Array.isArray(applications)) return [];

  const normalizedQuery = normalizeText(query);
  const searchTerms = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  return applications.filter((app) => {
    if (!app) return false;

    // 1. Status Filter
    if (status !== "all" && app.status !== status) {
      return false;
    }

    // 2. Query Filter (every term must match at least one haystack field)
    if (searchTerms.length === 0) {
      return true;
    }

    const haystacks = [
      normalizeText(`${app.first_name || ""} ${app.last_name || ""}`),
      normalizeText(app.email),
      normalizeText(app.location),
      normalizeText(app.instagram),
      normalizeText(app.about),
      normalizeText(app.notes),
    ];

    return searchTerms.every((term) =>
      haystacks.some((field) => field.includes(term))
    );
  });
}

/**
 * Extract height normalized to centimeters (cm) for accurate sorting across units.
 * Supports:
 * - Feet & Inches: 5'11", 5'11, 5' 11", 6', 6ft, 5.5ft
 * - Metric: 175cm, 175 cm, 175, 1.80m, 1.8 meters
 * - Inches: 70", 70 in, 70 inches
 */
export function parseHeightValue(
  heightStr: string | number | null | undefined
): number {
  if (heightStr == null) return 0;
  const cleaned = String(heightStr).trim().toLowerCase();
  if (!cleaned) return 0;

  // Reject negative heights
  if (cleaned.startsWith("-")) return 0;

  // 1. Feet and inches pattern: 5'11", 5'11, 6', 6ft, 5.5ft
  const feetInchesMatch = cleaned.match(
    /^(\d+(?:\.\d+)?)\s*(?:'|ft|feet)\s*(?:(\d+(?:\.\d+)?)\s*(?:"|in|inches)?)?\s*$/
  );
  if (feetInchesMatch) {
    const feet = parseFloat(feetInchesMatch[1]) || 0;
    const inches = feetInchesMatch[2] ? parseFloat(feetInchesMatch[2]) || 0 : 0;
    const totalInches = feet * 12 + inches;
    return totalInches * 2.54; // Convert to cm
  }

  // 2. Meters pattern: 1.80m, 1.8 m, 1.8 meters, 1.8 meter
  const metersMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*m(?:eters?)?\b/);
  if (metersMatch) {
    const m = parseFloat(metersMatch[1]) || 0;
    // Human heights in meters are between 0.5 and 3.0; values >= 3.0 (like "175m") fall through to cm
    if (m > 0 && m < 3.0) {
      return m * 100;
    }
  }

  // 3. Explicit inches pattern: 70", 70 in, 70 inches
  const inchesMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:"|in(?:ches)?(?:\b|$))/);
  if (inchesMatch) {
    return (parseFloat(inchesMatch[1]) || 0) * 2.54;
  }

  // 4. Centimeters or bare numbers: 175cm, 175
  const numericMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (numericMatch) {
    return parseFloat(numericMatch[1]) || 0;
  }

  return 0;
}

/**
 * Sort applications based on chosen field and direction.
 */
export function sortApplications(
  applications: Application[],
  field: SortField,
  order: SortOrder
): Application[] {
  if (!Array.isArray(applications)) return [];
  const sorted = [...applications];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "date": {
        const timeA = a?.created_at ? new Date(a.created_at).getTime() : NaN;
        const timeB = b?.created_at ? new Date(b.created_at).getTime() : NaN;
        const safeA = Number.isNaN(timeA) ? 0 : timeA;
        const safeB = Number.isNaN(timeB) ? 0 : timeB;
        comparison = safeA - safeB;
        break;
      }
      case "name": {
        const nameA = `${a?.first_name || ""} ${a?.last_name || ""}`.trim().toLowerCase();
        const nameB = `${b?.first_name || ""} ${b?.last_name || ""}`.trim().toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      }
      case "age": {
        const ageA = Number(a?.age) || 0;
        const ageB = Number(b?.age) || 0;
        comparison = ageA - ageB;
        break;
      }
      case "height": {
        const hA = parseHeightValue(a?.height);
        const hB = parseHeightValue(b?.height);
        comparison = hA - hB;
        break;
      }
      default:
        comparison = 0;
    }

    return order === "desc" ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Calculate count totals for each status filter prototype-pollution safely.
 */
export function getStatusCounts(
  applications: Application[]
): Record<ApplicationStatus | "all", number> {
  const counts: Record<ApplicationStatus | "all", number> = {
    all: Array.isArray(applications) ? applications.length : 0,
    new: 0,
    reviewing: 0,
    accepted: 0,
    declined: 0,
  };

  if (!Array.isArray(applications)) return counts;

  for (const app of applications) {
    if (!app || typeof app.status !== "string") continue;
    if (Object.prototype.hasOwnProperty.call(counts, app.status)) {
      counts[app.status as ApplicationStatus] += 1;
    }
  }

  return counts;
}

/**
 * Format timestamp as human-readable relative string.
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const time = date.getTime();
  if (isNaN(time)) return "—";

  const diffSeconds = Math.floor((Date.now() - time) / 1000);

  // Future timestamp guard (clock skew or scheduled data)
  if (diffSeconds < 0) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format exact localized timestamp for tooltip hover.
 */
export function formatExactTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
