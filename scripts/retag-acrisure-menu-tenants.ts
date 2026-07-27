/**
 * Apply durable tenant-scope tags on Acrisure Stadium menu rows.
 * Does NOT delete items or reviews.
 *
 *   npx tsx scripts/retag-acrisure-menu-tenants.ts
 *   npx tsx scripts/retag-acrisure-menu-tenants.ts --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { scopeTagsForAcrisureItem } from "../lib/shared-venue-menu-scope";

function mergeTags(existing: string[], extra: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of [...existing, ...extra]) {
    const t = raw.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL!)
  });

  try {
    const venue = await prisma.venue.findFirst({
      where: { slug: "acrisure-stadium" },
      select: { id: true, slug: true }
    });
    if (!venue) {
      throw new Error("acrisure-stadium not found");
    }

    const items = await prisma.foodItem.findMany({
      where: { venueId: venue.id },
      select: { id: true, slug: true, name: true, tags: true, status: true }
    });

    let changed = 0;
    for (const item of items) {
      const extra = scopeTagsForAcrisureItem(item.slug);
      const next = mergeTags(item.tags, extra);
      const same =
        next.length === item.tags.length &&
        next.every((t, i) => t === item.tags[i]);
      if (same) continue;
      changed += 1;
      console.log(
        `${apply ? "APPLY" : "DRY"} ${item.status} ${item.slug} → +[${extra.join(", ")}]`
      );
      if (apply) {
        await prisma.foodItem.update({
          where: { id: item.id },
          data: { tags: next }
        });
      }
    }
    console.log(
      `\n${apply ? "Updated" : "Would update"} ${changed} / ${items.length} Acrisure items`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
