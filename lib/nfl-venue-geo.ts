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
  }
};

export function getNflVenueGeo(slug: string): NflVenueGeo | undefined {
  return NFL_VENUE_GEO[slug.trim().toLowerCase()];
}
