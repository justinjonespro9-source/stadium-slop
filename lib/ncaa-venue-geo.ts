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
  },
  "tiger-stadium": {
    name: "Tiger Stadium",
    city: "Baton Rouge",
    state: "LA",
    country: "USA",
    latitude: 30.412,
    longitude: -91.185,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  "kyle-field": {
    name: "Kyle Field",
    city: "College Station",
    state: "TX",
    country: "USA",
    latitude: 30.61,
    longitude: -96.340,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  "sanford-stadium": {
    name: "Sanford Stadium",
    city: "Athens",
    state: "GA",
    country: "USA",
    latitude: 33.949,
    longitude: -83.373,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  "darrell-k-royal-texas-memorial-stadium": {
    name: "Darrell K Royal-Texas Memorial Stadium",
    city: "Austin",
    state: "TX",
    country: "USA",
    latitude: 30.283,
    longitude: -97.732,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  "beaver-stadium": {
    name: "Beaver Stadium",
    city: "University Park",
    state: "PA",
    country: "USA",
    latitude: 40.812,
    longitude: -77.856,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },

  // --- Big Ten Phase 1 ---
  // Coords: field/bowl center from OSM stadium footprints + athletics campus maps.
  // Radii: college football 1000–1200m convention (no campus >1500m).

  /** Illinois Memorial Stadium — bowl center (Champaign). OSM way 24844184. */
  "memorial-stadium-illinois": {
    name: "Memorial Stadium",
    city: "Champaign",
    state: "IL",
    country: "USA",
    latitude: 40.0992,
    longitude: -88.2359,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Indiana Memorial Stadium — field center (Bloomington). */
  "memorial-stadium-indiana": {
    name: "Merchants Bank Field at Memorial Stadium",
    city: "Bloomington",
    state: "IN",
    country: "USA",
    latitude: 39.1809,
    longitude: -86.5256,
    reviewRadiusMeters: 1100,
    timeZone: "America/Indiana/Indianapolis",
    venueClass: "football-stadium"
  },
  /** Kinnick Stadium — field center (Iowa City). */
  "kinnick-stadium": {
    name: "Kinnick Stadium",
    city: "Iowa City",
    state: "IA",
    country: "USA",
    latitude: 41.6586,
    longitude: -91.5511,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** SECU Stadium (Maryland) — field center (College Park). */
  "secu-stadium": {
    name: "SECU Stadium",
    city: "College Park",
    state: "MD",
    country: "USA",
    latitude: 38.9902,
    longitude: -76.9472,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Spartan Stadium — field center (East Lansing). */
  "spartan-stadium": {
    name: "Spartan Stadium",
    city: "East Lansing",
    state: "MI",
    country: "USA",
    latitude: 42.7281,
    longitude: -84.4849,
    reviewRadiusMeters: 1100,
    timeZone: "America/Detroit",
    venueClass: "football-stadium"
  },
  /**
   * Huntington Bank Stadium (Minnesota Golden Gophers) — field center.
   * Distinct from NFL Huntington Bank Field (Cleveland).
   */
  "huntington-bank-stadium": {
    name: "Huntington Bank Stadium",
    city: "Minneapolis",
    state: "MN",
    country: "USA",
    latitude: 44.9765,
    longitude: -93.2247,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Nebraska Memorial Stadium — field center (Lincoln). */
  "memorial-stadium-nebraska": {
    name: "Memorial Stadium",
    city: "Lincoln",
    state: "NE",
    country: "USA",
    latitude: 40.8207,
    longitude: -96.7056,
    reviewRadiusMeters: 1200,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** New Ryan Field (Northwestern) — rebuilt on historic Ryan Field footprint. */
  "ryan-field": {
    name: "Ryan Field",
    city: "Evanston",
    state: "IL",
    country: "USA",
    latitude: 42.0654,
    longitude: -87.6926,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Autzen Stadium — field center (Eugene). */
  "autzen-stadium": {
    name: "Autzen Stadium",
    city: "Eugene",
    state: "OR",
    country: "USA",
    latitude: 44.0583,
    longitude: -123.0684,
    reviewRadiusMeters: 1100,
    timeZone: "America/Los_Angeles",
    venueClass: "football-stadium"
  },
  /** Ross-Ade Stadium — field center (West Lafayette). */
  "ross-ade-stadium": {
    name: "Ross-Ade Stadium",
    city: "West Lafayette",
    state: "IN",
    country: "USA",
    latitude: 40.4342,
    longitude: -86.9185,
    reviewRadiusMeters: 1100,
    timeZone: "America/Indiana/Indianapolis",
    venueClass: "football-stadium"
  },
  /** SHI Stadium (Rutgers) — field center (Piscataway). */
  "shi-stadium": {
    name: "SHI Stadium",
    city: "Piscataway",
    state: "NJ",
    country: "USA",
    latitude: 40.5138,
    longitude: -74.4655,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Rose Bowl — bowl center (Pasadena); shared multi-use STADIUM. */
  "rose-bowl": {
    name: "Rose Bowl",
    city: "Pasadena",
    state: "CA",
    country: "USA",
    latitude: 34.1613,
    longitude: -118.1676,
    reviewRadiusMeters: 1200,
    timeZone: "America/Los_Angeles",
    venueClass: "football-stadium"
  },
  /** Los Angeles Memorial Coliseum — field center; shared multi-use STADIUM. */
  "los-angeles-memorial-coliseum": {
    name: "Los Angeles Memorial Coliseum",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    latitude: 34.0141,
    longitude: -118.2879,
    reviewRadiusMeters: 1200,
    timeZone: "America/Los_Angeles",
    venueClass: "football-stadium"
  },
  /** Husky Stadium — field center (Seattle). */
  "husky-stadium": {
    name: "Husky Stadium",
    city: "Seattle",
    state: "WA",
    country: "USA",
    latitude: 47.6503,
    longitude: -122.3015,
    reviewRadiusMeters: 1100,
    timeZone: "America/Los_Angeles",
    venueClass: "football-stadium"
  },
  /** Camp Randall Stadium — field center (Madison). */
  "camp-randall-stadium": {
    name: "Camp Randall Stadium",
    city: "Madison",
    state: "WI",
    country: "USA",
    latitude: 43.07,
    longitude: -89.4128,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  }
};

export function getNcaaVenueGeo(slug: string): NcaaVenueGeo | undefined {
  return NCAA_VENUE_GEO[slug.trim().toLowerCase()];
}
