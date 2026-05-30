import type { PrismaClient } from "@prisma/client";

import {
  fairCoordinatesMatchRegistry,
  getFairVenueGeoProfile
} from "@/lib/fair-venue-geo";
import { FAIR_VENUE_SLUGS } from "@/lib/fair-import/venues";
import { isValidVenueCoordinate } from "@/lib/mls-nwsl-venue-geo";
import { getVenueTimeZone } from "@/lib/venue-timezone";

export type FairVenueGeoAuditRow = {
  slug: string;
  name: string;
  inRegistry: boolean;
  inDatabase: boolean;
  latitude: number | null;
  longitude: number | null;
  reviewRadiusMeters: number | null;
  timeZone: string;
  expectedTimeZone: string;
  issues: string[];
};

export type FairVenueGeoAudit = {
  rows: FairVenueGeoAuditRow[];
  inDatabase: number;
  withValidCoords: number;
  fullyAligned: number;
  withIssues: number;
};

function auditRowFromVenue(venue: {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  state: string;
  country: string;
}): FairVenueGeoAuditRow {
  const profile = getFairVenueGeoProfile(venue.slug);
  const issues: string[] = [];
  const expectedTimeZone = profile?.timeZone ?? "—";
  const timeZone = getVenueTimeZone(venue);

  if (!profile) {
    issues.push("missing-registry");
  }

  if (!isValidVenueCoordinate(venue.latitude, venue.longitude)) {
    issues.push("invalid-coords");
  } else if (profile && !fairCoordinatesMatchRegistry(venue.slug, venue.latitude, venue.longitude)) {
    issues.push("coords-drift");
  }

  if (!Number.isFinite(venue.reviewRadiusMeters) || venue.reviewRadiusMeters <= 0) {
    issues.push("invalid-radius");
  } else if (profile && venue.reviewRadiusMeters !== profile.reviewRadiusMeters) {
    issues.push("radius-drift");
  }

  if (profile && timeZone !== profile.timeZone) {
    issues.push("timezone-mismatch");
  }

  return {
    slug: venue.slug,
    name: venue.name,
    inRegistry: Boolean(profile),
    inDatabase: true,
    latitude: venue.latitude,
    longitude: venue.longitude,
    reviewRadiusMeters: venue.reviewRadiusMeters,
    timeZone,
    expectedTimeZone,
    issues
  };
}

export async function auditFairVenueGeo(prisma: PrismaClient): Promise<FairVenueGeoAudit> {
  const dbVenues = await prisma.venue.findMany({
    where: { slug: { in: [...FAIR_VENUE_SLUGS] } },
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
  const rows: FairVenueGeoAuditRow[] = [];

  for (const slug of FAIR_VENUE_SLUGS) {
    const profile = getFairVenueGeoProfile(slug)!;
    const venue = dbBySlug.get(slug);
    if (venue) {
      rows.push(auditRowFromVenue(venue));
      continue;
    }
    rows.push({
      slug,
      name: profile.name,
      inRegistry: true,
      inDatabase: false,
      latitude: null,
      longitude: null,
      reviewRadiusMeters: null,
      timeZone: profile.timeZone,
      expectedTimeZone: profile.timeZone,
      issues: ["missing-in-database"]
    });
  }

  return summarizeFairAudit(rows, dbVenues.length);
}

function summarizeFairAudit(rows: FairVenueGeoAuditRow[], inDatabase: number): FairVenueGeoAudit {
  const registryRows = rows.filter((r) => r.inRegistry && r.inDatabase);
  return {
    rows,
    inDatabase,
    withValidCoords: registryRows.filter(
      (r) =>
        r.latitude != null &&
        r.longitude != null &&
        isValidVenueCoordinate(r.latitude, r.longitude)
    ).length,
    fullyAligned: registryRows.filter((r) => r.issues.length === 0).length,
    withIssues: rows.filter((r) => r.issues.length > 0).length
  };
}

export type ApplyFairVenueGeoStats = {
  updated: number;
  skipped: number;
  notInDb: string[];
};

export async function applyFairVenueGeo(
  prisma: PrismaClient,
  apply: boolean
): Promise<ApplyFairVenueGeoStats> {
  const stats: ApplyFairVenueGeoStats = {
    updated: 0,
    skipped: 0,
    notInDb: []
  };

  for (const slug of FAIR_VENUE_SLUGS) {
    const profile = getFairVenueGeoProfile(slug)!;
    const existing = await prisma.venue.findUnique({ where: { slug } });

    if (!existing) {
      stats.notInDb.push(slug);
      continue;
    }

    const data = {
      name: profile.name,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      latitude: profile.latitude,
      longitude: profile.longitude,
      reviewRadiusMeters: profile.reviewRadiusMeters,
      recurringEvents: profile.recurringEvents
    };

    const needsUpdate =
      existing.name !== data.name ||
      existing.city !== data.city ||
      existing.state !== data.state ||
      existing.country !== data.country ||
      existing.latitude !== data.latitude ||
      existing.longitude !== data.longitude ||
      existing.reviewRadiusMeters !== data.reviewRadiusMeters ||
      !fairCoordinatesMatchRegistry(slug, existing.latitude, existing.longitude);

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
