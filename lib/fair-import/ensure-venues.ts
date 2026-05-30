import { EntityStatus, type PrismaClient, VenueType } from "@prisma/client";

import { fairGeoNeedsUpdate } from "@/lib/fair-venue-geo";

import type { FairVenueDefinition } from "./types";
import { FAIR_VENUE_DEFINITIONS } from "./venues";

export type EnsureFairVenueRow = {
  slug: string;
  action: "created" | "updated" | "unchanged" | "would-create" | "would-update";
};

export type EnsureFairVenuesSummary = {
  dryRun: boolean;
  rows: EnsureFairVenueRow[];
};

function venueData(def: FairVenueDefinition) {
  return {
    name: def.name,
    city: def.city,
    state: def.state,
    country: def.country,
    region: "North America",
    leagues: [] as string[],
    teams: [] as string[],
    sports: ["State fair"],
    primarySport: "State fair",
    recurringEvents: def.recurringEvents,
    latitude: def.latitude,
    longitude: def.longitude,
    reviewRadiusMeters: def.reviewRadiusMeters,
    venueType: VenueType.OTHER,
    status: EntityStatus.ACTIVE
  };
}

export async function ensureFairVenues(
  db: PrismaClient,
  options: { dryRun: boolean; slugs?: string[] }
): Promise<EnsureFairVenuesSummary> {
  const targets = options.slugs?.length
    ? FAIR_VENUE_DEFINITIONS.filter((v) => options.slugs!.includes(v.slug))
    : FAIR_VENUE_DEFINITIONS;

  const rows: EnsureFairVenueRow[] = [];

  for (const def of targets) {
    const existing = await db.venue.findFirst({
      where: { slug: { equals: def.slug, mode: "insensitive" } },
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        reviewRadiusMeters: true
      }
    });

    if (!existing) {
      rows.push({ slug: def.slug, action: options.dryRun ? "would-create" : "created" });
      if (!options.dryRun) {
        await db.venue.create({
          data: { slug: def.slug, ...venueData(def) }
        });
      }
      continue;
    }

    const needsUpdate = fairGeoNeedsUpdate({ ...existing, slug: def.slug });

    if (options.dryRun) {
      rows.push({
        slug: def.slug,
        action: needsUpdate ? "would-update" : "unchanged"
      });
      continue;
    }

    await db.venue.update({
      where: { id: existing.id },
      data: venueData(def)
    });
    rows.push({ slug: def.slug, action: needsUpdate ? "updated" : "unchanged" });
  }

  return { dryRun: options.dryRun, rows };
}
