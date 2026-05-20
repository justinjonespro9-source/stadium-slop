import { GameStatus } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";

/**
 * Placeholder MLB home schedule rows for development.
 * TODO: Replace with SportsDataIO, Sportradar, TheSportsDB, or league feed import.
 */
export type MockMlbGameSeed = {
  externalId: string;
  venueSlug: string;
  homeTeamSlug: string;
  awayTeamName: string;
  startsAt: Date;
  status?: GameStatus;
};

const MLB_SEASON = 2026;

/** Fixed sample games for flagship ballparks (see `data/mlb/mlb-ballparks-venues.json`). */
function fixedSampleGames(): MockMlbGameSeed[] {
  return [
    {
      externalId: "mock-mlb-2026-target-field-vs-red-sox",
      venueSlug: "target-field",
      homeTeamSlug: "minnesota-twins",
      awayTeamName: "Boston Red Sox",
      startsAt: new Date("2026-05-19T23:10:00.000Z")
    },
    {
      externalId: "mock-mlb-2026-wrigley-field-vs-cardinals",
      venueSlug: "wrigley-field",
      homeTeamSlug: "chicago-cubs",
      awayTeamName: "St. Louis Cardinals",
      startsAt: new Date("2026-05-20T23:05:00.000Z")
    },
    {
      externalId: "mock-mlb-2026-yankee-stadium-vs-rays",
      venueSlug: "yankee-stadium",
      homeTeamSlug: "new-york-yankees",
      awayTeamName: "Tampa Bay Rays",
      startsAt: new Date("2026-05-21T23:05:00.000Z")
    },
    {
      externalId: "mock-mlb-2026-dodger-stadium-vs-giants",
      venueSlug: "dodger-stadium",
      homeTeamSlug: "los-angeles-dodgers",
      awayTeamName: "San Francisco Giants",
      startsAt: new Date("2026-05-22T02:10:00.000Z")
    }
  ];
}

/**
 * Rolling demo home game — first pitch ~90 minutes from seed time so polling is usually open.
 * TODO: Remove or gate behind env when a live schedule provider is wired.
 */
function rollingDemoActiveGame(seedNow: Date): MockMlbGameSeed {
  const startsAt = new Date(seedNow.getTime() + 90 * 60 * 1000);
  return {
    externalId: "mock-mlb-demo-active-target-field",
    venueSlug: "target-field",
    homeTeamSlug: "minnesota-twins",
    awayTeamName: "Detroit Tigers",
    startsAt,
    status: GameStatus.SCHEDULED
  };
}

export function getMockMlbGameSeeds(seedNow = new Date()): MockMlbGameSeed[] {
  return [...fixedSampleGames(), rollingDemoActiveGame(seedNow)];
}

export function mockMlbGameToPrismaData(
  seed: MockMlbGameSeed,
  venueId: string
) {
  const window = getGameDayWindow(seed.startsAt);
  return {
    league: "MLB",
    season: MLB_SEASON,
    homeTeamSlug: seed.homeTeamSlug,
    awayTeamName: seed.awayTeamName,
    venueId,
    startsAt: seed.startsAt,
    estimatedEndsAt: window.estimatedEndsAt,
    pollingOpensAt: window.pollingOpensAt,
    pollingClosesAt: window.pollingClosesAt,
    status: seed.status ?? GameStatus.SCHEDULED,
    externalId: seed.externalId
  };
}
