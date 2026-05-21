/**
 * Import MLS/NWSL venues, teams, vendors, and items from SS_MLS_NWSL_VENUE_ITEMS.docx.
 *
 * Usage:
 *   npm run import:mls-nwsl
 *   npm run import:mls-nwsl -- --dry-run
 *   npm run import:mls-nwsl -- /path/to/SS_MLS_NWSL_VENUE_ITEMS.docx
 *   npm run import:mls-nwsl -- --dry-run /path/to/doc.docx
 *
 * Merges into existing NFL/MLB shared stadiums (no duplicate venues).
 */
import "dotenv/config";
import { existsSync } from "fs";
import { homedir } from "os";
import { join, resolve } from "path";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyMlsNwslImport } from "../lib/apply-mls-nwsl-import";
import { parseMlsNwslDocx } from "../lib/mls-nwsl-docx-parser";
import { MLS_NWSL_VENUE_SLUG_ALIASES } from "../lib/mls-nwsl-venue-registry";

const DEFAULT_DOCX = join(homedir(), "Documents", "SS_MLS_NWSL_VENUE_ITEMS.docx");

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

type VenueCounts = { slug: string; items: number; vendors: number };

async function mlsNwslVenueCounts(): Promise<VenueCounts[]> {
  const venues = await prisma.venue.findMany({
    where: { OR: [{ leagues: { has: "MLS" } }, { leagues: { has: "NWSL" } }] },
    orderBy: { slug: "asc" },
    select: {
      slug: true,
      _count: { select: { items: true, vendors: true } }
    }
  });
  return venues.map((v) => ({
    slug: v.slug,
    items: v._count.items,
    vendors: v._count.vendors
  }));
}

function printVenueAudit(label: string, counts: VenueCounts[]) {
  const zero = counts.filter((v) => v.items === 0);
  const few = counts.filter((v) => v.items > 0 && v.items < 3);
  console.log(`${label}: ${counts.length} venues, ${zero.length} with 0 items, ${few.length} with 1–2 items`);
  for (const v of zero) {
    console.log(`  · 0 items: ${v.slug}`);
  }
  for (const v of few) {
    console.log(`  · ${v.items} items: ${v.slug}`);
  }
}

function parseArgs(argv: string[]): { dryRun: boolean; docxPath: string } {
  const flags = argv.filter((a) => a.startsWith("--"));
  const paths = argv.filter((a) => !a.startsWith("--"));
  const dryRun = flags.includes("--dry-run");
  const docxPath = resolve(paths[0] ?? DEFAULT_DOCX);
  return { dryRun, docxPath };
}

async function main() {
  const { dryRun, docxPath } = parseArgs(process.argv.slice(2));

  if (!existsSync(docxPath)) {
    console.error(`DOCX not found: ${docxPath}`);
    process.exit(1);
  }

  const before = await mlsNwslVenueCounts();
  printVenueAudit("Before import", before);

  console.log(`\nParsing ${docxPath}…`);
  const parsed = parseMlsNwslDocx(docxPath);

  const parsedByVenue = new Map<string, number>();
  for (const row of parsed.rows) {
    parsedByVenue.set(row.venue_slug, (parsedByVenue.get(row.venue_slug) ?? 0) + 1);
  }

  console.log(
    `Parsed ${parsed.rows.length} item rows across ${parsed.venueBlocks.length} venue blocks (${parsedByVenue.size} venue slugs)`
  );

  if (parsed.skippedLines.length > 0) {
    console.log(`Parser skipped ${parsed.skippedLines.length} non-item lines (sample):`);
    for (const line of parsed.skippedLines.slice(0, 8)) {
      console.log(`  · ${line}`);
    }
    if (parsed.skippedLines.length > 8) {
      console.log(`  … and ${parsed.skippedLines.length - 8} more`);
    }
  }

  console.log("\nParsed rows per venue (target 5–10 where doc is rich):");
  for (const [slug, n] of [...parsedByVenue.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const flag = n < 5 ? " (sparse)" : "";
    console.log(`  · ${slug}: ${n}${flag}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: no database writes.");
    const wouldTouch = new Set(
      parsed.rows.map((r) => r.venue_slug).concat(
        parsed.venueBlocks.flatMap((b) => b.venueSlugs.map((s) => MLS_NWSL_VENUE_SLUG_ALIASES[s] ?? s))
      )
    );
    console.log(`Would touch ${wouldTouch.size} venue slugs.`);
    return;
  }

  const stats = await applyMlsNwslImport(prisma, parsed);

  const after = await mlsNwslVenueCounts();
  printVenueAudit("\nAfter import", after);

  console.log("\nVenue item counts (before → after):");
  const beforeMap = new Map(before.map((v) => [v.slug, v.items]));
  const allSlugs = new Set([...beforeMap.keys(), ...after.map((v) => v.slug)]);
  for (const slug of [...allSlugs].sort()) {
    const b = beforeMap.get(slug) ?? 0;
    const a = after.find((v) => v.slug === slug)?.items ?? 0;
    if (b !== a || parsedByVenue.has(slug)) {
      const parsedN = parsedByVenue.get(slug) ?? parsedByVenue.get(MLS_NWSL_VENUE_SLUG_ALIASES[slug] ?? "") ?? 0;
      console.log(`  · ${slug}: ${b} → ${a} (parsed ${parsedN})`);
    }
  }

  console.log("");
  console.log("MLS/NWSL import summary");
  console.log("-----------------------");
  console.log(`Venues created:      ${stats.venuesCreated}`);
  console.log(`Venues updated:      ${stats.venuesUpdated}`);
  console.log(`Teams attached:      ${stats.teamsAttached}`);
  console.log(`Vendors created:     ${stats.vendorsCreated}`);
  console.log(`Vendors updated:     ${stats.vendorsUpdated}`);
  console.log(`Items created:       ${stats.itemsCreated}`);
  console.log(`Items updated:       ${stats.itemsUpdated}`);
  console.log(`Rows skipped:        ${stats.rowsSkipped}`);
  console.log(`Rows needing review: ${stats.reviewRows}`);

  const teamOnly = parsed.venueBlocks.filter((b) => b.teamOnly);
  if (teamOnly.length > 0) {
    console.log("");
    console.log("Team-only merges (shared stadiums, no new items in doc block):");
    for (const block of teamOnly) {
      console.log(
        `  · ${block.teams.map((t) => t.name).join(" & ")} → ${block.venueNames.join(" & ") || block.venueSlugs.join(" & ")}`
      );
    }
  }

  if (parsed.reviewRows.length > 0) {
    console.log("");
    console.log("Sample rows flagged for review:");
    for (const row of parsed.reviewRows.slice(0, 8)) {
      console.log(
        `  · ${row.venue} / ${row.item_name} [${row.reviewFlags.join(", ")}]`
      );
    }
    if (parsed.reviewRows.length > 8) {
      console.log(`  … and ${parsed.reviewRows.length - 8} more`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
