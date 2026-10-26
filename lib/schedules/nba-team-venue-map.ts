/**
 * NBA clubs → Stadium Slop venue slugs.
 *
 * Clippers play at Intuit Dome and do not share crypto.com Arena with the Lakers.
 * The Lakers still share that building with the Los Angeles Kings (NHL).
 */

import { resolveArenaVenueSlug } from "@/lib/schedules/arena-venue-names";
import { normalizeScheduleName } from "@/lib/schedules/schedule-names";

export type NbaHomeVenueMapping = {
  homeTeamName: string;
  homeTeamSlug: string;
  venueSlug: string;
};

export const NBA_TEAM_VENUE_ROWS: readonly NbaHomeVenueMapping[] = [
  { homeTeamName: "Atlanta Hawks", homeTeamSlug: "atlanta-hawks", venueSlug: "state-farm-arena" },
  { homeTeamName: "Boston Celtics", homeTeamSlug: "boston-celtics", venueSlug: "td-garden" },
  { homeTeamName: "Brooklyn Nets", homeTeamSlug: "brooklyn-nets", venueSlug: "barclays-center" },
  { homeTeamName: "Charlotte Hornets", homeTeamSlug: "charlotte-hornets", venueSlug: "spectrum-center" },
  { homeTeamName: "Chicago Bulls", homeTeamSlug: "chicago-bulls", venueSlug: "united-center" },
  { homeTeamName: "Cleveland Cavaliers", homeTeamSlug: "cleveland-cavaliers", venueSlug: "rocket-arena" },
  { homeTeamName: "Dallas Mavericks", homeTeamSlug: "dallas-mavericks", venueSlug: "american-airlines-center" },
  { homeTeamName: "Denver Nuggets", homeTeamSlug: "denver-nuggets", venueSlug: "ball-arena" },
  { homeTeamName: "Detroit Pistons", homeTeamSlug: "detroit-pistons", venueSlug: "little-caesars-arena" },
  { homeTeamName: "Golden State Warriors", homeTeamSlug: "golden-state-warriors", venueSlug: "chase-center" },
  { homeTeamName: "Houston Rockets", homeTeamSlug: "houston-rockets", venueSlug: "toyota-center" },
  { homeTeamName: "Indiana Pacers", homeTeamSlug: "indiana-pacers", venueSlug: "gainbridge-fieldhouse" },
  { homeTeamName: "LA Clippers", homeTeamSlug: "la-clippers", venueSlug: "intuit-dome" },
  { homeTeamName: "Los Angeles Lakers", homeTeamSlug: "los-angeles-lakers", venueSlug: "crypto-com-arena" },
  { homeTeamName: "Memphis Grizzlies", homeTeamSlug: "memphis-grizzlies", venueSlug: "fedexforum" },
  { homeTeamName: "Miami Heat", homeTeamSlug: "miami-heat", venueSlug: "kaseya-center" },
  { homeTeamName: "Milwaukee Bucks", homeTeamSlug: "milwaukee-bucks", venueSlug: "fiserv-forum" },
  { homeTeamName: "Minnesota Timberwolves", homeTeamSlug: "minnesota-timberwolves", venueSlug: "target-center" },
  { homeTeamName: "New Orleans Pelicans", homeTeamSlug: "new-orleans-pelicans", venueSlug: "smoothie-king-center" },
  { homeTeamName: "New York Knicks", homeTeamSlug: "new-york-knicks", venueSlug: "madison-square-garden" },
  { homeTeamName: "Oklahoma City Thunder", homeTeamSlug: "oklahoma-city-thunder", venueSlug: "paycom-center" },
  { homeTeamName: "Orlando Magic", homeTeamSlug: "orlando-magic", venueSlug: "kia-center" },
  { homeTeamName: "Philadelphia 76ers", homeTeamSlug: "philadelphia-76ers", venueSlug: "wells-fargo-center" },
  { homeTeamName: "Phoenix Suns", homeTeamSlug: "phoenix-suns", venueSlug: "footprint-center" },
  { homeTeamName: "Portland Trail Blazers", homeTeamSlug: "portland-trail-blazers", venueSlug: "moda-center" },
  { homeTeamName: "Sacramento Kings", homeTeamSlug: "sacramento-kings", venueSlug: "golden-1-center" },
  { homeTeamName: "San Antonio Spurs", homeTeamSlug: "san-antonio-spurs", venueSlug: "frost-bank-center" },
  { homeTeamName: "Toronto Raptors", homeTeamSlug: "toronto-raptors", venueSlug: "scotiabank-arena" },
  { homeTeamName: "Utah Jazz", homeTeamSlug: "utah-jazz", venueSlug: "delta-center" },
  { homeTeamName: "Washington Wizards", homeTeamSlug: "washington-wizards", venueSlug: "capital-one-arena" }
];

const TEAM_ALIASES: Record<string, string> = {
  "los angeles clippers": "LA Clippers"
};

const byTeamName = new Map<string, NbaHomeVenueMapping>();
for (const row of NBA_TEAM_VENUE_ROWS) {
  byTeamName.set(normalizeScheduleName(row.homeTeamName), row);
}

export function listNbaHomeVenueMappings() {
  return NBA_TEAM_VENUE_ROWS;
}

export function resolveNbaHomeVenue(teamName: string): NbaHomeVenueMapping | null {
  const key = normalizeScheduleName(teamName);
  const alias = TEAM_ALIASES[key];
  if (alias) {
    return byTeamName.get(normalizeScheduleName(alias)) ?? null;
  }
  return byTeamName.get(key) ?? null;
}

export function resolveNbaVenueSlug(venueName: string): string | null {
  return resolveArenaVenueSlug(venueName);
}
