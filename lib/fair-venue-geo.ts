import {
  FAIR_VENUE_DEFINITIONS,
  getFairVenueDefinition,
  isFairVenueSlug,
  type FairVenueSlug
} from "@/lib/fair-import/venues";
import type { FairVenueDefinition } from "@/lib/fair-import/types";
import { isValidVenueCoordinate } from "@/lib/mls-nwsl-venue-geo";

/** IANA timezone per state fair venue slug. */
export const FAIR_VENUE_TIMEZONE: Record<FairVenueSlug, string> = {
  "minnesota-state-fair": "America/Chicago",
  "iowa-state-fair": "America/Chicago",
  "state-fair-of-texas": "America/Chicago",
  "wisconsin-state-fair": "America/Chicago",
  "the-big-e": "America/New_York"
};

const COORD_EPSILON = 0.00015;

export type FairVenueGeoProfile = FairVenueDefinition & {
  timeZone: string;
};

export function getFairVenueGeoProfile(slug: string): FairVenueGeoProfile | null {
  if (!isFairVenueSlug(slug)) return null;
  const def = getFairVenueDefinition(slug);
  if (!def) return null;
  return { ...def, timeZone: FAIR_VENUE_TIMEZONE[slug] };
}

export function fairCoordinatesMatchRegistry(
  slug: string,
  lat: number,
  lng: number
): boolean {
  const def = getFairVenueDefinition(slug);
  if (!def) return false;
  return (
    Math.abs(lat - def.latitude) <= COORD_EPSILON &&
    Math.abs(lng - def.longitude) <= COORD_EPSILON
  );
}

export function fairGeoNeedsUpdate(venue: {
  slug: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
}): boolean {
  const profile = getFairVenueGeoProfile(venue.slug);
  if (!profile) return false;
  return (
    venue.name !== profile.name ||
    venue.city !== profile.city ||
    venue.state !== profile.state ||
    venue.reviewRadiusMeters !== profile.reviewRadiusMeters ||
    !fairCoordinatesMatchRegistry(venue.slug, venue.latitude, venue.longitude)
  );
}

export function auditFairVenueRegistryDefinition(def: FairVenueDefinition): string[] {
  const issues: string[] = [];
  if (!isValidVenueCoordinate(def.latitude, def.longitude)) {
    issues.push("invalid-registry-coords");
  }
  if (!Number.isFinite(def.reviewRadiusMeters) || def.reviewRadiusMeters <= 0) {
    issues.push("invalid-registry-radius");
  }
  if (!FAIR_VENUE_TIMEZONE[def.slug as FairVenueSlug]) {
    issues.push("missing-registry-timezone");
  }
  return issues;
}

/** Sanity-check all fair registry rows (static, no DB). */
export function validateFairVenueRegistry(): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  for (const def of FAIR_VENUE_DEFINITIONS) {
    const rowIssues = auditFairVenueRegistryDefinition(def);
    if (rowIssues.length > 0) {
      issues.push(`${def.slug}: ${rowIssues.join(", ")}`);
    }
  }
  return { ok: issues.length === 0, issues };
}
