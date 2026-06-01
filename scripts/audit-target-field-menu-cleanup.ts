#!/usr/bin/env npx tsx
/**
 * Target Field menu cleanup audit (duplicates + generic rows).
 *
 *   npx tsx scripts/audit-target-field-menu-cleanup.ts
 *   npm run audit:target-field-menu
 *   npx tsx scripts/audit-target-field-menu-cleanup.ts --apply
 */

import "dotenv/config";

import { EntityStatus, ItemType, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { normalizeMenuItemName } from "../lib/venue-menu-import/normalize";
import {
  CURATED_CLEANUP_GROUPS,
  isGenericNonReviewableItem,
  pickCanonicalMember,
  punctuationFoldKey,
  recommendActionForMember,
  TARGET_FIELD_VENUE_SLUG,
  vendorStripKey,
  type CleanupAction
} from "../lib/target-field-menu-cleanup";

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

type DuplicateGroupKind =
  | "exact-name"
  | "case-only"
  | "punctuation-only"
  | "normalized-name"
  | "vendor-stripped"
  | "curated";

type DuplicateGroup = {
  kind: DuplicateGroupKind;
  key: string;
  label?: string;
  treatAsDuplicate: boolean;
  preferredCanonical?: string;
  notes?: string;
  members: ItemRow[];
};

function itemTypeLabel(itemType: ItemType): string {
  if (itemType === "ALCOHOLIC_DRINK") return "Alcoholic Drink";
  if (itemType === "NON_ALCOHOLIC_DRINK") return "Non-Alcoholic Drink";
  return "Food";
}

function formatItemLine(item: ItemRow, action: CleanupAction): string {
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
    `photos=${item.photoCount}`
  ].join(" · ");
}

function buildAutoDuplicateGroups(items: ItemRow[]): DuplicateGroup[] {
  const active = items.filter((i) => i.status === EntityStatus.ACTIVE);
  const groups: DuplicateGroup[] = [];

  const addFromMap = (
    kind: DuplicateGroupKind,
    map: Map<string, ItemRow[]>,
    treatAsDuplicate = true
  ) => {
    for (const [key, members] of map) {
      if (members.length < 2) continue;
      groups.push({ kind, key, treatAsDuplicate, members });
    }
  };

  const exact = new Map<string, ItemRow[]>();
  const normalized = new Map<string, ItemRow[]>();
  const punctuation = new Map<string, ItemRow[]>();
  const vendorStripped = new Map<string, ItemRow[]>();

  for (const item of active) {
    const exactKey = item.name.trim().toLowerCase();
    if (!exact.has(exactKey)) exact.set(exactKey, []);
    exact.get(exactKey)!.push(item);

    const normKey = normalizeMenuItemName(item.name);
    if (!normalized.has(normKey)) normalized.set(normKey, []);
    normalized.get(normKey)!.push(item);

    const punctKey = punctuationFoldKey(item.name);
    if (!punctuation.has(punctKey)) punctuation.set(punctKey, []);
    punctuation.get(punctKey)!.push(item);

    const vsKey = `${item.vendor.id}::${vendorStripKey(item.name, item.vendor.name)}`;
    if (!vendorStripped.has(vsKey)) vendorStripped.set(vsKey, []);
    vendorStripped.get(vsKey)!.push(item);
  }

  addFromMap("exact-name", exact);
  addFromMap("normalized-name", normalized);
  addFromMap("punctuation-only", punctuation);
  addFromMap("vendor-stripped", vendorStripped);

  return groups;
}

function buildCuratedGroups(items: ItemRow[]): DuplicateGroup[] {
  const active = items.filter((i) => i.status === EntityStatus.ACTIVE);
  const groups: DuplicateGroup[] = [];

  for (const spec of CURATED_CLEANUP_GROUPS) {
    const members = active.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length < 2) continue;
    groups.push({
      kind: "curated",
      key: spec.id,
      label: spec.label,
      treatAsDuplicate: spec.treatAsDuplicate,
      preferredCanonical: spec.canonicalName,
      notes: spec.notes,
      members
    });
  }

  return groups;
}

function dedupeGroups(groups: DuplicateGroup[]): DuplicateGroup[] {
  const byMemberIds = new Map<string, DuplicateGroup>();

  for (const group of groups) {
    const memberKey = [...group.members]
      .map((m) => m.id)
      .sort()
      .join("|");
    const existing = byMemberIds.get(memberKey);
    if (!existing) {
      byMemberIds.set(memberKey, group);
      continue;
    }
    const preferCurated =
      group.kind === "curated" && existing.kind !== "curated";
    if (preferCurated || group.members.length > existing.members.length) {
      byMemberIds.set(memberKey, group);
    }
  }

  return [...byMemberIds.values()];
}

