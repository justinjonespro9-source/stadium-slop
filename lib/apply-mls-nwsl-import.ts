/**
 * Idempotent MLS/NWSL import — merges into existing shared stadiums.
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
  vendorSlugFromImport
} from "./import-slugs";
import { inferItemTypeFromImport } from "./item-type-classification";
import type { MlsNwslDocxParseResult, MlsNwslDocxParseRow } from "./mls-nwsl-docx-parser";
import { MLS_NWSL_VENUE_SLUG_ALIASES } from "./mls-nwsl-venue-registry";
import { getMlsNwslVenueGeo } from "./mls-nwsl-venue-geo";
import {
  MLS_NWSL_EXISTING_VENUE_SLUGS,
  MLS_NWSL_SHARED_VENUE_TEAMS,
  venueMetaForSlug
} from "./mls-nwsl-venue-registry";
import { resolveVenueTeams } from "./venue-teams";

const DEFAULT_SEASON = "2026";

export type MlsNwslImportStats = {
  venuesCreated: number;
  venuesUpdated: number;
  teamsAttached: number;
  vendorsCreated: number;
  vendorsUpdated: number;
  itemsCreated: number;
  itemsUpdated: number;
  rowsSkipped: number;
  reviewRows: number;
};

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

function countNewTeams(before: string[], after: string[]): number {
  const beforeSlugs = new Set(before.map((t) => teamSlugFromImport(t)));
  return after.filter((t) => !beforeSlugs.has(teamSlugFromImport(t))).length;
}

function itemCategoryFromString(raw?: string): ItemCategory {
  const key = (raw ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, ItemCategory> = {
    snack: ItemCategory.SNACK,
    savory: ItemCategory.SAVORY,
    sweet: ItemCategory.SWEET,
    beverage: ItemCategory.BEVERAGE,
    headline_item: ItemCategory.SAVORY,
    local_partner: ItemCategory.SAVORY,
    drinks_social: ItemCategory.BEVERAGE,
    dietary_value: ItemCategory.OTHER,
    other: ItemCategory.OTHER
  };
  if (map[key]) return map[key]!;
  if (["beer", "cocktail", "wine", "seltzer"].some((w) => key.includes(w))) {
    return ItemCategory.ALCOHOLIC_BEVERAGE;
  }
  return ItemCategory.OTHER;
}

function canonicalImportVenueSlug(slug: string): string {
  return MLS_NWSL_VENUE_SLUG_ALIASES[slug] ?? slug;
}

function buildItemTags(row: MlsNwslDocxParseRow): string[] {
  const tags = mergeUniqueStrings(
    [],
    [row.league, "Import", "MLS-NWSL", ...(row.foodTags ?? [])]
  );
  if (row.season?.trim()) {
    tags.push(`import-season:${row.season.trim()}`);
  }
  return tags;
}

function sharedTeamsForSlug(slug: string): string[] {
  return [...(MLS_NWSL_SHARED_VENUE_TEAMS[slug] ?? [])];
}

async function ensureVenueFromBlock(
  prisma: PrismaClient,
  slug: string,
  teamNames: string[],
  leagues: string[],
  stats: MlsNwslImportStats
) {
  const meta = venueMetaForSlug(slug, slug);
  const geo = getMlsNwslVenueGeo(slug);
  const existing = await prisma.venue.findUnique({ where: { slug } });
  const allTeams = mergeUniqueBySlug(
    mergeUniqueBySlug(teamNames, sharedTeamsForSlug(slug)),
    existing?.teams ?? []
  );
  const resolvedTeams = resolveVenueTeams(slug, allTeams);
  const attached = countNewTeams(existing?.teams ?? [], resolvedTeams);
  stats.teamsAttached += attached;

  const country = geo?.country ?? meta.country ?? "USA";
  const lat = geo?.latitude ?? meta.latitude ?? 0;
  const lng = geo?.longitude ?? meta.longitude ?? 0;
  const reviewRadiusMeters = geo?.reviewRadiusMeters ?? meta.reviewRadiusMeters ?? 750;

  if (!existing) {
    stats.venuesCreated += 1;
    await prisma.venue.create({
      data: {
        slug,
        name: meta.name,
        city: geo?.city ?? meta.city,
        state: geo?.state ?? meta.state,
        country,
        region: "North America",
        leagues: mergeUniqueStrings([], leagues),
        teams: resolvedTeams,
        sports: ["Soccer"],
        primarySport: "Soccer",
        recurringEvents: [],
        latitude: lat,
        longitude: lng,
        reviewRadiusMeters,
        venueType: VenueType.STADIUM,
        status: EntityStatus.ACTIVE
      }
    });
    return;
  }

  stats.venuesUpdated += 1;
  const mergedLeagues = mergeUniqueStrings(existing.leagues, leagues);
  const mergedSports = mergeUniqueStrings(existing.sports, ["Soccer"]);
  const keepPrimary =
    existing.primarySport &&
    !["Soccer"].includes(existing.primarySport) &&
    (existing.leagues.includes("NFL") ||
      existing.leagues.includes("MLB") ||
      existing.leagues.includes("NBA") ||
      existing.leagues.includes("NHL"));

  await prisma.venue.update({
    where: { id: existing.id },
    data: {
      leagues: mergedLeagues,
      teams: resolvedTeams,
      sports: mergedSports,
      primarySport: keepPrimary ? existing.primarySport : existing.primarySport ?? "Soccer",
      ...(geo
        ? {
            city: geo.city,
            state: geo.state,
            country: geo.country,
            latitude: geo.latitude,
            longitude: geo.longitude,
            reviewRadiusMeters: geo.reviewRadiusMeters
          }
        : {
            ...(lat !== 0 && existing.latitude === 0 ? { latitude: lat } : {}),
            ...(lng !== 0 && existing.longitude === 0 ? { longitude: lng } : {})
          }),
      status: EntityStatus.ACTIVE
    }
  });

}

export async function applyMlsNwslImport(
  prisma: PrismaClient,
  parsed: MlsNwslDocxParseResult
): Promise<MlsNwslImportStats> {
  const stats: MlsNwslImportStats = {
    venuesCreated: 0,
    venuesUpdated: 0,
    teamsAttached: 0,
    vendorsCreated: 0,
    vendorsUpdated: 0,
    itemsCreated: 0,
    itemsUpdated: 0,
    rowsSkipped: 0,
    reviewRows: parsed.reviewRows.length
  };

  const venueTeamMap = new Map<string, { teams: string[]; leagues: string[] }>();

  for (const block of parsed.venueBlocks) {
    for (const slug of block.venueSlugs.map(canonicalImportVenueSlug)) {
      const entry = venueTeamMap.get(slug) ?? { teams: [], leagues: [] };
      for (const t of block.teams) {
        entry.teams = mergeUniqueBySlug(entry.teams, [t.name]);
        entry.leagues = mergeUniqueStrings(entry.leagues, [t.league]);
      }
      venueTeamMap.set(slug, entry);
    }
  }

  const venuesTouched = new Set<string>();

  for (const [slug, { teams, leagues }] of venueTeamMap) {
    await ensureVenueFromBlock(prisma, slug, teams, leagues, stats);
    venuesTouched.add(slug);
  }

  for (const row of parsed.rows) {
    if (!row.item_name?.trim()) {
      stats.rowsSkipped += 1;
      continue;
    }

    const venueSlug = canonicalImportVenueSlug(row.venue_slug);
    if (!venuesTouched.has(venueSlug)) {
      await ensureVenueFromBlock(prisma, venueSlug, [row.team], [row.league], stats);
      venuesTouched.add(venueSlug);
    }

    const venue = await prisma.venue.findUnique({ where: { slug: venueSlug } });
    if (!venue) {
      stats.rowsSkipped += 1;
      continue;
    }

    const vendorSlug = vendorSlugFromImport(row.vendor, row.stand_name);
    const itemSlug = foodItemSlugFromImport(row.item_name, vendorSlug);
    const vendorName = vendorDisplayNameFromImport(row.vendor, row.stand_name);
    const section = row.section?.trim() || "Concourse";
    const location = row.stand_name?.trim()
      ? `${row.stand_name.trim()}${row.section?.trim() ? ` · ${row.section.trim()}` : ""}`
      : section;

    const existingVendor = await prisma.vendor.findUnique({
      where: { venueId_slug: { venueId: venue.id, slug: vendorSlug } }
    });

    const vendor = await prisma.vendor.upsert({
      where: { venueId_slug: { venueId: venue.id, slug: vendorSlug } },
      create: {
        venueId: venue.id,
        slug: vendorSlug,
        name: vendorName,
        section,
        location,
        status: EntityStatus.ACTIVE
      },
      update: { name: vendorName, section, location, status: EntityStatus.ACTIVE }
    });

    if (existingVendor) stats.vendorsUpdated += 1;
    else stats.vendorsCreated += 1;

    const itemType = inferItemTypeFromImport(row.category, row.item_name);
    const category =
      itemType === ItemType.ALCOHOLIC_DRINK
        ? ItemCategory.ALCOHOLIC_BEVERAGE
        : itemType === ItemType.NON_ALCOHOLIC_DRINK
          ? ItemCategory.BEVERAGE
          : itemCategoryFromString(row.category);

    const existingItem = await prisma.foodItem.findUnique({
      where: { venueId_slug: { venueId: venue.id, slug: itemSlug } }
    });

    await prisma.foodItem.upsert({
      where: { venueId_slug: { venueId: venue.id, slug: itemSlug } },
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
        description:
          row.description?.trim() ||
          `${row.item_name.trim()} at ${row.venue} (${row.league} import).`,
        tags: buildItemTags(row),
        seasonIntroduced: row.season?.trim() || DEFAULT_SEASON,
        isNewThisSeason: true,
        status: EntityStatus.ACTIVE
      },
      update: {
        name: row.item_name.trim(),
        vendorId: vendor.id,
        itemType,
        category,
        location: section,
        description: row.description?.trim() || undefined,
        tags: buildItemTags(row),
        status: EntityStatus.ACTIVE
      }
    });

    if (existingItem) stats.itemsUpdated += 1;
    else stats.itemsCreated += 1;
  }

  return stats;
}
