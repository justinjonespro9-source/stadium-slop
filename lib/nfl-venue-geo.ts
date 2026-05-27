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
  "att-stadium": {
    name: "AT&T Stadium",
    city: "Arlington",
    state: "TX",
    country: "USA",
    latitude: 32.7473,
    longitude: -97.0945,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago"
  }
};

export function getNflVenueGeo(slug: string): NflVenueGeo | undefined {
  return NFL_VENUE_GEO[slug.trim().toLowerCase()];
}