function planHideAndRename(groups: DuplicateGroup[]): {
  hide: { item: ItemRow; keep: ItemRow; group: DuplicateGroup }[];
  rename: { item: ItemRow; to: string; group: DuplicateGroup }[];
  manual: DuplicateGroup[];
  genericHide: ItemRow[];
} {
  const hide: { item: ItemRow; keep: ItemRow; group: DuplicateGroup }[] = [];
  const rename: { item: ItemRow; to: string; group: DuplicateGroup }[] = [];
  const manual: DuplicateGroup[] = [];
  const hideIds = new Set<string>();

  for (const group of groups) {
    if (!group.treatAsDuplicate) continue;

    const keep = pickCanonicalMember(group.members, group.preferredCanonical);
    let groupNeedsManual = false;

    for (const member of group.members) {
      const action = recommendActionForMember(member, keep, {
        treatAsDuplicate: group.treatAsDuplicate,
        preferredCanonical: group.preferredCanonical
      });

      if (action === "manual-review") {
        groupNeedsManual = true;
        continue;
      }
      if (action === "hide-duplicate" && member.id !== keep.id && !hideIds.has(member.id)) {
        hide.push({ item: member, keep, group });
        hideIds.add(member.id);
      }
      if (action === "rename-canonical" && group.preferredCanonical) {
        rename.push({ item: member, to: group.preferredCanonical, group });
      }
    }

    if (groupNeedsManual) {
      manual.push(group);
    }
  }

  return { hide, rename, manual, genericHide: [] };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  const venue = await prisma.venue.findFirst({
    where: { slug: { equals: TARGET_FIELD_VENUE_SLUG, mode: "insensitive" } }
  });
  if (!venue) {
    console.error(`Venue not found: ${TARGET_FIELD_VENUE_SLUG}`);
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

  const autoGroups = buildAutoDuplicateGroups(items);
  const curatedGroups = buildCuratedGroups(items);
  const allGroups = dedupeGroups([...curatedGroups, ...autoGroups]).filter(
    (g) => g.members.filter((m) => m.status === EntityStatus.ACTIVE).length >= 2
  );

  const genericCandidates = active.filter((item) =>
    isGenericNonReviewableItem(item.name, item.vendor.name)
  );

  console.log("═".repeat(72));
  console.log(dryRun ? "TARGET FIELD MENU CLEANUP AUDIT (DRY RUN)" : "TARGET FIELD MENU CLEANUP (APPLY)");
  console.log("═".repeat(72));
  console.log(`Venue: ${venue.name} (${TARGET_FIELD_VENUE_SLUG})`);
  console.log(`Total rows: ${items.length} · ACTIVE: ${active.length} · HIDDEN: ${items.length - active.length}\n`);

  console.log("── Curated inspection groups ───────────────────────────────────────");
  for (const spec of CURATED_CLEANUP_GROUPS) {
    const members = active.filter((item) => spec.matchName(item.name, item.vendor.name));
    console.log(`\n▸ ${spec.label} (${spec.id})`);
    console.log(`  Notes: ${spec.notes}`);
    console.log(`  Preferred canonical: ${spec.canonicalName}`);
    console.log(`  Treat as duplicate: ${spec.treatAsDuplicate ? "yes" : "no (keep both)"}`);

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
          : recommendActionForMember(member, keep ?? member, {
              treatAsDuplicate: spec.treatAsDuplicate,
              preferredCanonical: spec.canonicalName,
              isGeneric: isGenericNonReviewableItem(member.name, member.vendor.name)
            });
      console.log(formatItemLine(member, action));
    }
  }

  console.log("\n── Auto-detected duplicate groups (2+ ACTIVE) ──────────────────────");
  let groupNum = 0;
  for (const group of allGroups.sort(
    (a, b) => b.members.length - a.members.length || a.key.localeCompare(b.key)
  )) {
    if (group.kind === "curated") continue;
    groupNum += 1;
    const activeMembers = group.members.filter((m) => m.status === EntityStatus.ACTIVE);
    if (activeMembers.length < 2) continue;

    const keep = pickCanonicalMember(activeMembers, group.preferredCanonical);
    console.log(`\nGroup ${groupNum}: ${group.kind} · key=${group.key}`);
    if (group.label) console.log(`  ${group.label}`);
    if (group.notes) console.log(`  ${group.notes}`);

    for (const member of activeMembers) {
      const action = recommendActionForMember(member, keep, {
        treatAsDuplicate: group.treatAsDuplicate,
        preferredCanonical: group.preferredCanonical
      });
      console.log(formatItemLine(member, action));
    }
  }

  console.log("\n── Generic / non-reviewable ACTIVE rows ────────────────────────────");
  for (const item of genericCandidates) {
    const action =
      item.reviewCount > 0 || item.photoCount > 0 ? "manual-review" : "hide-generic";
    console.log(formatItemLine(item, action));
  }

  const { hide, rename, manual } = planHideAndRename(allGroups);

  const genericHide = genericCandidates.filter(
    (item) => item.reviewCount === 0 && item.photoCount === 0
  );

  const hidePlan = [...hide];
  const hideIds = new Set(hidePlan.map((h) => h.item.id));
  for (const item of genericHide) {
    if (!hideIds.has(item.id)) {
      hidePlan.push({
        item,
        keep: item,
        group: {
          kind: "curated",
          key: "generic",
          treatAsDuplicate: false,
          members: [item]
        }
      });
    }
  }

  console.log("\n── Summary ─────────────────────────────────────────────────────────");
  console.log(`Duplicate groups (2+ ACTIVE): ${allGroups.length}`);
  console.log(`Curated groups with matches: ${curatedGroups.length}`);
  console.log(`Generic / vague ACTIVE rows: ${genericCandidates.length}`);
  console.log(`${dryRun ? "Would hide" : "Hiding"}: ${hidePlan.length} row(s)`);
  console.log(`${dryRun ? "Would rename" : "Renaming"}: ${rename.length} row(s)`);
  console.log(`Groups needing manual review: ${manual.length}`);

  if (hidePlan.length > 0) {
    console.log("\n── Safe hide plan (no reviews/photos) ──────────────────────────────");
    for (const { item, keep, group } of hidePlan) {
      const ctx =
        group.key === "generic"
          ? "generic/non-reviewable"
          : `keep "${keep.name}" (${keep.slug}) [${group.kind}:${group.key}]`;
      console.log(`  HIDE "${item.name}" (${item.slug}) — ${ctx}`);
    }
  }

  if (rename.length > 0) {
    console.log("\n── Rename plan ─────────────────────────────────────────────────────");
    for (const { item, to, group } of rename) {
      console.log(
        `  RENAME "${item.name}" → "${to}" (${item.slug}) [${group.kind}:${group.key}]`
      );
    }
  }

  if (manual.length > 0) {
    console.log("\n── Manual review (reviews/photos on duplicate rows) ────────────────");
    for (const group of manual) {
      console.log(`  ${group.label ?? group.key}:`);
      for (const member of group.members) {
        if (member.reviewCount > 0 || member.photoCount > 0) {
          console.log(
            `    · "${member.name}" (${member.slug}) reviews=${member.reviewCount} photos=${member.photoCount}`
          );
        }
      }
    }
  }

  const manualGeneric = genericCandidates.filter(
    (i) => i.reviewCount > 0 || i.photoCount > 0
  );
  if (manualGeneric.length > 0) {
    console.log("\n── Manual review (generic rows with engagement) ────────────────────");
    for (const item of manualGeneric) {
      console.log(
        `  · "${item.name}" (${item.slug}) reviews=${item.reviewCount} photos=${item.photoCount}`
      );
    }
  }

  console.log("\n── Importer notes (no refactor in this pass) ───────────────────────");
  console.log(
    "  · Menu import uses category Food only; duplicates come from MLB seed + venue-menu import overlap."
  );
  console.log(
    "  · Consider fuzzyMenuNameMatch guard in apply.ts for target-field, and normalize Tony O apostrophe on vendors."
  );
  console.log(
    "  · Official menu names live in lib/venue-menu-import/target-field.ts — prefer those as canonical display names."
  );

  if (dryRun) {
    console.log("\nRun apply: npx tsx scripts/audit-target-field-menu-cleanup.ts --apply");
    return;
  }

  for (const { item } of hidePlan) {
    await prisma.foodItem.update({
      where: { id: item.id },
      data: { status: EntityStatus.HIDDEN }
    });
  }

  for (const { item, to } of rename) {
    await prisma.foodItem.update({
      where: { id: item.id },
      data: { name: to }
    });
  }

  console.log(`\nDone. ${hidePlan.length} hidden, ${rename.length} renamed.`);
  console.log(`Projected ACTIVE count: ~${active.length - hidePlan.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
