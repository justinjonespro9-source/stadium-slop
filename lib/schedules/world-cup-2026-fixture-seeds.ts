/**
 * Build FIFA World Cup 2026 fixture rows for `data/world-cup/2026-fixtures.json`.
 *
 * Kickoffs are stored as venue-local civil date/time and converted to UTC using
 * each host stadium's IANA timezone. Group-stage rows use final-draw team names;
 * knockout rows keep bracket placeholders until matchups are determined.
 *
 * Source: FIFA final draw schedule (Dec 2025)
 *   https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums
 */

import { WORLD_CUP_2026_FIXTURE_SEEDS } from "@/lib/schedules/world-cup-2026-fixture-data";
import { getWorldCupVenueTimeZone } from "@/lib/schedules/world-cup-fixture-timezone";
import { worldCupLocalKickoffToUtc } from "@/lib/schedules/world-cup-local-kickoff";
import {
  WORLD_CUP_VENUE_DISPLAY_NAMES,
  type WorldCupVenueSlug
} from "@/lib/schedules/world-cup-venue-map";

export type WorldCupFixtureRow = {
  matchId: string;
  startsAt: string;
  localDate: string;
  localTime: string;
  venueTimeZone: string;
  venueName: string;
  venueSlug: WorldCupVenueSlug;
  stage: string;
  teamOneName?: string;
  teamTwoName?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  status: "SCHEDULED" | "LIVE" | "FINAL" | "POSTPONED" | "CANCELED";
};

export type WorldCupFixturesFile = {
  season: number;
  tournament: string;
  fixtures: WorldCupFixtureRow[];
};

export function buildWorldCup2026Fixtures(): WorldCupFixturesFile {
  const fixtures: WorldCupFixtureRow[] = WORLD_CUP_2026_FIXTURE_SEEDS.map(
    (seed) => {
      const venueTimeZone = getWorldCupVenueTimeZone(seed.venueSlug);
      const startsAt = worldCupLocalKickoffToUtc(
        seed.localDate,
        seed.localTime,
        seed.venueSlug
      );

      return {
        matchId: String(seed.matchNumber).padStart(3, "0"),
        startsAt,
        localDate: seed.localDate,
        localTime: seed.localTime,
        venueTimeZone,
        venueName: WORLD_CUP_VENUE_DISPLAY_NAMES[seed.venueSlug],
        venueSlug: seed.venueSlug,
        stage: seed.stage,
        teamOneName: seed.teamOneName,
        teamTwoName: seed.teamTwoName,
        status: "SCHEDULED"
      };
    }
  );

  return {
    season: 2026,
    tournament: "FIFA World Cup 2026",
    fixtures
  };
}
