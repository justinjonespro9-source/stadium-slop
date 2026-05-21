import { venueSlugFromImport } from "@/lib/import-slugs";

/** Canonical display name fixes from the source doc. */
export const MLS_NWSL_VENUE_NAME_ALIASES: Record<string, string> = {
  "mercedes-benz-stadium": "Mercedes-Benz Stadium",
  "bank-of-america-stadium": "Bank of America Stadium",
  "soldier-field": "Soldier Field",
  "gillette-stadium": "Gillette Stadium",
  "lumen-field": "Lumen Field",
  "yankee-stadium": "Yankee Stadium",
  "citi-field": "Citi Field",
  "dick-s-sporting-goods-park": "DICK'S Sporting Goods Park",
  "lower-com-field": "Lower.com Field",
  "inter-co-stadium": "Inter&Co Stadium",
  "co-stadium": "Inter&Co Stadium",
  "sports-illustrated-stadium": "Sports Illustrated Stadium",
  "st-louis-city-sc-stadium": "CITYPARK",
  "citypark": "CITYPARK",
  "stade-saputo-feels-less-like-american-stadium": "Stade Saputo",
  "america-first-field": "America First Field"
};

/**
 * Legacy orphan venue rows from early MLS/NWSL import — merge into canonical slugs
 * via `npm run cleanup:mls-nwsl-orphans` (see scripts/cleanup-mls-nwsl-orphan-venues.ts).
 */
export const MLS_NWSL_ORPHAN_VENUE_MERGES = [
  {
    label: "NYCFC parser orphan → Citi Field",
    aliasSlug: "citi-field-both-are-already-built-so-we-need-to-add-them-to-each",
    canonicalSlug: "citi-field"
  },
  {
    label: "Inter&Co parser orphan → Inter&Co Stadium",
    aliasSlug: "co-stadium",
    canonicalSlug: "inter-co-stadium"
  },
  {
    label: "Stade Saputo parser orphan → Stade Saputo",
    aliasSlug: "stade-saputo-feels-less-like-american-stadium",
    canonicalSlug: "stade-saputo"
  },
  {
    label: "Louisville parser typo → Lynn Family Stadium",
    aliasSlug: "lyn-family-stadium",
    canonicalSlug: "lynn-family-stadium"
  }
] as const;

/** Parser/import slug corrections (bad intro text, typos). */
export const MLS_NWSL_VENUE_SLUG_ALIASES: Record<string, string> = {
  "co-stadium": "inter-co-stadium",
  "stade-saputo-feels-less-like-american-stadium": "stade-saputo",
  "citi-field-both-are-already-built-so-we-need-to-add-them-to-each": "citi-field",
  "lyn-family-stadium": "lynn-family-stadium",
  "wakemed-soccer-park": "wakemed-soccer-park"
};

/**
 * Existing Stadium Slop venue slugs (NFL/MLB/NBA/NHL) — import merges into these
 * instead of creating duplicates.
 */
export const MLS_NWSL_EXISTING_VENUE_SLUGS = new Set([
  "mercedes-benz-stadium",
  "bank-of-america-stadium",
  "soldier-field",
  "gillette-stadium",
  "lumen-field",
  "yankee-stadium",
  "citi-field"
]);

