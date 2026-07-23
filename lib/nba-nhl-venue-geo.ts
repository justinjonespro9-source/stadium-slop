/**
 * NBA / NHL / WNBA arena geolocation registry (review-certification centers).
 * Coordinates: arena structure center from Wikidata P625 (enwiki) or OpenStreetMap
 * leisure=stadium centroids where Wikidata was missing/coarse.
 * See data/venue-geo/zero-coord-backfill-backlog.json for per-venue sources.
 *
 * reviewRadiusMeters mirrors current DB values for this backfill (typically 800).
 * Do not change radii here without a documented venue-specific reason.
 */

export type NbaNhlVenueGeo = {
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
};

export const NBA_NHL_VENUE_GEO: Record<string, NbaNhlVenueGeo> = {
  "amerant-bank-arena": {
    name: "Amerant Bank Arena",
    city: "Sunrise",
    state: "FL",
    country: "USA",
    latitude: 26.1583,
    longitude: -80.3256,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "american-airlines-center": {
    name: "American Airlines Center",
    city: "Dallas",
    state: "TX",
    country: "USA",
    latitude: 32.7906,
    longitude: -96.8103,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "ball-arena": {
    name: "Ball Arena",
    city: "Denver",
    state: "CO",
    country: "USA",
    latitude: 39.7486,
    longitude: -105.0075,
    reviewRadiusMeters: 800,
    timeZone: "America/Denver"
  },
  "barclays-center": {
    name: "Barclays Center",
    city: "Brooklyn",
    state: "NY",
    country: "USA",
    latitude: 40.6827,
    longitude: -73.9752,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "bell-centre": {
    name: "Bell Centre",
    city: "Montreal",
    state: "QC",
    country: "Canada",
    latitude: 45.4961,
    longitude: -73.5694,
    reviewRadiusMeters: 800,
    timeZone: "America/Toronto"
  },
  "benchmark-international-arena": {
    name: "Benchmark International Arena",
    city: "Tampa",
    state: "FL",
    country: "USA",
    latitude: 27.9428,
    longitude: -82.4519,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "bridgestone-arena": {
    name: "Bridgestone Arena",
    city: "Nashville",
    state: "TN",
    country: "USA",
    latitude: 36.1592,
    longitude: -86.7786,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "canada-life-centre": {
    name: "Canada Life Centre",
    city: "Winnipeg",
    state: "MB",
    country: "Canada",
    latitude: 49.8928,
    longitude: -97.1436,
    reviewRadiusMeters: 800,
    timeZone: "America/Winnipeg"
  },
  "canadian-tire-centre": {
    name: "Canadian Tire Centre",
    city: "Ottawa",
    state: "ON",
    country: "Canada",
    latitude: 45.2969,
    longitude: -75.9272,
    reviewRadiusMeters: 800,
    timeZone: "America/Toronto"
  },
  "capital-one-arena": {
    name: "Capital One Arena",
    city: "Washington",
    state: "DC",
    country: "USA",
    latitude: 38.8981,
    longitude: -77.0208,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "chase-center": {
    name: "Chase Center",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    latitude: 37.7678,
    longitude: -122.3874,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "climate-pledge-arena": {
    name: "Climate Pledge Arena",
    city: "Seattle",
    state: "WA",
    country: "USA",
    latitude: 47.6222,
    longitude: -122.3542,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "crypto-com-arena": {
    name: "Crypto.com Arena",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    latitude: 34.0431,
    longitude: -118.2672,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "delta-center": {
    name: "Delta Center",
    city: "Salt Lake City",
    state: "UT",
    country: "USA",
    latitude: 40.7683,
    longitude: -111.9011,
    reviewRadiusMeters: 800,
    timeZone: "America/Denver"
  },
  "enterprise-center": {
    name: "Enterprise Center",
    city: "St. Louis",
    state: "MO",
    country: "USA",
    latitude: 38.6267,
    longitude: -90.2025,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "fedexforum": {
    name: "FedExForum",
    city: "Memphis",
    state: "TN",
    country: "USA",
    latitude: 35.1383,
    longitude: -90.0506,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "fiserv-forum": {
    name: "Fiserv Forum",
    city: "Milwaukee",
    state: "WI",
    country: "USA",
    latitude: 43.0451,
    longitude: -87.9182,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "footprint-center": {
    name: "Footprint Center",
    city: "Phoenix",
    state: "AZ",
    country: "USA",
    latitude: 33.446,
    longitude: -112.0711,
    reviewRadiusMeters: 800,
    timeZone: "America/Phoenix"
  },
  "frost-bank-center": {
    name: "Frost Bank Center",
    city: "San Antonio",
    state: "TX",
    country: "USA",
    latitude: 29.4269,
    longitude: -98.4375,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "gainbridge-fieldhouse": {
    name: "Gainbridge Fieldhouse",
    city: "Indianapolis",
    state: "IN",
    country: "USA",
    latitude: 39.7639,
    longitude: -86.1556,
    reviewRadiusMeters: 800,
    timeZone: "America/Indiana/Indianapolis"
  },
  "golden-1-center": {
    name: "Golden 1 Center",
    city: "Sacramento",
    state: "CA",
    country: "USA",
    latitude: 38.5801,
    longitude: -121.4995,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "honda-center": {
    name: "Honda Center",
    city: "Anaheim",
    state: "CA",
    country: "USA",
    latitude: 33.8078,
    longitude: -117.8767,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "intuit-dome": {
    name: "Intuit Dome",
    city: "Inglewood",
    state: "CA",
    country: "USA",
    latitude: 33.9451,
    longitude: -118.3431,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "kaseya-center": {
    name: "Kaseya Center",
    city: "Miami",
    state: "FL",
    country: "USA",
    latitude: 25.7814,
    longitude: -80.1881,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "keybank-center": {
    name: "KeyBank Center",
    city: "Buffalo",
    state: "NY",
    country: "USA",
    latitude: 42.875,
    longitude: -78.8764,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "kia-center": {
    name: "Kia Center",
    city: "Orlando",
    state: "FL",
    country: "USA",
    latitude: 28.5392,
    longitude: -81.3836,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "lenovo-center": {
    name: "Lenovo Center",
    city: "Raleigh",
    state: "NC",
    country: "USA",
    latitude: 35.8033,
    longitude: -78.7219,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "little-caesars-arena": {
    name: "Little Caesars Arena",
    city: "Detroit",
    state: "MI",
    country: "USA",
    latitude: 42.3412,
    longitude: -83.0549,
    reviewRadiusMeters: 800,
    timeZone: "America/Detroit"
  },
  "madison-square-garden": {
    name: "Madison Square Garden",
    city: "New York",
    state: "NY",
    country: "USA",
    latitude: 40.7505,
    longitude: -73.9935,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "moda-center": {
    name: "Moda Center",
    city: "Portland",
    state: "OR",
    country: "USA",
    latitude: 45.5317,
    longitude: -122.6667,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "nationwide-arena": {
    name: "Nationwide Arena",
    city: "Columbus",
    state: "OH",
    country: "USA",
    latitude: 39.9693,
    longitude: -83.0061,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "paycom-center": {
    name: "Paycom Center",
    city: "Oklahoma City",
    state: "OK",
    country: "USA",
    latitude: 35.4633,
    longitude: -97.515,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "ppg-paints-arena": {
    name: "PPG Paints Arena",
    city: "Pittsburgh",
    state: "PA",
    country: "USA",
    latitude: 40.4394,
    longitude: -79.9892,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "prudential-center": {
    name: "Prudential Center",
    city: "Newark",
    state: "NJ",
    country: "USA",
    latitude: 40.7336,
    longitude: -74.1711,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "rocket-arena": {
    name: "Rocket Arena",
    city: "Cleveland",
    state: "OH",
    country: "USA",
    latitude: 41.4964,
    longitude: -81.6881,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "rogers-arena": {
    name: "Rogers Arena",
    city: "Vancouver",
    state: "BC",
    country: "Canada",
    latitude: 49.2778,
    longitude: -123.1089,
    reviewRadiusMeters: 800,
    timeZone: "America/Vancouver"
  },
  "rogers-place": {
    name: "Rogers Place",
    city: "Edmonton",
    state: "AB",
    country: "Canada",
    latitude: 53.5469,
    longitude: -113.4978,
    reviewRadiusMeters: 800,
    timeZone: "America/Edmonton"
  },
  "sap-center": {
    name: "SAP Center",
    city: "San Jose",
    state: "CA",
    country: "USA",
    latitude: 37.3328,
    longitude: -121.9011,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "scotiabank-arena": {
    name: "Scotiabank Arena",
    city: "Toronto",
    state: "ON",
    country: "Canada",
    latitude: 43.6433,
    longitude: -79.3792,
    reviewRadiusMeters: 800,
    timeZone: "America/Toronto"
  },
  "scotiabank-saddledome": {
    name: "Scotiabank Saddledome",
    city: "Calgary",
    state: "AB",
    country: "Canada",
    latitude: 51.0375,
    longitude: -114.0519,
    reviewRadiusMeters: 800,
    timeZone: "America/Edmonton"
  },
  "smoothie-king-center": {
    name: "Smoothie King Center",
    city: "New Orleans",
    state: "LA",
    country: "USA",
    latitude: 29.9489,
    longitude: -90.0819,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "spectrum-center": {
    name: "Spectrum Center",
    city: "Charlotte",
    state: "NC",
    country: "USA",
    latitude: 35.225,
    longitude: -80.8392,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "state-farm-arena": {
    name: "State Farm Arena",
    city: "Atlanta",
    state: "GA",
    country: "USA",
    latitude: 33.7572,
    longitude: -84.3964,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "t-mobile-arena": {
    name: "T-Mobile Arena",
    city: "Las Vegas",
    state: "NV",
    country: "USA",
    latitude: 36.1029,
    longitude: -115.1784,
    reviewRadiusMeters: 800,
    timeZone: "America/Los_Angeles"
  },
  "target-center": {
    name: "Target Center",
    city: "Minneapolis",
    state: "MN",
    country: "USA",
    latitude: 44.9794,
    longitude: -93.2761,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "td-garden": {
    name: "TD Garden",
    city: "Boston",
    state: "MA",
    country: "USA",
    latitude: 42.3664,
    longitude: -71.0622,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "toyota-center": {
    name: "Toyota Center",
    city: "Houston",
    state: "TX",
    country: "USA",
    latitude: 29.7508,
    longitude: -95.3622,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "ubs-arena": {
    name: "UBS Arena",
    city: "Elmont",
    state: "NY",
    country: "USA",
    latitude: 40.7121,
    longitude: -73.7272,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  },
  "united-center": {
    name: "United Center",
    city: "Chicago",
    state: "IL",
    country: "USA",
    latitude: 41.8806,
    longitude: -87.6742,
    reviewRadiusMeters: 800,
    timeZone: "America/Chicago"
  },
  "wells-fargo-center": {
    name: "Wells Fargo Center",
    city: "Philadelphia",
    state: "PA",
    country: "USA",
    latitude: 39.9012,
    longitude: -75.172,
    reviewRadiusMeters: 800,
    timeZone: "America/New_York"
  }
};

export function getNbaNhlVenueGeo(slug: string): NbaNhlVenueGeo | undefined {
  return NBA_NHL_VENUE_GEO[slug.trim().toLowerCase()];
}

export const NBA_NHL_VENUE_SLUGS = Object.keys(NBA_NHL_VENUE_GEO).sort();
