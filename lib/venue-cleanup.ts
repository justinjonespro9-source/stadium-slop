import { teamSlugFromImport, venueSlugFromImport } from "@/lib/import-slugs";
import { resolveVenueTeams, sharedVenueTeamsForSlug } from "@/lib/venue-teams";

export type VenueChildCounts = {
  vendors: number;
  items: number;
  photos: number;
  games: number;
  reviews: number;
  priceReports: number;
  suggestedItems: number;
  homeUsers: number;
};

export type VenueCleanupRow = {
  id: string;
  slug: string;
  name: string;
  leagues: string[];
  teams: string[];
};

/** Normalize venue identity for duplicate grouping. */
export function normalizeVenueIdentity(name: string, slug?: string): string {
  const base = (name || slug || "")
    .toLowerCase()
    .replace(/u\.s\./g, "us")
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return base;
}

export function isVenueEmpty(counts: VenueChildCounts): boolean {
  return Object.values(counts).every((n) => n === 0);
}

export function totalChildRecords(counts: VenueChildCounts): number {
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

export function formatChildCounts(counts: VenueChildCounts): string {
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}=${n}`);
  return parts.length > 0 ? parts.join(", ") : "empty";
}

/** Known duplicate groups: canonical slug + alias slugs (same building). */
export const KNOWN_DUPLICATE_GROUPS: Array<{
  label: string;
  canonicalSlug: string;
  aliasSlugs: string[];
}> = [
  {
    label: "U.S. Bank Stadium (Minnesota Vikings)",
    canonicalSlug: "u-s-bank-stadium",
    aliasSlugs: ["us-bank-stadium"]
  },
  {
    label: "Grand Casino Arena / Xcel Energy Center",
    canonicalSlug: "grand-casino-arena",
    aliasSlugs: ["xcel-energy-center"]
  },
  {
    label: "AT&T Stadium (Dallas Cowboys)",
    canonicalSlug: "att-stadium",
    aliasSlugs: ["at-t-stadium", "cowboys-stadium"]
  },
  {
    label: "GEHA Field at Arrowhead Stadium (Kansas City Chiefs)",
    canonicalSlug: "arrowhead-stadium",
    aliasSlugs: ["geha-field-at-arrowhead-stadium", "arrowhead"]
  }
];

/** Leagues to merge onto shared NBA/NHL (and similar) arenas. */
export const SHARED_ARENA_LEAGUES: Record<string, readonly string[]> = {
  "sofi-stadium": ["NFL"],
  "metlife-stadium": ["NFL"],
  "td-garden": ["NBA", "NHL"],
  "united-center": ["NBA", "NHL"],
  "american-airlines-center": ["NBA", "NHL"],
  "ball-arena": ["NBA", "NHL"],
  "little-caesars-arena": ["NBA", "NHL"],
  "target-center": ["NBA", "WNBA"],
  "madison-square-garden": ["NBA", "NHL"],
  "scotiabank-arena": ["NBA", "NHL"],
  "delta-center": ["NBA", "NHL"],
  "capital-one-arena": ["NBA", "NHL"],
  "gainbridge-fieldhouse": ["NBA", "WNBA"],
  "grand-casino-arena": ["NHL", "PWHL"],
  "wells-fargo-center": ["NBA", "NHL"],
  "mercedes-benz-stadium": ["NFL", "MLS"],
  "bank-of-america-stadium": ["NFL", "MLS"],
  "soldier-field": ["NFL", "MLS"],
  "gillette-stadium": ["NFL", "MLS"],
  "lumen-field": ["NFL", "MLS"],
  "yankee-stadium": ["MLB", "MLS"],
  "citi-field": ["MLB", "MLS"],
  "att-stadium": ["NFL"],
  "arrowhead-stadium": ["NFL"],
  "geha-field-at-arrowhead-stadium": ["NFL"]
};

/** Explicit team additions beyond what is already on the venue row. */
export const SHARED_ARENA_TEAM_PATCHES: Record<string, readonly string[]> = {
  "wells-fargo-center": ["Philadelphia Flyers"]
};

export function mergeUniqueStrings(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((s) => s.trim().toLowerCase()));
  const out = [...existing];
  for (const value of incoming) {
    const key = value.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(value.trim());
    }
  }
  return out;
}

export function buildSharedVenueUpdate(
  venue: VenueCleanupRow
): { leagues: string[]; teams: string[]; teamsAdded: string[] } | null {
  const slug = venue.slug.trim().toLowerCase();
  const leaguePatch = SHARED_ARENA_LEAGUES[slug];
  const teamPatch = [
    ...(SHARED_ARENA_TEAM_PATCHES[slug] ?? []),
    ...sharedVenueTeamsForSlug(slug)
  ];

  if (!leaguePatch?.length && !teamPatch.length) {
    return null;
  }

  const beforeTeamSlugs = new Set(venue.teams.map((t) => teamSlugFromImport(t)));
  const mergedTeams = resolveVenueTeams(
    slug,
    mergeUniqueStrings(venue.teams, [...teamPatch])
  );
  const teamsAdded = mergedTeams.filter(
    (t) => !beforeTeamSlugs.has(teamSlugFromImport(t))
  );

  const leagues = leaguePatch
    ? mergeUniqueStrings(venue.leagues, [...leaguePatch])
    : venue.leagues;

  const teamsChanged =
    teamsAdded.length > 0 ||
    mergedTeams.length !== venue.teams.length ||
    mergedTeams.some((t, i) => t !== venue.teams[i]);

  const leaguesChanged =
    leagues.length !== venue.leagues.length ||
    leagues.some((l, i) => l !== venue.leagues[i]);

  if (!teamsChanged && !leaguesChanged) {
    return null;
  }

  return { leagues, teams: mergedTeams, teamsAdded };
}

/** Group venues by normalized name for audit output. */
export function findDuplicateGroupsByName(
  venues: VenueCleanupRow[]
): Map<string, VenueCleanupRow[]> {
  const groups = new Map<string, VenueCleanupRow[]>();
  for (const venue of venues) {
    const key = normalizeVenueIdentity(venue.name, venue.slug);
    const list = groups.get(key) ?? [];
    list.push(venue);
    groups.set(key, list);
  }
  return groups;
}

export function canonicalSlugForName(name: string): string {
  return venueSlugFromImport(name);
}
