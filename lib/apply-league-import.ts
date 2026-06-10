/**
 * Idempotent Prisma upsert for flat league import rows.
 * Used by `scripts/apply-league-import.ts` — not wired to seed (sample data unchanged).
 */

import {
  EntityStatus,
  ItemCategory,
  ItemType,
  PrismaClient,
  VenueType
} from "@prisma/client";

import {
  foodItemSlugFromImport,
  teamSlugFromImport,
  vendorDisplayNameFromImport,
  vendorSlugFromImport,
  venueSlugFromImport
} from "./import-slugs";
import { inferItemTypeFromImport } from "./item-type-classification";
import type { LeagueImportRow } from "./league-import-shape";
import { resolveVenueTeams } from "./venue-teams";

export type LeagueImportApplyResult = {
  venuesUpserted: number;
  vendorsUpserted: number;
  itemsUpserted: number;
  rowsSkipped: number;
};

const DEFAULT_LAT = 0;
const DEFAULT_LNG = 0;
const DEFAULT_REVIEW_RADIUS = 800;

function mergeUniqueBySlug(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((t) => teamSlugFromImport(t)));
  const out = [...existing];
  for (const name of incoming) {
    const key = teamSlugFromImport(name);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
  }
  return out;
}

function mergeUniqueStrings(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((s) => s.trim().toLowerCase()));
  const out = [...existing];
  for (const value of incoming) {
    const key = value.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(value.trim());
    }
  }
  return out;
}

function leagueToVenueType(league: string, sport?: string): VenueType {
  const key = league.trim().toLowerCase();
  const sportKey = (sport ?? "").trim().toLowerCase();
  if (
    key.includes("ncaa") ||
    key.includes("fbs") ||
    key.includes("fcs") ||
    key.includes("college")
  ) {
    return VenueType.COLLEGE_STADIUM;
  }
  if (key.includes("nba") || key.includes("nhl") || key.includes("mls")) {
    return VenueType.ARENA;
  }
  if (key.includes("nfl")) {
    return VenueType.STADIUM;
  }
  if (key.includes("mlb") || key.includes("baseball")) {
    return VenueType.BALLPARK;
  }
  if (sportKey.includes("basketball") && key.includes("college")) {
    return VenueType.COLLEGE_STADIUM;
  }
  return VenueType.STADIUM;
}

