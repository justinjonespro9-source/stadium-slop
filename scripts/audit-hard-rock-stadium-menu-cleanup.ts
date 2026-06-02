#!/usr/bin/env npx tsx
/**
 * Hard Rock Stadium menu cleanup audit (dry-run + optional apply).
 *
 *   npx tsx scripts/audit-hard-rock-stadium-menu-cleanup.ts
 *   npm run audit:hard-rock-stadium-menu
 *   npx tsx scripts/audit-hard-rock-stadium-menu-cleanup.ts --apply
 */

import "dotenv/config";

import { EntityStatus, ItemType, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  buildHardRockStadiumCuratedGroups,
  classifyHardRockStadiumRow,
  getHardRockStadiumKeepBothMemberIds,
  isHardRockStadiumVendorStandPlaceholder,
  HARD_ROCK_STADIUM_CANONICAL_STAND_DISH_SLUGS,
  HARD_ROCK_STADIUM_CURATED_CLEANUP_GROUPS,
  HARD_ROCK_STADIUM_VENUE_SLUG,
  pickHardRockStadiumCuratedKeep,
  recommendCuratedMemberAction,
  type HardRockStadiumCleanupAction
} from "../lib/hard-rock-stadium-menu-cleanup";
import {
  buildMenuDuplicateGroups,
  dedupeMenuQualityGroups,
  isGenericNonReviewableItem,
  pickCanonicalMember,
  recommendMenuQualityAction
} from "../lib/venue-menu-quality-audit";

const SOURCE_URL =
  "https://www.hardrockstadium.com/concessions/";

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

