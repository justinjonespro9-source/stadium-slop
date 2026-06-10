/**
 * Authoritative NCAA venue geolocation + review radius registry.
 * Used when JSON rows omit coords or for shared-venue merge targets.
 */

export type NcaaVenueClass = "football-stadium" | "basketball-arena" | "multi-use-campus";

export type NcaaVenueGeo = {
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
  venueClass: NcaaVenueClass;
};

export const NCAA_VENUE_GEO: Record<string, NcaaVenueGeo> = {
  "michigan-stadium": {
    name: "Michigan Stadium",
    city: "Ann Arbor",
    state: "MI",
    country: "USA",
    latitude: 42.2659,
    longitude: -83.7487,
    reviewRadiusMeters: 1200,
    timeZone: "America/Detroit",
    venueClass: "football-stadium"
  },
  "ohio-stadium": {
    name: "Ohio Stadium",
    city: "Columbus",
    state: "OH",
    country: "USA",
    latitude: 40.0016,
    longitude: -83.0199,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  "bryant-denny-stadium": {
    name: "Bryant-Denny Stadium",
    city: "Tuscaloosa",
    state: "AL",
    country: "USA",
    latitude: 33.208,
    longitude: -87.5504,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  "neyland-stadium": {
    name: "Neyland Stadium",
    city: "Knoxville",
    state: "TN",
    country: "USA",
    latitude: 35.955,
    longitude: -83.925,
    reviewRadiusMeters: 1200,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  "notre-dame-stadium": {
    name: "Notre Dame Stadium",
    city: "Notre Dame",
    state: "IN",
    country: "USA",
    latitude: 41.698,
    longitude: -86.234,
    reviewRadiusMeters: 1000,
    timeZone: "America/Indiana/Indianapolis",
    venueClass: "football-stadium"
  },
  "cameron-indoor-stadium": {
    name: "Cameron Indoor Stadium",
    city: "Durham",
    state: "NC",
    country: "USA",
    latitude: 35.9045,
    longitude: -78.9419,
    reviewRadiusMeters: 450,
    timeZone: "America/New_York",
    venueClass: "basketball-arena"
  },
  "allen-fieldhouse": {
    name: "Allen Fieldhouse",
    city: "Lawrence",
    state: "KS",
    country: "USA",
    latitude: 38.9543,
    longitude: -95.252,
    reviewRadiusMeters: 450,
    timeZone: "America/Chicago",
    venueClass: "basketball-arena"
  },
  "rupp-arena": {
    name: "Rupp Arena",
    city: "Lexington",
    state: "KY",
    country: "USA",
    latitude: 38.0494,
    longitude: -84.5028,
    reviewRadiusMeters: 600,
    timeZone: "America/New_York",
    venueClass: "multi-use-campus"
  },
  "snapdragon-stadium": {
    name: "Snapdragon Stadium",
    city: "San Diego",
    state: "CA",
    country: "USA",
    latitude: 32.7841,
    longitude: -117.1224,
    reviewRadiusMeters: 900,
    timeZone: "America/Los_Angeles",
    venueClass: "football-stadium"
  }
};

export function getNcaaVenueGeo(slug: string): NcaaVenueGeo | undefined {
  return NCAA_VENUE_GEO[slug.trim().toLowerCase()];
}
