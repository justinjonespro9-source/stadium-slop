/**
 * NFL venue geolocation + review radius registry.
 * Coordinates: stadium pitch/center from OpenStreetMap / Wikidata.
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
  }
};

export function getNflVenueGeo(slug: string): NflVenueGeo | undefined {
  return NFL_VENUE_GEO[slug.trim().toLowerCase()];
}
