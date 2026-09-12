/**
 * NFL 2026 schedule mapping tests.
 *   npx tsx --test lib/schedules/nfl-schedule.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START, isGameDayActive } from "../game-day";
import { mapEspnNflStatusToGameStatus } from "./nfl-espn";
import {
  loadNflScheduleFile,
  mapNflScheduleEvents,
  mapNflScheduleFile,
  nflExternalId,
  nflMappedGameToPrismaData,
  parseNflKickoffInstant,
  upsertNflGamesByExternalId
} from "./nfl-schedule";
import {
  listNflHomeVenueMappings,
  resolveHomeVenueByTeamName,
  resolveVenueSlugByEspnVenueName
} from "./nfl-team-venue-map";
import type { NflEspnScheduleEvent } from "./nfl-espn";

function event(partial: Partial<NflEspnScheduleEvent> & Pick<
  NflEspnScheduleEvent,
  "eventId" | "startsAt" | "homeTeamName" | "awayTeamName" | "venueName"
>): NflEspnScheduleEvent {
  return {
    season: 2026,
    week: 1,
    timeValid: true,
    statusName: "STATUS_SCHEDULED",
    statusDetail: "Scheduled",
    homeTeamAbbr: "",
    awayTeamAbbr: "",
    venueCity: null,
    venueState: null,
    venueCountry: null,
    isNeutralSite: false,
    ...partial
  };
}

describe("NFL team → venue mapping", () => {
  it("maps all 32 clubs to unique-or-shared Stadium Slop slugs", () => {
    const rows = listNflHomeVenueMappings();
    assert.equal(rows.length, 32);
    assert.equal(new Set(rows.map((r) => r.homeTeamSlug)).size, 32);
    assert.ok(rows.every((r) => r.verified));
    assert.equal(resolveHomeVenueByTeamName("Los Angeles Chargers")?.venueSlug, "sofi-stadium");
    assert.equal(resolveHomeVenueByTeamName("New York Jets")?.venueSlug, "metlife-stadium");
    assert.equal(resolveHomeVenueByTeamName("San Francisco 49ers")?.venueSlug, "levi-s-stadium");
    assert.equal(resolveHomeVenueByTeamName("Kansas City Chiefs")?.venueSlug, "geha-field-at-arrowhead-stadium");
    assert.equal(resolveHomeVenueByTeamName("Tennessee Titans")?.venueSlug, "nissan-stadium");
  });

  it("maps ESPN venue aliases without creating duplicate stadiums", () => {
    assert.equal(resolveVenueSlugByEspnVenueName("Reliant Stadium"), "nrg-stadium");
    assert.equal(resolveVenueSlugByEspnVenueName("Arrowhead Stadium"), "geha-field-at-arrowhead-stadium");
    assert.equal(resolveVenueSlugByEspnVenueName("Levi's Stadium"), "levi-s-stadium");
    assert.equal(resolveVenueSlugByEspnVenueName("Estadio Banorte"), "estadio-azteca");
    assert.equal(resolveVenueSlugByEspnVenueName("Allianz Arena"), "fc-bayern-munich-stadium");
  });
});

describe("timezone handling", () => {
  it("parses ESPN Z instants and rejects naive local datetimes", () => {
    const utc = parseNflKickoffInstant("2026-09-13T17:00Z");
    assert.ok(utc);
    assert.equal(utc.toISOString(), "2026-09-13T17:00:00.000Z");
    assert.equal(parseNflKickoffInstant("2026-09-13T17:00"), null);
    assert.equal(parseNflKickoffInstant("2026-09-13 17:00"), null);
  });

  it("does not treat 1:00 PM ET Sunday as 5:00 PM UTC wall clock in Central Time", () => {
    const startsAt = parseNflKickoffInstant("2026-09-13T17:00Z")!;
    const ct = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      weekday: "short"
    }).format(startsAt);
    assert.match(ct, /12:00 PM/);
    const et = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(startsAt);
    assert.equal(et, "1:00 PM");
  });
});

describe("review windows", () => {
  it("stores derived game-day windows for known kickoffs", () => {
    const { mapped } = mapNflScheduleEvents([
      event({
        eventId: "tz-sunday-early",
        startsAt: "2026-09-13T17:00Z",
        homeTeamName: "Cincinnati Bengals",
        awayTeamName: "Tampa Bay Buccaneers",
        venueName: "Paycor Stadium"
      })
    ]);
    const game = mapped[0]!;
    assert.equal(game.kickoffTbd, false);
    assert.equal(
      game.pollingOpensAt.getTime(),
      game.startsAt.getTime() - GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START * 60_000
    );
    assert.ok(game.pollingClosesAt.getTime() > game.pollingOpensAt.getTime());
    assert.equal(
      isGameDayActive(
        {
          pollingOpensAt: game.pollingOpensAt,
          pollingClosesAt: game.pollingClosesAt,
          status: game.status
        },
        game.startsAt
      ),
      true
    );
  });

  it("keeps TBD ESPN kickoffs from opening a review window", () => {
    const { mapped } = mapNflScheduleEvents([
      event({
        eventId: "tbd-week18",
        startsAt: "2027-01-10T05:00Z",
        timeValid: false,
        homeTeamName: "Buffalo Bills",
        awayTeamName: "New York Jets",
        venueName: "Highmark Stadium",
        week: 18
      })
    ]);
    const game = mapped[0]!;
    assert.equal(game.kickoffTbd, true);
    assert.equal(game.pollingOpensAt.getTime(), game.pollingClosesAt.getTime());
    assert.equal(
      isGameDayActive(
        {
          pollingOpensAt: game.pollingOpensAt,
          pollingClosesAt: game.pollingClosesAt,
          status: game.status
        },
        game.startsAt
      ),
      false
    );
  });
});

describe("idempotent upsert", () => {
  it("uses stable espn event ids and updates instead of duplicating", () => {
    const first = mapNflScheduleEvents([
      event({
        eventId: "401872656",
        startsAt: "2026-09-10T00:20Z",
        homeTeamName: "Seattle Seahawks",
        awayTeamName: "New England Patriots",
        venueName: "Lumen Field"
      })
    ]).mapped;
    const second = mapNflScheduleEvents([
      event({
        eventId: "401872656",
        startsAt: "2026-09-10T00:20Z",
        statusName: "STATUS_FINAL",
        homeTeamName: "Seattle Seahawks",
        awayTeamName: "New England Patriots",
        venueName: "Lumen Field"
      })
    ]).mapped;
    assert.equal(first[0]!.externalId, "nfl-401872656");
    assert.equal(nflExternalId("401872656"), first[0]!.externalId);
    const pass = upsertNflGamesByExternalId(first, second);
    assert.equal(pass.created, 0);
    assert.equal(pass.updated, 1);
    assert.equal(pass.byExternalId.size, 1);
    assert.equal(pass.byExternalId.get("nfl-401872656")?.status, "FINAL");
  });

  it("does not collide with other leagues' external ids", () => {
    assert.ok(nflExternalId("401872656").startsWith("nfl-"));
    assert.notEqual(nflExternalId("401872656"), "mlb-401872656");
    assert.notEqual(nflExternalId("401872656"), "wc26-401872656");
  });
});

describe("representative 2026 kickoffs", () => {
  it("maps Sunday early, Sunday late, SNF, MNF, Thursday, and Melbourne", () => {
    const { mapped, skipped } = mapNflScheduleEvents([
      event({
        eventId: "sun-early",
        startsAt: "2026-09-13T17:00Z",
        homeTeamName: "Cincinnati Bengals",
        awayTeamName: "Tampa Bay Buccaneers",
        venueName: "Paycor Stadium"
      }),
      event({
        eventId: "sun-late",
        startsAt: "2026-09-13T20:25Z",
        homeTeamName: "Las Vegas Raiders",
        awayTeamName: "Miami Dolphins",
        venueName: "Allegiant Stadium"
      }),
      event({
        eventId: "snf",
        startsAt: "2026-09-14T00:20Z",
        homeTeamName: "New York Giants",
        awayTeamName: "Dallas Cowboys",
        venueName: "MetLife Stadium"
      }),
      event({
        eventId: "mnf",
        startsAt: "2026-09-15T00:15Z",
        homeTeamName: "Kansas City Chiefs",
        awayTeamName: "Denver Broncos",
        venueName: "Arrowhead Stadium"
      }),
      event({
        eventId: "tnf",
        week: 2,
        startsAt: "2026-09-18T00:15Z",
        homeTeamName: "Buffalo Bills",
        awayTeamName: "Detroit Lions",
        venueName: "Highmark Stadium"
      }),
      event({
        eventId: "melbourne",
        startsAt: "2026-09-11T00:35Z",
        homeTeamName: "Los Angeles Rams",
        awayTeamName: "San Francisco 49ers",
        venueName: "Melbourne Cricket Ground",
        isNeutralSite: true,
        venueCountry: "Australia"
      })
    ]);
    assert.equal(skipped.length, 0);
    assert.equal(mapped.length, 6);
    assert.equal(mapped[0]!.venueSlug, "paycor-stadium");
    assert.equal(mapped[1]!.venueSlug, "allegiant-stadium");
    assert.equal(mapped[2]!.venueSlug, "metlife-stadium");
    assert.equal(mapped[3]!.venueSlug, "geha-field-at-arrowhead-stadium");
    assert.equal(mapped[4]!.venueSlug, "highmark-stadium");
    const melbourne = mapped[5]!;
    assert.equal(melbourne.venueSlug, "melbourne-cricket-ground");
    assert.equal(melbourne.isNeutralSite, true);
    assert.notEqual(melbourne.venueSlug, "sofi-stadium");
    const payload = nflMappedGameToPrismaData(melbourne, "venue-1");
    assert.equal(payload.league, "NFL");
    assert.equal(payload.isNeutralSite, true);
    assert.equal(payload.externalId, "nfl-melbourne");
  });
});

describe("ESPN status mapping", () => {
  it("maps scheduled, live, and final", () => {
    assert.equal(mapEspnNflStatusToGameStatus("STATUS_SCHEDULED"), "SCHEDULED");
    assert.equal(mapEspnNflStatusToGameStatus("STATUS_IN_PROGRESS"), "LIVE");
    assert.equal(mapEspnNflStatusToGameStatus("STATUS_FINAL"), "FINAL");
  });
});

describe("2026 snapshot slate", () => {
  it("maps 272 unique regular-season games with no unmapped venues", () => {
    const file = loadNflScheduleFile();
    assert.equal(file.season, 2026);
    assert.equal(file.events.length, 272);
    const { mapped, skipped } = mapNflScheduleFile(file);
    assert.equal(skipped.length, 0);
    assert.equal(mapped.length, 272);
    assert.equal(new Set(mapped.map((g) => g.externalId)).size, 272);
    assert.equal(mapped.filter((g) => g.isNeutralSite).length, 9);
    assert.ok(mapped.every((g) => g.league === "NFL"));
    assert.ok(mapped.every((g) => g.season === 2026));
  });
});
