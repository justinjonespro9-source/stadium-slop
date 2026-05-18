import type { Venue } from "@/lib/sample-data";
import { teamShortLabel } from "@/lib/venue-teams";

export const VENUE_SEARCH_EMPTY_HEADLINE = "No venue found yet.";
export const VENUE_SEARCH_EMPTY_HINT = "Try a city, team, league, or ballpark name.";
/** @deprecated Prefer structured empty UI; kept for callers that still expect one string. */
export const VENUE_SEARCH_EMPTY_MESSAGE =
  `${VENUE_SEARCH_EMPTY_HEADLINE} ${VENUE_SEARCH_EMPTY_HINT}`;
export const VENUE_SEARCH_EMPTY_FUTURE = "Suggest a venue coming soon.";

export const VENUE_SEARCH_HELPER_COPY =
  "Search by venue, team, city, or league.";

export type VenueSearchOptions = {
  /** Aggregated FoodItem.tags (or import tags) keyed by venue slug. */
  itemTagsByVenueSlug?: Record<string, readonly string[]>;
};

/** Expand 2-letter US state codes so queries like “minnesota” still match MN rows. */
const US_STATE_NAME_BY_ABBREV: Record<string, string> = {
  AL: "alabama",
  AK: "alaska",
  AZ: "arizona",
  AR: "arkansas",
  CA: "california",
  CO: "colorado",
  CT: "connecticut",
  DE: "delaware",
  DC: "district of columbia",
  FL: "florida",
  GA: "georgia",
  HI: "hawaii",
  ID: "idaho",
  IL: "illinois",
  IN: "indiana",
  IA: "iowa",
  KS: "kansas",
  KY: "kentucky",
  LA: "louisiana",
  ME: "maine",
  MD: "maryland",
  MA: "massachusetts",
  MI: "michigan",
  MN: "minnesota",
  MS: "mississippi",
  MO: "missouri",
  MT: "montana",
  NE: "nebraska",
  NV: "nevada",
  NH: "new hampshire",
  NJ: "new jersey",
  NM: "new mexico",
  NY: "new york",
  NC: "north carolina",
  ND: "north dakota",
  OH: "ohio",
  OK: "oklahoma",
  OR: "oregon",
  PA: "pennsylvania",
  RI: "rhode island",
  SC: "south carolina",
  SD: "south dakota",
  TN: "tennessee",
  TX: "texas",
  UT: "utah",
  VT: "vermont",
  VA: "virginia",
  WA: "washington",
  WV: "west virginia",
  WI: "wisconsin",
  WY: "wyoming"
};

const CA_PROVINCE_NAME_BY_ABBREV: Record<string, string> = {
  AB: "alberta",
  BC: "british columbia",
  MB: "manitoba",
  NB: "new brunswick",
  NL: "newfoundland",
  NS: "nova scotia",
  ON: "ontario",
  PE: "prince edward island",
  QC: "quebec",
  SK: "saskatchewan"
};

/** Query token → extra phrases that should count as a match for that token. */
const SEARCH_TOKEN_PHRASES: Record<string, readonly string[]> = {
  la: ["los angeles"],
  ny: ["new york"],
  nyc: ["new york"],
  sf: ["san francisco"],
  dc: ["washington"],
  st: ["saint", "st "],
  twin: ["minneapolis", "st paul", "saint paul"],
  twins: ["minnesota twins", "target field"],
  tampa: ["tampa bay"],
  vegas: ["las vegas"],
  knights: ["vegas golden knights", "golden knights"]
};

/** League code → related search terms (sport names, spelled-out leagues). */
const LEAGUE_SEARCH_ALIASES: Record<string, readonly string[]> = {
  nfl: ["football", "national football league"],
  nba: ["basketball", "national basketball association"],
  nhl: ["hockey", "national hockey league"],
  mlb: ["baseball", "major league baseball"],
  pwhl: ["hockey", "womens hockey", "professional womens hockey"],
  wnba: ["basketball", "womens basketball"]
};

