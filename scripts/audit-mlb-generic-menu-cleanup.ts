#!/usr/bin/env npx tsx
/**
 * MLB-wide conservative generic menu cleanup (dry-run + optional apply).
 *
 * Hides only explicit generic / value / category rows across MLB venues.
 * Does not hide name=vendor stand specialties or duplicate groups.
 *
 *   npm run audit:mlb-generic-menu-cleanup
 *   npx tsx scripts/audit-mlb-generic-menu-cleanup.ts --apply
 */

import "dotenv/config";

import { EntityStatus, ItemType, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  formatAuditGroupLabel,
  getActiveVenueAuditGroups
} from "../lib/active-venue-audit-scope";
import {
  classifyMlbGenericRow,
  type MlbGenericCleanupAction,
  type MlbGenericMenuItem
} from "../lib/mlb-generic-menu-cleanup";
import {
  buildMenuDuplicateGroups,
  dedupeMenuQualityGroups,
  type MenuDuplicateGroup
} from "../lib/venue-menu-quality-audit";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

type ItemRow = MlbGenericMenuItem & {
  itemType: ItemType;
  category: string;
  customCategoryLabel: string | null;
  isNewThisSeason: boolean;
};

type ClassifiedRow = {
  venueSlug: string;
  venueName: string;
  item: ItemRow;
  action: MlbGenericCleanupAction;
  reason: string;
};

function itemTypeLabel(itemType: ItemType): string {
  if (itemType === "ALCOHOLIC_DRINK") return "Alcoholic Drink";
  if (itemType === "NON_ALCOHOLIC_DRINK") return "Non-Alcoholic Drink";
  return "Food";
}

function formatRowLine(row: ClassifiedRow): string {
  const { item, action, reason } = row;
  const label = item.customCategoryLabel ?? "—";
  return [
    `  [${action}]`,
    `"${item.name}"`,
    `slug=${item.slug}`,
    `vendor=${item.vendor.name}`,
    `type=${itemTypeLabel(item.itemType)}`,
    `category=${item.category}`,
    `label=${label}`,
    `reviews=${item.reviewCount}`,
    `photos=${item.photoCount}`,
    `— ${reason}`
  ].join(" · ");
}

