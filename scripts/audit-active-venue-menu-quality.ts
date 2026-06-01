#!/usr/bin/env npx tsx
/**
 * Active venue menu quality audit (dry-run only — no DB writes).
 *
 *   npx tsx scripts/audit-active-venue-menu-quality.ts --scope=mlb
 *   npx tsx scripts/audit-active-venue-menu-quality.ts --scope=target-field
 *   npx tsx scripts/audit-active-venue-menu-quality.ts --venue=target-field --verbose
 *
 * Requires --scope=... or --venue=... (no default).
 */

import "dotenv/config";

import { EntityStatus, ItemType, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  formatAuditGroupLabel,
  getActiveVenueAuditGroups,
  isInActiveVenueAuditScope,
  type ActiveVenueAuditGroup
} from "../lib/active-venue-audit-scope";
import {
  CURATED_CLEANUP_GROUPS,
  TARGET_FIELD_VENUE_SLUG
} from "../lib/target-field-menu-cleanup";
import {
  analyzeVenueMenuQuality,
  isGenericNonReviewableItem,
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuDuplicateGroup,
  type MenuQualityItem,
  type VenueMenuQualityReport
} from "../lib/venue-menu-quality-audit";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

type AuditScope = "target-field" | "mlb" | "world-cup" | "mls-nwsl" | "active";

type DbItemRow = MenuQualityItem & {
  slug: string;
  itemType: ItemType;
  category: string;
  customCategoryLabel: string | null;
};

const VALID_SCOPES: AuditScope[] = [
  "target-field",
  "mlb",
  "world-cup",
  "mls-nwsl",
  "active"
];

function parseArgs(): {
  scope: AuditScope | null;
  venueSlug: string | null;
  verbose: boolean;
} {
  const args = process.argv.slice(2);
  const scopeArg = args.find((a) => a.startsWith("--scope="))?.split("=")[1] as
    | AuditScope
    | undefined;
  const venueSlug =
    args.find((a) => a.startsWith("--venue="))?.split("=")[1]?.trim().toLowerCase() ??
    null;
  const verbose = args.includes("--verbose");

  if (scopeArg && !VALID_SCOPES.includes(scopeArg)) {
    console.error(`Invalid --scope=${scopeArg}. Use: ${VALID_SCOPES.join(", ")}`);
    process.exit(1);
  }

  return { scope: scopeArg ?? null, venueSlug, verbose };
}

function venueMatchesScope(
  venue: { slug: string; leagues: string[] },
  scope: AuditScope
): boolean {
  const groups = getActiveVenueAuditGroups(venue);
  if (scope === "target-field") {
    return venue.slug.toLowerCase() === TARGET_FIELD_VENUE_SLUG;
  }
  if (scope === "active") {
    return isInActiveVenueAuditScope(venue);
  }
  return groups.includes(scope);
}

function buildTargetFieldCuratedGroups(items: DbItemRow[]): MenuDuplicateGroup<DbItemRow>[] {
  const groups: MenuDuplicateGroup<DbItemRow>[] = [];

  for (const spec of CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length < 2) continue;
    groups.push({
      kind: "curated",
      key: spec.id,
      label: spec.label,
      notes: spec.notes,
      treatAsDuplicate: spec.treatAsDuplicate,
      preferredCanonical: spec.canonicalName,
      members
    });
  }

  return groups;
}

function itemTypeLabel(itemType: ItemType): string {
  if (itemType === "ALCOHOLIC_DRINK") return "Alcoholic Drink";
  if (itemType === "NON_ALCOHOLIC_DRINK") return "Non-Alcoholic Drink";
  return "Food";
}

function printVenueReport(report: VenueMenuQualityReport, items: DbItemRow[], verbose: boolean) {
  console.log("─".repeat(72));
  console.log(`${report.venueName} (${report.venueSlug}) [${report.groups.join(", ")}]`);
  console.log(
    `  ACTIVE: ${report.activeCount} · issues: ${report.issueCount} (safe-hide: ${report.safeHideCount}, manual: ${report.manualReviewCount}) · severity: ${report.severityScore}`
  );

  if (!verbose) return;

  for (const group of report.duplicateGroups) {
    if (group.members.length < 2) continue;
    const keep = pickCanonicalMember(group.members, group.preferredCanonical);
    console.log(`\n  ▸ ${group.label ?? group.kind} (${group.key})`);
    if (group.notes) console.log(`    ${group.notes}`);
    for (const member of group.members) {
      const db = items.find((i) => i.id === member.id)!;
      const action = recommendMenuQualityAction(member, keep, {
        treatAsDuplicate: group.treatAsDuplicate,
        preferredCanonical: group.preferredCanonical,
        isGeneric: isGenericNonReviewableItem(member.name, member.vendor.name)
      });
      console.log(
        `    [${action}] "${member.name}" (${db.slug}) · ${db.vendor.name} · reviews=${member.reviewCount} · photos=${member.photoCount}`
      );
    }
  }

  if (report.genericRows.length > 0) {
    console.log("\n  ▸ Generic / vague rows");
    for (const row of report.genericRows) {
      const db = items.find((i) => i.id === row.id)!;
      const action =
        row.reviewCount > 0 || row.photoCount > 0 ? "manual-review" : "hide-generic";
      console.log(
        `    [${action}] "${row.name}" (${db.slug}) · ${db.vendor.name} · type=${itemTypeLabel(db.itemType)} · reviews=${row.reviewCount} · photos=${row.photoCount}`
      );
    }
  }
}

