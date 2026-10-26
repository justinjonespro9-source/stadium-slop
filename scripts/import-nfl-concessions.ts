/**
 * Import a curated NFL concessions JSON payload for one venue.
 *
 * Usage:
 *   npm run import:nfl-concessions -- --venue nissan-stadium --dry-run
 *   npm run import:nfl-concessions -- --venue nissan-stadium --file data/nfl/2026-concessions/nissan-stadium.json --apply
 *
 * Default: dry-run. Never deletes. Never writes other venues or games.
 */

import "dotenv/config";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  applyNflConcessionsImport,
  defaultNflConcessionsFile,
  parseNflConcessionsPayload,
  planNflConcessionsImport,
  qualityErrorsForPayload
} from "../lib/nfl-concessions-import";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

function argValue(argv: string[], name: string): string | undefined {
  const prefixed = argv.find((a) => a.startsWith(`${name}=`));
  if (prefixed) return prefixed.slice(name.length + 1);
  const index = argv.indexOf(name);
  if (index >= 0 && argv[index + 1] && !argv[index + 1].startsWith("--")) {
    return argv[index + 1];
  }
  return undefined;
}

async function main() {
  const argv = process.argv.slice(2);
  const venueSlug = argValue(argv, "--venue");
  const fileArg = argValue(argv, "--file");
  const apply = argv.includes("--apply");
  const dryRun = !apply;

  if (!venueSlug) {
    console.error(
      "Usage: npm run import:nfl-concessions -- --venue <slug> [--file path] [--dry-run|--apply]"
    );
    process.exit(1);
  }

  const filePath = resolve(fileArg ?? defaultNflConcessionsFile(venueSlug));
  const payload = parseNflConcessionsPayload(JSON.parse(readFileSync(filePath, "utf8")));
  const qualityErrors = qualityErrorsForPayload(payload);
  if (qualityErrors.length > 0) {
    console.error("Quality checks failed:");
    for (const error of qualityErrors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log(
    `\n  ${payload.league === "NFL" ? "NFL concessions import" : "Concessions import"}: ${venueSlug}`
  );
  console.log(`  File: ${filePath}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN (no changes)" : "APPLY"}`);
  console.log(`  Source: ${payload.source.url}\n`);

  const plan = dryRun
    ? await planNflConcessionsImport(prisma, payload, venueSlug)
    : await applyNflConcessionsImport(prisma, payload, venueSlug);

  console.log("── Before ───────────────────────────────────────────");
  console.log(`  Active vendors:   ${plan.before.activeVendors}`);
  console.log(`  Inactive vendors: ${plan.before.inactiveVendors}`);
  console.log(`  Active items:     ${plan.before.activeItems}`);
  console.log(`  Inactive items:   ${plan.before.inactiveItems}`);

  console.log("\n── Vendors ──────────────────────────────────────────");
  console.log(`  Create:     ${plan.vendors.create}`);
  console.log(`  Reactivate: ${plan.vendors.reactivate}`);
  console.log(`  Update:     ${plan.vendors.update}`);
  console.log(`  Matched:    ${plan.vendors.matched}`);

  console.log("\n── Items ────────────────────────────────────────────");
  console.log(`  Create:              ${plan.items.create}`);
  console.log(`  Reactivate:          ${plan.items.reactivate}`);
  console.log(`  Update:              ${plan.items.update}`);
  console.log(`  Matched:             ${plan.items.matched}`);
  console.log(`  Possible duplicate:  ${plan.items.possibleDuplicate}`);
  console.log(`  Stale review:        ${plan.items.staleReview}`);
  console.log(`  Skipped:             ${plan.items.skip}`);
  if (payload.applyRecommendedHides || plan.recommendedHides > 0) {
    console.log(`  Recommended hides:   ${plan.recommendedHides}`);
  }

  console.log("\n── Projected after ──────────────────────────────────");
  console.log(`  Active vendors:   ${plan.after.activeVendors}`);
  console.log(`  Inactive vendors: ${plan.after.inactiveVendors}`);
  console.log(`  Active items:     ${plan.after.activeItems}`);
  console.log(`  Inactive items:   ${plan.after.inactiveItems}`);

  if (plan.rows.length > 0) {
    console.log("\n── Rows ─────────────────────────────────────────────");
    for (const row of plan.rows) {
      const tag = row.action.toUpperCase().padEnd(11);
      const vendor = row.vendorName ? `  [${row.vendorName}]` : "";
      const reason = row.reason ? `  -- ${row.reason}` : "";
      console.log(`  ${tag} ${row.kind.padEnd(6)} ${row.name}${vendor}${reason}`);
    }
  }

  if (plan.staleReview.length > 0) {
    console.log(
      payload.applyRecommendedHides
        ? "\n── Stale review (hide only when recommendation is hide) ─"
        : "\n── Stale review (left active; not imported as updates) ─"
    );
    for (const row of plan.staleReview) {
      console.log(`  ${row.existingName}  → recommend ${row.recommendation}`);
      console.log(`    ${row.evidence}`);
    }
  }

  if (plan.possibleDuplicates.length > 0) {
    console.log("\n── Possible duplicates (manual review; no auto-merge) ─");
    for (const row of plan.possibleDuplicates) {
      console.log(`  ${row.existingName}  → ${row.recommendation}`);
      console.log(`    ${row.evidence}`);
    }
  }

  if (plan.excluded.length > 0) {
    console.log("\n── Intentionally excluded ───────────────────────────");
    for (const row of plan.excluded) {
      console.log(`  ${row.kind}: ${row.name}`);
      console.log(`    ${row.reason}`);
    }
  }

  console.log("\n─────────────────────────────────────────────────────");
  if (dryRun) {
    console.log(`  Dry run only. Re-run with --apply to write ${plan.venueName}.`);
  } else {
    console.log("  Applied. No other venues, games, or deletes were included.");
  }
  console.log("");
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