function formatItemLine(item: ItemRow, action: HardRockStadiumCleanupAction, reason: string) {
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

function buildHardRockStadiumCuratedDuplicateGroups(items: ItemRow[]) {
  const active = items.filter((i) => i.status === EntityStatus.ACTIVE);
  return buildHardRockStadiumCuratedGroups(active).map(({ spec, members }) => ({
    kind: "curated" as const,
    key: spec.id,
    label: spec.label,
    notes: spec.notes,
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName,
    spec,
    members
  }));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  const venue = await prisma.venue.findFirst({
    where: { slug: { equals: HARD_ROCK_STADIUM_VENUE_SLUG, mode: "insensitive" } }
  });
  if (!venue) {
    console.error(`Venue not found: ${HARD_ROCK_STADIUM_VENUE_SLUG}`);
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
  const keepBothMemberIds = getHardRockStadiumKeepBothMemberIds(active);

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

  const curatedGroups = buildHardRockStadiumCuratedDuplicateGroups(items);
  const curatedMemberIds = new Set(
    curatedGroups.flatMap((g) => g.members.map((m) => m.id))
  );

  const vendorOnlyRows = active.filter((item) => isHardRockStadiumVendorStandPlaceholder(item));
  const genericConcessionRows = active.filter(
    (item) => classifyHardRockStadiumRow(item).kind === "generic-concession"
  );
  const genericBeverageRows = active.filter(
    (item) => classifyHardRockStadiumRow(item).kind === "generic-beverage"
  );
  const vagueRows = active.filter((item) => classifyHardRockStadiumRow(item).kind === "vague");
  const broadGenericFalsePositives = active.filter((item) =>
    isGenericNonReviewableItem(item.name, item.vendor.name)
  );

  const hidePlan = new Map<
    string,
    { item: ItemRow; action: HardRockStadiumCleanupAction; reason: string; keep?: ItemRow }
  >();
  const manualRows: ItemRow[] = [];

  for (const item of active) {
    const classified = classifyHardRockStadiumRow(item);
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
    const keep = pickHardRockStadiumCuratedKeep(group.members, group.spec);
    for (const member of group.members) {
      const action = recommendCuratedMemberAction(member, keep, group.spec);
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

    if (members.every((m) => curatedMemberIds.has(m.id))) continue;

    const keep = pickCanonicalMember(members, group.preferredCanonical);
    for (const member of members) {
      if (keepBothMemberIds.has(member.id)) continue;

      if (curatedMemberIds.has(member.id) && hidePlan.has(member.id) === false) {
        const curatedKeep = curatedGroups.some((g) =>
          g.members.some((m) => m.id === member.id && m.id === pickHardRockStadiumCuratedKeep(g.members, g.spec).id)
        );
        if (curatedKeep) continue;
      }

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
        if (curatedMemberIds.has(member.id)) continue;
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
    "the-beef-hammer",
    "salmon-mosaic-salmon-mosaic",
    "south-florida-mofongo-south-florida-mofongo",
    "caramelized-foie-gras-slider-caramelized-foie-gras-slider",
    "shula-burger",
    "key-lime-pie-souvenir-jar",
    "famous-empanadas",
    "cochinita-pibil-taco",
    "guava-cheese-donut",
    "leeks-and-bacon-pizza",
    "spicy-fried-chicken-sandwich",
    "fuku-cbr",
    "citrus-quinoa-salad",
    "medianoche-sandwich",
    "pulled-pork-sandwich",
    "choripan"
  ]);

  const specialtyDrinkRows = active.filter((item) =>
    /miami daydream/i.test(`${item.name} ${item.slug}`)
  );

  console.log("═".repeat(72));
  console.log(
    dryRun
      ? "HARD ROCK STADIUM MENU CLEANUP AUDIT (DRY RUN)"
      : "HARD ROCK STADIUM MENU CLEANUP (APPLY)"
  );
  console.log("═".repeat(72));
  console.log(`Venue: ${venue.name} (${HARD_ROCK_STADIUM_VENUE_SLUG})`);
  console.log(`Source: ${SOURCE_URL}`);
  console.log(`Total rows: ${items.length} · ACTIVE before: ${activeBefore}`);
  console.log(
    `Broad audit flagged (name=vendor / generic heuristic): ${broadGenericFalsePositives.length} — reclassified below\n`
  );

  console.log("── Curated inspection groups ───────────────────────────────────────");
  for (const spec of HARD_ROCK_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = active.filter((item) => spec.matchName(item.name, item.vendor.name));
    console.log(`\n▸ ${spec.label} (${spec.id})`);
    console.log(`  ${spec.notes}`);
    if (members.length === 0) {
      console.log("  (no ACTIVE rows matched)");
      continue;
    }
    const keep =
      members.length >= 2 && spec.treatAsDuplicate
        ? pickHardRockStadiumCuratedKeep(members, spec)
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
      const curatedHandled = members.every((m) => curatedMemberIds.has(m.id));
      const keep = pickCanonicalMember(members, group.preferredCanonical);
      console.log(`\n  Group ${n}: ${group.kind} · ${group.key}`);
      if (group.notes) console.log(`    ${group.notes}`);
      if (curatedHandled) {
        console.log("    → Handled by curated groups above");
      } else if (members.every((m) => keepBothMemberIds.has(m.id))) {
        console.log("    → Handled by curated groups above");
      }
      for (const member of members) {
        const action =
          keepBothMemberIds.has(member.id)
            ? "keep-both"
            : curatedHandled
              ? recommendCuratedMemberAction(
                  member,
                  pickHardRockStadiumCuratedKeep(
                    members,
                    HARD_ROCK_STADIUM_CURATED_CLEANUP_GROUPS.find((s) =>
                      s.matchName(member.name, member.vendor.name)
                    )!
                  ),
                  HARD_ROCK_STADIUM_CURATED_CLEANUP_GROUPS.find((s) =>
                    s.matchName(member.name, member.vendor.name)
                  )!
                )
              : recommendMenuQualityAction(member, keep, {
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
  for (const item of vendorOnlyRows) {
    const classified = classifyHardRockStadiumRow(item);
    console.log(formatItemLine(item, classified.action, classified.reason));
  }

  console.log("\n── Generic ballpark concessions (hide) ─────────────────────────────");
  if (genericConcessionRows.length === 0) {
    console.log("  (none in this pass)");
  } else {
    for (const item of genericConcessionRows) {
      const classified = classifyHardRockStadiumRow(item);
      console.log(formatItemLine(item, classified.action, classified.reason));
    }
  }

  console.log("\n── Generic beverages (hide) ──────────────────────────────────────────");
  if (genericBeverageRows.length === 0) {
    console.log(
      "  (none — no generic value/beer/soda rows flagged at this venue)"
    );
  } else {
    for (const item of genericBeverageRows) {
      const classified = classifyHardRockStadiumRow(item);
      console.log(formatItemLine(item, classified.action, classified.reason));
    }
  }

  console.log("\n── Vague placeholders (hide) ─────────────────────────────────────────");
  if (vagueRows.length === 0) {
    console.log("  (none)");
  } else {
    for (const item of vagueRows) {
      const classified = classifyHardRockStadiumRow(item);
      console.log(formatItemLine(item, classified.action, classified.reason));
    }
  }

  console.log("\n── Notable keep items (Miami / Dolphins / World Cup specialties) ────────────");
  const notableKeep = active.filter(
    (item) =>
      notableKeepSlugs.has(item.slug) ||
      HARD_ROCK_STADIUM_CANONICAL_STAND_DISH_SLUGS.has(item.slug)
  );
  for (const item of notableKeep) {
    console.log(`    · ${item.name} (${item.slug}) — ${item.vendor.name}`);
  }

  console.log("\n── 21+ specialty drinks (Miami Daydream) ───────────────────────────");
  if (specialtyDrinkRows.length === 0) {
    console.log(
      "  Not present as ACTIVE FoodItems. Miami Daydream is documented in NFL import and skipped in hard-rock-stadium.ts beverage curation."
    );
  } else {
    for (const item of specialtyDrinkRows) {
      console.log(`    · ${item.name} (${item.slug}) — ${item.vendor.name}`);
    }
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
    "  · lib/venue-menu-import/hard-rock-stadium.ts — curated dishes; Miami Daydream intentionally skipped as beverage."
  );
  console.log(
    "  · data/league-import/nfl-venues-import.cleaned.csv — NFL headline/partner stand imports."
  );
  console.log(
    "  · Headline dishes (Beef Hammer, Salmon Mosaic, Mofongo, etc.) kept despite name=vendor."
  );
  console.log(
    "  · Key Lime Pie Souvenir Jar — hide plural NFL import row; keep official singular slug."
  );

  if (dryRun) {
    console.log("\nRun apply: npx tsx scripts/audit-hard-rock-stadium-menu-cleanup.ts --apply");
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
