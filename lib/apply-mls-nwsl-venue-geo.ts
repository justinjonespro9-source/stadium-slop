import type { PrismaClient } from "@prisma/client";

import {
  coordinatesMatchRegistry,
  getMlsNwslVenueGeo,
  isValidVenueCoordinate,
  MLS_NWSL_VENUE_SLUGS
} from "@/lib/mls-nwsl-venue-geo";
import { getVenueTimeZone } from "@/lib/venue-timezone";

export type MlsNwslVenueGeoAuditRow = {
  slug: string;
  name: string;
  inRegistry: boolean;
  inDatabase: boolean;
  latitude: number | null;
  longitude: number | null;
  reviewRadiusMeters: number | null;
  timeZone: string;
  expectedTimeZone: string;
  venueClass: string | null;
  issues: string[];
};

export type MlsNwslVenueGeoAudit = {
  rows: MlsNwslVenueGeoAuditRow[];
  totalMlsNwslInDb: number;
  withValidCoords: number;
  matchingRegistry: number;
  withIssues: number;
};

function auditRowFromVenue(venue: {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  state: string | null;
  country: string | null;
}): MlsNwslVenueGeoAuditRow {
  const geo = getMlsNwslVenueGeo(venue.slug);
  const issues: string[] = [];
  const expectedTimeZone = geo?.timeZone ?? getVenueTimeZone(venue);
  const timeZone = getVenueTimeZone(venue);

  if (!geo) {
    issues.push("missing-registry");
  }

  if (!isValidVenueCoordinate(venue.latitude, venue.longitude)) {
    issues.push("invalid-coords");
  } else if (geo && !coordinatesMatchRegistry(venue.slug, venue.latitude, venue.longitude)) {
    issues.push("coords-drift");
  }

  if (!Number.isFinite(venue.reviewRadiusMeters) || venue.reviewRadiusMeters <= 0) {
    issues.push("invalid-radius");
  } else if (geo && venue.reviewRadiusMeters !== geo.reviewRadiusMeters) {
    issues.push("radius-drift");
  }

  if (geo && timeZone !== geo.timeZone) {
    issues.push("timezone-mismatch");
  }

  if (venue.state === "TBD" || !venue.state?.trim()) {
    issues.push("state-tbd");
  }

  return {
    slug: venue.slug,
    name: venue.name,
    inRegistry: Boolean(geo),
    inDatabase: true,
    latitude: venue.latitude,
    longitude: venue.longitude,
    reviewRadiusMeters: venue.reviewRadiusMeters,
    timeZone,
    expectedTimeZone,
    venueClass: geo?.venueClass ?? null,
    issues
  };
}

export async function auditMlsNwslVenueGeo(
  prisma: PrismaClient
): Promise<MlsNwslVenueGeoAudit> {
  const dbVenues = await prisma.venue.findMany({
    where: { OR: [{ leagues: { has: "MLS" } }, { leagues: { has: "NWSL" } }] },
    orderBy: { slug: "asc" },
    select: {
      slug: true,
      name: true,
      latitude: true,
      longitude: true,
      reviewRadiusMeters: true,
      state: true,
      country: true
    }
  });

  const dbBySlug = new Map(dbVenues.map((v) => [v.slug, v]));
  const rows: MlsNwslVenueGeoAuditRow[] = [];

  for (const slug of MLS_NWSL_VENUE_SLUGS) {
    const geo = getMlsNwslVenueGeo(slug)!;
    const venue = dbBySlug.get(slug);
    if (venue) {
      rows.push(auditRowFromVenue(venue));
      continue;
    }
    rows.push({
      slug,
      name: geo.name,
      inRegistry: true,
      inDatabase: false,
      latitude: null,
      longitude: null,
      reviewRadiusMeters: null,
      timeZone: geo.timeZone,
      expectedTimeZone: geo.timeZone,
      venueClass: geo.venueClass,
      issues: ["missing-in-database"]
    });
  }

  for (const venue of dbVenues) {
    if (MLS_NWSL_VENUE_SLUGS.includes(venue.slug)) continue;
    rows.push({
      slug: venue.slug,
      name: venue.name,
      inRegistry: false,
      inDatabase: true,
      latitude: venue.latitude,
      longitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      timeZone: getVenueTimeZone(venue),
      expectedTimeZone: "—",
      venueClass: null,
      issues: ["not-in-mls-nwsl-registry"]
    });
  }

  rows.sort((a, b) => a.slug.localeCompare(b.slug));

  const registryRows = rows.filter((r) => r.inRegistry && r.inDatabase);
  return {
    rows,
    totalMlsNwslInDb: dbVenues.length,
    withValidCoords: registryRows.filter(
      (r) => r.latitude != null && r.longitude != null && isValidVenueCoordinate(r.latitude, r.longitude)
    ).length,
    matchingRegistry: registryRows.filter(
      (r) =>
        r.latitude != null &&
        r.longitude != null &&
        coordinatesMatchRegistry(r.slug, r.latitude, r.longitude) &&
        r.issues.length === 0
    ).length,
    withIssues: rows.filter((r) => r.issues.length > 0).length
  };
}

export type ApplyMlsNwslVenueGeoStats = {
  updated: number;
  skipped: number;
  notInDb: string[];
};

export async function applyMlsNwslVenueGeo(
  prisma: PrismaClient,
  apply: boolean
): Promise<ApplyMlsNwslVenueGeoStats> {
  const stats: ApplyMlsNwslVenueGeoStats = {
    updated: 0,
    skipped: 0,
    notInDb: []
  };

  for (const slug of MLS_NWSL_VENUE_SLUGS) {
    const geo = getMlsNwslVenueGeo(slug)!;
    const existing = await prisma.venue.findUnique({ where: { slug } });

    if (!existing) {
      stats.notInDb.push(slug);
      continue;
    }

    const data = {
      city: geo.city,
      state: geo.state,
      country: geo.country,
      latitude: geo.latitude,
      longitude: geo.longitude,
      reviewRadiusMeters: geo.reviewRadiusMeters
    };

    const needsUpdate =
      existing.latitude !== geo.latitude ||
      existing.longitude !== geo.longitude ||
      existing.reviewRadiusMeters !== geo.reviewRadiusMeters ||
      existing.state !== geo.state ||
      existing.city !== geo.city ||
      existing.country !== geo.country;

    if (!needsUpdate) {
      stats.skipped += 1;
      continue;
    }

    if (apply) {
      await prisma.venue.update({ where: { slug }, data });
    }
    stats.updated += 1;
  }

  return stats;
}
