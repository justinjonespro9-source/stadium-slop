/**
 * NCAA venue registry — shared-venue merges, slug aliases, existing pro venues.
 */

import { getNcaaVenueGeo } from "./ncaa-venue-geo";
import type { NcaaVenueImportRow } from "./ncaa-import-shape";

/** NCAA import slug → canonical Stadium Slop venue slug (shared buildings). */
export const NCAA_VENUE_SLUG_ALIASES: Record<string, string> = {
  "sdccu-stadium": "snapdragon-stadium",
  "san-diego-state-stadium": "snapdragon-stadium"
};

/** Existing pro venue slugs NCAA tenants should merge into (no duplicate venues). */
export const NCAA_EXISTING_VENUE_SLUGS = new Set(["snapdragon-stadium"]);

/** Extra college tenants when merging into shared venues. */
export const NCAA_SHARED_VENUE_TEAMS: Record<string, readonly string[]> = {
  "snapdragon-stadium": ["San Diego State Aztecs"]
};

export function resolveNcaaVenueSlug(slug: string, mergeInto?: string): string {
  const key = slug.trim().toLowerCase();
  const aliased = NCAA_VENUE_SLUG_ALIASES[key] ?? key;
  if (mergeInto?.trim()) {
    const merge = mergeInto.trim().toLowerCase();
    return NCAA_VENUE_SLUG_ALIASES[merge] ?? merge;
  }
  if (NCAA_EXISTING_VENUE_SLUGS.has(aliased)) {
    return aliased;
  }
  return aliased;
}

export function ncaaLeaguesForVenue(row: NcaaVenueImportRow): string[] {
  const leagues = ["NCAA"];
  if (row.subdivision?.trim()) {
    leagues.push(row.subdivision.trim());
  }
  if (row.conference?.trim()) {
    leagues.push(row.conference.trim());
  }
  return leagues;
}

export function ncaaSportsForVenue(row: NcaaVenueImportRow): string[] {
  if (row.sport === "Multi-Sport") {
    return ["Football", "Basketball"];
  }
  return [row.sport];
}

export function ncaaVenueMetaFromRow(row: NcaaVenueImportRow) {
  const slug = resolveNcaaVenueSlug(row.slug, row.mergeIntoVenueSlug);
  const geo = getNcaaVenueGeo(slug) ?? getNcaaVenueGeo(row.slug);
  return {
    slug,
    name: row.name,
    school: row.school,
    team: row.team,
    city: row.city || geo?.city || "",
    state: row.state || geo?.state || "",
    country: row.country ?? geo?.country ?? "USA",
    region: row.region ?? "North America",
    latitude: row.latitude ?? geo?.latitude ?? 0,
    longitude: row.longitude ?? geo?.longitude ?? 0,
    reviewRadiusMeters: row.reviewRadiusMeters ?? geo?.reviewRadiusMeters ?? 800,
    timeZone: row.timeZone || geo?.timeZone || "America/New_York",
    leagues: ncaaLeaguesForVenue(row),
    sports: ncaaSportsForVenue(row),
    primarySport: row.sport === "Multi-Sport" ? "Basketball" : row.sport,
    sourceUrl: row.sourceUrl
  };
}
