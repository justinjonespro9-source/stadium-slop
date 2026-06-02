#!/usr/bin/env npx tsx
/**
 * Fenway Park menu cleanup audit (dry-run + optional apply).
 *
 *   npx tsx scripts/audit-fenway-park-menu-cleanup.ts
 *   npm run audit:fenway-park-menu
 *   npx tsx scripts/audit-fenway-park-menu-cleanup.ts --apply
 */

import "dotenv/config";

import { EntityStatus, ItemType, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  buildFenwayParkCuratedGroups,
  classifyFenwayParkRow,
  FENWAY_PARK_CANONICAL_STAND_DISH_SLUGS,
  FENWAY_PARK_CURATED_CLEANUP_GROUPS,
  FENWAY_PARK_VENUE_SLUG,
  isFenwayParkVendorStandPlaceholder,
  recommendCuratedMemberAction,
  type FenwayParkCleanupAction
} from "../lib/fenway-park-menu-cleanup";
import {
  buildMenuDuplicateGroups,
  dedupeMenuQualityGroups,
  isGenericNonReviewableItem,
  pickCanonicalMember,
  recommendMenuQualityAction
} from "../lib/venue-menu-quality-audit";

const SOURCE_URL = "https://www.mlb.com/redsox/ballpark/concessions";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

type ItemRow = {
  id: string;
  slug: string;
  name: string;
  status: EntityStatus;
  itemType: ItemType;
  category: string;
  customCategoryLabel: string | null;
  isNewThisSeason: boolean;
  vendor: { id: string; name: string; slug: string };
  reviewCount: number;
  photoCount: number;
};

function itemTypeLabel(itemType: ItemType): string {
  if (itemType === "ALCOHOLIC_DRINK") return "Alcoholic Drink";
  if (itemType === "NON_ALCOHOLIC_DRINK") return "Non-Alcoholic Drink";
  return "Food";
}

function formatItemLine(item: ItemRow, action: FenwayParkCleanupAction, reason: string) {
  return [
    `  [${action}]`,
    `"${item.name}"`,
    `slug=${item.slug}`,
    `vendor=${item.vendor.name}`,
    `type=${itemTypeLabel(item.itemType)}`,
    `category=${item.category}`,
    `label=${item.customCategoryLabel ?? "—"}`,
    `status=${item.status}`,
    `reviews=${item.reviewCount}`,
    `photos=${item.photoCount}`,
    `— ${reason}`
  ].join(" · ");
}

