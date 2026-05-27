/**
 * Multi-team / shared-venue helpers.
 * Venues store tenants on `Venue.teams[]` (no separate Team table).
 *
 * TODO: NHL awards badges when league-specific stats exist
 * TODO: NBA / NHL / WNBA shared arenas (e.g. same building, different leagues)
 * TODO: PWHL tenants at NHL buildings
 * TODO: neutral-site venues (World Cup, bowl games) with event-specific tenants
 * TODO: temporary event overlays (Super Bowl, Final Four) without duplicating menus
 */

import { teamSlugFromImport } from "./import-slugs";

/** Extra tenants for a venue slug when import rows only list one team. */
const SHARED_VENUE_TEAMS: Record<string, readonly string[]> = {
  "sofi-stadium": ["Los Angeles Chargers"],
  "metlife-stadium": ["New York Jets"],
  // NBA / NHL / WNBA shared arenas (see also parse:nba-docx)
  "td-garden": ["Boston Bruins"],
  "united-center": ["Chicago Blackhawks"],
  "american-airlines-center": ["Dallas Stars"],
  "ball-arena": ["Colorado Avalanche"],
  "little-caesars-arena": ["Detroit Red Wings"],
  "target-center": ["Minnesota Lynx"],
  "madison-square-garden": ["New York Rangers"],
  "scotiabank-arena": ["Toronto Maple Leafs"],
  "delta-center": ["Utah Hockey Club"],
  "capital-one-arena": ["Washington Capitals"],
  "gainbridge-fieldhouse": ["Indiana Fever"],
  "wells-fargo-center": ["Philadelphia Flyers"],
  "grand-casino-arena": ["Minnesota Frost"],
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

/** Preferred display order for known shared venues (primary tenant first). */
const SHARED_VENUE_TEAM_ORDER: Record<string, readonly string[]> = {
  "sofi-stadium": ["Los Angeles Rams", "Los Angeles Chargers"],
  "metlife-stadium": ["New York Giants", "New York Jets"],
  "td-garden": ["Boston Celtics", "Boston Bruins"],
  "united-center": ["Chicago Bulls", "Chicago Blackhawks"],
  "american-airlines-center": ["Dallas Mavericks", "Dallas Stars"],
  "ball-arena": ["Denver Nuggets", "Colorado Avalanche"],
  "little-caesars-arena": ["Detroit Pistons", "Detroit Red Wings"],
  "target-center": ["Minnesota Timberwolves", "Minnesota Lynx"],
  "madison-square-garden": ["New York Knicks", "New York Rangers"],
  "scotiabank-arena": ["Toronto Raptors", "Toronto Maple Leafs"],
  "delta-center": ["Utah Jazz", "Utah Hockey Club"],
  "capital-one-arena": ["Washington Wizards", "Washington Capitals"],
  "gainbridge-fieldhouse": ["Indiana Pacers", "Indiana Fever"],
  "wells-fargo-center": ["Philadelphia 76ers", "Philadelphia Flyers"],
  "grand-casino-arena": ["Minnesota Wild", "Minnesota Frost"],
  "mercedes-benz-stadium": ["Atlanta Falcons", "Atlanta United FC"],
  "bank-of-america-stadium": ["Carolina Panthers", "Charlotte FC"],
  "soldier-field": ["Chicago Bears", "Chicago Fire FC"],
  "gillette-stadium": ["New England Patriots", "New England Revolution", "Boston Legacy FC"],
  "lumen-field": ["Seattle Seahawks", "Seattle Sounders FC", "Seattle Reign FC"],
  "att-stadium": ["Dallas Cowboys"],
  "arrowhead-stadium": ["Kansas City Chiefs"],
  "geha-field-at-arrowhead-stadium": ["Kansas City Chiefs"],
  "yankee-stadium": ["New York Yankees", "New York City FC"],
  "citi-field": ["New York Mets", "New York City FC"]
};

function dedupeTeams(teams: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of teams) {
    const trimmed = name.trim();
    if (!trimmed) {
      continue;
    }
    const key = teamSlugFromImport(trimmed);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Stable, human-friendly order.
 * Shared venues use a configured primary-first order; others sort A–Z.
 */
export function sortVenueTeamsStable(teams: string[], venueSlug?: string): string[] {
  const key = venueSlug?.trim().toLowerCase();
  const preset = key ? SHARED_VENUE_TEAM_ORDER[key] : undefined;
  if (preset?.length) {
    const out: string[] = [];
    const unmatched: string[] = [];
    const seen = new Set<string>();

    for (const preferred of preset) {
      const match = teams.find(
        (t) => teamSlugFromImport(t) === teamSlugFromImport(preferred)
      );
      if (match) {
        out.push(match);
        seen.add(teamSlugFromImport(match));
      }
    }
    for (const team of teams) {
      const slug = teamSlugFromImport(team);
      if (!seen.has(slug)) {
        unmatched.push(team);
        seen.add(slug);
      }
    }
    unmatched.sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base", numeric: true })
    );
    return [...out, ...unmatched];
  }

  return [...teams].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base", numeric: true })
  );
}

/** Additional tenants configured for a shared venue slug. */
export function sharedVenueTeamsForSlug(venueSlug: string): string[] {
  return [...(SHARED_VENUE_TEAMS[venueSlug.trim().toLowerCase()] ?? [])];
}

/**
 * Merge import/DB teams with shared-venue config, dedupe, and sort.
 * Does not duplicate vendors, items, or reviews.
 */
export function resolveVenueTeams(venueSlug: string, teams: string[]): string[] {
  const merged = dedupeTeams([...teams, ...sharedVenueTeamsForSlug(venueSlug)]);
  return sortVenueTeamsStable(merged, venueSlug);
}

/** Short label for UI: "Los Angeles Rams" → "Rams". */
export function teamShortLabel(team: string): string {
  const parts = team.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return team.trim();
  }
  return parts[parts.length - 1] ?? team.trim();
}

/**
 * "Home of the Rams & Chargers" / "Home of the Giants & Jets".
 * Uses short nicknames; lists every tenant (no truncation).
 */
export function formatHomeOfTeams(teams: string[], venueSlug?: string): string | null {
  const sorted = sortVenueTeamsStable(teams, venueSlug);
  if (sorted.length === 0) {
    return null;
  }
  const labels = sorted.map(teamShortLabel);
  if (labels.length === 1) {
    return `the ${labels[0]}`;
  }
  if (labels.length === 2) {
    return `the ${labels[0]} & ${labels[1]}`;
  }
  const last = labels[labels.length - 1]!;
  const rest = labels.slice(0, -1).join(", ");
  return `the ${rest} & ${last}`;
}

/** Inline tenant list for headers and cards (full team names). */
export function formatVenueTeamsInline(teams: string[], venueSlug?: string): string {
  const sorted = sortVenueTeamsStable(teams, venueSlug);
  if (sorted.length === 0) {
    return "—";
  }
  if (sorted.length === 2) {
    return `${sorted[0]} & ${sorted[1]}`;
  }
  if (sorted.length === 3) {
    return `${sorted[0]}, ${sorted[1]} & ${sorted[2]}`;
  }
  return `${sorted.slice(0, 2).join(", ")} & ${sorted.length - 2} more`;
}