export type MlsNwslVenueMeta = {
  name: string;
  city: string;
  state: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

/** City/state/coords for soccer-specific or shared venues. */
export const MLS_NWSL_VENUE_META: Record<string, MlsNwslVenueMeta> = {
  "mercedes-benz-stadium": {
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    state: "GA",
    latitude: 33.7554,
    longitude: -84.4008
  },
  "bank-of-america-stadium": {
    name: "Bank of America Stadium",
    city: "Charlotte",
    state: "NC",
    latitude: 35.2258,
    longitude: -80.8528
  },
  "soldier-field": {
    name: "Soldier Field",
    city: "Chicago",
    state: "IL",
    latitude: 41.8623,
    longitude: -87.6167
  },
  "gillette-stadium": {
    name: "Gillette Stadium",
    city: "Foxborough",
    state: "MA",
    latitude: 42.0909,
    longitude: -71.2643
  },
  "lumen-field": {
    name: "Lumen Field",
    city: "Seattle",
    state: "WA",
    latitude: 47.5952,
    longitude: -122.3316
  },
  "yankee-stadium": {
    name: "Yankee Stadium",
    city: "Bronx",
    state: "NY",
    latitude: 40.8296,
    longitude: -73.9265
  },
  "citi-field": {
    name: "Citi Field",
    city: "Flushing",
    state: "NY",
    latitude: 40.7571,
    longitude: -73.8458
  },
  "q2-stadium": {
    name: "Q2 Stadium",
    city: "Austin",
    state: "TX",
    latitude: 30.3878,
    longitude: -97.7194
  },
  "tql-stadium": {
    name: "TQL Stadium",
    city: "Cincinnati",
    state: "OH",
    latitude: 39.1113,
    longitude: -84.5223
  },
  "dick-s-sporting-goods-park": {
    name: "DICK'S Sporting Goods Park",
    city: "Commerce City",
    state: "CO",
    latitude: 39.8057,
    longitude: -104.8918
  },
  "lower-com-field": {
    name: "Lower.com Field",
    city: "Columbus",
    state: "OH",
    latitude: 39.9689,
    longitude: -83.0093
  },
  "audi-field": {
    name: "Audi Field",
    city: "Washington",
    state: "DC",
    latitude: 38.8689,
    longitude: -77.0129
  },
  "toyota-stadium": {
    name: "Toyota Stadium",
    city: "Frisco",
    state: "TX",
    latitude: 33.1544,
    longitude: -96.8353
  },
  "shell-energy-stadium": {
    name: "Shell Energy Stadium",
    city: "Houston",
    state: "TX",
    latitude: 29.7522,
    longitude: -95.352
  },
  "chase-stadium": {
    name: "Chase Stadium",
    city: "Fort Lauderdale",
    state: "FL",
    latitude: 26.1932,
    longitude: -80.1607
  },
  "dignity-health-sports-park": {
    name: "Dignity Health Sports Park",
    city: "Carson",
    state: "CA",
    latitude: 33.8643,
    longitude: -118.2611
  },
  "bmo-stadium": {
    name: "BMO Stadium",
    city: "Los Angeles",
    state: "CA",
    latitude: 34.0127,
    longitude: -118.2845
  },
  "allianz-field": {
    name: "Allianz Field",
    city: "Saint Paul",
    state: "MN",
    latitude: 44.9526,
    longitude: -93.165
  },
  "stade-saputo": {
    name: "Stade Saputo",
    city: "Montreal",
    state: "QC",
    country: "Canada",
    latitude: 45.5629,
    longitude: -73.5533
  },
  "geodis-park": {
    name: "GEODIS Park",
    city: "Nashville",
    state: "TN",
    latitude: 36.1302,
    longitude: -86.7755
  },
  "sports-illustrated-stadium": {
    name: "Sports Illustrated Stadium",
    city: "Harrison",
    state: "NJ",
    latitude: 40.7368,
    longitude: -74.1503
  },
  "inter-co-stadium": {
    name: "Inter&Co Stadium",
    city: "Orlando",
    state: "FL",
    latitude: 28.5389,
    longitude: -81.3839
  },
  "subaru-park": {
    name: "Subaru Park",
    city: "Chester",
    state: "PA",
    latitude: 39.8328,
    longitude: -75.3785
  },
  "providence-park": {
    name: "Providence Park",
    city: "Portland",
    state: "OR",
    latitude: 45.5215,
    longitude: -122.6919
  },
  "snapdragon-stadium": {
    name: "Snapdragon Stadium",
    city: "San Diego",
    state: "CA",
    latitude: 32.7841,
    longitude: -117.1225
  },
  "paypal-park": {
    name: "PayPal Park",
    city: "San Jose",
    state: "CA",
    latitude: 37.3504,
    longitude: -121.9243
  },
  "citypark": {
    name: "CITYPARK",
    city: "St. Louis",
    state: "MO",
    latitude: 38.6318,
    longitude: -90.2104
  },
  "bmo-field": {
    name: "BMO Field",
    city: "Toronto",
    state: "ON",
    country: "Canada",
    latitude: 43.6332,
    longitude: -79.4186
  },
  "bc-place": {
    name: "BC Place",
    city: "Vancouver",
    state: "BC",
    country: "Canada",
    latitude: 49.2768,
    longitude: -123.1119
  },
  "northwestern-medicine-field-at-martin-stadium": {
    name: "Northwestern Medicine Field at Martin Stadium",
    city: "Evanston",
    state: "IL",
    latitude: 42.0654,
    longitude: -87.6925
  },
  "cpkc-stadium": {
    name: "CPKC Stadium",
    city: "Kansas City",
    state: "MO",
    latitude: 39.121,
    longitude: -94.577
  },
  "centennial-stadium": {
    name: "Centennial Stadium",
    city: "Denver",
    state: "CO",
    latitude: 39.682,
    longitude: -104.962
  },
  "wakemed-soccer-park": {
    name: "WakeMed Soccer Park",
    city: "Cary",
    state: "NC",
    latitude: 35.7878,
    longitude: -78.7411
  },
  "lynn-family-stadium": {
    name: "Lynn Family Stadium",
    city: "Louisville",
    state: "KY",
    latitude: 38.254,
    longitude: -85.7594
  },
  "america-first-field": {
    name: "America First Field",
    city: "Sandy",
    state: "UT",
    latitude: 40.528,
    longitude: -111.884
  }
};

/** Extra tenants when doc lists multiple teams on one venue. */
export const MLS_NWSL_SHARED_VENUE_TEAMS: Record<string, readonly string[]> = {
  "mercedes-benz-stadium": ["Atlanta United FC"],
  "bank-of-america-stadium": ["Charlotte FC"],
  "soldier-field": ["Chicago Fire FC"],
  "gillette-stadium": ["New England Revolution", "Boston Legacy FC"],
  "lumen-field": ["Seattle Sounders FC", "Seattle Reign FC"],
  "yankee-stadium": ["New York City FC"],
  "citi-field": ["New York City FC"],
  "audi-field": ["D.C. United", "Washington Spirit"],
  "shell-energy-stadium": ["Houston Dynamo FC", "Houston Dash"],
  "bmo-stadium": ["LAFC", "Angel City FC"],
  "providence-park": ["Portland Timbers", "Portland Thorns FC"],
  "paypal-park": ["San Jose Earthquakes", "Bay FC"],
  "snapdragon-stadium": ["San Diego FC", "San Diego Wave FC"],
  "inter-co-stadium": ["Orlando City SC", "Orlando Pride"],
  "sports-illustrated-stadium": ["New York Red Bulls", "NJ/NY Gotham FC"]
};

const VENUE_NAME_PATTERN =
  /(?:stadium|stade|field|park|arena|place|centre|center|bowl|garden|grounds|citypark|saputo)/i;

export function looksLikeMlsNwslVenueName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed.length > 2 &&
    trimmed.length < 90 &&
    VENUE_NAME_PATTERN.test(trimmed) &&
    !/^(verde|welcome|marching)/i.test(trimmed)
  );
}