function buildFenwayParkCuratedDuplicateGroups(items: ItemRow[]) {
  const active = items.filter((i) => i.status === EntityStatus.ACTIVE);
  return buildFenwayParkCuratedGroups(active).map(({ spec, members }) => ({
    kind: "curated" as const,
    key: spec.id,
    label: spec.label,
    notes: spec.notes,
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName,
    members
  }));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  const venue = await prisma.venue.findFirst({
    where: { slug: { equals: FENWAY_PARK_VENUE_SLUG, mode: "insensitive" } }
  });
  if (!venue) {
    console.error(`Venue not found: ${FENWAY_PARK_VENUE_SLUG}`);
    process.exit(1);
  }

  const rows = await prisma.foodItem.findMany({
    where: { venueId: venue.id },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      itemType: true,
      category: true,
      customCategoryLabel: true,
      isNewThisSeason: true,
      vendor: { select: { id: true, name: true, slug: true } },
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
    status: row.status,
    itemType: row.itemType,
    category: row.category,
    customCategoryLabel: row.customCategoryLabel,
    isNewThisSeason: row.isNewThisSeason,
    vendor: row.vendor,
    reviewCount: row._count.reviews,
    photoCount: row._count.photos
  }));

  const active = items.filter((i) => i.status === EntityStatus.ACTIVE);
  const activeBefore = active.length;

  const autoGroups = dedupeMenuQualityGroups(
    buildMenuDuplicateGroups(
      active.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        reviewCount: item.reviewCount,
        photoCount: item.photoCount,
        isNewThisSeason: item.isNewThisSeason,
        vendor: { id: item.vendor.id, name: item.vendor.name }
      })),
      { includeTokenSimilar: true }
    )
  ).filter((g) => g.members.length >= 2);

  const curatedGroups = buildFenwayParkCuratedDuplicateGroups(items);

  const vendorOnlyRows = active.filter((item) => isFenwayParkVendorStandPlaceholder(item));
  const genericConcessionRows = active.filter(
    (item) => classifyFenwayParkRow(item).kind === "generic-concession"
  );
  const genericBeverageRows = active.filter(
    (item) => classifyFenwayParkRow(item).kind === "generic-beverage"
  );
  const vagueRows = active.filter((item) => classifyFenwayParkRow(item).kind === "vague");
  const broadGenericFalsePositives = active.filter((item) =>
    isGenericNonReviewableItem(item.name, item.vendor.name)
  );

  const hidePlan = new Map<
    string,
    { item: ItemRow; action: FenwayParkCleanupAction; reason: string; keep?: ItemRow }
  >();
  const manualRows: ItemRow[] = [];

  for (const item of active) {
    const classified = classifyFenwayParkRow(item);
    if (classified.action === "manual-review") {
      manualRows.push(item);
      continue;
    }
    if (
      classified.action === "hide-duplicate" ||
      classified.action === "hide-generic"
    ) {
      hidePlan.set(item.id, {
        item,
        action: classified.action,
        reason: classified.reason
      });
    }
  }

  for (const group of curatedGroups) {
    if (!group.treatAsDuplicate) continue;
    const keep = pickCanonicalMember(group.members, group.preferredCanonical);
    for (const member of group.members) {
      const spec = FENWAY_PARK_CURATED_CLEANUP_GROUPS.find((s) => s.id === group.key)!;
      const action = recommendCuratedMemberAction(member, keep, spec);
      if (action === "manual-review") {
        manualRows.push(member as ItemRow);
        hidePlan.delete(member.id);
        continue;
      }
      if (action === "hide-duplicate" && member.id !== keep.id) {
        hidePlan.set(member.id, {
          item: member as ItemRow,
          action,
          reason: group.notes ?? "Curated duplicate",
          keep: keep as ItemRow
        });
      }
    }
  }

  for (const group of autoGroups) {
    if (!group.treatAsDuplicate) continue;
    const members = group.members
      .map((m) => active.find((i) => i.id === m.id))
      .filter((m): m is ItemRow => Boolean(m));
    if (members.length < 2) continue;

    const keep = pickCanonicalMember(members, group.preferredCanonical);
    for (const member of members) {
      const action = recommendMenuQualityAction(member, keep, {
        treatAsDuplicate: true,
        preferredCanonical: group.preferredCanonical
      });
      if (action === "manual-review") {
        if (!manualRows.some((r) => r.id === member.id)) {
          manualRows.push(member);
        }
        hidePlan.delete(member.id);
        continue;
      }
      if (action === "hide-duplicate" && member.id !== keep.id) {
        hidePlan.set(member.id, {
          item: member,
          action,
          reason: `${group.kind}: ${group.key}`,
          keep
        });
      }
    }
  }

  const safeHideRows = [...hidePlan.values()];
  const projectedActive = activeBefore - safeHideRows.length;

  const notableKeepSlugs = new Set([
    "fenway-kayem-frank",
    "fenway-lukes-lobster-roll",
    "lukes-crab-roll",
    "lukes-lobster-bisque",
    "fenway-lobstah-poutine-item",
    "fenway-green-monster-fries-item",
    "fenway-spicy-cabot-grilled-cheese-item",
    "fenway-surf-turf-dog",
    "fenway-boston-dog",
    "fenway-north-end-cannoli-item",
    "clam-chowder",
    "fenway-guinness-beef-stew",
    "fenway-angry-orchard-slushy",
    "fenway-sausage-peppers-onions",
    "fenway-big-tasty-burger",
    "fenway-shaft-shake",
    "fenway-regina-cheese-slice",
    "fenway-regina-pepperoni-slice",
    "boston-cr-me-pie",
    "savenors-cheesesteak",
    "fenway-savenors-burger",
    "fenway-cake-in-a-can"
  ]);

  console.log("═".repeat(72));
  console.log(
    dryRun ? "FENWAY PARK MENU CLEANUP AUDIT (DRY RUN)" : "FENWAY PARK MENU CLEANUP (APPLY)"
  );
  console.log("═".repeat(72));
  console.log(`Venue: ${venue.name} (${FENWAY_PARK_VENUE_SLUG})`);
  console.log(`Source: ${SOURCE_URL}`);
  console.log(`Total rows: ${items.length} · ACTIVE before: ${activeBefore}`);
  console.log(
    `Broad audit flagged (name=vendor / generic heuristic): ${broadGenericFalsePositives.length} — reclassified below\n`
  );

  console.log("── Curated inspection groups ───────────────────────────────────────");
  for (const spec of FENWAY_PARK_CURATED_CLEANUP_GROUPS) {
    const members = active.filter((item) => spec.matchName(item.name, item.vendor.name));
    console.log(`\n▸ ${spec.label} (${spec.id})`);
    console.log(`  ${spec.notes}`);
    if (members.length === 0) {
      console.log("  (no ACTIVE rows matched)");
      continue;
    }
    const keep =
      members.length >= 2 && spec.treatAsDuplicate
        ? pickCanonicalMember(members, spec.canonicalName)
        : null;
    for (const member of members) {
      const action =
        members.length < 2
          ? "keep-canonical"
          : recommendCuratedMemberAction(member, keep ?? member, spec);
      console.log(
        formatItemLine(
          member,
          action,
          action === "keep-canonical" ? "Keep" : spec.notes
        )
      );
    }
  }

  console.log("\n── Auto-detected duplicate groups (2+ ACTIVE) ──────────────────────");
  if (autoGroups.length === 0) {
    console.log("  (none beyond curated)");
  } else {
    let n = 0;
    for (const group of autoGroups) {
      if (group.kind === "curated") continue;
      n += 1;
      const members = group.members
        .map((m) => active.find((i) => i.id === m.id))
        .filter((m): m is ItemRow => Boolean(m));
      if (members.length < 2) continue;
      const keep = pickCanonicalMember(members, group.preferredCanonical);
      console.log(`\n  Group ${n}: ${group.kind} · ${group.key}`);
      for (const member of members) {
        const action = recommendMenuQualityAction(member, keep, {
          treatAsDuplicate: group.treatAsDuplicate,
          preferredCanonical: group.preferredCanonical
        });
        console.log(formatItemLine(member, action, group.notes ?? group.kind));
      }
    }
    if (n === 0) console.log("  (none beyond curated)");
  }

  console.log("\n── Vendor stand placeholders ───────────────────────────────────────");
  console.log(
    `  ${vendorOnlyRows.length} row(s) where item name equals vendor — hide stand label unless canonical specialty.`
  );
  console.log(
    "  KEEP (canonical): Green Monster fries, Lobstah poutine, Spicy Cabot grilled cheese — name=vendor Fenway specialties."
  );
  console.log(
    "  HIDE: Farmer's Fridge, Sal's Pizza — grab-and-go / pizza stand labels with named alternatives."
  );
  for (const item of vendorOnlyRows) {
    const classified = classifyFenwayParkRow(item);
    console.log(formatItemLine(item, classified.action, classified.reason));
  }

  console.log("\n── Generic ballpark concessions (hide) ─────────────────────────────");
  if (genericConcessionRows.length === 0) {
    console.log("  (none in this pass)");
  } else {
    for (const item of genericConcessionRows) {
      const classified = classifyFenwayParkRow(item);
      console.log(formatItemLine(item, classified.action, classified.reason));
    }
  }

  console.log("\n── Generic beverages (hide) ──────────────────────────────────────────");
  if (genericBeverageRows.length === 0) {
    console.log("  (none — Cotton Candy / Cocktails already hidden by MLB generic pass)");
  } else {
    for (const item of genericBeverageRows) {
      const classified = classifyFenwayParkRow(item);
      console.log(formatItemLine(item, classified.action, classified.reason));
    }
  }

  console.log("\n── Vague placeholders (hide) ─────────────────────────────────────────");
  if (vagueRows.length === 0) {
    console.log("  (none)");
  } else {
    for (const item of vagueRows) {
      const classified = classifyFenwayParkRow(item);
      console.log(formatItemLine(item, classified.action, classified.reason));
    }
  }

  console.log("\n── Notable keep items (Boston / Fenway specialties) ────────────────");
  const notableKeep = active.filter(
    (item) =>
      notableKeepSlugs.has(item.slug) ||
      FENWAY_PARK_CANONICAL_STAND_DISH_SLUGS.has(item.slug)
  );
  for (const item of notableKeep) {
    console.log(`    · ${item.name} (${item.slug}) — ${item.vendor.name}`);
  }

  console.log("\n── Keep — all remaining ACTIVE after cleanup ───────────────────────");
  const keepRows = active.filter(
    (item) => !hidePlan.has(item.id) && !manualRows.some((m) => m.id === item.id)
  );
  console.log(`  ${keepRows.length} ACTIVE row(s) remain after cleanup.`);

  console.log("\n── Summary ─────────────────────────────────────────────────────────");
  console.log(`ACTIVE before: ${activeBefore}`);
  console.log(`Duplicate groups (curated): ${curatedGroups.length}`);
  console.log(
    `Duplicate groups (auto, non-curated): ${autoGroups.filter((g) => g.kind !== "curated").length}`
  );
  console.log(`Vendor stand placeholders: ${vendorOnlyRows.length}`);
  console.log(`Generic concessions: ${genericConcessionRows.length}`);
  console.log(`Generic beverages: ${genericBeverageRows.length}`);
  console.log(`Vague placeholders: ${vagueRows.length}`);
  console.log(`${dryRun ? "Would hide" : "Hiding"}: ${safeHideRows.length}`);
  console.log(`Manual review: ${manualRows.length}`);
  console.log(`Projected ACTIVE after apply: ${projectedActive}`);

  if (safeHideRows.length > 0) {
    console.log("\n── Safe hide plan ──────────────────────────────────────────────────");
    for (const { item, reason, keep } of safeHideRows) {
      const ctx = keep ? `keep "${keep.name}" (${keep.slug})` : reason;
      console.log(`  HIDE "${item.name}" (${item.slug}) — ${ctx}`);
    }
  }

  if (manualRows.length > 0) {
    console.log("\n── Manual review ───────────────────────────────────────────────────");
    for (const item of manualRows) {
      console.log(
        `  · "${item.name}" (${item.slug}) reviews=${item.reviewCount} photos=${item.photoCount}`
      );
    }
  }

  console.log("\n── Importer notes (no refactor in this pass) ───────────────────────");
  console.log(
    "  · lib/venue-menu-import/fenway-park.ts imports vendor concepts as FoodItem names."
  );
  console.log(
    "  · Expansion seed (lib/mlb-ballpark-concessions-parks-expansion.ts) adds named Red Sox specialties."
  );
  console.log(
    "  · Green Monster fries, Lobstah poutine, and Spicy Cabot grilled cheese kept despite broad-audit flags."
  );

  if (dryRun) {
    console.log("\nRun apply: npx tsx scripts/audit-fenway-park-menu-cleanup.ts --apply");
    return;
  }

  for (const { item } of safeHideRows) {
    await prisma.foodItem.update({
      where: { id: item.id },
      data: { status: EntityStatus.HIDDEN }
    });
  }

  console.log(`\nDone. ${safeHideRows.length} row(s) set to HIDDEN.`);
  console.log(`Projected ACTIVE: ${projectedActive}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
