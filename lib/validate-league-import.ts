/**
 * Pre-import validation for flat league CSV/JSON rows (no database access).
 */

import {
  foodItemSlugFromImport,
  vendorSlugFromImport,
  venueSlugFromImport
} from "./import-slugs";
import { parseCsvToRecords, parseLeagueImportRowsFromCsv } from "./league-import-shape";

export type ValidationSeverity = "error" | "warn";

export type LeagueImportValidationIssue = {
  row: number;
  field?: string;
  code: string;
  message: string;
  severity: ValidationSeverity;
};

export type LeagueImportReviewRow = {
  row: number;
  venue: string;
  item_name: string;
  vendor: string;
  score: number;
  reasons: string[];
};

export type LeagueImportValidationReport = {
  filePath: string;
  totalRows: number;
  importableRows: number;
  venues: string[];
  venueCount: number;
  issues: LeagueImportValidationIssue[];
  reviewRows: LeagueImportReviewRow[];
  summary: {
    missingRequiredFields: number;
    importBlockingFields: number;
    badVenueSlugs: number;
    badItemSlugs: number;
    duplicateItemKeys: number;
    missingSections: number;
    blankCategories: number;
    shortDescriptions: number;
    suspiciousParse: number;
  };
  safeToImport: boolean;
};

const REQUIRED_VALIDATE = ["league", "venue", "item_name"] as const;
const REQUIRED_IMPORT = ["team", "city", "state", "vendor"] as const;

const SHORT_DESCRIPTION_MAX = 24;

function pick(record: Record<string, string>, key: string): string {
  return (record[key] ?? "").trim();
}

function slugProblems(slug: string, label: string): string[] {
  const problems: string[] = [];
  if (!slug || slug === "unknown") {
    problems.push(`${label} slug collapsed to "${slug || "empty"}"`);
  }
  if (slug.includes("--")) {
    problems.push(`${label} slug has consecutive hyphens`);
  }
  if (/[^a-z0-9-]/.test(slug)) {
    problems.push(`${label} slug has invalid characters`);
  }
  return problems;
}

function slugTruncationWarning(slug: string, label: string, source: string): string | null {
  if (slug.length >= 78) {
    return `${label} slug is at max length (${slug.length} chars) from "${source}"`;
  }
  return null;
}

function suspiciousParseReasons(record: Record<string, string>): string[] {
  const reasons: string[] = [];
  const vendor = pick(record, "vendor");
  const item = pick(record, "item_name");
  const stand = pick(record, "stand_name");
  const section = pick(record, "section");
  const description = pick(record, "description");

  if (vendor && item && vendor === item && !section) {
    reasons.push("vendor equals item_name with no section");
  }
  if (item.length > 72) {
    reasons.push("item_name unusually long");
  }
  if (vendor.length > 64) {
    reasons.push("vendor name unusually long");
  }
  if (/partnership|value menu|pricing:|social hub|atrium|renovation/i.test(vendor)) {
    reasons.push("vendor looks like narrative hub, not a stand");
  }
  if (/^(the\s+)?(".+"\s+)?(value|fan first)/i.test(item)) {
    reasons.push("item_name looks like a menu heading");
  }
  if (description.endsWith(":") && description.length < 120) {
    reasons.push("description ends with colon (possible parent hub)");
  }
  if (/&amp;|&quot;|&#/.test(`${vendor}${item}${description}`)) {
    reasons.push("HTML entities still present");
  }
  if (/pro-tip/i.test(`${vendor}${item}${description}`)) {
    reasons.push("pro-tip language in row");
  }
  if (stand && !vendor) {
    reasons.push("stand_name without vendor");
  }
  if (!vendor) {
    reasons.push("missing vendor (import requires it)");
  }

  return reasons;
}

function reviewScore(reasons: string[], severityCount: { error: number; warn: number }): number {
  return severityCount.error * 10 + severityCount.warn * 3 + reasons.length;
}

