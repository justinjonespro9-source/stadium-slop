/**
 * NHL clubs → Stadium Slop venue slugs.
 *
 * Shared buildings use the arena Stadium Slop already has:
 * Bruins → TD Garden, Blackhawks → United Center, Stars → American Airlines Center,
 * Avalanche → Ball Arena, Red Wings → Little Caesars Arena, Kings → crypto.com Arena,
 * Rangers → Madison Square Garden, Leafs → Scotiabank Arena, Mammoth → Delta Center,
 * Capitals → Capital One Arena, Flyers → Wells Fargo Center.
 *
 * The venue row for Delta Center still lists "Utah Hockey Club". ESPN's 2026–27
 * name is Utah Mammoth. Games store the ESPN name; the slug stays `delta-center`.
 */

import { resolveArenaVenueSlug } from "@/lib/schedules/arena-venue-names";
import { normalizeScheduleName } from "@/lib/schedules/schedule-names";

export type NhlHomeVenueMapping = {
  homeTeamName: string;
  homeTeamSlug: string;
  venueSlug: string;
};

export const NHL_TEAM_VENUE_ROWS: readonly NhlHomeVenueMapping[] = [
  { homeTeamName: "Anaheim Ducks", homeTeamSlug: "anaheim-ducks", venueSlug: "honda-center" },
  { homeTeamName: "Boston Bruins", homeTeamSlug: "boston-bruins", venueSlug: "td-garden" },
  { homeTeamName: "Buffalo Sabres", homeTeamSlug: "buffalo-sabres", venueSlug: "keybank-center" },
  { homeTeamName: "Calgary Flames", homeTeamSlug: "calgary-flames", venueSlug: "scotiabank-saddledome" },
  { homeTeamName: "Carolina Hurricanes", homeTeamSlug: "carolina-hurricanes", venueSlug: "lenovo-center" },
  { homeTeamName: "Chicago Blackhawks", homeTeamSlug: "chicago-blackhawks", venueSlug: "united-center" },
  { homeTeamName: "Colorado Avalanche", homeTeamSlug: "colorado-avalanche", venueSlug: "ball-arena" },
  { homeTeamName: "Columbus Blue Jackets", homeTeamSlug: "columbus-blue-jackets", venueSlug: "nationwide-arena" },
  { homeTeamName: "Dallas Stars", homeTeamSlug: "dallas-stars", venueSlug: "american-airlines-center" },
  { homeTeamName: "Detroit Red Wings", homeTeamSlug: "detroit-red-wings", venueSlug: "little-caesars-arena" },
  { homeTeamName: "Edmonton Oilers", homeTeamSlug: "edmonton-oilers", venueSlug: "rogers-place" },
  { homeTeamName: "Florida Panthers", homeTeamSlug: "florida-panthers", venueSlug: "amerant-bank-arena" },
  { homeTeamName: "Los Angeles Kings", homeTeamSlug: "los-angeles-kings", venueSlug: "crypto-com-arena" },
  { homeTeamName: "Minnesota Wild", homeTeamSlug: "minnesota-wild", venueSlug: "grand-casino-arena" },
  { homeTeamName: "Montreal Canadiens", homeTeamSlug: "montreal-canadiens", venueSlug: "bell-centre" },
  { homeTeamName: "Nashville Predators", homeTeamSlug: "nashville-predators", venueSlug: "bridgestone-arena" },
  { homeTeamName: "New Jersey Devils", homeTeamSlug: "new-jersey-devils", venueSlug: "prudential-center" },
  { homeTeamName: "New York Islanders", homeTeamSlug: "new-york-islanders", venueSlug: "ubs-arena" },
  { homeTeamName: "New York Rangers", homeTeamSlug: "new-york-rangers", venueSlug: "madison-square-garden" },
  { homeTeamName: "Ottawa Senators", homeTeamSlug: "ottawa-senators", venueSlug: "canadian-tire-centre" },
  { homeTeamName: "Philadelphia Flyers", homeTeamSlug: "philadelphia-flyers", venueSlug: "wells-fargo-center" },
  { homeTeamName: "Pittsburgh Penguins", homeTeamSlug: "pittsburgh-penguins", venueSlug: "ppg-paints-arena" },
  { homeTeamName: "San Jose Sharks", homeTeamSlug: "san-jose-sharks", venueSlug: "sap-center" },
  { homeTeamName: "Seattle Kraken", homeTeamSlug: "seattle-kraken", venueSlug: "climate-pledge-arena" },
  { homeTeamName: "St. Louis Blues", homeTeamSlug: "st-louis-blues", venueSlug: "enterprise-center" },
  { homeTeamName: "Tampa Bay Lightning", homeTeamSlug: "tampa-bay-lightning", venueSlug: "benchmark-international-arena" },
  { homeTeamName: "Toronto Maple Leafs", homeTeamSlug: "toronto-maple-leafs", venueSlug: "scotiabank-arena" },
  { homeTeamName: "Utah Mammoth", homeTeamSlug: "utah-mammoth", venueSlug: "delta-center" },
  { homeTeamName: "Vancouver Canucks", homeTeamSlug: "vancouver-canucks", venueSlug: "rogers-arena" },
  { homeTeamName: "Vegas Golden Knights", homeTeamSlug: "vegas-golden-knights", venueSlug: "t-mobile-arena" },
  { homeTeamName: "Washington Capitals", homeTeamSlug: "washington-capitals", venueSlug: "capital-one-arena" },
  { homeTeamName: "Winnipeg Jets", homeTeamSlug: "winnipeg-jets", venueSlug: "canada-life-centre" }
];

const TEAM_ALIASES: Record<string, string> = {
  "utah hockey club": "Utah Mammoth",
  "arizona coyotes": "Utah Mammoth"
};

const byTeamName = new Map<string, NhlHomeVenueMapping>();
for (const row of NHL_TEAM_VENUE_ROWS) {
  byTeamName.set(normalizeScheduleName(row.homeTeamName), row);
}

export function listNhlHomeVenueMappings() {
  return NHL_TEAM_VENUE_ROWS;
}

export function resolveNhlHomeVenue(teamName: string): NhlHomeVenueMapping | null {
  const key = normalizeScheduleName(teamName);
  const alias = TEAM_ALIASES[key];
  if (alias) {
    return byTeamName.get(normalizeScheduleName(alias)) ?? null;
  }
  return byTeamName.get(key) ?? null;
}

export function resolveNhlVenueSlug(venueName: string): string | null {
  return resolveArenaVenueSlug(venueName);
}
