/**
 * Map NFL teams + ESPN venue labels → Stadium Slop venue slugs.
 *
 * Canonical home slugs match production `Venue.slug` values (e.g. `levi-s-stadium`,
 * `geha-field-at-arrowhead-stadium`, `u-s-bank-stadium`). Do not use import-slug
 * aliases that would create duplicate stadium rows.
 */

import { teamSlugFromImport } from "@/lib/import-slugs";
import {
  NFL_INTERNATIONAL_VENUE_SLUGS,
  NFL_MEXICO_CITY_VENUE_SLUG
} from "@/lib/schedules/nfl-international-venue-geo";

export type NflHomeVenueMapping = {
  venueSlug: string;
  homeTeamSlug: string;
  homeTeamName: string;
  verified: boolean;
};

function normalizeKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * All 32 NFL clubs → existing Stadium Slop venues.
 * Chargers share SoFi; Jets share MetLife. Titans map to Nissan Stadium
 * (created on schedule apply if missing).
 */
export const NFL_TEAM_VENUE_ROWS: readonly NflHomeVenueMapping[] = [
  { homeTeamName: "Arizona Cardinals", homeTeamSlug: "arizona-cardinals", venueSlug: "state-farm-stadium", verified: true },
  { homeTeamName: "Atlanta Falcons", homeTeamSlug: "atlanta-falcons", venueSlug: "mercedes-benz-stadium", verified: true },
  { homeTeamName: "Baltimore Ravens", homeTeamSlug: "baltimore-ravens", venueSlug: "m-t-bank-stadium", verified: true },
  { homeTeamName: "Buffalo Bills", homeTeamSlug: "buffalo-bills", venueSlug: "highmark-stadium", verified: true },
  { homeTeamName: "Carolina Panthers", homeTeamSlug: "carolina-panthers", venueSlug: "bank-of-america-stadium", verified: true },
  { homeTeamName: "Chicago Bears", homeTeamSlug: "chicago-bears", venueSlug: "soldier-field", verified: true },
  { homeTeamName: "Cincinnati Bengals", homeTeamSlug: "cincinnati-bengals", venueSlug: "paycor-stadium", verified: true },
  { homeTeamName: "Cleveland Browns", homeTeamSlug: "cleveland-browns", venueSlug: "huntington-bank-field", verified: true },
  { homeTeamName: "Dallas Cowboys", homeTeamSlug: "dallas-cowboys", venueSlug: "att-stadium", verified: true },
  { homeTeamName: "Denver Broncos", homeTeamSlug: "denver-broncos", venueSlug: "empower-field-at-mile-high", verified: true },
  { homeTeamName: "Detroit Lions", homeTeamSlug: "detroit-lions", venueSlug: "ford-field", verified: true },
  { homeTeamName: "Green Bay Packers", homeTeamSlug: "green-bay-packers", venueSlug: "lambeau-field", verified: true },
  { homeTeamName: "Houston Texans", homeTeamSlug: "houston-texans", venueSlug: "nrg-stadium", verified: true },
  { homeTeamName: "Indianapolis Colts", homeTeamSlug: "indianapolis-colts", venueSlug: "lucas-oil-stadium", verified: true },
  { homeTeamName: "Jacksonville Jaguars", homeTeamSlug: "jacksonville-jaguars", venueSlug: "everbank-stadium", verified: true },
  { homeTeamName: "Kansas City Chiefs", homeTeamSlug: "kansas-city-chiefs", venueSlug: "geha-field-at-arrowhead-stadium", verified: true },
  { homeTeamName: "Las Vegas Raiders", homeTeamSlug: "las-vegas-raiders", venueSlug: "allegiant-stadium", verified: true },
  { homeTeamName: "Los Angeles Chargers", homeTeamSlug: "los-angeles-chargers", venueSlug: "sofi-stadium", verified: true },
  { homeTeamName: "Los Angeles Rams", homeTeamSlug: "los-angeles-rams", venueSlug: "sofi-stadium", verified: true },
  { homeTeamName: "Miami Dolphins", homeTeamSlug: "miami-dolphins", venueSlug: "hard-rock-stadium", verified: true },
  { homeTeamName: "Minnesota Vikings", homeTeamSlug: "minnesota-vikings", venueSlug: "u-s-bank-stadium", verified: true },
  { homeTeamName: "New England Patriots", homeTeamSlug: "new-england-patriots", venueSlug: "gillette-stadium", verified: true },
  { homeTeamName: "New Orleans Saints", homeTeamSlug: "new-orleans-saints", venueSlug: "caesars-superdome", verified: true },
  { homeTeamName: "New York Giants", homeTeamSlug: "new-york-giants", venueSlug: "metlife-stadium", verified: true },
  { homeTeamName: "New York Jets", homeTeamSlug: "new-york-jets", venueSlug: "metlife-stadium", verified: true },
  { homeTeamName: "Philadelphia Eagles", homeTeamSlug: "philadelphia-eagles", venueSlug: "lincoln-financial-field", verified: true },
  { homeTeamName: "Pittsburgh Steelers", homeTeamSlug: "pittsburgh-steelers", venueSlug: "acrisure-stadium", verified: true },
  { homeTeamName: "San Francisco 49ers", homeTeamSlug: "san-francisco-49ers", venueSlug: "levi-s-stadium", verified: true },
  { homeTeamName: "Seattle Seahawks", homeTeamSlug: "seattle-seahawks", venueSlug: "lumen-field", verified: true },
  { homeTeamName: "Tampa Bay Buccaneers", homeTeamSlug: "tampa-bay-buccaneers", venueSlug: "raymond-james-stadium", verified: true },
  { homeTeamName: "Tennessee Titans", homeTeamSlug: "tennessee-titans", venueSlug: "nissan-stadium", verified: true },
  { homeTeamName: "Washington Commanders", homeTeamSlug: "washington-commanders", venueSlug: "northwest-stadium", verified: true }
];

