/**
 * Create 2026–27 special-site venues that Stadium Slop does not already have,
 * and record the Los Angeles Kings as a tenant of crypto.com Arena.
 *
 * Does not rename Wells Fargo Center, Footprint Center, or Delta Center.
 * Does not insert a second row for AT&T Stadium or Rice-Eccles Stadium.
 */

import { EntityStatus, type PrismaClient, VenueType } from "@prisma/client";

import {
  arenaSpecialVenuesForLeague,
  type ArenaSpecialVenueGeo
} from "@/lib/schedules/arena-special-venues";
import { mergeUniqueStrings } from "@/lib/venue-cleanup";
import { resolveVenueTeams } from "@/lib/venue-teams";

export type EnsureArenaScheduleVenueRow = {
  slug: string;
  action: "create" | "created" | "update" | "updated" | "exists";
};

export async function ensureArenaScheduleVenues(
  prisma: PrismaClient,
  league: "NBA" | "NHL",
  apply: boolean
): Promise<EnsureArenaScheduleVenueRow[]> {
  const rows: EnsureArenaScheduleVenueRow[] = [];

  for (const [slug, geo] of arenaSpecialVenuesForLeague(league)) {
    rows.push(await ensureSpecialVenue(prisma, apply, slug, geo));
  }

  if (league === "NHL") {
    rows.push(await ensureKingsShareCryptoArena(prisma, apply));
  }

  return rows;
}

async function ensureSpecialVenue(
  prisma: PrismaClient,
  apply: boolean,
  slug: string,
  geo: ArenaSpecialVenueGeo
): Promise<EnsureArenaScheduleVenueRow> {
  const existing = await prisma.venue.findUnique({ where: { slug } });
  if (existing) {
    return { slug, action: "exists" };
  }
  if (!apply) {
    return { slug, action: "create" };
  }

  await prisma.venue.create({
    data: {
      slug,
      name: geo.name,
      city: geo.city,
      state: geo.state,
      country: geo.country,
      region: geo.region,
      leagues: geo.leagues,
      teams: [],
      sports: geo.sports,
      primarySport: geo.primarySport,
      recurringEvents: geo.recurringEvents,
      latitude: geo.latitude,
      longitude: geo.longitude,
      reviewRadiusMeters: geo.reviewRadiusMeters,
      timeZone: geo.timeZone,
      venueType: geo.venueType === "STADIUM" ? VenueType.STADIUM : VenueType.ARENA,
      status: EntityStatus.ACTIVE
    }
  });

  return { slug, action: "created" };
}

async function ensureKingsShareCryptoArena(
  prisma: PrismaClient,
  apply: boolean
): Promise<EnsureArenaScheduleVenueRow> {
  const slug = "crypto-com-arena";
  const existing = await prisma.venue.findUnique({ where: { slug } });
  if (!existing) {
    throw new Error(
      "crypto-com-arena is missing. Kings home games cannot be mapped until that venue exists."
    );
  }

  const leagues = mergeUniqueStrings(existing.leagues, ["NHL"]);
  const teams = resolveVenueTeams(slug, existing.teams);
  const leaguesSame =
    leagues.length === existing.leagues.length &&
    leagues.every((league, index) => league === existing.leagues[index]);
  const teamsSame =
    teams.length === existing.teams.length &&
    teams.every((team, index) => team === existing.teams[index]);

  if (leaguesSame && teamsSame) {
    return { slug, action: "exists" };
  }
  if (!apply) {
    return { slug, action: "update" };
  }

  await prisma.venue.update({
    where: { slug },
    data: { leagues, teams }
  });
  return { slug, action: "updated" };
}
