/**
 * Authoritative MLS/NWSL venue geolocation + review radius registry.
 * Sources: stadium operator sites, OpenStreetMap/Wikidata pitch centers, league venues.
 */

export type MlsNwslVenueClass = "soccer-specific" | "shared-nfl" | "campus-park";

export type MlsNwslVenueGeo = {
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
  venueClass: MlsNwslVenueClass;
};

/** All MLS/NWSL venue slugs with geo profiles (canonical list). */
export const MLS_NWSL_VENUE_GEO: Record<string, MlsNwslVenueGeo> = {
  "mercedes-benz-stadium": {
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    state: "GA",
    country: "USA",
    latitude: 33.7554,
    longitude: -84.4008,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York",
    venueClass: "shared-nfl"
  },
  "bank-of-america-stadium": {
    name: "Bank of America Stadium",
    city: "Charlotte",
    state: "NC",
    country: "USA",
    latitude: 35.2258,
    longitude: -80.8528,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York",
    venueClass: "shared-nfl"
  },
  "soldier-field": {
    name: "Soldier Field",
    city: "Chicago",
    state: "IL",
    country: "USA",
    latitude: 41.8623,
    longitude: -87.6167,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago",
    venueClass: "shared-nfl"
  },
  "gillette-stadium": {
    name: "Gillette Stadium",
    city: "Foxborough",
    state: "MA",
    country: "USA",
    latitude: 42.0909,
    longitude: -71.2643,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York",
    venueClass: "shared-nfl"
  },
  "lumen-field": {
    name: "Lumen Field",
    city: "Seattle",
    state: "WA",
    country: "USA",
    latitude: 47.5952,
    longitude: -122.3316,
    reviewRadiusMeters: 1000,
    timeZone: "America/Los_Angeles",
    venueClass: "shared-nfl"
  },
  "yankee-stadium": {
    name: "Yankee Stadium",
    city: "Bronx",
    state: "NY",
    country: "USA",
    latitude: 40.8296,
    longitude: -73.9265,
    reviewRadiusMeters: 950,
    timeZone: "America/New_York",
    venueClass: "shared-nfl"
  },
  "citi-field": {
    name: "Citi Field",
    city: "Flushing",
    state: "NY",
    country: "USA",
    latitude: 40.7561,
    longitude: -73.8458,
    reviewRadiusMeters: 950,
    timeZone: "America/New_York",
    venueClass: "shared-nfl"
  },
  "q2-stadium": {
    name: "Q2 Stadium",
    city: "Austin",
    state: "TX",
    country: "USA",
    latitude: 30.3878,
    longitude: -97.7194,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  },
  "tql-stadium": {
    name: "TQL Stadium",
    city: "Cincinnati",
    state: "OH",
    country: "USA",
    latitude: 39.1114,
    longitude: -84.5223,
    reviewRadiusMeters: 750,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "dick-s-sporting-goods-park": {
    name: "DICK'S Sporting Goods Park",
    city: "Commerce City",
    state: "CO",
    country: "USA",
    latitude: 39.8057,
    longitude: -104.8919,
    reviewRadiusMeters: 1000,
    timeZone: "America/Denver",
    venueClass: "campus-park"
  },
  "lower-com-field": {
    name: "Lower.com Field",
    city: "Columbus",
    state: "OH",
    country: "USA",
    latitude: 39.9689,
    longitude: -83.0094,
    reviewRadiusMeters: 750,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "audi-field": {
    name: "Audi Field",
    city: "Washington",
    state: "DC",
    country: "USA",
    latitude: 38.8683,
    longitude: -77.0129,
    reviewRadiusMeters: 700,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "toyota-stadium": {
    name: "Toyota Stadium",
    city: "Frisco",
    state: "TX",
    country: "USA",
    latitude: 33.1544,
    longitude: -96.835,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  },
  "shell-energy-stadium": {
    name: "Shell Energy Stadium",
    city: "Houston",
    state: "TX",
    country: "USA",
    latitude: 29.7522,
    longitude: -95.3521,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  },
  "chase-stadium": {
    name: "Chase Stadium",
    city: "Fort Lauderdale",
    state: "FL",
    country: "USA",
    latitude: 26.1931,
    longitude: -80.1609,
    reviewRadiusMeters: 750,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  // Nu Stadium replaced Chase Stadium as Inter Miami CF's home in 2026
  "nu-stadium": {
    name: "Nu Stadium",
    city: "Miami",
    state: "FL",
    country: "USA",
    latitude: 25.7796,
    longitude: -80.3185,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "dignity-health-sports-park": {
    name: "Dignity Health Sports Park",
    city: "Carson",
    state: "CA",
    country: "USA",
    latitude: 33.8644,
    longitude: -118.2611,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles",
    venueClass: "soccer-specific"
  },
  "bmo-stadium": {
    name: "BMO Stadium",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    latitude: 34.0128,
    longitude: -118.2844,
    reviewRadiusMeters: 750,
    timeZone: "America/Los_Angeles",
    venueClass: "soccer-specific"
  },
  "allianz-field": {
    name: "Allianz Field",
    city: "Saint Paul",
    state: "MN",
    country: "USA",
    latitude: 44.9528,
    longitude: -93.165,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  },
  "stade-saputo": {
    name: "Stade Saputo",
    city: "Montreal",
    state: "QC",
    country: "Canada",
    latitude: 45.5629,
    longitude: -73.5534,
    reviewRadiusMeters: 750,
    timeZone: "America/Toronto",
    venueClass: "soccer-specific"
  },
  "geodis-park": {
    name: "GEODIS Park",
    city: "Nashville",
    state: "TN",
    country: "USA",
    latitude: 36.1303,
    longitude: -86.7655,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  },
  "sports-illustrated-stadium": {
    name: "Sports Illustrated Stadium",
    city: "Harrison",
    state: "NJ",
    country: "USA",
    latitude: 40.7368,
    longitude: -74.1503,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "inter-co-stadium": {
    name: "Inter&Co Stadium",
    city: "Orlando",
    state: "FL",
    country: "USA",
    latitude: 28.5392,
    longitude: -81.3899,
    reviewRadiusMeters: 750,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "subaru-park": {
    name: "Subaru Park",
    city: "Chester",
    state: "PA",
    country: "USA",
    latitude: 39.8328,
    longitude: -75.3786,
    reviewRadiusMeters: 750,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "providence-park": {
    name: "Providence Park",
    city: "Portland",
    state: "OR",
    country: "USA",
    latitude: 45.5215,
    longitude: -122.6919,
    reviewRadiusMeters: 650,
    timeZone: "America/Los_Angeles",
    venueClass: "soccer-specific"
  },
  "snapdragon-stadium": {
    name: "Snapdragon Stadium",
    city: "San Diego",
    state: "CA",
    country: "USA",
    latitude: 32.784,
    longitude: -117.1224,
    reviewRadiusMeters: 750,
    timeZone: "America/Los_Angeles",
    venueClass: "soccer-specific"
  },
  "paypal-park": {
    name: "PayPal Park",
    city: "San Jose",
    state: "CA",
    country: "USA",
    latitude: 37.3503,
    longitude: -121.9243,
    reviewRadiusMeters: 750,
    timeZone: "America/Los_Angeles",
    venueClass: "soccer-specific"
  },
  citypark: {
    name: "CITYPARK",
    city: "St. Louis",
    state: "MO",
    country: "USA",
    latitude: 38.6347,
    longitude: -90.2109,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  },
  "bmo-field": {
    name: "BMO Field",
    city: "Toronto",
    state: "ON",
    country: "Canada",
    latitude: 43.6332,
    longitude: -79.4186,
    reviewRadiusMeters: 750,
    timeZone: "America/Toronto",
    venueClass: "soccer-specific"
  },
  "bc-place": {
    name: "BC Place",
    city: "Vancouver",
    state: "BC",
    country: "Canada",
    latitude: 49.2768,
    longitude: -123.112,
    reviewRadiusMeters: 800,
    timeZone: "America/Vancouver",
    venueClass: "soccer-specific"
  },
  "northwestern-medicine-field-at-martin-stadium": {
    name: "Northwestern Medicine Field at Martin Stadium",
    city: "Evanston",
    state: "IL",
    country: "USA",
    latitude: 42.0569,
    longitude: -87.6756,
    reviewRadiusMeters: 1000,
    timeZone: "America/Chicago",
    venueClass: "campus-park"
  },
  "cpkc-stadium": {
    name: "CPKC Stadium",
    city: "Kansas City",
    state: "MO",
    country: "USA",
    latitude: 39.1214,
    longitude: -94.5775,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  },
  "centennial-stadium": {
    name: "Centennial Stadium",
    city: "Denver",
    state: "CO",
    country: "USA",
    latitude: 39.7429,
    longitude: -104.9622,
    reviewRadiusMeters: 1000,
    timeZone: "America/Denver",
    venueClass: "campus-park"
  },
  "wakemed-soccer-park": {
    name: "WakeMed Soccer Park",
    city: "Cary",
    state: "NC",
    country: "USA",
    latitude: 35.7876,
    longitude: -78.7411,
    reviewRadiusMeters: 1000,
    timeZone: "America/New_York",
    venueClass: "campus-park"
  },
  "lynn-family-stadium": {
    name: "Lynn Family Stadium",
    city: "Louisville",
    state: "KY",
    country: "USA",
    latitude: 38.2653,
    longitude: -85.7594,
    reviewRadiusMeters: 750,
    timeZone: "America/New_York",
    venueClass: "soccer-specific"
  },
  "america-first-field": {
    name: "America First Field",
    city: "Sandy",
    state: "UT",
    country: "USA",
    latitude: 40.528,
    longitude: -111.8842,
    reviewRadiusMeters: 750,
    timeZone: "America/Denver",
    venueClass: "soccer-specific"
  },
  "sporting-park": {
    name: "Sporting Park",
    city: "Kansas City",
    state: "KS",
    country: "USA",
    latitude: 39.1216,
    longitude: -94.8233,
    reviewRadiusMeters: 750,
    timeZone: "America/Chicago",
    venueClass: "soccer-specific"
  }
};

export const MLS_NWSL_VENUE_SLUGS = Object.keys(MLS_NWSL_VENUE_GEO).sort();

export function getMlsNwslVenueGeo(slug: string): MlsNwslVenueGeo | null {
  return MLS_NWSL_VENUE_GEO[slug] ?? null;
}

/** IANA timezone per slug for `getVenueTimeZone`. */
export function buildMlsNwslVenueTimeZoneMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [slug, geo] of Object.entries(MLS_NWSL_VENUE_GEO)) {
    map[slug] = geo.timeZone;
  }
  return map;
}

export function isValidVenueCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

const COORD_EPSILON = 0.00015;

export function coordinatesMatchRegistry(
  slug: string,
  lat: number,
  lng: number
): boolean {
  const geo = getMlsNwslVenueGeo(slug);
  if (!geo) return false;
  return (
    Math.abs(lat - geo.latitude) <= COORD_EPSILON &&
    Math.abs(lng - geo.longitude) <= COORD_EPSILON
  );
}
