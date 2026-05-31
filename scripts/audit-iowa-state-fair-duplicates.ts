/**
 * Iowa State Fair duplicate audit and optional HIDDEN cleanup.
 *
 *   npx tsx scripts/audit-iowa-state-fair-duplicates.ts --dry-run
 *   npx tsx scripts/audit-iowa-state-fair-duplicates.ts --apply
 */

import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  IOWA_FOOD_NAME_ALIASES,
  iowaVendorItemDedupeKey,
  normalizeIowaFoodDedupeKey,
  resolveIowaFoodCanonicalName
} from "../lib/fair-import/iowa-food-name-normalize";
import { normalizeMenuItemName } from "../lib/venue-menu-import/normalize";

const VENUE_SLUG = "iowa-state-fair";

type IowaItemRow = {
  id: string;
  slug: string;
  name: string;
  status: EntityStatus;
  tags: string[];
  isNewThisSeason: boolean;
  seasonIntroduced: string | null;
  description: string;
  vendor: { id: string; name: string; slug: string };
  reviewCount: number;
  photoCount: number;
};

type DuplicateGroupKind =
  | "exact-name"
  | "normalized-name"
  | "iowa-near-name"
  | "vendor-iowa-near";

type DuplicateGroup = {
  kind: DuplicateGroupKind;
  key: string;
  suggestedCanonical: string;
  members: IowaItemRow[];
};

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

function sourceTags(tags: string[]): string[] {
  return tags.filter((t) =>
    ["2025-preview", "core-catalog", "official-source", "prior-year-listing", "state-fair"].includes(
      t
    )
  );
}

function scoreCanonicalCandidate(item: IowaItemRow): number {
  let score = 0;
  const tags = item.tags.map((t) => t.toLowerCase());
  if (tags.includes("2025-preview")) score += 120;
  if (item.isNewThisSeason) score += 80;
  if (tags.includes("official-source")) score += 40;
  if (tags.includes("core-catalog")) score += 10;
  score += item.reviewCount * 10_000;
  score += item.photoCount * 5_000;

  const alias = IOWA_FOOD_NAME_ALIASES[normalizeIowaFoodDedupeKey(item.name)];
  if (alias && item.name.trim() === alias) score += 60;
  if (alias) score += 25;

  const name = item.name.trim();
  if (name.length >= 4 && name.length <= 48) score += 8;
  if (/^[A-Z][a-z]/.test(name)) score += 6;
  if (!/^\(\d+\)\s/.test(name)) score += 20;
  if (/\s{2,}/.test(name)) score -= 20;
  if (name === name.toUpperCase() && name.length > 6) score -= 15;
  if (/[\\/|]/.test(name)) score -= 25;

  return score;
}

function pickSuggestedCanonical(members: IowaItemRow[]): string {
  const sorted = [...members].sort((a, b) => scoreCanonicalCandidate(b) - scoreCanonicalCandidate(a));
  const winner = sorted[0];
  return resolveIowaFoodCanonicalName(winner.name);
}

function buildGroups(items: IowaItemRow[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];

  const addGroups = (
    kind: DuplicateGroupKind,
    map: Map<string, IowaItemRow[]>
  ) => {
    for (const [key, members] of map) {
      const active = members.filter((m) => m.status === EntityStatus.ACTIVE);
      if (active.length < 2) continue;
      groups.push({
        kind,
        key,
        suggestedCanonical: pickSuggestedCanonical(active),
        members: active
      });
    }
  };

  const exact = new Map<string, IowaItemRow[]>();
  const normalized = new Map<string, IowaItemRow[]>();
  const iowaNear = new Map<string, IowaItemRow[]>();
  const vendorIowaNear = new Map<string, IowaItemRow[]>();

  for (const item of items) {
    if (item.status !== EntityStatus.ACTIVE) continue;

    const exactKey = item.name.trim().toLowerCase();
    if (!exact.has(exactKey)) exact.set(exactKey, []);
    exact.get(exactKey)!.push(item);

    const normKey = normalizeMenuItemName(item.name);
    if (!normalized.has(normKey)) normalized.set(normKey, []);
    normalized.get(normKey)!.push(item);

    const nearKey = normalizeIowaFoodDedupeKey(item.name);
    if (!iowaNear.has(nearKey)) iowaNear.set(nearKey, []);
    iowaNear.get(nearKey)!.push(item);

    const vendorKey = iowaVendorItemDedupeKey(item.vendor.name, item.name);
    if (!vendorIowaNear.has(vendorKey)) vendorIowaNear.set(vendorKey, []);
    vendorIowaNear.get(vendorKey)!.push(item);
  }

  addGroups("exact-name", exact);
  addGroups("normalized-name", normalized);
  addGroups("iowa-near-name", iowaNear);
  addGroups("vendor-iowa-near", vendorIowaNear);

  return groups;
}

function groupId(group: DuplicateGroup): string {
  return `${group.kind}:${group.key}`;
}

function chooseHideCandidates(group: DuplicateGroup): {
  keep: IowaItemRow;
  hide: IowaItemRow[];
  blocked: IowaItemRow[];
} {
  const sorted = [...group.members].sort(
    (a, b) => scoreCanonicalCandidate(b) - scoreCanonicalCandidate(a)
  );
  const keep = sorted[0];
  const hide: IowaItemRow[] = [];
  const blocked: IowaItemRow[] = [];

  for (const item of sorted.slice(1)) {
    if (item.reviewCount > 0 || item.photoCount > 0) {
      blocked.push(item);
      continue;
    }
    hide.push(item);
  }

  return { keep, hide, blocked };
}