export function normalizeMlsNwslVenueName(raw: string): string {
  let name = raw
    .replace(/\s*\([^)]*(?:already imported|already in the system|just need|same as)[^)]*\)\s*/gi, "")
    .replace(/\s*\(.*already imported.*\)\s*/gi, "")
    .replace(/\s*\(.*just need.*\)\s*/gi, "")
    .replace(/\s*\(.*new park.*\)\s*/gi, "")
    .replace(/\s*\(.*both are already.*\)\s*/gi, "")
    .replace(/\.\./g, ".")
    .trim()
    .replace(/\.$/, "");

  if (/^dick['\u2019]?s sporting goods park$/i.test(name)) {
    return "DICK'S Sporting Goods Park";
  }
  if (/^lower\.com field$/i.test(name)) {
    return "Lower.com Field";
  }
  if (/^st,?\s*louis city/i.test(name) || /^citypark$/i.test(name)) {
    return "CITYPARK";
  }
  if (/^sports illustrated stadium$/i.test(name)) {
    return "Sports Illustrated Stadium";
  }
  if (/^inter&co stadium$/i.test(name)) {
    return "Inter&Co Stadium";
  }
  if (/^geodis park$/i.test(name)) {
    return "GEODIS Park";
  }
  if (/^america first field$/i.test(name)) {
    return "America First Field";
  }

  const feelsIdx = name.search(/\s+feels\s+less\s+like\b/i);
  if (feelsIdx > 0) {
    name = name.slice(0, feelsIdx).trim();
  }

  return name;
}

export function resolveMlsNwslVenueSlug(venueName: string): string {
  const normalized = normalizeMlsNwslVenueName(venueName);
  let slug = venueSlugFromImport(normalized);
  if (MLS_NWSL_VENUE_SLUG_ALIASES[slug]) {
    slug = MLS_NWSL_VENUE_SLUG_ALIASES[slug]!;
  }
  if (slug === "st-louis-city-sc-stadium") {
    slug = "citypark";
  }
  return slug;
}

export function venueMetaForSlug(slug: string, fallbackName: string): MlsNwslVenueMeta {
  const known = MLS_NWSL_VENUE_META[slug];
  if (known) {
    return known;
  }
  return {
    name: MLS_NWSL_VENUE_NAME_ALIASES[slug] ?? fallbackName,
    city: "TBD",
    state: "TBD"
  };
}
