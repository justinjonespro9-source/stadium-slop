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
  },

  // --- SEC Phase 1 ---
  // Coords: field/bowl center from OSM stadium footprints (Nominatim) + athletics maps.
  // Radii: college football 1000–1200m convention.

  /** Donald W. Reynolds Razorback Stadium — bowl center (Fayetteville). */
  "donald-w-reynolds-razorback-stadium": {
    name: "Donald W. Reynolds Razorback Stadium",
    city: "Fayetteville",
    state: "AR",
    country: "USA",
    latitude: 36.0681,
    longitude: -94.1789,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Jordan-Hare Stadium — field center (Auburn). */
  "jordan-hare-stadium": {
    name: "Jordan-Hare Stadium",
    city: "Auburn",
    state: "AL",
    country: "USA",
    latitude: 32.6022,
    longitude: -85.4892,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Ben Hill Griffin Stadium — bowl center (Gainesville). */
  "ben-hill-griffin-stadium": {
    name: "Ben Hill Griffin Stadium",
    city: "Gainesville",
    state: "FL",
    country: "USA",
    latitude: 29.65,
    longitude: -82.3488,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /**
   * Kroger Field (Kentucky) — field center (Lexington).
   * Legacy name Commonwealth Stadium; keep slug kroger-field (current official).
   */
  "kroger-field": {
    name: "Kroger Field",
    city: "Lexington",
    state: "KY",
    country: "USA",
    latitude: 38.0227,
    longitude: -84.5051,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Vaught-Hemingway Stadium — field center (Oxford). */
  "vaught-hemingway-stadium": {
    name: "Vaught-Hemingway Stadium",
    city: "Oxford",
    state: "MS",
    country: "USA",
    latitude: 34.362,
    longitude: -89.5342,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Davis Wade Stadium — field center (Starkville). OSM way 207653615. */
  "davis-wade-stadium": {
    name: "Davis Wade Stadium",
    city: "Starkville",
    state: "MS",
    country: "USA",
    latitude: 33.4565,
    longitude: -88.7934,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /**
   * Faurot Field at Memorial Stadium (Missouri) — field center (Columbia).
   * Distinct from Illinois / Indiana / Nebraska Memorial Stadiums.
   */
  "faurot-field-at-memorial-stadium": {
    name: "Faurot Field at Memorial Stadium",
    city: "Columbia",
    state: "MO",
    country: "USA",
    latitude: 38.9358,
    longitude: -92.3322,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /**
   * Gaylord Family – Oklahoma Memorial Stadium — bowl center (Norman).
   * Playing surface Owen Field is not a separate venue slug.
   */
  "gaylord-family-oklahoma-memorial-stadium": {
    name: "Gaylord Family – Oklahoma Memorial Stadium",
    city: "Norman",
    state: "OK",
    country: "USA",
    latitude: 35.2057,
    longitude: -97.4423,
    reviewRadiusMeters: 1200,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Williams-Brice Stadium — field center (Columbia, S.C.). */
  "williams-brice-stadium": {
    name: "Williams-Brice Stadium",
    city: "Columbia",
    state: "SC",
    country: "USA",
    latitude: 33.9731,
    longitude: -81.0192,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /**
   * FirstBank Stadium (Vanderbilt) — field center (Nashville).
   * Formerly Vanderbilt Stadium at Dudley Field; keep sponsored slug.
   */
  "firstbank-stadium": {
    name: "FirstBank Stadium",
    city: "Nashville",
    state: "TN",
    country: "USA",
    latitude: 36.1439,
    longitude: -86.8089,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },

  // --- Big 12 Phase 1 ---
  // Coords: OSM stadium footprints where available; Wikipedia bowl center when
  // Nominatim lacks a stadium hit (TDECU, Galaxy, Acrisure Bounce House, Casino Del Sol).
  // Radii: college football 1000–1200m convention.

  /**
   * Casino Del Sol Stadium (Arizona) — bowl center (Tucson).
   * Formerly Arizona Stadium; alias arizona-stadium → this slug.
   */
  "casino-del-sol-stadium": {
    name: "Casino Del Sol Stadium",
    city: "Tucson",
    state: "AZ",
    country: "USA",
    latitude: 32.2288,
    longitude: -110.9488,
    reviewRadiusMeters: 1100,
    timeZone: "America/Phoenix",
    venueClass: "football-stadium"
  },
  /** Mountain America Stadium (ASU) — field center (Tempe). Formerly Sun Devil Stadium. */
  "mountain-america-stadium": {
    name: "Mountain America Stadium",
    city: "Tempe",
    state: "AZ",
    country: "USA",
    latitude: 33.4263,
    longitude: -111.9327,
    reviewRadiusMeters: 1200,
    timeZone: "America/Phoenix",
    venueClass: "football-stadium"
  },
  /** McLane Stadium — field center (Waco). */
  "mclane-stadium": {
    name: "McLane Stadium",
    city: "Waco",
    state: "TX",
    country: "USA",
    latitude: 31.5582,
    longitude: -97.1157,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** LaVell Edwards Stadium — field center (Provo). */
  "lavell-edwards-stadium": {
    name: "LaVell Edwards Stadium",
    city: "Provo",
    state: "UT",
    country: "USA",
    latitude: 40.2573,
    longitude: -111.6546,
    reviewRadiusMeters: 1200,
    timeZone: "America/Denver",
    venueClass: "football-stadium"
  },
  /** Nippert Stadium — field center (Cincinnati). Distinct from TQL Stadium. */
  "nippert-stadium": {
    name: "Nippert Stadium",
    city: "Cincinnati",
    state: "OH",
    country: "USA",
    latitude: 39.1311,
    longitude: -84.5162,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Folsom Field — field center (Boulder). */
  "folsom-field": {
    name: "Folsom Field",
    city: "Boulder",
    state: "CO",
    country: "USA",
    latitude: 40.0093,
    longitude: -105.2661,
    reviewRadiusMeters: 1100,
    timeZone: "America/Denver",
    venueClass: "football-stadium"
  },
  /** TDECU Stadium / John O'Quinn Field — bowl center (Houston). Wikipedia footprint. */
  "tdecu-stadium": {
    name: "TDECU Stadium",
    city: "Houston",
    state: "TX",
    country: "USA",
    latitude: 29.7219,
    longitude: -95.3492,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Jack Trice Stadium — field center (Ames). */
  "jack-trice-stadium": {
    name: "Jack Trice Stadium",
    city: "Ames",
    state: "IA",
    country: "USA",
    latitude: 42.014,
    longitude: -93.6358,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /**
   * David Booth Kansas Memorial Stadium — field center (Lawrence).
   * Distinct from Allen Fieldhouse (basketball) and other Memorial Stadiums.
   */
  "david-booth-kansas-memorial-stadium": {
    name: "David Booth Kansas Memorial Stadium",
    city: "Lawrence",
    state: "KS",
    country: "USA",
    latitude: 38.9631,
    longitude: -95.2463,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Bill Snyder Family Stadium — field center (Manhattan). */
  "bill-snyder-family-stadium": {
    name: "Bill Snyder Family Stadium",
    city: "Manhattan",
    state: "KS",
    country: "USA",
    latitude: 39.202,
    longitude: -96.5938,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Boone Pickens Stadium — field center (Stillwater). */
  "boone-pickens-stadium": {
    name: "Boone Pickens Stadium",
    city: "Stillwater",
    state: "OK",
    country: "USA",
    latitude: 36.1257,
    longitude: -97.0676,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Amon G. Carter Stadium — field center (Fort Worth). */
  "amon-g-carter-stadium": {
    name: "Amon G. Carter Stadium",
    city: "Fort Worth",
    state: "TX",
    country: "USA",
    latitude: 32.7098,
    longitude: -97.368,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /**
   * Galaxy Stadium (Texas Tech) — field center (Lubbock).
   * Formerly Jones AT&T Stadium; aliases point here.
   */
  "galaxy-stadium": {
    name: "Galaxy Stadium",
    city: "Lubbock",
    state: "TX",
    country: "USA",
    latitude: 33.5911,
    longitude: -101.8728,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /**
   * Acrisure Bounce House (UCF) — field center (Orlando).
   * Formerly FBC Mortgage Stadium / Spectrum Stadium.
   */
  "acrisure-bounce-house": {
    name: "Acrisure Bounce House",
    city: "Orlando",
    state: "FL",
    country: "USA",
    latitude: 28.6091,
    longitude: -81.1924,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Rice-Eccles Stadium — field center (Salt Lake City). */
  "rice-eccles-stadium": {
    name: "Rice-Eccles Stadium",
    city: "Salt Lake City",
    state: "UT",
    country: "USA",
    latitude: 40.7599,
    longitude: -111.8489,
    reviewRadiusMeters: 1100,
    timeZone: "America/Denver",
    venueClass: "football-stadium"
  },
  /** Milan Puskar Stadium — field center (Morgantown). */
  "milan-puskar-stadium": {
    name: "Milan Puskar Stadium",
    city: "Morgantown",
    state: "WV",
    country: "USA",
    latitude: 39.6502,
    longitude: -79.955,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },

  // ── ACC Phase 1 football (bowl / field centers; OSM + athletics maps) ──
  /** Alumni Stadium — field center (Chestnut Hill). */
  "alumni-stadium": {
    name: "Alumni Stadium",
    city: "Chestnut Hill",
    state: "MA",
    country: "USA",
    latitude: 42.3351,
    longitude: -71.1664,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** California Memorial Stadium — field center (Berkeley). */
  "california-memorial-stadium": {
    name: "California Memorial Stadium",
    city: "Berkeley",
    state: "CA",
    country: "USA",
    latitude: 37.871,
    longitude: -122.2508,
    reviewRadiusMeters: 1100,
    timeZone: "America/Los_Angeles",
    venueClass: "football-stadium"
  },
  /** Memorial Stadium (Clemson / Death Valley) — field center. */
  "memorial-stadium-clemson": {
    name: "Memorial Stadium",
    city: "Clemson",
    state: "SC",
    country: "USA",
    latitude: 34.6788,
    longitude: -82.8432,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Wallace Wade Stadium — field center (Durham). */
  "wallace-wade-stadium": {
    name: "Wallace Wade Stadium",
    city: "Durham",
    state: "NC",
    country: "USA",
    latitude: 35.9953,
    longitude: -78.9419,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Doak Campbell Stadium — field center (Tallahassee). */
  "doak-campbell-stadium": {
    name: "Doak Campbell Stadium",
    city: "Tallahassee",
    state: "FL",
    country: "USA",
    latitude: 30.438,
    longitude: -84.3044,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Bobby Dodd Stadium at Hyundai Field — field center (Atlanta). */
  "bobby-dodd-stadium-at-hyundai-field": {
    name: "Bobby Dodd Stadium at Hyundai Field",
    city: "Atlanta",
    state: "GA",
    country: "USA",
    latitude: 33.7725,
    longitude: -84.3928,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** L&N Federal Credit Union Stadium — field center (Louisville). */
  "ln-federal-credit-union-stadium": {
    name: "L&N Federal Credit Union Stadium",
    city: "Louisville",
    state: "KY",
    country: "USA",
    latitude: 38.2058,
    longitude: -85.7589,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Kenan Memorial Stadium — field center (Chapel Hill). */
  "kenan-memorial-stadium": {
    name: "Kenan Memorial Stadium",
    city: "Chapel Hill",
    state: "NC",
    country: "USA",
    latitude: 35.9069,
    longitude: -79.0479,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Carter-Finley Stadium — field center (Raleigh). */
  "carter-finley-stadium": {
    name: "Carter-Finley Stadium",
    city: "Raleigh",
    state: "NC",
    country: "USA",
    latitude: 35.8006,
    longitude: -78.7194,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Gerald J. Ford Stadium — field center (Dallas / SMU). */
  "gerald-j-ford-stadium": {
    name: "Gerald J. Ford Stadium",
    city: "Dallas",
    state: "TX",
    country: "USA",
    latitude: 32.8405,
    longitude: -96.7828,
    reviewRadiusMeters: 1100,
    timeZone: "America/Chicago",
    venueClass: "football-stadium"
  },
  /** Stanford Stadium — field center. */
  "stanford-stadium": {
    name: "Stanford Stadium",
    city: "Stanford",
    state: "CA",
    country: "USA",
    latitude: 37.4346,
    longitude: -122.1611,
    reviewRadiusMeters: 1100,
    timeZone: "America/Los_Angeles",
    venueClass: "football-stadium"
  },
  /** JMA Wireless Dome — bowl center (Syracuse; formerly Carrier Dome). */
  "jma-wireless-dome": {
    name: "JMA Wireless Dome",
    city: "Syracuse",
    state: "NY",
    country: "USA",
    latitude: 43.0362,
    longitude: -76.1362,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Scott Stadium — field center (Charlottesville). */
  "scott-stadium": {
    name: "Scott Stadium",
    city: "Charlottesville",
    state: "VA",
    country: "USA",
    latitude: 38.0313,
    longitude: -78.5136,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Lane Stadium — field center (Blacksburg). */
  "lane-stadium": {
    name: "Lane Stadium",
    city: "Blacksburg",
    state: "VA",
    country: "USA",
    latitude: 37.22,
    longitude: -80.4181,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  },
  /** Allegacy Federal Credit Union Stadium — field center (Winston-Salem). */
  "allegacy-federal-credit-union-stadium": {
    name: "Allegacy Federal Credit Union Stadium",
    city: "Winston-Salem",
    state: "NC",
    country: "USA",
    latitude: 36.1306,
    longitude: -80.2547,
    reviewRadiusMeters: 1100,
    timeZone: "America/New_York",
    venueClass: "football-stadium"
  }
};

export function getNcaaVenueGeo(slug: string): NcaaVenueGeo | undefined {
  return NCAA_VENUE_GEO[slug.trim().toLowerCase()];
}