function autoHideEligible(group: DuplicateGroup): boolean {
  if (group.kind === "vendor-iowa-near" || group.kind === "exact-name" || group.kind === "normalized-name") {
    return true;
  }
  if (group.kind === "iowa-near-name") {
    const vendors = new Set(group.members.map((m) => m.vendor.id));
    return vendors.size === 1;
  }
  return false;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  const venue = await prisma.venue.findFirst({
    where: { slug: { equals: VENUE_SLUG, mode: "insensitive" } }
  });
  if (!venue) {
    console.error(`Venue not found: ${VENUE_SLUG}`);
    process.exit(1);
  }

  const rows = await prisma.foodItem.findMany({
    where: { venueId: venue.id },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      tags: true,
      isNewThisSeason: true,
      seasonIntroduced: true,
      description: true,
      vendor: { select: { id: true, name: true, slug: true } },
      _count: {
        select: {
          reviews: { where: { status: EntityStatus.ACTIVE, isTestReview: false } },
          photos: { where: { status: EntityStatus.ACTIVE } }
        }
      }
    },
    orderBy: [{ name: "asc" }, { slug: "asc" }]
  });

  const items: IowaItemRow[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    tags: row.tags,
    isNewThisSeason: row.isNewThisSeason,
    seasonIntroduced: row.seasonIntroduced,
    description: row.description,
    vendor: row.vendor,
    reviewCount: row._count.reviews,
    photoCount: row._count.photos
  }));

  const active = items.filter((i) => i.status === EntityStatus.ACTIVE);
  const groups = buildGroups(items);
  const uniqueGroups = new Map<string, DuplicateGroup>();
  for (const g of groups) {
    const id = groupId(g);
    const existing = uniqueGroups.get(id);
    if (!existing || g.members.length > existing.members.length) {
      uniqueGroups.set(id, g);
    }
  }

  const hidePlan = new Map<string, { group: DuplicateGroup; keep: IowaItemRow; item: IowaItemRow }>();
  const manualGroups: DuplicateGroup[] = [];

  console.log(dryRun ? "DRY RUN — Iowa State Fair duplicate audit\n" : "APPLY — hiding Iowa duplicate rows\n");
  console.log(`Venue: ${venue.name} (${VENUE_SLUG})`);
  console.log(`Total rows: ${items.length}`);
  console.log(`ACTIVE: ${active.length}`);
  console.log(`HIDDEN: ${items.filter((i) => i.status === EntityStatus.HIDDEN).length}\n`);

  const sortedGroups = [...uniqueGroups.values()].sort(
    (a, b) => b.members.length - a.members.length || a.key.localeCompare(b.key)
  );

  let groupIndex = 0;
  for (const group of sortedGroups) {
    groupIndex += 1;
    const { keep, hide, blocked } = chooseHideCandidates(group);
    const eligible = autoHideEligible(group);

    console.log(`── Group ${groupIndex}: ${group.kind} ──`);
    console.log(`Key: ${group.key}`);
    console.log(`Suggested canonical: ${group.suggestedCanonical}`);
    console.log(`Auto-hide eligible: ${eligible ? "yes" : "manual review"}`);

    for (const member of group.members) {
      const role =
        member.id === keep.id
          ? "KEEP"
          : hide.some((h) => h.id === member.id)
            ? dryRun
              ? "WOULD HIDE"
              : "HIDE"
            : "BLOCKED (reviews/photos)";
      console.log(
        `  [${role}] "${member.name}" (${member.slug}) · vendor=${member.vendor.name} · reviews=${member.reviewCount} · photos=${member.photoCount} · tags=${sourceTags(member.tags).join(", ") || "(none)"}`
      );
    }

    if (blocked.length > 0) {
      manualGroups.push(group);
    }

    if (!eligible || hide.length === 0) {
      console.log("");
      continue;
    }

    for (const item of hide) {
      hidePlan.set(item.id, { group, keep, item });
    }
    console.log("");
  }

  const toHide = [...hidePlan.values()];
  const projectedActive = active.length - toHide.length;

  console.log("── Summary ─────────────────────────────────────────");
  console.log(`Duplicate groups (2+ ACTIVE): ${sortedGroups.length}`);
  console.log(`Groups with blocked members (reviews/photos): ${manualGroups.length}`);
  console.log(`${dryRun ? "Would hide" : "Hiding"}: ${toHide.length} ACTIVE row(s)`);
  console.log(`Projected ACTIVE after cleanup: ${projectedActive}`);

  if (toHide.length > 0) {
    console.log("\n── Planned hides (deduped) ──");
    for (const { group, keep, item } of toHide) {
      console.log(
        `  "${item.name}" (${item.slug}) → HIDDEN; keep "${keep.name}" (${keep.slug}) [${group.kind}]`
      );
    }
  }

  if (dryRun) {
    if (toHide.length === 0) {
      console.log("\nNo safe duplicate ACTIVE rows to hide.");
    } else {
      console.log("\nRun: npx tsx scripts/audit-iowa-state-fair-duplicates.ts --apply");
    }
    return;
  }

  for (const { item } of toHide) {
    await prisma.foodItem.update({
      where: { id: item.id },
      data: { status: EntityStatus.HIDDEN }
    });
  }
  console.log(`\nDone. ${toHide.length} row(s) set to HIDDEN.`);
  console.log(`ACTIVE count should now be ~${projectedActive}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
