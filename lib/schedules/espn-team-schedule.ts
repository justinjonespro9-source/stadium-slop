/**
 * ESPN public team schedules for league-wide regular seasons.
 *
 * NBA and NHL do not publish a week index the way the NFL scoreboard does.
 * Each club schedule is requested with `seasontype=2` (regular season) and
 * events are deduped by ESPN event id. Preseason (`seasontype=1`) is a
 * separate request and is not fetched here.
 *
 * `startsAt` is an ESPN ISO-8601 instant. Parse with `new Date(iso)`.
 */

import { GameStatus } from "@prisma/client";

export const ESPN_SITE_API = "https://site.api.espn.com/apis/site/v2/sports";

/** ESPN's season.year for the 2026–27 NBA and NHL seasons (displayName "2026-27"). */
export const ESPN_2026_27_SEASON_YEAR = 2027;

export const ESPN_REGULAR_SEASON_TYPE = 2;

export type EspnArenaScheduleEvent = {
  eventId: string;
  espnSeasonYear: number;
  seasonTypeId: number | null;
  seasonTypeName: string;
  startsAt: string;
  timeValid: boolean;
  statusName: string;
  homeTeamName: string;
  awayTeamName: string;
  venueName: string;
  venueCity: string | null;
  venueState: string | null;
  venueCountry: string | null;
  isNeutralSite: boolean;
  notes: string[];
};

export type EspnArenaScheduleFile = {
  league: "NBA" | "NHL";
  /** Stadium Slop `Game.season` integer. Current competitions in this project use 2026. */
  season: number;
  espnSeasonYear: number;
  seasonType: "regular";
  source: string;
  fetchedAt: string;
  events: EspnArenaScheduleEvent[];
};

type EspnCompetitor = {
  homeAway?: string;
  team?: { displayName?: string };
};

type EspnNote = { headline?: string };

type EspnCompetition = {
  date?: string;
  timeValid?: boolean;
  neutralSite?: boolean;
  notes?: EspnNote[];
  competitors?: EspnCompetitor[];
  venue?: {
    fullName?: string;
    address?: { city?: string; state?: string; country?: string };
  };
  status?: { type?: { name?: string } };
};

type EspnScheduleEvent = {
  id?: string | number;
  date?: string;
  timeValid?: boolean;
  season?: { year?: number };
  seasonType?: { type?: number; name?: string; abbreviation?: string };
  competitions?: EspnCompetition[];
};

type EspnTeamSchedule = {
  events?: EspnScheduleEvent[];
};

type EspnTeamList = {
  sports?: Array<{
    leagues?: Array<{
      teams?: Array<{ team?: { id?: string | number } }>;
    }>;
  }>;
};

export function mapEspnStatusToGameStatus(statusName: string | undefined): GameStatus {
  const raw = (statusName ?? "").trim().toLowerCase();
  if (raw.includes("postpon")) return GameStatus.POSTPONED;
  if (raw.includes("cancel")) return GameStatus.CANCELED;
  if (raw.includes("final")) return GameStatus.FINAL;
  if (
    raw.includes("in_progress") ||
    raw.includes("in-progress") ||
    raw.includes("status_in_progress") ||
    raw === "status_halftime" ||
    raw.includes("halftime")
  ) {
    return GameStatus.LIVE;
  }
  return GameStatus.SCHEDULED;
}

export function parseEspnArenaScheduleEvent(
  event: EspnScheduleEvent,
  fallbackSeasonYear: number
): EspnArenaScheduleEvent | null {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  const eventId = String(event.id ?? "").trim();
  const startsAt = (event.date ?? competition?.date ?? "").trim();
  const homeTeamName = home?.team?.displayName?.trim() ?? "";
  const awayTeamName = away?.team?.displayName?.trim() ?? "";
  if (!eventId || !startsAt || !homeTeamName || !awayTeamName) {
    return null;
  }

  const venue = competition?.venue;
  const notes = (competition?.notes ?? [])
    .map((note) => note.headline?.trim() ?? "")
    .filter(Boolean);

  return {
    eventId,
    espnSeasonYear: event.season?.year ?? fallbackSeasonYear,
    seasonTypeId:
      typeof event.seasonType?.type === "number" ? event.seasonType.type : null,
    seasonTypeName: event.seasonType?.name?.trim() ?? "",
    startsAt,
    timeValid: (competition?.timeValid ?? event.timeValid) !== false,
    statusName: competition?.status?.type?.name ?? "",
    homeTeamName,
    awayTeamName,
    venueName: venue?.fullName?.trim() ?? "",
    venueCity: venue?.address?.city?.trim() ?? null,
    venueState: venue?.address?.state?.trim() ?? null,
    venueCountry: venue?.address?.country?.trim() ?? null,
    isNeutralSite: Boolean(competition?.neutralSite),
    notes
  };
}

export function dedupeEspnArenaEvents(events: EspnArenaScheduleEvent[]): {
  events: EspnArenaScheduleEvent[];
  /** Event ids that appeared more than twice. Home and away schedules both list a game, so two copies are expected. */
  duplicateIds: string[];
} {
  const byId = new Map<string, EspnArenaScheduleEvent>();
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.eventId, (counts.get(event.eventId) ?? 0) + 1);
    byId.set(event.eventId, event);
  }
  const duplicateIds = [...counts.entries()]
    .filter(([, count]) => count > 2)
    .map(([eventId]) => eventId);
  const unique = [...byId.values()].sort((a, b) => {
    if (a.startsAt !== b.startsAt) return a.startsAt.localeCompare(b.startsAt);
    return a.eventId.localeCompare(b.eventId);
  });
  return { events: unique, duplicateIds };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "stadium-slop-schedule-sync"
    }
  });
  if (!response.ok) {
    throw new Error(`ESPN schedule request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchEspnRegularSeasonTeamSchedules(options: {
  sportPath: "basketball/nba" | "hockey/nhl";
  espnSeasonYear?: number;
}): Promise<{ events: EspnArenaScheduleEvent[]; duplicateIds: string[] }> {
  const espnSeasonYear = options.espnSeasonYear ?? ESPN_2026_27_SEASON_YEAR;
  const teamsUrl = `${ESPN_SITE_API}/${options.sportPath}/teams?limit=50`;
  const teamList = await fetchJson<EspnTeamList>(teamsUrl);
  const teamIds = (teamList.sports?.[0]?.leagues?.[0]?.teams ?? [])
    .map((row) => String(row.team?.id ?? "").trim())
    .filter(Boolean);

  if (teamIds.length === 0) {
    throw new Error(`ESPN returned no teams for ${options.sportPath}`);
  }

  const parsed: EspnArenaScheduleEvent[] = [];
  const queue = [...teamIds];
  const workers = 6;

  async function worker() {
    while (queue.length > 0) {
      const teamId = queue.shift();
      if (!teamId) return;
      const url =
        `${ESPN_SITE_API}/${options.sportPath}/teams/${teamId}/schedule` +
        `?season=${espnSeasonYear}&seasontype=${ESPN_REGULAR_SEASON_TYPE}`;
      const schedule = await fetchJson<EspnTeamSchedule>(url);
      for (const event of schedule.events ?? []) {
        const row = parseEspnArenaScheduleEvent(event, espnSeasonYear);
        if (row) parsed.push(row);
      }
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));
  return dedupeEspnArenaEvents(parsed);
}