const TEAM_ALIASES: Record<string, string> = {
  "washington football team": "Washington Commanders",
  "washington redskins": "Washington Commanders",
  "oakland raiders": "Las Vegas Raiders",
  "san diego chargers": "Los Angeles Chargers",
  "st louis rams": "Los Angeles Rams"
};

/** ESPN / media stadium labels → canonical Stadium Slop slug. */
const VENUE_NAME_TO_SLUG: Record<string, string> = {
  "acrisure stadium": "acrisure-stadium",
  "allegiant stadium": "allegiant-stadium",
  "at t stadium": "att-stadium",
  "att stadium": "att-stadium",
  "bank of america stadium": "bank-of-america-stadium",
  "caesars superdome": "caesars-superdome",
  "the superdome": "caesars-superdome",
  "empower field at mile high": "empower-field-at-mile-high",
  "mile high stadium": "empower-field-at-mile-high",
  "everbank stadium": "everbank-stadium",
  "tiiaa bank field": "everbank-stadium",
  "ford field": "ford-field",
  "geha field at arrowhead stadium": "geha-field-at-arrowhead-stadium",
  "arrowhead stadium": "geha-field-at-arrowhead-stadium",
  "gillette stadium": "gillette-stadium",
  "hard rock stadium": "hard-rock-stadium",
  "highmark stadium": "highmark-stadium",
  "huntington bank field": "huntington-bank-field",
  "cleveland browns stadium": "huntington-bank-field",
  "lambeau field": "lambeau-field",
  "levis stadium": "levi-s-stadium",
  "levi s stadium": "levi-s-stadium",
  "lincoln financial field": "lincoln-financial-field",
  "lucas oil stadium": "lucas-oil-stadium",
  "lumen field": "lumen-field",
  "m t bank stadium": "m-t-bank-stadium",
  "mt bank stadium": "m-t-bank-stadium",
  "mercedes benz stadium": "mercedes-benz-stadium",
  "metlife stadium": "metlife-stadium",
  "nissan stadium": "nissan-stadium",
  "northwest stadium": "northwest-stadium",
  "fedex field": "northwest-stadium",
  "nrg stadium": "nrg-stadium",
  "reliant stadium": "nrg-stadium",
  "paycor stadium": "paycor-stadium",
  "paul brown stadium": "paycor-stadium",
  "raymond james stadium": "raymond-james-stadium",
  "sofi stadium": "sofi-stadium",
  "soldier field": "soldier-field",
  "state farm stadium": "state-farm-stadium",
  "u s bank stadium": "u-s-bank-stadium",
  "us bank stadium": "u-s-bank-stadium",
  "melbourne cricket ground": "melbourne-cricket-ground",
  "mcg": "melbourne-cricket-ground",
  "maracana stadium": "maracana-stadium",
  "estadio do maracana": "maracana-stadium",
  "tottenham hotspur stadium": "tottenham-hotspur-stadium",
  "wembley stadium": "wembley-stadium",
  "stade de france": "stade-de-france",
  "santiago bernabeu": "santiago-bernabeu",
  "santiago bernabeu stadium": "santiago-bernabeu",
  "bernabeu stadium": "santiago-bernabeu",
  "fc bayern munich stadium": "fc-bayern-munich-stadium",
  "allianz arena": "fc-bayern-munich-stadium",
  "estadio banorte": NFL_MEXICO_CITY_VENUE_SLUG,
  "estadio azteca": NFL_MEXICO_CITY_VENUE_SLUG
};

const byTeamName = new Map<string, NflHomeVenueMapping>();

for (const row of NFL_TEAM_VENUE_ROWS) {
  byTeamName.set(normalizeKey(row.homeTeamName), row);
}

export function resolveHomeVenueByTeamName(
  teamName: string
): NflHomeVenueMapping | null {
  const key = normalizeKey(teamName);
  const alias = TEAM_ALIASES[key];
  if (alias) {
    return byTeamName.get(normalizeKey(alias)) ?? null;
  }
  return byTeamName.get(key) ?? null;
}

export function resolveVenueSlugByEspnVenueName(venueName: string): string | null {
  const key = normalizeKey(venueName);
  return VENUE_NAME_TO_SLUG[key] ?? null;
}

export function isNflInternationalVenueSlug(slug: string): boolean {
  return NFL_INTERNATIONAL_VENUE_SLUGS.has(slug.trim().toLowerCase());
}

export function listNflHomeVenueMappings(): NflHomeVenueMapping[] {
  return [...NFL_TEAM_VENUE_ROWS];
}

export function nflHomeTeamSlugFromName(teamName: string): string {
  return resolveHomeVenueByTeamName(teamName)?.homeTeamSlug ?? teamSlugFromImport(teamName);
}
