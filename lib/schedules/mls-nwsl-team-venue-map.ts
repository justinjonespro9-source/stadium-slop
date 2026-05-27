import { teamSlugFromImport } from "@/lib/import-slugs";
import {
  MLS_NWSL_SHARED_VENUE_TEAMS,
  MLS_NWSL_VENUE_META
} from "@/lib/mls-nwsl-venue-registry";

export type SoccerHomeVenueMapping = {
  venueSlug: string;
  homeTeamSlug: string;
  homeTeamName: string;
};

function normalizeTeamKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .replace(/'/g, "'");
}

function normalizeStadiumKey(name: string) {
  return normalizeTeamKey(name);
}

/** Stadium labels from MLS Stats API / FixtureDownload → Stadium Slop venue slug. */
const STADIUM_TO_VENUE_SLUG: Record<string, string> = {
  "allianz field": "allianz-field",
  "america first field": "america-first-field",
  "audi field": "audi-field",
  "bc place": "bc-place",
  "bmo field": "bmo-field",
  "bmo stadium": "bmo-stadium",
  "bank of america stadium": "bank-of-america-stadium",
  "citi field": "citi-field",
  "chase stadium": "chase-stadium",
  "nu stadium": "nu-stadium",
  "miami freedom park": "nu-stadium",
  "centennial stadium": "centennial-stadium",
  "cpkc stadium": "cpkc-stadium",
  "dignity health sports park": "dignity-health-sports-park",
  "dick's sporting goods park": "dick-s-sporting-goods-park",
  "dicks sporting goods park": "dick-s-sporting-goods-park",
  "energizer park": "citypark",
  "geodis park": "geodis-park",
  "gillette stadium": "gillette-stadium",
  "inter&co stadium": "inter-co-stadium",
  "lower.com field": "lower-com-field",
  "scottsmiracle-gro field": "lower-com-field",
  "lumen field": "lumen-field",
  "lynn family stadium": "lynn-family-stadium",
  "mercedes-benz stadium": "mercedes-benz-stadium",
  "soldier field": "soldier-field",
  "empower field at mile high": "centennial-stadium",
  "northwestern medicine field at martin stadium": "northwestern-medicine-field-at-martin-stadium",
  "paypal park": "paypal-park",
  "providence park": "providence-park",
  "q2 stadium": "q2-stadium",
  "shell energy stadium": "shell-energy-stadium",
  "snapdragon stadium": "snapdragon-stadium",
  "sports illustrated stadium": "sports-illustrated-stadium",
  "centreville bank stadium": "sports-illustrated-stadium",
  "stade saputo": "stade-saputo",
  "subaru park": "subaru-park",
  "tql stadium": "tql-stadium",
  "toyota stadium": "toyota-stadium",
  "yankee stadium": "yankee-stadium",
  "first horizon stadium at wakemed soccer park": "wakemed-soccer-park",
  "wakemed soccer park": "wakemed-soccer-park",
  "sporting park": "sporting-park",
  "children's mercy park": "sporting-park"
};

const MLS_TEAM_ALIASES: Record<string, string> = {
  "atlanta united": "Atlanta United FC",
  "atlanta united fc": "Atlanta United FC",
  "austin fc": "Austin FC",
  "charlotte fc": "Charlotte FC",
  "chicago fire": "Chicago Fire FC",
  "chicago fire fc": "Chicago Fire FC",
  "fc cincinnati": "FC Cincinnati",
  "colorado rapids": "Colorado Rapids",
  "columbus crew": "Columbus Crew",
  "d.c. united": "D.C. United",
  "dc united": "D.C. United",
  "fc dallas": "FC Dallas",
  "houston dynamo": "Houston Dynamo FC",
  "houston dynamo fc": "Houston Dynamo FC",
  "inter miami": "Inter Miami CF",
  "inter miami cf": "Inter Miami CF",
  "la galaxy": "LA Galaxy",
  "lafc": "LAFC",
  "los angeles fc": "LAFC",
  "los angeles football club": "LAFC",
  "minnesota united": "Minnesota United FC",
  "minnesota united fc": "Minnesota United FC",
  "cf montreal": "CF Montréal",
  "cf montréal": "CF Montréal",
  "montreal": "CF Montréal",
  "nashville sc": "Nashville SC",
  "new england revolution": "New England Revolution",
  "new york city": "New York City FC",
  "new york city fc": "New York City FC",
  "new york city football club": "New York City FC",
  "new york red bulls": "New York Red Bulls",
  "orlando city": "Orlando City SC",
  "orlando city sc": "Orlando City SC",
  "philadelphia union": "Philadelphia Union",
  "portland timbers": "Portland Timbers",
  "real salt lake": "Real Salt Lake",
  "san diego fc": "San Diego FC",
  "san jose earthquakes": "San Jose Earthquakes",
  "seattle sounders": "Seattle Sounders FC",
  "seattle sounders fc": "Seattle Sounders FC",
  "st. louis city": "St. Louis City SC",
  "st. louis city sc": "St. Louis City SC",
  "st louis city sc": "St. Louis City SC",
  "toronto fc": "Toronto FC",
  "vancouver whitecaps": "Vancouver Whitecaps FC",
  "vancouver whitecaps fc": "Vancouver Whitecaps FC",
  "sporting kansas city": "Sporting Kansas City",
  "sporting kc": "Sporting Kansas City"
};

