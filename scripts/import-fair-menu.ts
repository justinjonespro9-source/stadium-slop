/**
 * Import state fair preview menu items (2025 public sources).
 *
 * Usage:
 *   npm run import:fair-menu -- --fair=minnesota-state-fair --dry-run
 *   npm run import:fair-menu -- --fair=all --dry-run
 *   npm run ensure:fair-venues -- --dry-run
 *   npm run import:fair-menu -- --fair=iowa-state-fair --apply
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { ensureFairVenues } from "../lib/fair-import/ensure-venues";
import { getFairMenuParser, getRegisteredFairSlugs } from "../lib/fair-import/registry";
import { applyVenueMenuImport } from "../lib/venue-menu-import/apply";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public"
  })
});

function parseFairArg(argv: string[]): string[] {
  const fairArg = argv.find((a) => a.startsWith("--fair="))?.split("=")[1];
  if (!fairArg) return [];
  if (fairArg === "all") return getRegisteredFairSlugs();
  return [fairArg];
}

async function runFairImport(slug: string, dryRun: boolean, skipEnsure: boolean) {
  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`  Fair import: ${slug}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`══════════════════════════════════════════════════════\n`);

  if (!skipEnsure) {
    const venueSummary = await ensureFairVenues(prisma, {
      dryRun,
      slugs: [slug]
    });
    console.log("── Venues ───────────────────────────────────────────");
    for (const row of venueSummary.rows) {
      console.log(`  ${row.slug}: ${row.action}`);
    }
    console.log("");
  }

  const parser = await getFairMenuParser(slug);
  if (!parser) {
    console.error(`No parser for "${slug}". Available: ${getRegisteredFairSlugs().join(", ")}`);
    return { ok: false as const };
  }

  const parseResult = await parser();
  console.log(`  Source (${parseResult.sourceYear} preview): ${parseResult.sourceUrl}`);
  console.log(`  Parsed items: ${parseResult.items.length}`);
  console.log(`  Skipped in parser: ${parseResult.skippedItems.length}`);
  console.log(`  Drinks skipped (filter): ${parseResult.skippedDrinks}`);

  if (parseResult.warnings.length) {
    console.log("\n  Warnings:");
    for (const w of parseResult.warnings) {
      console.log(`    · ${w}`);
    }
  }

  if (parseResult.skippedItems.length) {
    console.log("\n  Skipped items:");
    for (const s of parseResult.skippedItems) {
      console.log(`    - ${s.name}: ${s.reason}`);
    }
  }

  if (parseResult.items.length === 0) {
    console.log("\n  No items to import — venue shell only.\n");
    return { ok: true as const, summary: null, parseResult };
  }

  let summary;
  try {
    summary = await applyVenueMenuImport(prisma, parseResult, {
      dryRun,
      assumeNewVenue: dryRun
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n  Import failed: ${message}\n`);
    return { ok: false as const, parseResult };
  }

  console.log("\n── Menu apply ───────────────────────────────────────");
  console.log(`  Would add / added: ${summary.added}`);
  console.log(`  Matched existing:  ${summary.matched}`);
  console.log(`  Duplicates:        ${summary.duplicates}`);
  console.log(`  Skipped:           ${summary.skipped}`);

  const vendors = new Set(
    summary.rows.filter((r) => r.action === "added").map((r) => r.vendorName).filter(Boolean)
  );
  if (vendors.size) {
    console.log(`  New vendors (${vendors.size}): ${[...vendors].slice(0, 8).join(", ")}${
      vendors.size > 8 ? "…" : ""
    }`);
  }

  return { ok: true as const, summary, parseResult };
}

async function main() {
  const argv = process.argv.slice(2);
  const slugs = parseFairArg(argv);
  const isApply = argv.includes("--apply");
  const dryRun = !isApply;
  const skipEnsure = argv.includes("--skip-ensure");

  if (!slugs.length) {
    console.error("Usage: npm run import:fair-menu -- --fair=<slug|all> [--dry-run|--apply]");
    console.error(`\nFair slugs: ${getRegisteredFairSlugs().join(", ")}`);
    process.exit(1);
  }

  const results = [];
  for (const slug of slugs) {
    results.push(await runFairImport(slug, dryRun, skipEnsure));
  }

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  Summary");
  console.log("══════════════════════════════════════════════════════");
  for (const r of results) {
    if (!r.ok) continue;
    const slug = r.parseResult?.venueSlug ?? "?";
    const added = r.summary?.added ?? 0;
    const parsed = r.parseResult?.items.length ?? 0;
    console.log(`  ${slug}: parsed=${parsed} added=${added}`);
  }

  if (dryRun) {
    console.log("\n  Dry run complete — no database writes. Re-run with --apply after review.\n");
  } else {
    console.log("\n  Apply complete.\n");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
