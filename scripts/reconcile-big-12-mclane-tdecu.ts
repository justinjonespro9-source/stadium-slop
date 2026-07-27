#!/usr/bin/env npx tsx
/**
 * Big 12 McLane / TDECU menu reconciliation (no deletes).
 *
 * - McLane: merge confidence tags from the current parser onto existing ACTIVE rows
 * - TDECU: set inferred dish SKUs to HIDDEN (preserve history); venue is menu-pending
 *
 *   npx tsx scripts/reconcile-big-12-mclane-tdecu.ts --apply
 */
import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  parseMclaneStadiumMenu,
  TDECU_ARCHIVAL_INFERRED_ITEMS
} from "../lib/venue-menu-import/big-12-football-menus";
import { normalizeMenuItemName } from "../lib/venue-menu-import/normalize";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function reconcileMclane(apply: boolean) {
  const venue = await prisma.venue.findFirst({
    where: { slug: "mclane-stadium" },
    select: { id: true, name: true }
  });
  if (!venue) {
    console.log("  McLane venue missing");
    return;
  }

  const parsed = await parseMclaneStadiumMenu();
  const byNorm = new Map(
    parsed.items.map((item) => [normalizeMenuItemName(item.name), item])
  );

  const existing = await prisma.foodItem.findMany({
    where: { venueId: venue.id, status: EntityStatus.ACTIVE },
    select: { id: true, name: true, tags: true, lastConfirmed: true }
  });

  let updated = 0;
  for (const row of existing) {
    const source = byNorm.get(normalizeMenuItemName(row.name));
    if (!source) continue;
    const nextTags = [...new Set([...(row.tags ?? []), ...(source.importTags ?? [])])];
    const tagsChanged =
      nextTags.length !== (row.tags ?? []).length ||
      nextTags.some((t) => !(row.tags ?? []).includes(t));
    const lastConfirmed = (source.importTags ?? []).includes("fan-first-2026")
      ? "2026-02-18"
      : (row.lastConfirmed ?? "2025-08-28");
    const lastChanged = lastConfirmed !== row.lastConfirmed;
    if (!tagsChanged && !lastChanged) continue;
    console.log(
      `  McLane retag "${row.name}" → +${nextTags.filter((t) => !(row.tags ?? []).includes(t)).join(",") || "lastConfirmed"}`
    );
    if (apply) {
      await prisma.foodItem.update({
        where: { id: row.id },
        data: { tags: nextTags, lastConfirmed }
      });
    }
    updated++;
  }
  console.log(`  McLane retags: ${updated}${apply ? "" : " (dry-run)"}`);
}

async function hideTdecu(apply: boolean) {
  const venue = await prisma.venue.findFirst({
    where: { slug: "tdecu-stadium" },
    select: { id: true }
  });
  if (!venue) {
    console.log("  TDECU venue missing");
    return;
  }

  const items = await prisma.foodItem.findMany({
    where: {
      venueId: venue.id,
      status: EntityStatus.ACTIVE,
      name: { in: [...TDECU_ARCHIVAL_INFERRED_ITEMS] }
    },
    select: { id: true, name: true, status: true, tags: true }
  });

  for (const item of items) {
    const nextTags = [
      ...new Set([
        ...(item.tags ?? []),
        "inferred-sku",
        "hidden-unverified-2026",
        "menu-pending-vendor-only"
      ])
    ];
    console.log(`  TDECU hide "${item.name}"`);
    if (apply) {
      await prisma.foodItem.update({
        where: { id: item.id },
        data: { status: EntityStatus.HIDDEN, tags: nextTags }
      });
    }
  }
  console.log(`  TDECU hidden: ${items.length}${apply ? "" : " (dry-run)"}`);
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n  Big 12 McLane/TDECU reconcile · ${apply ? "APPLY" : "DRY RUN"}\n`);
  await reconcileMclane(apply);
  await hideTdecu(apply);
  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