const NWSL_TEAM_ALIASES: Record<string, string> = {
  "angel city": "Angel City FC",
  "angel city fc": "Angel City FC",
  "bay": "Bay FC",
  "bay fc": "Bay FC",
  "boston legacy": "Boston Legacy FC",
  "boston legacy fc": "Boston Legacy FC",
  "chicago stars": "Chicago Stars FC",
  "chicago stars fc": "Chicago Stars FC",
  "denver summit": "Denver Summit FC",
  "denver summit fc": "Denver Summit FC",
  "gotham fc": "NJ/NY Gotham FC",
  "nj/ny gotham fc": "NJ/NY Gotham FC",
  "houston dash": "Houston Dash",
  "kansas city current": "Kansas City Current",
  "north carolina courage": "North Carolina Courage",
  "orlando pride": "Orlando Pride",
  "portland thorns": "Portland Thorns FC",
  "portland thorns fc": "Portland Thorns FC",
  "racing louisville": "Racing Louisville FC",
  "racing louisville fc": "Racing Louisville FC",
  "san diego wave": "San Diego Wave FC",
  "san diego wave fc": "San Diego Wave FC",
  "seattle reign": "Seattle Reign FC",
  "seattle reign fc": "Seattle Reign FC",
  "utah royals": "Utah Royals",
  "washington spirit": "Washington Spirit"
};

function canonicalMlsTeamName(raw: string): string | null {
  const key = normalizeTeamKey(raw);
  return MLS_TEAM_ALIASES[key] ?? null;
}

function canonicalNwslTeamName(raw: string): string | null {
  const key = normalizeTeamKey(raw);
  return NWSL_TEAM_ALIASES[key] ?? null;
}

function buildTeamToVenueFromRegistry(): Map<string, SoccerHomeVenueMapping> {
  const byTeam = new Map<string, SoccerHomeVenueMapping>();

  for (const [venueSlug, meta] of Object.entries(MLS_NWSL_VENUE_META)) {
    const shared = MLS_NWSL_SHARED_VENUE_TEAMS[venueSlug] ?? [];
    const candidates = shared.length > 0 ? [...shared] : [];
    for (const teamName of candidates) {
      const canonical = canonicalMlsTeamName(teamName) ?? canonicalNwslTeamName(teamName) ?? teamName;
      const mapping: SoccerHomeVenueMapping = {
        venueSlug,
        homeTeamSlug: teamSlugFromImport(canonical),
        homeTeamName: canonical
      };
      byTeam.set(normalizeTeamKey(canonical), mapping);
      byTeam.set(normalizeTeamKey(teamName), mapping);
    }
  }

  const explicitMls: Array<[string, string]> = [
    ["Atlanta United FC", "mercedes-benz-stadium"],
    ["Austin FC", "q2-stadium"],
    ["Charlotte FC", "bank-of-america-stadium"],
    ["Chicago Fire FC", "soldier-field"],
    ["FC Cincinnati", "tql-stadium"],
    ["Colorado Rapids", "dick-s-sporting-goods-park"],
    ["Columbus Crew", "lower-com-field"],
    ["D.C. United", "audi-field"],
    ["FC Dallas", "toyota-stadium"],
    ["Houston Dynamo FC", "shell-energy-stadium"],
    ["Inter Miami CF", "nu-stadium"],
    ["LA Galaxy", "dignity-health-sports-park"],
    ["LAFC", "bmo-stadium"],
    ["Minnesota United FC", "allianz-field"],
    ["CF Montréal", "stade-saputo"],
    ["Nashville SC", "geodis-park"],
    ["New England Revolution", "gillette-stadium"],
    ["New York City FC", "yankee-stadium"],
    ["New York Red Bulls", "sports-illustrated-stadium"],
    ["Orlando City SC", "inter-co-stadium"],
    ["Philadelphia Union", "subaru-park"],
    ["Portland Timbers", "providence-park"],
    ["Real Salt Lake", "america-first-field"],
    ["San Diego FC", "snapdragon-stadium"],
    ["San Jose Earthquakes", "paypal-park"],
    ["Seattle Sounders FC", "lumen-field"],
    ["St. Louis City SC", "citypark"],
    ["Toronto FC", "bmo-field"],
    ["Vancouver Whitecaps FC", "bc-place"],
    ["Sporting Kansas City", "sporting-park"]
  ];

  for (const [teamName, venueSlug] of explicitMls) {
    const mapping: SoccerHomeVenueMapping = {
      venueSlug,
      homeTeamSlug: teamSlugFromImport(teamName),
      homeTeamName: teamName
    };
    byTeam.set(normalizeTeamKey(teamName), mapping);
  }

  const explicitNwsl: Array<[string, string]> = [
    ["Angel City FC", "bmo-stadium"],
    ["Bay FC", "paypal-park"],
    ["Boston Legacy FC", "gillette-stadium"],
    ["Chicago Stars FC", "northwestern-medicine-field-at-martin-stadium"],
    ["Denver Summit FC", "centennial-stadium"],
    ["Houston Dash", "shell-energy-stadium"],
    ["Kansas City Current", "cpkc-stadium"],
    ["NJ/NY Gotham FC", "sports-illustrated-stadium"],
    ["North Carolina Courage", "wakemed-soccer-park"],
    ["Orlando Pride", "inter-co-stadium"],
    ["Portland Thorns FC", "providence-park"],
    ["Racing Louisville FC", "lynn-family-stadium"],
    ["San Diego Wave FC", "snapdragon-stadium"],
    ["Seattle Reign FC", "lumen-field"],
    ["Utah Royals", "america-first-field"],
    ["Washington Spirit", "audi-field"]
  ];

  for (const [teamName, venueSlug] of explicitNwsl) {
    const mapping: SoccerHomeVenueMapping = {
      venueSlug,
      homeTeamSlug: teamSlugFromImport(teamName),
      homeTeamName: teamName
    };
    byTeam.set(normalizeTeamKey(teamName), mapping);
  }

  return byTeam;
}

