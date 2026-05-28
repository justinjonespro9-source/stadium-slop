/**
 * Audit (and optionally hide) likely test reviews, photos, and scorecards.
 *
 * Dry run (default) — lists candidates, does not mutate data:
 *   npm run cleanup:test-reviews -- --dry-run
 *
 * Apply — marks strong-flagged rows as test + HIDDEN (no deletes):
 *   npm run cleanup:test-reviews -- --apply
 *   npm run cleanup:test-reviews -- --apply --ids=review-id-1,review-id-2
 *
 * By default, --apply only touches rows with strong auto-apply flags
 * (dev seeds, demo users, test keywords, picsum URLs, etc.).
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  applyTestReviewCleanup,
  auditLikelyTestReviews,
  type AuditedTestReviewRow
} from "../lib/audit-test-reviews";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const jsonOut = process.argv.includes("--json");

const idsArg = process.argv.find((arg) => arg.startsWith("--ids="));
const explicitIds = idsArg
  ? idsArg
      .slice("--ids=".length)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  : null;

function formatRow(row: AuditedTestReviewRow): Record<string, unknown> {
  return {
    reviewId: row.reviewId,
    foodItem: row.foodItem,
    venue: row.venue,
    photoUrls: row.photoUrls.length > 0 ? row.photoUrls : ["—"],
    reviewer: row.reviewerDisplay,
    reviewerEmail: row.reviewerEmail ?? "—",
    note: row.note?.trim() || "—",
    createdAt: row.createdAt.toISOString(),
    status: row.status,
    isTestReview: row.isTestReview,
    flags: row.flags,
    autoApply: row.autoApply
  };
}

function printTable(rows: AuditedTestReviewRow[]) {
  if (rows.length === 0) {
    console.log("No matching reviews.");
    return;
  }

  for (const row of rows) {
    console.log("—".repeat(72));
    console.log(`Review ID:  ${row.reviewId}`);
    console.log(`Food:       ${row.foodItem} (${row.venueSlug}/${row.foodSlug})`);
    console.log(`Venue:      ${row.venue}`);
    console.log(
      `Photo URL:  ${row.photoUrls.length > 0 ? row.photoUrls.join("\n            ") : "—"}`
    );
    console.log(`Reviewer:   ${row.reviewerDisplay}`);
    console.log(`Email:      ${row.reviewerEmail ?? "—"}`);
    console.log(`Note:       ${row.note?.trim() || "—"}`);
    console.log(`Created:    ${row.createdAt.toISOString()}`);
    console.log(`Status:     ${row.status} · isTestReview=${row.isTestReview}`);
    console.log(`Flags:      ${row.flags.join(", ") || "—"}`);
    console.log(`Auto-apply: ${row.autoApply ? "yes" : "no (review manually)"}`);
  }
  console.log("—".repeat(72));
}

async function main() {
  const audit = await auditLikelyTestReviews(prisma);

  console.log(
    dryRun ? "DRY RUN — test review audit\n" : "APPLY — hide/mark test reviews\n"
  );
  console.log(`Total reviews scanned:     ${audit.rows.length}`);
  console.log(`Flagged (any signal):      ${audit.flagged.length}`);
  console.log(`Strong auto-apply flags:   ${audit.autoApplyCandidates.length}`);
  console.log(`Already test/hidden:       ${audit.alreadyExcluded}`);

  const listRows = audit.flagged;

  if (jsonOut) {
    console.log(JSON.stringify(listRows.map(formatRow), null, 2));
  } else {
    console.log("\nFlagged reviews:\n");
    printTable(listRows);
  }

  if (dryRun) {
    const weakOnly = audit.flagged.filter((r) => !r.autoApply);
    if (weakOnly.length > 0) {
      console.log(
        `\n${weakOnly.length} review(s) flagged with weak signals only (e.g. shoe/non-food text) — not auto-applied.`
      );
    }
    console.log(
      `\n${audit.autoApplyCandidates.length} review(s) eligible for --apply (mark isTestReview + HIDDEN).`
    );
    console.log("Run: npm run cleanup:test-reviews -- --apply");
    return;
  }

  const targetIds =
    explicitIds ?? audit.autoApplyCandidates.map((row) => row.reviewId);

  if (targetIds.length === 0) {
    console.log("\nNothing to apply.");
    return;
  }

  const result = await applyTestReviewCleanup(prisma, targetIds);
  console.log("\nApply results:");
  console.log(`  Reviews marked test + hidden: ${result.reviewsMarkedTest}`);
  console.log(`  Photos hidden:              ${result.photosHidden}`);
  if (result.skippedNotFlagged > 0) {
    console.log(
      `  Skipped (not auto-apply eligible): ${result.skippedNotFlagged}`
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
