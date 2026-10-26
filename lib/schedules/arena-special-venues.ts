/**
 * 2026–27 NBA/NHL sites that are not a club's everyday arena.
 *
 * Coordinates are building centers from OpenStreetMap Nominatim (October 2026):
 * Moody Center, Arena Ciudad de México, Accor Arena, Co-op Live, Veikkaus Arena
 * (Helsinki Halli), PSD Bank Dome (ISS Dome), Princess Auto Stadium.
 *
 * AT&T Stadium and Rice-Eccles Stadium already exist. Do not create them again.
 * Xfinity Mobile Arena and Mortgage Matchup Center are renames of venues we have.
 */

export type ArenaSpecialVenueGeo = {
  name: string;
  city: string;
  state: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
  leagues: string[];
  sports: string[];
  primarySport: string;
  recurringEvents: string[];
  venueType: "ARENA" | "STADIUM";
};

export const ARENA_SPECIAL_VENUE_GEO: Record<string, ArenaSpecialVenueGeo> = {
  "moody-center": {
    name: "Moody Center",
    city: "Austin",
    state: "TX",
    country: "USA",
    region: "North America",
    latitude: 30.2809367,
    longitude: -97.7306522,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago",
    leagues: ["NBA"],
    sports: ["Basketball"],
    primarySport: "Basketball",
    recurringEvents: ["San Antonio Spurs Austin games"],
    venueType: "ARENA"
  },
  "arena-cdmx": {
    name: "Arena CDMX",
    city: "Mexico City",
    state: "CDMX",
    country: "Mexico",
    region: "North America",
    latitude: 19.4976072,
    longitude: -99.1751954,
    reviewRadiusMeters: 800,
    timeZone: "America/Mexico_City",
    leagues: ["NBA"],
    sports: ["Basketball"],
    primarySport: "Basketball",
    recurringEvents: ["NBA Mexico City Game"],
    venueType: "ARENA"
  },
  "accor-arena": {
    name: "Accor Arena",
    city: "Paris",
    state: "IDF",
    country: "France",
    region: "Europe",
    latitude: 48.8387085,
    longitude: 2.3787666,
    reviewRadiusMeters: 800,
    timeZone: "Europe/Paris",
    leagues: ["NBA"],
    sports: ["Basketball"],
    primarySport: "Basketball",
    recurringEvents: ["NBA Paris Game"],
    venueType: "ARENA"
  },
  "co-op-live": {
    name: "Co-op Live",
    city: "Manchester",
    state: "ENG",
    country: "United Kingdom",
    region: "Europe",
    latitude: 53.4864068,
    longitude: -2.1999998,
    reviewRadiusMeters: 800,
    timeZone: "Europe/London",
    leagues: ["NBA"],
    sports: ["Basketball"],
    primarySport: "Basketball",
    recurringEvents: ["NBA Manchester Game"],
    venueType: "ARENA"
  },
  "veikkaus-arena": {
    name: "Veikkaus Arena",
    city: "Helsinki",
    state: "Uusimaa",
    country: "Finland",
    region: "Europe",
    latitude: 60.2054771,
    longitude: 24.9291488,
    reviewRadiusMeters: 800,
    timeZone: "Europe/Helsinki",
    leagues: ["NHL"],
    sports: ["Hockey"],
    primarySport: "Hockey",
    recurringEvents: ["NHL Global Series"],
    venueType: "ARENA"
  },
  "psd-bank-dome": {
    name: "PSD Bank Dome",
    city: "Düsseldorf",
    state: "NW",
    country: "Germany",
    region: "Europe",
    latitude: 51.2721479,
    longitude: 6.8114054,
    reviewRadiusMeters: 800,
    timeZone: "Europe/Berlin",
    leagues: ["NHL"],
    sports: ["Hockey"],
    primarySport: "Hockey",
    recurringEvents: ["NHL Global Series"],
    venueType: "ARENA"
  },
  "princess-auto-stadium": {
    name: "Princess Auto Stadium",
    city: "Winnipeg",
    state: "MB",
    country: "Canada",
    region: "North America",
    latitude: 49.8077586,
    longitude: -97.1429177,
    reviewRadiusMeters: 1100,
    timeZone: "America/Winnipeg",
    leagues: ["NHL"],
    sports: ["Hockey"],
    primarySport: "Hockey",
    recurringEvents: ["NHL Heritage Classic"],
    venueType: "STADIUM"
  }
};

export const ARENA_SPECIAL_VENUE_TIME_ZONES: Record<string, string> =
  Object.fromEntries(
    Object.entries(ARENA_SPECIAL_VENUE_GEO).map(([slug, geo]) => [
      slug,
      geo.timeZone
    ])
  );

export function arenaSpecialVenuesForLeague(league: "NBA" | "NHL") {
  return Object.entries(ARENA_SPECIAL_VENUE_GEO).filter(([, geo]) =>
    geo.leagues.includes(league)
  );
}