function itemCategoryFromString(raw?: string): ItemCategory {
  const key = (raw ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, ItemCategory> = {
    snack: ItemCategory.SNACK,
    savory: ItemCategory.SAVORY,
    sweet: ItemCategory.SWEET,
    beverage: ItemCategory.BEVERAGE,
    bbq: ItemCategory.SAVORY,
    seafood: ItemCategory.SAVORY,
    burger: ItemCategory.SAVORY,
    hot_dog: ItemCategory.SAVORY,
    pizza: ItemCategory.SAVORY,
    sandwich: ItemCategory.SAVORY,
    tacos: ItemCategory.SAVORY,
    chicken: ItemCategory.SAVORY,
    vegan: ItemCategory.SAVORY,
    gluten_free: ItemCategory.SAVORY,
    dessert: ItemCategory.SWEET,
    drink: ItemCategory.BEVERAGE,
    alcohol: ItemCategory.ALCOHOLIC_BEVERAGE,
    alcoholic: ItemCategory.ALCOHOLIC_BEVERAGE,
    other: ItemCategory.OTHER
  };
  if (map[key]) {
    return map[key]!;
  }
  if (["beer", "cocktail", "wine", "seltzer"].some((w) => key.includes(w))) {
    return ItemCategory.ALCOHOLIC_BEVERAGE;
  }
  if (key.includes("dessert") || key.includes("sweet")) {
    return ItemCategory.SWEET;
  }
  if (key.includes("snack")) {
    return ItemCategory.SNACK;
  }
  return ItemCategory.OTHER;
}

function buildItemTags(row: LeagueImportRow, league: string): string[] {
  const tags = mergeUniqueStrings([], [league.trim(), "Import"]);
  if (row.season?.trim()) {
    tags.push(`import-season:${row.season.trim()}`);
  }
  const url = row.source_url?.trim();
  if (url) {
    const clipped = url.length > 180 ? `${url.slice(0, 177)}...` : url;
    tags.push(`import-source:${clipped}`);
  }
  return tags;
}

function primarySportForLeague(league: string, sport?: string): string {
  if (sport?.trim()) {
    return sport.trim();
  }
  const key = league.trim().toLowerCase();
  if (key.includes("mlb")) {
    return "Baseball";
  }
  if (key.includes("nfl")) {
    return "Football";
  }
  if (key.includes("nba")) {
    return "Basketball";
  }
  if (key.includes("nhl")) {
    return "Hockey";
  }
  if (key.includes("mls")) {
    return "Soccer";
  }
  if (key.includes("ncaa")) {
    if (key.includes("basketball")) {
      return "Basketball";
    }
    if (key.includes("football")) {
      return "Football";
    }
    return "Football";
  }
  return league.trim();
}

function leaguesForRow(row: LeagueImportRow): string[] {
  const leagues = mergeUniqueStrings([], [row.league.trim()]);
  if (row.conference?.trim()) {
    leagues.push(row.conference.trim());
  }
  if (row.subdivision?.trim()) {
    leagues.push(row.subdivision.trim());
  }
  return leagues;
}

/**
 * Upsert venues → vendors → food items for each row.
 * Duplicate prevention: unique Venue.slug, Vendor (venueId, slug), FoodItem (venueId, slug).
 */
export async function applyLeagueImportRows(
  prisma: PrismaClient,
  rows: LeagueImportRow[]
): Promise<LeagueImportApplyResult> {
  let venuesUpserted = 0;
  let vendorsUpserted = 0;
  let itemsUpserted = 0;
  let rowsSkipped = 0;

  for (const row of rows) {
    if (!row.item_name?.trim()) {
      rowsSkipped += 1;
      continue;
    }

    const venueSlug = venueSlugFromImport(row.venue, row.venue_slug);
    const vendorSlug = vendorSlugFromImport(row.vendor, row.stand_name);
    const itemSlug = foodItemSlugFromImport(row.item_name, vendorSlug);

    const existingVenue = await prisma.venue.findUnique({
      where: { slug: venueSlug }
    });

    const lat =
      row.latitude ??
      (existingVenue && existingVenue.latitude !== 0 ? existingVenue.latitude : DEFAULT_LAT);
    const lng =
      row.longitude ??
      (existingVenue && existingVenue.longitude !== 0 ? existingVenue.longitude : DEFAULT_LNG);
    const reviewRadius =
      row.review_radius_meters ??
      existingVenue?.reviewRadiusMeters ??
      DEFAULT_REVIEW_RADIUS;
    const sport = primarySportForLeague(row.league, row.sport);
    const rowLeagues = leaguesForRow(row);

    const venue = await prisma.venue.upsert({
      where: { slug: venueSlug },
      create: {
        slug: venueSlug,
        name: row.venue.trim(),
        city: row.city.trim(),
        state: row.state.trim(),
        country: "USA",
        region: "North America",
        leagues: rowLeagues,
        teams: resolveVenueTeams(venueSlug, [row.team.trim()]),
        sports: [sport],
        primarySport: sport,
        school: row.school?.trim() || null,
        timeZone: row.timezone?.trim() || null,
        recurringEvents: [],
        surfaceType: null,
        latitude: lat,
        longitude: lng,
        reviewRadiusMeters: reviewRadius,
        venueType: leagueToVenueType(row.league, row.sport),
        status: EntityStatus.ACTIVE
      },
      update: {
        name: row.venue.trim(),
        city: row.city.trim(),
        state: row.state.trim(),
        leagues: mergeUniqueStrings(existingVenue?.leagues ?? [], rowLeagues),
        teams: resolveVenueTeams(
          venueSlug,
          mergeUniqueBySlug(existingVenue?.teams ?? [], [row.team.trim()])
        ),
        sports: mergeUniqueStrings(existingVenue?.sports ?? [], [sport]),
        primarySport: sport,
        ...(row.school?.trim() ? { school: row.school.trim() } : {}),
        ...(row.timezone?.trim() ? { timeZone: row.timezone.trim() } : {}),
        ...(row.latitude != null ? { latitude: row.latitude } : {}),
        ...(row.longitude != null ? { longitude: row.longitude } : {}),
        ...(row.review_radius_meters != null
          ? { reviewRadiusMeters: row.review_radius_meters }
          : {}),
        venueType: leagueToVenueType(row.league, row.sport),
        status: EntityStatus.ACTIVE
      }
    });
    venuesUpserted += 1;

    const vendorName = vendorDisplayNameFromImport(row.vendor, row.stand_name);
    const section = row.section?.trim() || "Concourse";
    const location = row.stand_name?.trim()
      ? `${row.stand_name.trim()}${row.section?.trim() ? ` · ${row.section.trim()}` : ""}`
      : row.section?.trim() || "Concourse";

    const vendor = await prisma.vendor.upsert({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: vendorSlug
        }
      },
      create: {
        venueId: venue.id,
        slug: vendorSlug,
        name: vendorName,
        section,
        location,
        lineIntel: null,
        status: EntityStatus.ACTIVE
      },
      update: {
        name: vendorName,
        section,
        location,
        status: EntityStatus.ACTIVE
      }
    });
    vendorsUpserted += 1;

    const itemType = inferItemTypeFromImport(row.category, row.item_name);
    const category =
      itemType === ItemType.ALCOHOLIC_DRINK
        ? ItemCategory.ALCOHOLIC_BEVERAGE
        : itemType === ItemType.NON_ALCOHOLIC_DRINK
          ? ItemCategory.BEVERAGE
          : itemCategoryFromString(row.category);

    const tags = buildItemTags(row, row.league);
    const description =
      row.description?.trim() ||
      `${row.item_name.trim()} at ${row.venue.trim()} (${row.league.trim()} import row).`;

    await prisma.foodItem.upsert({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: itemSlug
        }
      },
      create: {
        slug: itemSlug,
        name: row.item_name.trim(),
        venueId: venue.id,
        vendorId: vendor.id,
        itemType,
        category,
        customCategoryLabel: row.category?.trim() || null,
        alcoholic: itemType === ItemType.ALCOHOLIC_DRINK,
        ageRestricted: itemType === ItemType.ALCOHOLIC_DRINK,
        location: section,
        sections: row.section?.trim() ? [row.section.trim()] : [],
        description,
        basePrice: row.price ?? null,
        tags,
        seasonIntroduced: row.season?.trim() || null,
        isNewThisSeason: Boolean(row.season?.trim()),
        status: EntityStatus.ACTIVE
      },
      update: {
        name: row.item_name.trim(),
        vendorId: vendor.id,
        itemType,
        category,
        customCategoryLabel: row.category?.trim() || null,
        location: section,
        sections: row.section?.trim() ? [row.section.trim()] : [],
        description,
        basePrice: row.price ?? null,
        tags,
        seasonIntroduced: row.season?.trim() || undefined,
        status: EntityStatus.ACTIVE
      }
    });
    itemsUpserted += 1;
  }

  return {
    venuesUpserted,
    vendorsUpserted,
    itemsUpserted,
    rowsSkipped
  };
}
