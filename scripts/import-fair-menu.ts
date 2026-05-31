/**
 * Import state fair preview menu items (2025 public sources).
 *
 * Usage:
 *   npm run import:fair-menu -- --fair=minnesota-state-fair --dry-run
 *   npm run import:fair-menu -- --fair=minnesota-state-fair --source=core-catalog --dry-run
 *   npm run import:fair-menu -- --fair=all --dry-run
 *   npm run ensure:fair-venues -- --dry-run
 *   npm run import:fair-menu -- --fair=iowa-state-fair --apply
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { ensureFairVenues } from "../lib/fair-import/ensure-venues";
import {
  fairSupportsImportSource,
  getFairMenuParser,
  getRegisteredFairSlugs
} from "../lib/fair-import/registry";
import {
  parseFairImportSourceArg,
  type FairImportSource
} from "../lib/fair-import/sources";
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

async function runFairImport(
  slug: string,
  dryRun: boolean,
  skipEnsure: boolean,
  source: FairImportSource
) {
  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`  Fair import: ${slug}`);
  console.log(`  Source: ${source}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`══════════════════════════════════════════════════════\n`);

  if (!fairSupportsImportSource(slug, source)) {
    console.error(`  Source "${source}" is not supported for ${slug}.`);
    return { ok: false as const };
  }

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

  const parseResult = await parser(source);
  const label = source === "core-catalog" ? "core catalog" : `${parseResult.sourceYear} preview`;
  console.log(`  Source (${label}): ${parseResult.sourceUrl}`);
  console.log(`  Parsed items: ${parseResult.items.length}`);
  console.log(`  Skipped in parser: ${parseResult.skippedItems.length}`);
  console.log(`  Drinks skipped (filter): ${parseResult.skippedDrinks}`);

  const ambiguous = parseResult.skippedItems.filter((s) =>
    s.reason.toLowerCase().includes("ambiguous")
  );
  const skippedGeneric = parseResult.skippedItems.filter(
    (s) => !s.reason.toLowerCase().includes("ambiguous")
  );

  const qualityWarnings = parseResult.warnings.filter((w) => w.startsWith("Quality pass:"));
  const otherWarnings = parseResult.warnings.filter(
    (w) =>
      !w.startsWith("Quality pass:") &&
      !w.startsWith("Iconic kept") &&
      !w.startsWith("Generic skipped") &&
      !w.startsWith("Ambiguous (sample)")
  );
  const qualitySamples = parseResult.warnings.filter(
    (w) => w.startsWith("Iconic kept") || w.startsWith("Generic skipped") || w.startsWith("Ambiguous (sample)")
  );

  if (qualityWarnings.length) {
    console.log("\n  Quality pass:");
    for (const w of qualityWarnings) {
      console.log(`    · ${w.replace(/^Quality pass: /, "")}`);
    }
    for (const w of qualitySamples) {
      console.log(`    · ${w}`);
    }
  }

  if (otherWarnings.length) {
    console.log("\n  Warnings:");
    for (const w of otherWarnings) {
      console.log(`    · ${w}`);
    }
  }

  if (skippedGeneric.length) {
    console.log("\n  Skipped items:");
    for (const s of skippedGeneric.slice(0, 40)) {
      console.log(`    - ${s.name}: ${s.reason}`);
    }
    if (skippedGeneric.length > 40) {
      console.log(`    … and ${skippedGeneric.length - 40} more`);
    }
  }

  if (ambiguous.length) {
    console.log("\n  Skipped ambiguous:");
    for (const s of ambiguous.slice(0, 20)) {
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

  const addedVendors = new Set(
    summary.rows.filter((r) => r.action === "added").map((r) => r.vendorName).filter(Boolean)
  );
  const matchedVendors = new Set(
    summary.rows
      .filter((r) => r.action === "matched" || r.action === "added")
      .map((r) => r.vendorName)
      .filter(Boolean)
  );
  console.log(`  Vendors touched:     ${matchedVendors.size}`);
  if (addedVendors.size) {
    console.log(`  New vendors (${addedVendors.size}): ${[...addedVendors].slice(0, 8).join(", ")}${
      addedVendors.size > 8 ? "…" : ""
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
  const source = parseFairImportSourceArg(argv);

  if (!slugs.length) {
    console.error(
      "Usage: npm run import:fair-menu -- --fair=<slug|all> [--source=preview|core-catalog] [--dry-run|--apply]"
    );
    console.error(`\nFair slugs: ${getRegisteredFairSlugs().join(", ")}`);
    process.exit(1);
  }

  const results = [];
  for (const slug of slugs) {
    results.push(await runFairImport(slug, dryRun, skipEnsure, source));
  }

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  Summary");
  console.log("══════════════════════════════════════════════════════");
  for (const r of results) {
    if (!r.ok) continue;
    const slug = r.parseResult?.venueSlug ?? "?";
    const added = r.summary?.added ?? 0;
    const parsed = r.parseResult?.items.length ?? 0;
    const matched = r.summary?.matched ?? 0;
    console.log(`  ${slug}: parsed=${parsed} matched=${matched} added=${added}`);
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
