import { EntityStatus, type PrismaClient } from "@prisma/client";

import { auditFairVenueGeo } from "@/lib/apply-fair-venue-geo";
import { auditMlsNwslVenueGeo } from "@/lib/apply-mls-nwsl-venue-geo";
import { isFairVenueSlug } from "@/lib/fair-import/venues";
import { getFairVenueGeoProfile } from "@/lib/fair-venue-geo";
import { getMlsNwslVenueGeo, isValidVenueCoordinate } from "@/lib/mls-nwsl-venue-geo";
import { getNflVenueGeo } from "@/lib/nfl-venue-geo";
import { getVenueTimeZone } from "@/lib/venue-timezone";
import {
  getWorldCupMexicoVenueGeo,
  WORLD_CUP_MEXICO_VENUE_GEO
} from "@/lib/world-cup-venue-geo";
import { WORLD_CUP_HOST_VENUES } from "@/lib/world-cup-stadium-food-guide";

export type VenueGeoIssue =
  | "invalid-coords"
  | "missing-state"
  | "timezone-fallback-risk"
  | "timezone-mismatch";

export type ActiveVenueGeoRow = {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
  expectedTimeZone: string;
  timeZoneSource: string;
  issues: VenueGeoIssue[];
};

export type WorldCupHostGeoRow = {
  hostId: string;
  name: string;
  country: string;
  matchedSlug: string | null;
  inDatabase: boolean;
  latitude: number | null;
  longitude: number | null;
  timeZone: string | null;
  issues: string[];
};

export type VenueGeoAuditReport = {
  totalActiveVenues: number;
  activeWithInvalidCoords: number;
  activeWithTimezoneIssues: number;
  activeVenuesMissingGeo: ActiveVenueGeoRow[];
  fair: Awaited<ReturnType<typeof auditFairVenueGeo>>;
  mlsNwsl: Awaited<ReturnType<typeof auditMlsNwslVenueGeo>>;
  worldCupHosts: WorldCupHostGeoRow[];
  worldCupHostsWithIssues: number;
};

function resolveExpectedTimeZone(venue: {
  slug: string;
  state: string | null;
  country: string | null;
}): { timeZone: string; source: string; issues: VenueGeoIssue[] } {
  const issues: VenueGeoIssue[] = [];
  const fair = getFairVenueGeoProfile(venue.slug);
  if (fair) {
    return { timeZone: fair.timeZone, source: "fair-registry", issues };
  }

  const mls = getMlsNwslVenueGeo(venue.slug);
  if (mls) {
    return { timeZone: mls.timeZone, source: "mls-nwsl-registry", issues };
  }

  const nfl = getNflVenueGeo(venue.slug);
  if (nfl) {
    return { timeZone: nfl.timeZone, source: "nfl-registry", issues };
  }

  const mexico = getWorldCupMexicoVenueGeo(venue.slug);
  if (mexico) {
    return { timeZone: mexico.timeZone, source: "world-cup-mexico", issues };
  }

  const resolved = getVenueTimeZone(venue);
  const country = venue.country?.trim().toUpperCase() ?? "";
  if (country === "MEXICO") {
    issues.push("timezone-fallback-risk");
  }
  if (!venue.state?.trim()) {
    issues.push("missing-state");
  }
  return { timeZone: resolved, source: "state-country", issues };
}

function auditActiveVenue(venue: {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
}): ActiveVenueGeoRow {
  const issues: VenueGeoIssue[] = [];
  const timeZone = getVenueTimeZone(venue);
  const expected = resolveExpectedTimeZone(venue);

  if (!isValidVenueCoordinate(venue.latitude, venue.longitude)) {
    issues.push("invalid-coords");
  }

  if (!venue.state?.trim()) {
    issues.push("missing-state");
  }

  issues.push(...expected.issues);

  if (timeZone !== expected.timeZone) {
    issues.push("timezone-mismatch");
  }

  const uniqueIssues = [...new Set(issues)];

  return {
    slug: venue.slug,
    name: venue.name,
    city: venue.city,
    state: venue.state,
    country: venue.country,
    latitude: venue.latitude,
    longitude: venue.longitude,
    reviewRadiusMeters: venue.reviewRadiusMeters,
    timeZone,
    expectedTimeZone: expected.timeZone,
    timeZoneSource: expected.source,
    issues: uniqueIssues
  };
}

