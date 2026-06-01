import { WORLD_CUP_HOST_VENUES } from "@/lib/world-cup-stadium-food-guide";
import { MLS_NWSL_VENUE_GEO } from "@/lib/mls-nwsl-venue-geo";

export type ActiveVenueAuditGroup = "mlb" | "world-cup" | "mls-nwsl";

const WORLD_CUP_SLUGS = new Set(
  WORLD_CUP_HOST_VENUES.flatMap((host) =>
    host.slugCandidates.map((slug) => slug.trim().toLowerCase())
  )
);

const MLS_NWSL_SLUGS = new Set(Object.keys(MLS_NWSL_VENUE_GEO));

function leagueSet(leagues: string[]): Set<string> {
  return new Set(leagues.map((league) => league.trim().toUpperCase()));
}

export function getActiveVenueAuditGroups(venue: {
  slug: string;
  leagues: string[];
}): ActiveVenueAuditGroup[] {
  const groups: ActiveVenueAuditGroup[] = [];
  const leagues = leagueSet(venue.leagues);
  const slug = venue.slug.trim().toLowerCase();

  if (leagues.has("MLB")) {
    groups.push("mlb");
  }
  if (WORLD_CUP_SLUGS.has(slug)) {
    groups.push("world-cup");
  }
  if (leagues.has("MLS") || leagues.has("NWSL") || MLS_NWSL_SLUGS.has(slug)) {
    groups.push("mls-nwsl");
  }

  return groups;
}

/** Near-term audit scope: MLB + World Cup hosts + MLS/NWSL (not NHL/NBA/NFL-only). */
export function isInActiveVenueAuditScope(venue: {
  slug: string;
  leagues: string[];
}): boolean {
  return getActiveVenueAuditGroups(venue).length > 0;
}

/** @deprecated Use isInActiveVenueAuditScope */
export const isInActive21PlusAuditScope = isInActiveVenueAuditScope;

export function formatAuditGroupLabel(groups: ActiveVenueAuditGroup[]): string {
  return groups.join(", ");
}

export function getWorldCupSlugSet(): ReadonlySet<string> {
  return WORLD_CUP_SLUGS;
}

export function getMlsNwslSlugSet(): ReadonlySet<string> {
  return MLS_NWSL_SLUGS;
}
