import { venueSlugFromImport } from "@/lib/import-slugs";
import {
  getMlsNwslVenueGeo,
  MLS_NWSL_VENUE_GEO,
  type MlsNwslVenueGeo
} from "@/lib/mls-nwsl-venue-geo";

export { MLS_NWSL_VENUE_GEO, getMlsNwslVenueGeo, type MlsNwslVenueGeo };

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
  reviewRadiusMeters?: number;
  timeZone?: string;
};

function geoToMeta(geo: MlsNwslVenueGeo): MlsNwslVenueMeta {
  return {
    name: geo.name,
    city: geo.city,
    state: geo.state,
    country: geo.country,
    latitude: geo.latitude,
    longitude: geo.longitude,
    reviewRadiusMeters: geo.reviewRadiusMeters,
    timeZone: geo.timeZone
  };
}

/** City/state/coords/radius/timezone for soccer-specific or shared venues. */
export const MLS_NWSL_VENUE_META: Record<string, MlsNwslVenueMeta> = Object.fromEntries(
  Object.entries(MLS_NWSL_VENUE_GEO).map(([slug, geo]) => [slug, geoToMeta(geo)])
);

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
  "sports-illustrated-stadium": ["New York Red Bulls", "NJ/NY Gotham FC"],
  "sporting-park": ["Sporting Kansas City"],
  "nu-stadium": ["Inter Miami CF"]
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
  const geo = getMlsNwslVenueGeo(slug);
  if (geo) {
    return geoToMeta(geo);
  }
  return {
    name: MLS_NWSL_VENUE_NAME_ALIASES[slug] ?? fallbackName,
    city: "TBD",
    state: "TBD"
  };
}