export function validateLeagueImportCsv(
  text: string,
  filePath = "<csv>"
): LeagueImportValidationReport {
  const records = parseCsvToRecords(text);
  const importable = parseLeagueImportRowsFromCsv(text);
  const issues: LeagueImportValidationIssue[] = [];
  const reviewCandidates: LeagueImportReviewRow[] = [];

  const slugToVenueNames = new Map<string, Set<string>>();
  const itemKeyRows = new Map<string, number[]>();

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;
    const rowNum = i + 2;

    for (const field of REQUIRED_VALIDATE) {
      if (!pick(record, field)) {
        issues.push({
          row: rowNum,
          field,
          code: "missing-required",
          message: `Missing required field "${field}"`,
          severity: "error"
        });
      }
    }

    for (const field of REQUIRED_IMPORT) {
      if (!pick(record, field)) {
        issues.push({
          row: rowNum,
          field,
          code: "missing-import-field",
          message: `Missing "${field}" (required for npm run import:league)`,
          severity: "error"
        });
      }
    }

    const venue = pick(record, "venue");
    const item = pick(record, "item_name");
    const vendor = pick(record, "vendor");
    const stand = pick(record, "stand_name");
    const section = pick(record, "section");
    const category = pick(record, "category");
    const description = pick(record, "description");
    const venueSlugExplicit = pick(record, "venue_slug");

    if (!venue && !item) {
      continue;
    }

    const venueSlug = venueSlugFromImport(venue, venueSlugExplicit || undefined);
    for (const msg of slugProblems(venueSlug, "venue")) {
      issues.push({
        row: rowNum,
        field: "venue",
        code: "bad-venue-slug",
        message: `${msg} (from "${venue}")`,
        severity: "error"
      });
    }

    if (venueSlug && venue) {
      const names = slugToVenueNames.get(venueSlug) ?? new Set<string>();
      names.add(venue);
      slugToVenueNames.set(venueSlug, names);
    }

    const vendorSlug = vendorSlugFromImport(vendor || item || "unknown", stand || undefined);
    const itemSlug = foodItemSlugFromImport(item || "unknown", vendorSlug);
    for (const msg of slugProblems(itemSlug, "item")) {
      issues.push({
        row: rowNum,
        field: "item_name",
        code: "bad-item-slug",
        message: `${msg} (from "${item}")`,
        severity: "error"
      });
    }
    const truncWarn = slugTruncationWarning(itemSlug, "Item", item);
    if (truncWarn) {
      issues.push({
        row: rowNum,
        field: "item_name",
        code: "truncated-item-slug",
        message: truncWarn,
        severity: "warn"
      });
    }

    if (venueSlug && itemSlug) {
      const key = `${venueSlug}::${itemSlug}`;
      const rows = itemKeyRows.get(key) ?? [];
      rows.push(rowNum);
      itemKeyRows.set(key, rows);
    }

    if (!section) {
      issues.push({
        row: rowNum,
        field: "section",
        code: "missing-section",
        message: "Section is empty",
        severity: "warn"
      });
    }

    if (!category) {
      issues.push({
        row: rowNum,
        field: "category",
        code: "blank-category",
        message: "Category is blank",
        severity: "warn"
      });
    }

    if (description && description.length <= SHORT_DESCRIPTION_MAX) {
      issues.push({
        row: rowNum,
        field: "description",
        code: "short-description",
        message: `Description is very short (${description.length} chars)`,
        severity: "warn"
      });
    }

    const suspicious = suspiciousParseReasons(record);
    for (const reason of suspicious) {
      issues.push({
        row: rowNum,
        code: "suspicious-parse",
        message: reason,
        severity: reason.includes("import requires") ? "error" : "warn"
      });
    }

    const rowIssues = issues.filter((x) => x.row === rowNum);
    const errors = rowIssues.filter((x) => x.severity === "error").length;
    const warns = rowIssues.filter((x) => x.severity === "warn").length;
    if (suspicious.length > 0 || errors > 0 || warns >= 3) {
      reviewCandidates.push({
        row: rowNum,
        venue: venue || "—",
        item_name: item || "—",
        vendor: vendor || "—",
        score: reviewScore(suspicious, { error: errors, warn: warns }),
        reasons: [
          ...new Set([
            ...suspicious,
            ...rowIssues.map((x) => x.message)
          ])
        ].slice(0, 6)
      });
    }
  }

  for (const [slug, names] of slugToVenueNames.entries()) {
    if (names.size > 1) {
      issues.push({
        row: 0,
        field: "venue",
        code: "venue-slug-collision",
        message: `Venue slug "${slug}" used for: ${[...names].join(" | ")}`,
        severity: "error"
      });
    }
  }

  let duplicateItemKeys = 0;
  for (const [key, rows] of itemKeyRows.entries()) {
    if (rows.length > 1) {
      duplicateItemKeys += rows.length;
      issues.push({
        row: rows[0]!,
        code: "duplicate-item-key",
        message: `Duplicate venue+item slug "${key}" on rows ${rows.join(", ")}`,
        severity: "error"
      });
    }
  }

  const venues = [...new Set(records.map((r) => pick(r, "venue")).filter(Boolean))].sort();
  const errorCount = issues.filter((x) => x.severity === "error").length;

  const reviewRows = [...reviewCandidates]
    .sort((a, b) => b.score - a.score || a.row - b.row)
    .slice(0, 10);

  const summary = {
    missingRequiredFields: issues.filter((x) => x.code === "missing-required").length,
    importBlockingFields: issues.filter((x) => x.code === "missing-import-field").length,
    badVenueSlugs: issues.filter((x) => x.code === "bad-venue-slug").length,
    badItemSlugs: issues.filter((x) => x.code === "bad-item-slug").length,
    duplicateItemKeys,
    missingSections: issues.filter((x) => x.code === "missing-section").length,
    blankCategories: issues.filter((x) => x.code === "blank-category").length,
    shortDescriptions: issues.filter((x) => x.code === "short-description").length,
    suspiciousParse: issues.filter((x) => x.code === "suspicious-parse").length
  };

  return {
    filePath,
    totalRows: records.length,
    importableRows: importable.length,
    venues,
    venueCount: venues.length,
    issues,
    reviewRows,
    summary,
    safeToImport:
      errorCount === 0 &&
      records.length > 0 &&
      importable.length === records.length
  };
}

