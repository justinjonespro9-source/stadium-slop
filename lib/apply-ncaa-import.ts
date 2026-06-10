/**
 * Idempotent NCAA venue + menu import — merges into shared pro venues when configured.
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
import { ncaaSkipReasonForItem, shouldSkipNcaaItem } from "./ncaa-import-filters";
import type { NcaaImportPayload, NcaaItemImportRow, NcaaVenueImportRow } from "./ncaa-import-shape";
import {
  NCAA_SHARED_VENUE_TEAMS,
  ncaaVenueMetaFromRow,
  resolveNcaaVenueSlug
} from "./ncaa-venue-registry";
import { resolveVenueTeams } from "./venue-teams";

export type NcaaImportStats = {
  venuesCreated: number;
  venuesUpdated: number;
  teamsAttached: number;
  vendorsCreated: number;
  vendorsUpdated: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  skippedByReason: Record<string, number>;
  byVenue: Record<string, { items: number; sport: string }>;
  bySport: Record<string, { venues: number; items: number }>;
};

export type NcaaImportPreview = {
  dryRun: boolean;
  stats: NcaaImportStats;
  venueSlugs: string[];
  totalItems: number;
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
    dessert: ItemCategory.SWEET,
    burger: ItemCategory.SAVORY,
    bbq: ItemCategory.SAVORY,
    sandwich: ItemCategory.SAVORY,
    pizza: ItemCategory.SAVORY,
    tacos: ItemCategory.SAVORY,
    chicken: ItemCategory.SAVORY,
    other: ItemCategory.OTHER
  };
  if (map[key]) return map[key]!;
  if (["beer", "cocktail", "wine", "seltzer"].some((w) => key.includes(w))) {
    return ItemCategory.ALCOHOLIC_BEVERAGE;
  }
  return ItemCategory.SAVORY;
}

function venueTypeFromRow(raw?: string): VenueType {
  const key = (raw ?? "COLLEGE_STADIUM").trim().toUpperCase();
  if (key === "ARENA") return VenueType.ARENA;
  if (key === "STADIUM") return VenueType.STADIUM;
  if (key === "COLLEGE_STADIUM") return VenueType.COLLEGE_STADIUM;
  return VenueType.COLLEGE_STADIUM;
}

function sharedTeamsForSlug(slug: string): string[] {
  return [...(NCAA_SHARED_VENUE_TEAMS[slug] ?? [])];
}

function buildItemTags(row: NcaaItemImportRow, sport: string): string[] {
  const tags = mergeUniqueStrings([], ["NCAA", sport, "Import", ...(row.tags ?? [])]);
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

function initStats(): NcaaImportStats {
  return {
    venuesCreated: 0,
    venuesUpdated: 0,
    teamsAttached: 0,
    vendorsCreated: 0,
    vendorsUpdated: 0,
    itemsCreated: 0,
    itemsUpdated: 0,
    itemsSkipped: 0,
    skippedByReason: {},
    byVenue: {},
    bySport: {}
  };
}

function bumpSkip(stats: NcaaImportStats, reason: string) {
  stats.itemsSkipped += 1;
  stats.skippedByReason[reason] = (stats.skippedByReason[reason] ?? 0) + 1;
}

function trackVenueItem(stats: NcaaImportStats, venueSlug: string, sport: string) {
  if (!stats.byVenue[venueSlug]) {
    stats.byVenue[venueSlug] = { items: 0, sport };
  }
  stats.byVenue[venueSlug]!.items += 1;

  if (!stats.bySport[sport]) {
    stats.bySport[sport] = { venues: 0, items: 0 };
  }
  stats.bySport[sport]!.items += 1;
}

function trackVenueCreated(stats: NcaaImportStats, sport: string) {
  if (!stats.bySport[sport]) {
    stats.bySport[sport] = { venues: 0, items: 0 };
  }
  stats.bySport[sport]!.venues += 1;
}

async function ensureVenue(
  prisma: PrismaClient,
  row: NcaaVenueImportRow,
  stats: NcaaImportStats,
  dryRun: boolean
): Promise<{ id: string; slug: string } | null> {
  const meta = ncaaVenueMetaFromRow(row);
  const slug = meta.slug;
  const sport = row.sport === "Multi-Sport" ? row.sport : row.sport;

  const existing = await prisma.venue.findUnique({ where: { slug } });

  const sharedTeams = sharedTeamsForSlug(slug);
  const allTeams = mergeUniqueBySlug([meta.team], sharedTeams);
  const resolvedTeams = resolveVenueTeams(slug, allTeams);

  if (existing) {
    stats.venuesUpdated += 1;
    stats.teamsAttached += countNewTeams(existing.teams, resolvedTeams);

    if (!dryRun) {
      const mergedLeagues = mergeUniqueStrings(existing.leagues, meta.leagues);
      const mergedSports = mergeUniqueStrings(existing.sports, meta.sports);
      const keepPrimary =
        existing.primarySport &&
        !meta.sports.includes(existing.primarySport) &&
        (existing.leagues.includes("NFL") ||
          existing.leagues.includes("MLB") ||
          existing.leagues.includes("NBA") ||
          existing.leagues.includes("NHL") ||
          existing.leagues.includes("MLS"));

      await prisma.venue.update({
        where: { id: existing.id },
        data: {
          leagues: mergedLeagues,
          teams: resolvedTeams,
          sports: mergedSports,
          primarySport: keepPrimary ? existing.primarySport : existing.primarySport ?? meta.primarySport,
          school: existing.school ?? meta.school,
          timeZone: existing.timeZone ?? meta.timeZone,
          ...(meta.latitude ? { latitude: meta.latitude } : {}),
          ...(meta.longitude ? { longitude: meta.longitude } : {}),
          reviewRadiusMeters: meta.reviewRadiusMeters,
          status: EntityStatus.ACTIVE
        }
      });
    }
    return { id: existing.id, slug };
  }

  stats.venuesCreated += 1;
  trackVenueCreated(stats, sport);

  if (dryRun) {
    return { id: `dry-run-${slug}`, slug };
  }

  const created = await prisma.venue.create({
    data: {
      slug,
      name: meta.name,
      city: meta.city,
      state: meta.state,
      country: meta.country,
      region: meta.region,
      leagues: meta.leagues,
      teams: resolvedTeams,
      sports: meta.sports,
      primarySport: meta.primarySport,
      school: meta.school,
      timeZone: meta.timeZone,
      recurringEvents: [],
      latitude: meta.latitude,
      longitude: meta.longitude,
      reviewRadiusMeters: meta.reviewRadiusMeters,
      venueType: venueTypeFromRow(row.venueType),
      status: EntityStatus.ACTIVE
    }
  });

  return { id: created.id, slug: created.slug };
}

export async function applyNcaaImport(
  prisma: PrismaClient,
  payload: NcaaImportPayload,
  options: { dryRun?: boolean } = {}
): Promise<NcaaImportPreview> {
  const dryRun = options.dryRun ?? false;
  const stats = initStats();

  const venueRowsBySlug = new Map<string, NcaaVenueImportRow>();
  for (const row of payload.venues) {
    const slug = resolveNcaaVenueSlug(row.slug, row.mergeIntoVenueSlug);
    venueRowsBySlug.set(slug, { ...row, slug });
  }

  const venueIds = new Map<string, string>();
  for (const row of venueRowsBySlug.values()) {
    const result = await ensureVenue(prisma, row, stats, dryRun);
    if (result) {
      venueIds.set(result.slug, result.id);
      if (!stats.byVenue[result.slug]) {
        stats.byVenue[result.slug] = { items: 0, sport: row.sport };
      }
    }
  }

  const sportByVenueSlug = new Map<string, string>();
  for (const row of venueRowsBySlug.values()) {
    sportByVenueSlug.set(resolveNcaaVenueSlug(row.slug, row.mergeIntoVenueSlug), row.sport);
  }

  for (const itemRow of payload.items) {
    const venueSlug = resolveNcaaVenueSlug(itemRow.venueSlug);
    const sport = sportByVenueSlug.get(venueSlug) ?? "Football";

    const skipReason = ncaaSkipReasonForItem(itemRow);
    if (skipReason) {
      bumpSkip(stats, skipReason);
      continue;
    }

    if (!venueIds.has(venueSlug) && !venueRowsBySlug.has(venueSlug)) {
      bumpSkip(stats, "unknown-venue");
      continue;
    }

    let venueId = venueIds.get(venueSlug);
    if (!venueId && !dryRun) {
      const venue = await prisma.venue.findUnique({ where: { slug: venueSlug } });
      if (!venue) {
        bumpSkip(stats, "unknown-venue");
        continue;
      }
      venueId = venue.id;
      venueIds.set(venueSlug, venueId);
    }
    if (!venueId && dryRun) {
      venueId = `dry-run-${venueSlug}`;
    }
    if (!venueId) {
      bumpSkip(stats, "unknown-venue");
      continue;
    }

    const vendorSlug = vendorSlugFromImport(itemRow.vendor, itemRow.stand_name);
    const itemSlug = foodItemSlugFromImport(itemRow.item_name, vendorSlug);
    const vendorName = vendorDisplayNameFromImport(itemRow.vendor, itemRow.stand_name);
    const section = itemRow.section?.trim() || "Concourse";
    const location = itemRow.stand_name?.trim()
      ? `${itemRow.stand_name.trim()}${itemRow.section?.trim() ? ` · ${itemRow.section.trim()}` : ""}`
      : itemRow.section?.trim() || "Concourse";

    if (!dryRun) {
      const existingVendor = await prisma.vendor.findUnique({
        where: { venueId_slug: { venueId, slug: vendorSlug } }
      });
      if (existingVendor) {
        stats.vendorsUpdated += 1;
      } else {
        stats.vendorsCreated += 1;
      }

      const vendor = await prisma.vendor.upsert({
        where: { venueId_slug: { venueId, slug: vendorSlug } },
        create: {
          venueId,
          slug: vendorSlug,
          name: vendorName,
          section,
          location,
          status: EntityStatus.ACTIVE
        },
        update: {
          name: vendorName,
          section,
          location,
          status: EntityStatus.ACTIVE
        }
      });

      const itemType = inferItemTypeFromImport(itemRow.category, itemRow.item_name);
      if (itemType === ItemType.ALCOHOLIC_DRINK || itemType === ItemType.NON_ALCOHOLIC_DRINK) {
        bumpSkip(stats, "alcohol");
        continue;
      }

      const category = itemCategoryFromString(itemRow.category);
      const tags = buildItemTags(itemRow, sport);
      const description =
        itemRow.description?.trim() ||
        `${itemRow.item_name.trim()} at ${venueSlug} (NCAA import).`;

      const existingItem = await prisma.foodItem.findUnique({
        where: { venueId_slug: { venueId, slug: itemSlug } }
      });
      if (existingItem) {
        stats.itemsUpdated += 1;
      } else {
        stats.itemsCreated += 1;
      }

      await prisma.foodItem.upsert({
        where: { venueId_slug: { venueId, slug: itemSlug } },
        create: {
          slug: itemSlug,
          name: itemRow.item_name.trim(),
          venueId,
          vendorId: vendor.id,
          itemType: ItemType.FOOD,
          category,
          customCategoryLabel: itemRow.category?.trim() || null,
          alcoholic: false,
          ageRestricted: false,
          location: section,
          sections: itemRow.section?.trim() ? [itemRow.section.trim()] : [],
          description,
          basePrice: itemRow.price ?? null,
          tags,
          seasonIntroduced: itemRow.season?.trim() || null,
          status: EntityStatus.ACTIVE
        },
        update: {
          name: itemRow.item_name.trim(),
          vendorId: vendor.id,
          category,
          customCategoryLabel: itemRow.category?.trim() || null,
          location: section,
          sections: itemRow.section?.trim() ? [itemRow.section.trim()] : [],
          description,
          basePrice: itemRow.price ?? null,
          tags,
          status: EntityStatus.ACTIVE
        }
      });
    } else {
      stats.vendorsCreated += 1;
      stats.itemsCreated += 1;
    }

    trackVenueItem(stats, venueSlug, sport);
  }

  const venueSlugs = [...venueRowsBySlug.keys()].sort();
  const totalItems = stats.itemsCreated + stats.itemsUpdated;

  return {
    dryRun,
    stats,
    venueSlugs,
    totalItems: dryRun ? stats.itemsCreated : totalItems
  };
}

export { shouldSkipNcaaItem };
