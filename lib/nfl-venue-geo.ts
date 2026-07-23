/**
 * NFL venue geolocation + review radius registry.
 * Coordinates: stadium pitch/center from OpenStreetMap / Wikidata.
 *
 * World Cup host / shared soccer stadiums use ~1000m radii.
 * Pure NFL backfill venues (formerly 0,0) keep 800m to match existing DB
 * until a venue-specific radius review changes them.
 * Sources for the 2026-07 zero-coord backfill:
 * `data/venue-geo/zero-coord-backfill-backlog.json`.
 */

export type NflVenueGeo = {
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
};

export const NFL_VENUE_GEO: Record<string, NflVenueGeo> = {
  "arrowhead-stadium": {
    name: "GEHA Field at Arrowhead Stadium",
    city: "Kansas City",
    state: "MO",
    country: "USA",
    latitude: 39.0489,
    longitude: -94.4839,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago"
  },
  "geha-field-at-arrowhead-stadium": {
    name: "GEHA Field at Arrowhead Stadium",
    city: "Kansas City",
    state: "MO",
    country: "USA",
    latitude: 39.0489,
    longitude: -94.4839,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago"
  },
  "att-stadium": {
    name: "AT&T Stadium",
    city: "Arlington",
    state: "TX",
    country: "USA",
    latitude: 32.7473,
    longitude: -97.0945,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago"
  },
  "sofi-stadium": {
    name: "SoFi Stadium",
    city: "Inglewood",
    state: "CA",
    country: "USA",
    latitude: 33.9535,
    longitude: -118.3392,
    reviewRadiusMeters: 1000,
    timeZone: "America/Los_Angeles"
  },
  "metlife-stadium": {
    name: "MetLife Stadium",
    city: "East Rutherford",
    state: "NJ",
    country: "USA",
    latitude: 40.8128,
    longitude: -74.0742,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York"
  },
  "lincoln-financial-field": {
    name: "Lincoln Financial Field",
    city: "Philadelphia",
    state: "PA",
    country: "USA",
    latitude: 39.9008,
    longitude: -75.1675,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York"
  },
  "nrg-stadium": {
    name: "NRG Stadium",
    city: "Houston",
    state: "TX",
    country: "USA",
    latitude: 29.6847,
    longitude: -95.4107,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago"
  },
  "levis-stadium": {
    name: "Levi's Stadium",
    city: "Santa Clara",
    state: "CA",
    country: "USA",
    latitude: 37.403,
    longitude: -121.9694,
    reviewRadiusMeters: 1000,
    timeZone: "America/Los_Angeles"
  },
  "levi-s-stadium": {
    name: "Levi's Stadium",
    city: "Santa Clara",
    state: "CA",
    country: "USA",
    latitude: 37.403,
    longitude: -121.9694,
    reviewRadiusMeters: 1000,
    timeZone: "America/Los_Angeles"
  },
  "hard-rock-stadium": {
    name: "Hard Rock Stadium",
    city: "Miami Gardens",
    state: "FL",
    country: "USA",
    latitude: 25.958,
    longitude: -80.2389,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York"
  },
  "acrisure-stadium": {
    name: "Acrisure Stadium",
    city: "Pittsburgh",
    state: "PA",
    country: "USA",
    latitude: 40.4467,
    longitude: -80.0158,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "allegiant-stadium": {
    name: "Allegiant Stadium",
    city: "Las Vegas",
    state: "NV",
    country: "USA",
    latitude: 36.0906,
    longitude: -115.1839,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "caesars-superdome": {
    name: "Caesars Superdome",
    city: "New Orleans",
    state: "LA",
    country: "USA",
    latitude: 29.9508,
    longitude: -90.0811,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "empower-field-at-mile-high": {
    name: "Empower Field at Mile High",
    city: "Denver",
    state: "CO",
    country: "USA",
    latitude: 39.7439,
    longitude: -105.02,
    reviewRadiusMeters: 800,
    timeZone: "America/Denver"
  },
  "everbank-stadium": {
    name: "EverBank Stadium",
    city: "Jacksonville",
    state: "FL",
    country: "USA",
    latitude: 30.3239,
    longitude: -81.6375,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "ford-field": {
    name: "Ford Field",
    city: "Detroit",
    state: "MI",
    country: "USA",
    latitude: 42.34,
    longitude: -83.0456,
    reviewRadiusMeters: 800,
    timeZone: "America/Detroit"
  },
  "highmark-stadium": {
    name: "Highmark Stadium",
    city: "Orchard Park",
    state: "NY",
    country: "USA",
    latitude: 42.773,
    longitude: -78.7922,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "huntington-bank-field": {
    name: "Huntington Bank Field",
    city: "Cleveland",
    state: "OH",
    country: "USA",
    latitude: 41.5061,
    longitude: -81.6994,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "lambeau-field": {
    name: "Lambeau Field",
    city: "Green Bay",
    state: "WI",
    country: "USA",
    latitude: 44.5014,
    longitude: -88.0622,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "lucas-oil-stadium": {
    name: "Lucas Oil Stadium",
    city: "Indianapolis",
    state: "IN",
    country: "USA",
    latitude: 39.7601,
    longitude: -86.1638,
    reviewRadiusMeters: 800,
    timeZone: "America/Indiana/Indianapolis"
  },
  "m-t-bank-stadium": {
    name: "M&T Bank Stadium",
    city: "Baltimore",
    state: "MD",
    country: "USA",
    latitude: 39.2781,
    longitude: -76.6228,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "northwest-stadium": {
    name: "Northwest Stadium",
    city: "Landover",
    state: "MD",
    country: "USA",
    latitude: 38.9078,
    longitude: -76.8644,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "paycor-stadium": {
    name: "Paycor Stadium",
    city: "Cincinnati",
    state: "OH",
    country: "USA",
    latitude: 39.095,
    longitude: -84.516,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "raymond-james-stadium": {
    name: "Raymond James Stadium",
    city: "Tampa",
    state: "FL",
    country: "USA",
    latitude: 27.9758,
    longitude: -82.5033,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "state-farm-stadium": {
    name: "State Farm Stadium",
    city: "Glendale",
    state: "AZ",
    country: "USA",
    latitude: 33.5275,
    longitude: -112.2625,
    reviewRadiusMeters: 800,
    timeZone: "America/Phoenix"
  }
};

export function getNflVenueGeo(slug: string): NflVenueGeo | undefined {
  return NFL_VENUE_GEO[slug.trim().toLowerCase()];
}
