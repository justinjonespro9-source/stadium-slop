/**
 * ESPN public NFL scoreboard → normalized regular-season events.
 *
 * Kickoff `startsAt` values are ESPN ISO-8601 instants (typically `...Z`).
 * Parse with `new Date(iso)` — never treat the local wall-clock digits as UTC.
 */

import { GameStatus } from "@prisma/client";

export const ESPN_NFL_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

export const NFL_REGULAR_SEASON_TYPE = 2;
export const NFL_REGULAR_SEASON_WEEKS = 18;
export const NFL_REGULAR_SEASON_GAME_COUNT = 272;

export type NflEspnScheduleEvent = {
  eventId: string;
  season: number;
  week: number;
  startsAt: string;
  timeValid: boolean;
  statusName: string;
  statusDetail: string;
  homeTeamName: string;
  homeTeamAbbr: string;
  awayTeamName: string;
  awayTeamAbbr: string;
  venueName: string;
  venueCity: string | null;
  venueState: string | null;
  venueCountry: string | null;
  isNeutralSite: boolean;
};

export type NflEspnScheduleFile = {
  season: number;
  seasonType: "regular";
  source: string;
  fetchedAt: string;
  events: NflEspnScheduleEvent[];
};

type EspnCompetitor = {
  homeAway?: string;
  team?: {
    displayName?: string;
    abbreviation?: string;
  };
};

type EspnCompetition = {
  date?: string;
  timeValid?: boolean;
  neutralSite?: boolean;
  competitors?: EspnCompetitor[];
  venue?: {
    fullName?: string;
    name?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  status?: {
    type?: {
      name?: string;
      description?: string;
      detail?: string;
    };
  };
};

type EspnEvent = {
  id?: string | number;
  date?: string;
  week?: { number?: number };
  season?: { year?: number; type?: number };
  status?: {
    type?: {
      name?: string;
      description?: string;
      detail?: string;
    };
  };
  competitions?: EspnCompetition[];
};

type EspnScoreboard = {
  season?: { year?: number; type?: number };
  week?: { number?: number };
  events?: EspnEvent[];
};

export function nflEspnScoreboardUrl(season: number, week: number) {
  const params = new URLSearchParams({
    seasontype: String(NFL_REGULAR_SEASON_TYPE),
    year: String(season),
    week: String(week)
  });
  return `${ESPN_NFL_SCOREBOARD_URL}?${params.toString()}`;
}

function competitorName(comp: EspnCompetitor | undefined): string {
  return comp?.team?.displayName?.trim() ?? "";
}

function competitorAbbr(comp: EspnCompetitor | undefined): string {
  return comp?.team?.abbreviation?.trim() ?? "";
}

export function mapEspnNflStatusToGameStatus(statusName: string | undefined): GameStatus {
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

export function parseEspnNflScoreboard(
  payload: EspnScoreboard,
  fallbackWeek: number,
  fallbackSeason: number
): NflEspnScheduleEvent[] {
  const events: NflEspnScheduleEvent[] = [];
  for (const event of payload.events ?? []) {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const home = competitors.find((c) => c.homeAway === "home");
    const away = competitors.find((c) => c.homeAway === "away");
    const venue = competition?.venue;
    const startsAt = (event.date ?? competition?.date ?? "").trim();
    const eventId = String(event.id ?? "").trim();
    const homeTeamName = competitorName(home);
    const awayTeamName = competitorName(away);
    if (!eventId || !startsAt || !homeTeamName || !awayTeamName) {
      continue;
    }

    const statusName =
      event.status?.type?.name ??
      competition?.status?.type?.name ??
      "";
    const statusDetail =
      event.status?.type?.detail ??
      event.status?.type?.description ??
      competition?.status?.type?.detail ??
      "";

    events.push({
      eventId,
      season: event.season?.year ?? payload.season?.year ?? fallbackSeason,
      week: event.week?.number ?? payload.week?.number ?? fallbackWeek,
      startsAt,
      timeValid: competition?.timeValid !== false,
      statusName,
      statusDetail,
      homeTeamName,
      homeTeamAbbr: competitorAbbr(home),
      awayTeamName,
      awayTeamAbbr: competitorAbbr(away),
      venueName: (venue?.fullName ?? venue?.name ?? "").trim(),
      venueCity: venue?.address?.city?.trim() ?? null,
      venueState: venue?.address?.state?.trim() ?? null,
      venueCountry: venue?.address?.country?.trim() ?? null,
      isNeutralSite: Boolean(competition?.neutralSite)
    });
  }
  return events;
}

export async function fetchEspnNflRegularSeason(
  season: number
): Promise<NflEspnScheduleFile> {
  const events: NflEspnScheduleEvent[] = [];
  for (let week = 1; week <= NFL_REGULAR_SEASON_WEEKS; week += 1) {
    const url = nflEspnScoreboardUrl(season, week);
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`ESPN NFL scoreboard failed (${response.status}): ${url}`);
    }
    const payload = (await response.json()) as EspnScoreboard;
    events.push(...parseEspnNflScoreboard(payload, week, season));
  }

  const unique = new Map<string, NflEspnScheduleEvent>();
  for (const event of events) {
    unique.set(event.eventId, event);
  }

  return {
    season,
    seasonType: "regular",
    source: ESPN_NFL_SCOREBOARD_URL,
    fetchedAt: new Date().toISOString(),
    events: [...unique.values()].sort((a, b) => {
      if (a.startsAt !== b.startsAt) return a.startsAt.localeCompare(b.startsAt);
      return a.eventId.localeCompare(b.eventId);
    })
  };
}
