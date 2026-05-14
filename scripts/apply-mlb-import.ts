/**
 * Upsert MLB-shaped JSON into Postgres (venues → vendors → optional items).
 * Usage: npx tsx scripts/apply-mlb-import.ts path/to/import.json
 * Requires DATABASE_URL and migrations applied.
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

import {
  EntityStatus,
  ItemCategory,
  ItemType,
  VenueType
} from "@prisma/client";

import { prisma } from "../lib/prisma";
import { parseMlbImportPayload } from "../lib/mlb-import-shape";

const VENUE_TYPES = new Set<string>(Object.values(VenueType));

function venueTypeOrDefault(raw?: string): VenueType {
  if (raw && VENUE_TYPES.has(raw)) {
    return raw as VenueType;
  }
  return VenueType.BALLPARK;
}

function itemCategoryFromString(raw?: string): ItemCategory {
  const key = (raw ?? "").toLowerCase();
  const map: Record<string, ItemCategory> = {
    snack: ItemCategory.SNACK,
    savory: ItemCategory.SAVORY,
    sweet: ItemCategory.SWEET,
    beverage: ItemCategory.BEVERAGE,
    bbq: ItemCategory.SAVORY,
    seafood: ItemCategory.SAVORY
  };
  return map[key] ?? ItemCategory.OTHER;
}

function itemTypeFromString(raw?: string): ItemType {
  if (raw === "Alcoholic Drink") {
    return ItemType.ALCOHOLIC_DRINK;
  }
  if (raw === "Non-Alcoholic Drink") {
    return ItemType.NON_ALCOHOLIC_DRINK;
  }
  return ItemType.FOOD;
}

async function main() {
  const filePath = resolve(process.argv[2] ?? "data/mlb/mlb-import.example.json");
  const raw = JSON.parse(readFileSync(filePath, "utf8"));
  const data = parseMlbImportPayload(raw);

  for (const v of data.venues) {
    const vt = venueTypeOrDefault(v.venueType);
    await prisma.venue.upsert({
      where: { slug: v.slug },
      create: {
        slug: v.slug,
        name: v.name,
        city: v.city,
        state: v.state,
        country: v.country ?? "USA",
        region: v.region ?? "North America",
        leagues: [v.league ?? "MLB"],
        teams: [v.team],
        sports: [v.primarySport ?? "Baseball"],
        primarySport: v.primarySport ?? "Baseball",
        recurringEvents: v.recurringEvents ?? [],
        surfaceType: null,
        latitude: v.latitude,
        longitude: v.longitude,
        reviewRadiusMeters: v.reviewRadiusMeters ?? 800,
        venueType: vt,
        status: EntityStatus.ACTIVE
      },
      update: {
        name: v.name,
        city: v.city,
        state: v.state,
        country: v.country ?? "USA",
        region: v.region ?? "North America",
        leagues: [v.league ?? "MLB"],
        teams: [v.team],
        sports: [v.primarySport ?? "Baseball"],
        primarySport: v.primarySport ?? "Baseball",
        recurringEvents: v.recurringEvents ?? [],
        latitude: v.latitude,
        longitude: v.longitude,
        reviewRadiusMeters: v.reviewRadiusMeters ?? 800,
        venueType: vt,
        status: EntityStatus.ACTIVE
      }
    });
  }

  for (const row of data.vendors) {
    const venue = await prisma.venue.findUniqueOrThrow({
      where: { slug: row.venueSlug }
    });
    await prisma.vendor.upsert({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: row.slug
        }
      },
      update: {
        name: row.name,
        section: row.section,
        location: row.location,
        lineIntel: row.lineIntel ?? null,
        status: EntityStatus.ACTIVE
      },
      create: {
        venueId: venue.id,
        slug: row.slug,
        name: row.name,
        section: row.section,
        location: row.location,
        lineIntel: row.lineIntel ?? null,
        status: EntityStatus.ACTIVE
      }
    });
  }

  for (const row of data.items ?? []) {
    const venue = await prisma.venue.findUniqueOrThrow({
      where: { slug: row.venueSlug }
    });
    const vendor = await prisma.vendor.findUniqueOrThrow({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: row.vendorSlug
        }
      }
    });
    const category = itemCategoryFromString(row.category);
    const itemType = itemTypeFromString(row.itemType);
    await prisma.foodItem.upsert({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: row.slug
        }
      },
      update: {
        name: row.name,
        vendorId: vendor.id,
        itemType,
        category,
        customCategoryLabel: row.category ?? "Imported",
        location: row.location ?? "Concourse",
        sections: [],
        description: row.description ?? "Imported MLB menu row.",
        basePrice: row.price ?? null,
        tags: row.tags ?? ["MLB", "Import"],
        status: EntityStatus.ACTIVE
      },
      create: {
        slug: row.slug,
        name: row.name,
        venueId: venue.id,
        vendorId: vendor.id,
        itemType,
        category,
        customCategoryLabel: row.category ?? "Imported",
        alcoholic: false,
        ageRestricted: false,
        location: row.location ?? "Concourse",
        sections: [],
        description: row.description ?? "Imported MLB menu row.",
        basePrice: row.price ?? null,
        tags: row.tags ?? ["MLB", "Import"],
        status: EntityStatus.ACTIVE
      }
    });
  }

  console.log(
    `MLB import OK: ${data.venues.length} venues, ${data.vendors.length} vendors, ${data.items?.length ?? 0} items (from ${filePath})`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