async function main() {
  const { scope, venueSlug, verbose } = parseArgs();

  if (!scope && !venueSlug) {
    console.error(
      "Pass an explicit scope or venue (no default).\n" +
        "  --scope=target-field|mlb|world-cup|mls-nwsl|active\n" +
        "  --venue=<slug>\n" +
        "  --verbose (per-venue duplicate/generic detail)"
    );
    process.exit(1);
  }

  const venues = await prisma.venue.findMany({
    where: { status: EntityStatus.ACTIVE },
    select: { id: true, slug: true, name: true, leagues: true },
    orderBy: { name: "asc" }
  });

  let scoped = venues.filter(
    (v) => isInActiveVenueAuditScope(v) || venueSlug === v.slug.toLowerCase()
  );

  if (venueSlug) {
    scoped = venues.filter((v) => v.slug.toLowerCase() === venueSlug);
    if (scoped.length === 0) {
      console.error(`Venue not found: ${venueSlug}`);
      process.exit(1);
    }
  } else if (scope) {
    scoped = venues.filter((v) => venueMatchesScope(v, scope));
  }

  console.log("═".repeat(72));
  console.log("ACTIVE VENUE MENU QUALITY AUDIT (DRY RUN)");
  console.log("═".repeat(72));
  console.log(
    `Scope: ${venueSlug ?? scope} · venues: ${scoped.length} · verbose: ${verbose ? "yes" : "no"}`
  );
  console.log("No DB changes. Rows with reviews/photos are never auto-hidden.\n");

  const reports: VenueMenuQualityReport[] = [];

  for (const venue of scoped) {
    const groups = getActiveVenueAuditGroups(venue);
    const rows = await prisma.foodItem.findMany({
      where: {
        venueId: venue.id,
        status: EntityStatus.ACTIVE
      },
      select: {
        id: true,
        slug: true,
        name: true,
        itemType: true,
        category: true,
        customCategoryLabel: true,
        isNewThisSeason: true,
        vendor: { select: { id: true, name: true } },
        _count: {
          select: {
            reviews: {
              where: { status: EntityStatus.ACTIVE, isTestReview: false }
            },
            photos: { where: { status: EntityStatus.ACTIVE } }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    const items: DbItemRow[] = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      itemType: row.itemType,
      category: row.category,
      customCategoryLabel: row.customCategoryLabel,
      isNewThisSeason: row.isNewThisSeason,
      vendor: row.vendor,
      reviewCount: row._count.reviews,
      photoCount: row._count.photos
    }));

    const curated =
      venue.slug.toLowerCase() === TARGET_FIELD_VENUE_SLUG
        ? buildTargetFieldCuratedGroups(items)
        : [];

    const report = analyzeVenueMenuQuality(
      venue.slug,
      venue.name,
      formatAuditGroupLabel(groups).split(", "),
      items,
      curated
    );

    reports.push(report);
    if (verbose) {
      printVenueReport(report, items, true);
    }
  }

  const ranked = [...reports].sort(
    (a, b) => b.severityScore - a.severityScore || b.issueCount - a.issueCount
  );

  console.log("\n── Per-venue summary ───────────────────────────────────────────────");
  console.log(
    "Venue".padEnd(36) +
      "Active".padStart(7) +
      "Issues".padStart(8) +
      "SafeHide".padStart(9) +
      "Manual".padStart(8) +
      "Severity".padStart(10)
  );
  for (const r of ranked) {
    console.log(
      r.venueName.slice(0, 35).padEnd(36) +
        String(r.activeCount).padStart(7) +
        String(r.issueCount).padStart(8) +
        String(r.safeHideCount).padStart(9) +
        String(r.manualReviewCount).padStart(8) +
        String(r.severityScore).padStart(10)
    );
  }

  const withIssues = ranked.filter((r) => r.issueCount > 0);
  console.log(`\nVenues with issues: ${withIssues.length} / ${ranked.length}`);

  console.log("\n── Top 10 by cleanup severity ──────────────────────────────────────");
  for (const r of ranked.slice(0, 10)) {
    const dupGroups = r.duplicateGroups.filter((g) => g.members.length >= 2).length;
    console.log(
      `  ${r.severityScore.toString().padStart(3)}  ${r.venueName} (${r.venueSlug}) — ${r.issueCount} issues, ${dupGroups} duplicate groups, ${r.genericRows.length} generic`
    );
  }

  const targetField = reports.find((r) => r.venueSlug === TARGET_FIELD_VENUE_SLUG);
  if (targetField) {
    console.log("\n── Target Field status ─────────────────────────────────────────────");
    console.log(
      `  ACTIVE food rows: ${targetField.activeCount} · pending cleanup issues: ${targetField.issueCount}`
    );
    console.log(
      `  Safe to hide (no real reviews/photos): ${targetField.safeHideCount} · manual review: ${targetField.manualReviewCount}`
    );
    console.log(
      "  Cleanup not applied yet — run scripts/audit-target-field-menu-cleanup.ts --apply when ready."
    );
    if (targetField.issueCount > 0 && verbose) {
      console.log("  (Use --scope=target-field --verbose for full Target Field breakdown.)");
    }
  }

  const scopeLabel = scope ?? (venueSlug ? `venue:${venueSlug}` : "unknown");
  console.log(`\n── ${scopeLabel.toUpperCase()} totals ──────────────────────────────────────────────`);
  console.log(`  Venues audited: ${reports.length}`);
  console.log(`  Total issues: ${reports.reduce((s, r) => s + r.issueCount, 0)}`);
  console.log(`  Total safe-hide candidates: ${reports.reduce((s, r) => s + r.safeHideCount, 0)}`);
  console.log(`  Total manual-review flags: ${reports.reduce((s, r) => s + r.manualReviewCount, 0)}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