/** City display name → common alternate spellings / metro labels. */
const CITY_SEARCH_ALIASES: Record<string, readonly string[]> = {
  "los angeles": ["la", "inglewood", "hollywood"],
  "new york": ["nyc", "manhattan", "brooklyn", "elmont"],
  "minneapolis": ["twin cities", "st paul", "saint paul"],
  "saint paul": ["st paul", "twin cities", "minneapolis"],
  "st louis": ["saint louis"],
  "las vegas": ["vegas", "paradise"],
  "salt lake city": ["salt lake", "utah"],
  "washington": ["dc", "district"],
  "tampa": ["tampa bay"],
  "edmonton": ["oil country"],
  "montreal": ["montreal", "quebec"],
  "toronto": ["the 6ix", "6ix"]
};

/** Venue slug → former names / rebrands still fans search for. */
const VENUE_SLUG_SEARCH_ALIASES: Record<string, readonly string[]> = {
  "xcel-energy-center": ["grand casino arena", "grand casino", "xcel energy"],
  "grand-casino-arena": ["xcel energy center", "xcel energy", "grand casino"],
  "benchmark-international-arena": ["amalie arena", "amalie", "thunder alley"],
  "amalie-arena": ["benchmark international arena", "benchmark international"],
  "lenovo-center": ["pnc arena", "raleigh entertainment"],
  "wells-fargo-center": ["xfinity mobile arena", "south philly"],
  "rocket-arena": ["rocket mortgage fieldhouse", "cleveland"],
  "amerant-bank-arena": ["bb t center", "bbt center", "sunrise"],
  "keybank-center": ["buffalo", "sabres"],
  "intuit-dome": ["clippers", "la clippers", "inglewood"],
  "crypto-com-arena": ["staples center", "downtown la"],
  "footprint-center": ["phoenix suns arena"],
  "delta-center": ["utah jazz arena", "utah hockey club", "mammoth"],
  "gainbridge-fieldhouse": ["bankers life", "indiana"],
  "scotiabank-saddledome": ["calgary", "saddledome", "flames"],
  "canada-life-centre": ["winnipeg", "jets", "mtn centre"],
  "climate-pledge-arena": ["seattle kraken", "keyarena"]
};

function stateSearchTokens(state: string): string[] {
  const trimmed = state.trim();
  if (!trimmed) {
    return [];
  }
  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();
  const out = [lower.replace(/\./g, "")];
  if (upper.length === 2 && US_STATE_NAME_BY_ABBREV[upper]) {
    out.push(US_STATE_NAME_BY_ABBREV[upper]);
  }
  if (upper.length === 2 && CA_PROVINCE_NAME_BY_ABBREV[upper]) {
    out.push(CA_PROVINCE_NAME_BY_ABBREV[upper]);
  }
  return out;
}

/**
 * Normalize for substring search: lowercase, strip diacritics, unify hyphens /
 * punctuation to spaces so tokens match nicknames and slug fragments reliably.
 */