const teamToVenue = buildTeamToVenueFromRegistry();

export function resolveVenueSlugByStadiumName(stadiumName: string): string | null {
  const key = normalizeStadiumKey(stadiumName);
  if (!key || key === "tba" || key === "tbc") {
    return null;
  }
  return STADIUM_TO_VENUE_SLUG[key] ?? null;
}

function mappingForVenueAndTeam(
  venueSlug: string,
  teamName: string
): SoccerHomeVenueMapping | null {
  if (!MLS_NWSL_VENUE_META[venueSlug]) {
    return null;
  }
  const canonical =
    canonicalMlsTeamName(teamName) ?? canonicalNwslTeamName(teamName) ?? teamName.trim();
  return {
    venueSlug,
    homeTeamSlug: teamSlugFromImport(canonical),
    homeTeamName: canonical
  };
}

export function resolveMlsHomeVenue(input: {
  homeTeamName: string;
  stadiumName?: string;
}): SoccerHomeVenueMapping | null {
  const stadiumSlug = input.stadiumName
    ? resolveVenueSlugByStadiumName(input.stadiumName)
    : null;

  if (stadiumSlug) {
    const fromStadium = mappingForVenueAndTeam(stadiumSlug, input.homeTeamName);
    if (fromStadium) return fromStadium;
  }

  const canonical = canonicalMlsTeamName(input.homeTeamName);
  if (!canonical) return null;
  return teamToVenue.get(normalizeTeamKey(canonical)) ?? null;
}

export function resolveNwslHomeVenue(input: {
  homeTeamName: string;
  stadiumName?: string;
}): SoccerHomeVenueMapping | null {
  const stadiumSlug = input.stadiumName
    ? resolveVenueSlugByStadiumName(input.stadiumName)
    : null;

  if (stadiumSlug) {
    const fromStadium = mappingForVenueAndTeam(stadiumSlug, input.homeTeamName);
    if (fromStadium) return fromStadium;
  }

  const canonical = canonicalNwslTeamName(input.homeTeamName);
  if (!canonical) return null;
  return teamToVenue.get(normalizeTeamKey(canonical)) ?? null;
}

export function listMlsHomeVenueMappings(): SoccerHomeVenueMapping[] {
  const seen = new Set<string>();
  const out: SoccerHomeVenueMapping[] = [];
  for (const mapping of teamToVenue.values()) {
    if (seen.has(mapping.venueSlug)) continue;
    seen.add(mapping.venueSlug);
    if (MLS_NWSL_VENUE_META[mapping.venueSlug]) {
      out.push(mapping);
    }
  }
  return out;
}
