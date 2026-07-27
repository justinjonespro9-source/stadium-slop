/**
 * NCAA venue registry — shared-venue merges, slug aliases, existing pro venues.
 */

import { getNcaaVenueGeo } from "./ncaa-venue-geo";
import type { NcaaVenueImportRow } from "./ncaa-import-shape";

/** NCAA import slug → canonical Stadium Slop venue slug (shared buildings). */
export const NCAA_VENUE_SLUG_ALIASES: Record<string, string> = {
  "sdccu-stadium": "snapdragon-stadium",
  "san-diego-state-stadium": "snapdragon-stadium",
  "martin-stadium": "northwestern-medicine-field-at-martin-stadium",
  "northwestern-medicine-field": "northwestern-medicine-field-at-martin-stadium",
  // Memorial Stadium disambiguation (legacy draft slugs → canonical)
  "memorial-stadium-champaign": "memorial-stadium-illinois",
  "indiana-memorial-stadium": "memorial-stadium-indiana",
  "memorial-stadium-lincoln": "memorial-stadium-nebraska",
  // SEC sponsored / legacy names → canonical
  "commonwealth-stadium": "kroger-field",
  "vanderbilt-stadium": "firstbank-stadium",
  "dudley-field": "firstbank-stadium",
  "oklahoma-memorial-stadium": "gaylord-family-oklahoma-memorial-stadium",
  "gaylord-family-oklahoma-memorial": "gaylord-family-oklahoma-memorial-stadium",
  "razorback-stadium": "donald-w-reynolds-razorback-stadium",
  "memorial-stadium-missouri": "faurot-field-at-memorial-stadium",
  "faurot-field": "faurot-field-at-memorial-stadium",
  // Big 12 sponsored / legacy names → canonical
  "arizona-stadium": "casino-del-sol-stadium",
  "sun-devil-stadium": "mountain-america-stadium",
  "jones-at-t-stadium": "galaxy-stadium",
  "jones-att-stadium": "galaxy-stadium",
  "jones-stadium": "galaxy-stadium",
  "fbc-mortgage-stadium": "acrisure-bounce-house",
  "bounce-house": "acrisure-bounce-house",
  "spectrum-stadium": "acrisure-bounce-house",
  "bright-house-networks-stadium": "acrisure-bounce-house",
  "memorial-stadium-kansas": "david-booth-kansas-memorial-stadium",
  "kansas-memorial-stadium": "david-booth-kansas-memorial-stadium",
  "david-booth-memorial-stadium": "david-booth-kansas-memorial-stadium",
  "mountaineer-field": "milan-puskar-stadium",
  "john-oquinn-field-at-tdecu-stadium": "tdecu-stadium"
};

/**
 * Existing pro/shared venue slugs NCAA tenants should merge into
 * (no duplicate venue rows).
 */
export const NCAA_EXISTING_VENUE_SLUGS = new Set([
  "snapdragon-stadium",
  "northwestern-medicine-field-at-martin-stadium"
]);

/** Extra college tenants when merging into shared venues. */
export const NCAA_SHARED_VENUE_TEAMS: Record<string, readonly string[]> = {
  "snapdragon-stadium": ["San Diego State Aztecs"],
  "northwestern-medicine-field-at-martin-stadium": ["Northwestern Wildcats"]
};

/** Big Ten primary football stadium slugs (2026 membership). */
export const BIG_TEN_PRIMARY_FOOTBALL_SLUGS = [
  "memorial-stadium-illinois",
  "memorial-stadium-indiana",
  "kinnick-stadium",
  "secu-stadium",
  "michigan-stadium",
  "spartan-stadium",
  "huntington-bank-stadium",
  "memorial-stadium-nebraska",
  "ryan-field",
  "ohio-stadium",
  "autzen-stadium",
  "beaver-stadium",
  "ross-ade-stadium",
  "shi-stadium",
  "rose-bowl",
  "los-angeles-memorial-coliseum",
  "husky-stadium",
  "camp-randall-stadium"
] as const;

/** SEC primary football stadium slugs (2026 membership, 16 programs). */
export const SEC_PRIMARY_FOOTBALL_SLUGS = [
  "bryant-denny-stadium",
  "donald-w-reynolds-razorback-stadium",
  "jordan-hare-stadium",
  "ben-hill-griffin-stadium",
  "sanford-stadium",
  "kroger-field",
  "tiger-stadium",
  "vaught-hemingway-stadium",
  "davis-wade-stadium",
  "faurot-field-at-memorial-stadium",
  "gaylord-family-oklahoma-memorial-stadium",
  "williams-brice-stadium",
  "neyland-stadium",
  "darrell-k-royal-texas-memorial-stadium",
  "kyle-field",
  "firstbank-stadium"
] as const;

/** Big 12 primary football stadium slugs (2026 membership, 16 programs). */
export const BIG_12_PRIMARY_FOOTBALL_SLUGS = [
  "casino-del-sol-stadium",
  "mountain-america-stadium",
  "mclane-stadium",
  "lavell-edwards-stadium",
  "nippert-stadium",
  "folsom-field",
  "tdecu-stadium",
  "jack-trice-stadium",
  "david-booth-kansas-memorial-stadium",
  "bill-snyder-family-stadium",
  "boone-pickens-stadium",
  "amon-g-carter-stadium",
  "galaxy-stadium",
  "acrisure-bounce-house",
  "rice-eccles-stadium",
  "milan-puskar-stadium"
] as const;

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
