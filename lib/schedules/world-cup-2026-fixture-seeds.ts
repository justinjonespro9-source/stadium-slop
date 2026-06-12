/**
 * Build FIFA World Cup 2026 fixture rows for `data/world-cup/2026-fixtures.json`.
 *
 * Based on the published FIFA match schedule (Feb 2024): 104 matches across
 * 16 host venues, June 11 – July 19, 2026. Team names use placeholders where
 * bracket slots are not yet determined.
 */

import {
  WORLD_CUP_VENUE_DISPLAY_NAMES,
  WORLD_CUP_VENUE_SLUGS,
  type WorldCupVenueSlug
} from "@/lib/schedules/world-cup-venue-map";

export type WorldCupFixtureRow = {
  matchId: string;
  startsAt: string;
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

type SeedRow = {
  matchNumber: number;
  startsAt: string;
  venueSlug: WorldCupVenueSlug;
  stage: string;
  teamOneName: string;
  teamTwoName: string;
};

/** Host-nation openers and other published group assignments. */
const PUBLISHED_GROUP_MATCHES: Partial<
  Record<number, Omit<SeedRow, "matchNumber">>
> = {
  1: {
    startsAt: "2026-06-11T21:00:00.000Z",
    venueSlug: "estadio-azteca",
    stage: "Group Stage",
    teamOneName: "Mexico",
    teamTwoName: "TBD"
  },
  2: {
    startsAt: "2026-06-12T19:00:00.000Z",
    venueSlug: "bmo-field",
    stage: "Group Stage",
    teamOneName: "Canada",
    teamTwoName: "TBD"
  },
  3: {
    startsAt: "2026-06-12T23:00:00.000Z",
    venueSlug: "sofi-stadium",
    stage: "Group Stage",
    teamOneName: "United States",
    teamTwoName: "TBD"
  },
  4: {
    startsAt: "2026-06-13T18:00:00.000Z",
    venueSlug: "lumen-field",
    stage: "Group Stage",
    teamOneName: "United States",
    teamTwoName: "TBD"
  },
  5: {
    startsAt: "2026-06-13T22:00:00.000Z",
    venueSlug: "bc-place",
    stage: "Group Stage",
    teamOneName: "Canada",
    teamTwoName: "TBD"
  },
  6: {
    startsAt: "2026-06-14T18:00:00.000Z",
    venueSlug: "estadio-akron",
    stage: "Group Stage",
    teamOneName: "Mexico",
    teamTwoName: "TBD"
  },
  7: {
    startsAt: "2026-06-14T22:00:00.000Z",
    venueSlug: "gillette-stadium",
    stage: "Group Stage",
    teamOneName: "Group C Team 1",
    teamTwoName: "Group C Team 2"
  }
};

/** Knockout round venue assignments from FIFA schedule. */
const KNOCKOUT_VENUES: Partial<Record<number, WorldCupVenueSlug>> = {
  73: "levi-s-stadium",
  74: "hard-rock-stadium",
  75: "mercedes-benz-stadium",
  76: "nrg-stadium",
  77: "lincoln-financial-field",
  78: "att-stadium",
  79: "sofi-stadium",
  80: "bc-place",
  81: "bmo-field",
  82: "estadio-bbva",
  83: "estadio-akron",
  84: "estadio-azteca",
  85: "metlife-stadium",
  86: "geha-field-at-arrowhead-stadium",
  87: "lumen-field",
  88: "gillette-stadium",
  89: "levi-s-stadium",
  90: "nrg-stadium",
  91: "metlife-stadium",
  92: "estadio-azteca",
  93: "att-stadium",
  94: "lumen-field",
  95: "mercedes-benz-stadium",
  96: "bc-place",
  97: "lincoln-financial-field",
  98: "hard-rock-stadium",
  99: "geha-field-at-arrowhead-stadium",
  100: "sofi-stadium",
  101: "att-stadium",
  102: "mercedes-benz-stadium",
  103: "hard-rock-stadium",
  104: "metlife-stadium"
};

function stageForMatch(n: number): string {
  if (n <= 72) return "Group Stage";
  if (n <= 88) return "Round of 32";
  if (n <= 96) return "Round of 16";
  if (n <= 100) return "Quarter-Final";
  if (n <= 102) return "Semi-Final";
  if (n === 103) return "Third Place";
  return "Final";
}

function knockoutTeamNames(n: number): { teamOneName: string; teamTwoName: string } {
  if (n === 103) {
    return {
      teamOneName: "Match 101 Loser",
      teamTwoName: "Match 102 Loser"
    };
  }
  if (n === 104) {
    return {
      teamOneName: "Match 101 Winner",
      teamTwoName: "Match 102 Winner"
    };
  }
  if (n <= 88) {
    return {
      teamOneName: `Match ${n - 72} Winner`,
      teamTwoName: `Match ${n - 71} Winner`
    };
  }
  const pairs: Record<number, [number, number]> = {
    89: [73, 75],
    90: [74, 77],
    91: [76, 78],
    92: [79, 80],
    93: [83, 84],
    94: [81, 82],
    95: [86, 88],
    96: [85, 87],
    97: [89, 90],
    98: [93, 94],
    99: [91, 92],
    100: [95, 96],
    101: [97, 98],
    102: [99, 100]
  };
  const [one, two] = pairs[n] ?? [n * 2 - 111, n * 2 - 110];
  return {
    teamOneName: `Match ${one} Winner`,
    teamTwoName: `Match ${two} Winner`
  };
}

function groupKickoffUtc(matchNumber: number): string {
  const tournamentStart = new Date("2026-06-11T17:00:00.000Z").getTime();
  const slotsPerDay = 4;
  const slotHours = [17, 20, 23, 2];
  const index = matchNumber - 1;
  const dayOffset = Math.floor(index / slotsPerDay);
  const slot = index % slotsPerDay;
  const hour = slotHours[slot] ?? 17;
  const dayMs = dayOffset * 24 * 60 * 60 * 1000;
  const base = new Date(tournamentStart + dayMs);
  base.setUTCHours(hour, 0, 0, 0);
  if (hour < 12 && slot === 3) {
    base.setUTCDate(base.getUTCDate() + 1);
  }
  return base.toISOString();
}

function knockoutKickoffUtc(matchNumber: number): string {
  const baseDates: Record<number, string> = {
    73: "2026-06-28T17:00:00.000Z",
    81: "2026-06-29T17:00:00.000Z",
    89: "2026-07-04T17:00:00.000Z",
    97: "2026-07-09T17:00:00.000Z",
    101: "2026-07-14T20:00:00.000Z",
    103: "2026-07-18T20:00:00.000Z",
    104: "2026-07-19T20:00:00.000Z"
  };
  if (matchNumber >= 104) return baseDates[104];
  if (matchNumber >= 103) return baseDates[103];
  if (matchNumber >= 101) {
    const offset = matchNumber - 101;
    return new Date(
      new Date(baseDates[101]).getTime() + offset * 24 * 60 * 60 * 1000
    ).toISOString();
  }
  if (matchNumber >= 97) {
    const offset = matchNumber - 97;
    return new Date(
      new Date(baseDates[97]).getTime() + offset * 24 * 60 * 60 * 1000
    ).toISOString();
  }
  if (matchNumber >= 89) {
    const offset = matchNumber - 89;
    return new Date(
      new Date(baseDates[89]).getTime() + offset * 12 * 60 * 60 * 1000
    ).toISOString();
  }
  const offset = matchNumber - 73;
  return new Date(
    new Date(baseDates[73]).getTime() + offset * 8 * 60 * 60 * 1000
  ).toISOString();
}

function buildSeedRow(matchNumber: number): SeedRow {
  const published = PUBLISHED_GROUP_MATCHES[matchNumber];
  if (published) {
    return { matchNumber, ...published };
  }

  const stage = stageForMatch(matchNumber);

  if (matchNumber <= 72) {
    const venueSlug = WORLD_CUP_VENUE_SLUGS[(matchNumber - 1) % WORLD_CUP_VENUE_SLUGS.length];
    const groupLetter = String.fromCharCode(65 + ((matchNumber - 1) % 12));
    return {
      matchNumber,
      startsAt: groupKickoffUtc(matchNumber),
      venueSlug,
      stage,
      teamOneName: `Group ${groupLetter} Team 1`,
      teamTwoName: `Group ${groupLetter} Team 2`
    };
  }

  const venueSlug = KNOCKOUT_VENUES[matchNumber] ?? "metlife-stadium";
  const teams = knockoutTeamNames(matchNumber);
  return {
    matchNumber,
    startsAt: knockoutKickoffUtc(matchNumber),
    venueSlug,
    stage,
    ...teams
  };
}

export function buildWorldCup2026Fixtures(): WorldCupFixturesFile {
  const fixtures: WorldCupFixtureRow[] = [];

  for (let n = 1; n <= 104; n += 1) {
    const seed = buildSeedRow(n);
    fixtures.push({
      matchId: String(n).padStart(3, "0"),
      startsAt: seed.startsAt,
      venueName: WORLD_CUP_VENUE_DISPLAY_NAMES[seed.venueSlug],
      venueSlug: seed.venueSlug,
      stage: seed.stage,
      teamOneName: seed.teamOneName,
      teamTwoName: seed.teamTwoName,
      status: "SCHEDULED"
    });
  }

  return {
    season: 2026,
    tournament: "FIFA World Cup 2026",
    fixtures
  };
}
