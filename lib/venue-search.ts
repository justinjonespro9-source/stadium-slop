import type { Venue } from "@/lib/sample-data";

export const VENUE_SEARCH_EMPTY_HEADLINE = "No venue found yet.";
export const VENUE_SEARCH_EMPTY_HINT = "Try a city, team, or ballpark name.";
/** @deprecated Prefer structured empty UI; kept for callers that still expect one string. */
export const VENUE_SEARCH_EMPTY_MESSAGE =
  `${VENUE_SEARCH_EMPTY_HEADLINE} ${VENUE_SEARCH_EMPTY_HINT}`;
export const VENUE_SEARCH_EMPTY_FUTURE = "Suggest a venue coming soon.";

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

/** Last-word + two-word tails help match team nicknames (e.g. “twins”, “bay rays”). */
function teamSearchFragments(teams: string[]): string[] {
  const out: string[] = [];
  for (const raw of teams) {
    const n = normalizeSearchText(raw);
    if (!n) {
      continue;
    }
    out.push(n);
    const words = n.split(" ").filter((w) => w.length > 0);
    if (words.length >= 2) {
      out.push(words[words.length - 1]!);
    }
    if (words.length >= 3) {
      out.push(`${words[words.length - 2]!} ${words[words.length - 1]!}`);
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
  return parts;
}

/** Raw textual fields aggregated before normalization (caller normalizes once). */
function venueSearchHaystackParts(venue: Venue): string[] {
  const parts: string[] = [
    venue.name,
    venue.city,
    ...stateSearchTokens(venue.state),
    venue.country,
    venue.region,
    venue.venueType,
    venue.venueTypeKey?.replace(/_/g, " ") ?? "",
    venue.primarySport ?? "",
    venue.surfaceType ?? "",
    venue.importNotes ?? "",
    ...venue.leagues,
    ...venue.sports,
    ...(venue.recurringEvents ?? []),
    ...teamSearchFragments(venue.teams),
    ...slugSearchFragments(venue.slug)
  ];
  return parts;
}

/** Single normalized haystack string for token AND-matching. */
export function venueSearchHaystack(venue: Venue): string {
  const raw = venueSearchHaystackParts(venue).filter(Boolean).join(" ");
  return normalizeSearchText(raw);
}

/**
 * AND-match on whitespace-separated tokens (e.g. "minneapolis twins").
 * Empty query returns all venues unchanged.
 */
export function filterVenuesBySearch(venues: Venue[], rawQuery: string): Venue[] {
  const q = normalizeSearchText(rawQuery);
  if (!q) {
    return venues;
  }
  const tokens = q.split(" ").filter(Boolean);
  return venues.filter((venue) => {
    const hay = venueSearchHaystack(venue);
    return tokens.every((t) => hay.includes(t));
  });
}