function buildDuplicateGroupMemberIds(items: ItemRow[]): {
  memberIds: Set<string>;
  groups: MenuDuplicateGroup[];
} {
  const groups = dedupeMenuQualityGroups(
    buildMenuDuplicateGroups(
      items.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        reviewCount: item.reviewCount,
        photoCount: item.photoCount,
        isNewThisSeason: item.isNewThisSeason,
        vendor: item.vendor
      })),
      { includeTokenSimilar: true }
    )
  ).filter((g) => g.members.length >= 2);

  const memberIds = new Set<string>();
  for (const group of groups) {
    for (const member of group.members) {
      memberIds.add(member.id);
    }
  }

  return { memberIds, groups };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  const venues = await prisma.venue.findMany({
    where: { status: EntityStatus.ACTIVE },
    select: { id: true, slug: true, name: true, leagues: true },
    orderBy: { name: "asc" }
  });

  const mlbVenues = venues.filter((v) => getActiveVenueAuditGroups(v).includes("mlb"));

  console.log("═".repeat(72));
  console.log(
    dryRun
      ? "MLB GENERIC MENU CLEANUP AUDIT (DRY RUN)"
      : "MLB GENERIC MENU CLEANUP (APPLY)"
  );
  console.log("═".repeat(72));
  console.log(`MLB venues: ${mlbVenues.length}`);
  console.log(
    "Scope: ACTIVE FoodItems · explicit generic rows only · no duplicate cleanup"
  );
  console.log("Rows with real reviews/photos are never auto-hidden.\n");

  const allClassified: ClassifiedRow[] = [];
  const duplicateGroupsByVenue: Array<{
    venueSlug: string;
    venueName: string;
    items: ItemRow[];
    groups: MenuDuplicateGroup[];
  }> = [];

  for (const venue of mlbVenues) {
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
      orderBy: [{ name: "asc" }, { slug: "asc" }]
    });

    const items: ItemRow[] = rows.map((row) => ({
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

    const { memberIds, groups } = buildDuplicateGroupMemberIds(items);
    if (groups.length > 0) {
      duplicateGroupsByVenue.push({
        venueSlug: venue.slug,
        venueName: venue.name,
        items,
        groups
      });
    }

    for (const item of items) {
      const { action, reason } = classifyMlbGenericRow(item, {
        inDuplicateGroup: memberIds.has(item.id)
      });
      allClassified.push({
        venueSlug: venue.slug,
        venueName: venue.name,
        item,
        action,
        reason
      });
    }
  }

  const hideRows = allClassified.filter((r) => r.action === "hide-generic");
  const manualRows = allClassified.filter((r) => r.action === "manual-review");
  const skippedDuplicate = allClassified.filter((r) => r.action === "skip-duplicate");

  const skippedDuplicateGeneric = skippedDuplicate.filter((r) =>
    classifyMlbGenericRow(r.item, { inDuplicateGroup: false }).action === "hide-generic"
  );

  console.log("── Safe hide candidates ────────────────────────────────────────────");
  if (hideRows.length === 0) {
    console.log("  (none)");
  } else {
    let currentVenue = "";
    for (const row of hideRows) {
      if (row.venueSlug !== currentVenue) {
        currentVenue = row.venueSlug;
        const groupLabel = formatAuditGroupLabel(
          getActiveVenueAuditGroups({
            slug: row.venueSlug,
            leagues: ["MLB"]
          })
        );
        console.log(`\n${row.venueName} (${row.venueSlug}) [${groupLabel}]`);
      }
      console.log(formatRowLine(row));
      console.log(`    proposed: HIDDEN`);
    }
  }

  console.log("\n── Duplicate groups skipped (not cleaned in this pass) ─────────────");
  if (duplicateGroupsByVenue.length === 0) {
    console.log("  (none)");
  } else {
    let groupCount = 0;
    for (const { venueName, venueSlug, items, groups } of duplicateGroupsByVenue) {
      console.log(`\n${venueName} (${venueSlug}) — ${groups.length} group(s)`);
      for (const group of groups) {
        groupCount += 1;
        console.log(`  Group ${groupCount}: ${group.kind} · ${group.key}`);
        if (group.notes) console.log(`    ${group.notes}`);
        for (const member of group.members) {
          const db = items.find((i) => i.id === member.id);
          if (!db) continue;
          console.log(
            `    · "${db.name}" (${db.slug}) · ${db.vendor.name} · reviews=${db.reviewCount} · photos=${db.photoCount}`
          );
        }
      }
    }
    console.log(`\n  Total duplicate groups skipped: ${groupCount}`);
    if (skippedDuplicateGeneric.length > 0) {
      console.log(
        `  Generic rows in duplicate groups (also skipped): ${skippedDuplicateGeneric.length}`
      );
      for (const row of skippedDuplicateGeneric) {
        console.log(`    · "${row.item.name}" (${row.item.slug}) @ ${row.venueSlug}`);
      }
    }
  }

  if (manualRows.length > 0) {
    console.log("\n── Excluded — reviews/photos ───────────────────────────────────────");
    for (const row of manualRows) {
      console.log(
        `  · ${row.venueName}: "${row.item.name}" (${row.item.slug}) reviews=${row.item.reviewCount} photos=${row.item.photoCount}`
      );
    }
  }

  console.log("\n── Summary ─────────────────────────────────────────────────────────");
  console.log(`MLB venues audited: ${mlbVenues.length}`);
  console.log(`Total safe hides: ${hideRows.length}`);
  console.log(`Excluded (reviews/photos): ${manualRows.length}`);
  console.log(
    `Duplicate group members skipped: ${skippedDuplicate.length} (${duplicateGroupsByVenue.reduce((s, v) => s + v.groups.length, 0)} groups)`
  );

  console.log("\n── Safe hides by venue ─────────────────────────────────────────────");
  const byVenue = new Map<string, ClassifiedRow[]>();
  for (const row of hideRows) {
    if (!byVenue.has(row.venueSlug)) byVenue.set(row.venueSlug, []);
    byVenue.get(row.venueSlug)!.push(row);
  }
  if (byVenue.size === 0) {
    console.log("  (none)");
  } else {
    for (const [slug, rows] of [...byVenue.entries()].sort(
      (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
    )) {
      console.log(`  ${rows[0].venueName} (${slug}): ${rows.length}`);
      for (const row of rows) {
        console.log(`    · "${row.item.name}" (${row.item.slug}) — ${row.reason}`);
      }
    }
  }

  if (dryRun) {
    console.log("\nRun apply: npx tsx scripts/audit-mlb-generic-menu-cleanup.ts --apply");
    return;
  }

  for (const row of hideRows) {
    await prisma.foodItem.update({
      where: { id: row.item.id },
      data: { status: EntityStatus.HIDDEN }
    });
  }

  console.log(`\nDone. ${hideRows.length} row(s) set to HIDDEN.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