export function formatLeagueImportValidationReport(
  report: LeagueImportValidationReport
): string {
  const lines: string[] = [];
  lines.push(`League import validation — ${report.filePath}`);
  lines.push("═".repeat(60));
  lines.push(`Total rows:          ${report.totalRows}`);
  lines.push(`Importable rows:     ${report.importableRows}`);
  lines.push(`Venues:              ${report.venueCount}`);
  lines.push(`Safe to import:      ${report.safeToImport ? "YES" : "NO"}`);
  lines.push("");
  lines.push("Issue counts");
  lines.push("─".repeat(40));
  lines.push(`Missing required (league/venue/item_name): ${report.summary.missingRequiredFields}`);
  lines.push(`Missing import fields (team/city/state/vendor): ${report.summary.importBlockingFields}`);
  lines.push(`Bad venue slugs:     ${report.summary.badVenueSlugs}`);
  lines.push(`Bad item slugs:      ${report.summary.badItemSlugs}`);
  lines.push(`Duplicate item keys: ${report.summary.duplicateItemKeys}`);
  lines.push(`Missing sections:    ${report.summary.missingSections}`);
  lines.push(`Blank categories:    ${report.summary.blankCategories}`);
  lines.push(`Short descriptions:  ${report.summary.shortDescriptions}`);
  lines.push(`Suspicious parse:    ${report.summary.suspiciousParse}`);
  lines.push("");

  if (report.reviewRows.length > 0) {
    lines.push("Top rows needing review");
    lines.push("─".repeat(40));
    for (const row of report.reviewRows) {
      lines.push(
        `  Row ${row.row}: ${row.venue} · ${row.item_name} (vendor: ${row.vendor})`
      );
      for (const reason of row.reasons.slice(0, 4)) {
        lines.push(`    - ${reason}`);
      }
    }
    lines.push("");
  }

  const errors = report.issues.filter((x) => x.severity === "error");
  if (errors.length > 0 && errors.length <= 20) {
    lines.push("Errors");
    lines.push("─".repeat(40));
    for (const issue of errors) {
      lines.push(`  Row ${issue.row}: ${issue.message}`);
    }
  } else if (errors.length > 20) {
    lines.push(`Errors: ${errors.length} total (see issue counts above)`);
  }

  return lines.join("\n");
}