export async function auditWorldCupHostGeo(
  prisma: PrismaClient
): Promise<WorldCupHostGeoRow[]> {
  const venues = await prisma.venue.findMany({
    where: { status: EntityStatus.ACTIVE },
    select: {
      slug: true,
      latitude: true,
      longitude: true,
      state: true,
      country: true
    }
  });
  const bySlug = new Map(venues.map((v) => [v.slug.toLowerCase(), v]));

  return WORLD_CUP_HOST_VENUES.map((host) => {
    const matchedSlug = host.slugCandidates.find((c) => bySlug.has(c.toLowerCase())) ?? null;
    const venue = matchedSlug ? bySlug.get(matchedSlug.toLowerCase()) : undefined;
    const issues: string[] = [];

    if (!matchedSlug || !venue) {
      issues.push("missing-in-database");
      return {
        hostId: host.id,
        name: host.name,
        country: host.country,
        matchedSlug,
        inDatabase: false,
        latitude: null,
        longitude: null,
        timeZone: null,
        issues
      };
    }

    const timeZone = getVenueTimeZone(venue);
    const mexico = matchedSlug ? getWorldCupMexicoVenueGeo(matchedSlug) : undefined;
    const nfl = matchedSlug ? getNflVenueGeo(matchedSlug) : undefined;
    const mls = matchedSlug ? getMlsNwslVenueGeo(matchedSlug) : undefined;
    const expectedTz =
      mexico?.timeZone ?? mls?.timeZone ?? nfl?.timeZone ?? timeZone;

    if (!isValidVenueCoordinate(venue.latitude, venue.longitude)) {
      issues.push("invalid-coords");
    }
    if (timeZone !== expectedTz) {
      issues.push("timezone-mismatch");
    }
    if (host.country === "Mexico" && !mexico) {
      issues.push("missing-mexico-registry");
    }

    return {
      hostId: host.id,
      name: host.name,
      country: host.country,
      matchedSlug: venue.slug,
      inDatabase: true,
      latitude: venue.latitude,
      longitude: venue.longitude,
      timeZone,
      issues
    };
  });
}

export async function auditAllVenueGeo(prisma: PrismaClient): Promise<VenueGeoAuditReport> {
  const activeVenues = await prisma.venue.findMany({
    where: { status: EntityStatus.ACTIVE },
    orderBy: { slug: "asc" },
    select: {
      slug: true,
      name: true,
      city: true,
      state: true,
      country: true,
      latitude: true,
      longitude: true,
      reviewRadiusMeters: true
    }
  });

  const audited = activeVenues.map(auditActiveVenue);
  const activeVenuesMissingGeo = audited.filter((r) => r.issues.length > 0);

  const [fair, mlsNwsl, worldCupHosts] = await Promise.all([
    auditFairVenueGeo(prisma),
    auditMlsNwslVenueGeo(prisma),
    auditWorldCupHostGeo(prisma)
  ]);

  return {
    totalActiveVenues: activeVenues.length,
    activeWithInvalidCoords: audited.filter((r) => r.issues.includes("invalid-coords")).length,
    activeWithTimezoneIssues: audited.filter(
      (r) =>
        r.issues.includes("timezone-mismatch") || r.issues.includes("timezone-fallback-risk")
    ).length,
    activeVenuesMissingGeo,
    fair,
    mlsNwsl,
    worldCupHosts,
    worldCupHostsWithIssues: worldCupHosts.filter((r) => r.issues.length > 0).length
  };
}

export function isMexicoWorldCupSlug(slug: string): boolean {
  return slug in WORLD_CUP_MEXICO_VENUE_GEO;
}

export function isFairSlug(slug: string): boolean {
  return isFairVenueSlug(slug);
}