export function normalizeSearchText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[''`]/g, "")
    .replace(/[\u2013\u2014\-._/&,]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function citySearchTokens(city: string): string[] {
  const normalized = normalizeSearchText(city);
  if (!normalized) {
    return [];
  }
  const out = [normalized];
  const aliases = CITY_SEARCH_ALIASES[normalized];
  if (aliases) {
    out.push(...aliases.map(normalizeSearchText));
  }
  return out;
}

function leagueSearchTokens(leagues: string[], sports: string[]): string[] {
  const out = new Set<string>();
  for (const league of leagues) {
    const code = normalizeSearchText(league);
    if (!code) {
      continue;
    }
    out.add(code);
    for (const alias of LEAGUE_SEARCH_ALIASES[code] ?? []) {
      out.add(normalizeSearchText(alias));
    }
  }
  for (const sport of sports) {
    const n = normalizeSearchText(sport);
    if (!n) {
      continue;
    }
    out.add(n);
    if (n.includes("football")) {
      out.add("nfl");
    }
    if (n.includes("basketball")) {
      out.add("nba");
      out.add("wnba");
    }
    if (n.includes("hockey")) {
      out.add("nhl");
      out.add("pwhl");
    }
    if (n.includes("baseball")) {
      out.add("mlb");
    }
  }
  return [...out];
}

/** Team names, nicknames, and city fragments for tenant matching. */
function teamSearchFragments(teams: string[]): string[] {
  const out: string[] = [];
  for (const raw of teams) {
    const n = normalizeSearchText(raw);
    if (!n) {
      continue;
    }
    out.push(n);
    out.push(normalizeSearchText(teamShortLabel(raw)));
    const words = n.split(" ").filter((w) => w.length > 0);
    for (const word of words) {
      if (word.length >= 2) {
        out.push(word);
      }
    }
    if (words.length >= 2) {
      out.push(words[words.length - 1]!);
    }
    if (words.length >= 3) {
      out.push(`${words[words.length - 2]!} ${words[words.length - 1]!}`);
    }
    if (words.length >= 2) {
      out.push(`${words[0]!} ${words[1]!}`);
    }
  }
  return out;
}

function slugSearchFragments(slug: string): string[] {
  const spaced = slug.replace(/-/g, " ");
  const n = normalizeSearchText(spaced);
  if (!n) {
    return [];
  }
  const parts = [n];
  for (const piece of slug.split("-")) {
    const p = normalizeSearchText(piece);
    if (p.length >= 3) {
      parts.push(p);
    }
  }
  const aliases = VENUE_SLUG_SEARCH_ALIASES[slug.trim().toLowerCase()];
  if (aliases) {
    parts.push(...aliases.map(normalizeSearchText));
  }
  return parts;
}

function importTagSearchFragments(tags: readonly string[]): string[] {
  const out: string[] = [];
  for (const tag of tags) {
    const n = normalizeSearchText(tag);
    if (!n) {
      continue;
    }
    out.push(n);
    if (n.startsWith("import source ")) {
      out.push(n.replace(/^import source /, ""));
    }
    if (n.startsWith("import league ")) {
      out.push(n.replace(/^import league /, ""));
    }
  }
  return out;
}

/** Raw textual fields aggregated before normalization (caller normalizes once). */
function venueSearchHaystackParts(
  venue: Venue,
  options?: VenueSearchOptions
): string[] {
  const itemTags = options?.itemTagsByVenueSlug?.[venue.slug] ?? [];
  const parts: string[] = [
    venue.name,
    venue.city,
    ...citySearchTokens(venue.city),
    ...stateSearchTokens(venue.state),
    venue.country,
    venue.region,
    venue.venueType,
    venue.venueTypeKey?.replace(/_/g, " ") ?? "",
    venue.primarySport ?? "",
    venue.surfaceType ?? "",
    venue.importNotes ?? "",
    ...leagueSearchTokens(venue.leagues, venue.sports),
    ...venue.leagues,
    ...venue.sports,
    ...(venue.recurringEvents ?? []),
    ...teamSearchFragments(venue.teams),
    ...slugSearchFragments(venue.slug),
    ...importTagSearchFragments(itemTags)
  ];
  return parts;
}

/** Single normalized haystack string for token AND-matching. */
export function venueSearchHaystack(venue: Venue, options?: VenueSearchOptions): string {
  const raw = venueSearchHaystackParts(venue, options).filter(Boolean).join(" ");
  return normalizeSearchText(raw);
}

function searchTokenMatchesHaystack(haystack: string, token: string): boolean {
  if (!token) {
    return true;
  }
  if (haystack.includes(token)) {
    return true;
  }
  const phrases = SEARCH_TOKEN_PHRASES[token];
  if (phrases?.some((phrase) => haystack.includes(normalizeSearchText(phrase)))) {
    return true;
  }
  return false;
}

/**
 * AND-match on whitespace-separated tokens (e.g. "minneapolis twins").
 * Empty query returns all venues unchanged.
 */
export function filterVenuesBySearch(
  venues: Venue[],
  rawQuery: string,
  options?: VenueSearchOptions
): Venue[] {
  const q = normalizeSearchText(rawQuery);
  if (!q) {
    return venues;
  }
  const tokens = q.split(" ").filter(Boolean);
  return venues.filter((venue) => {
    const hay = venueSearchHaystack(venue, options);
    return tokens.every((t) => searchTokenMatchesHaystack(hay, t));
  });
}
