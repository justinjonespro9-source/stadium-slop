/**
 * NBA 2026–27 schedule mapping tests.
 *   npx tsx --test lib/schedules/nba-schedule.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START,
  GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START,
  isGameDayActive
} from "../game-day";
import { getVenueTimeZone } from "../venue-timezone";
import {
  arenaExternalId,
  parseArenaStartInstant,
  planArenaScheduleWrites
} from "./arena-schedule";
import { dedupeEspnArenaEvents } from "./espn-team-schedule";
import {
  loadNbaScheduleFile,
  mapNbaScheduleEvents,
  mapNbaScheduleFile,
  NBA_CUP_GROUP_PLAY_NOTE,
  NBA_REGULAR_SEASON_GAME_COUNT,
  NBA_SEASON
} from "./nba-schedule";
import {
  listNbaHomeVenueMappings,
  resolveNbaHomeVenue,
  resolveNbaVenueSlug
} from "./nba-team-venue-map";
import type { EspnArenaScheduleEvent } from "./espn-team-schedule";

function event(
  partial: Partial<EspnArenaScheduleEvent> &
    Pick<EspnArenaScheduleEvent, "eventId" | "startsAt" | "homeTeamName" | "awayTeamName" | "venueName">
): EspnArenaScheduleEvent {
  return {
    espnSeasonYear: 2027,
    seasonTypeId: 2,
    seasonTypeName: "Regular Season",
    timeValid: true,
    statusName: "STATUS_SCHEDULED",
    venueCity: null,
    venueState: null,
    venueCountry: null,
    isNeutralSite: false,
    notes: [],
    ...partial
  };
}

function zoneParts(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { weekday: get("weekday"), hour: `${get("hour")} ${get("dayPeriod")}` };
}

describe("NBA team → venue mapping", () => {
  it("maps all 30 clubs, including buildings shared with the NHL", () => {
    const rows = listNbaHomeVenueMappings();
    assert.equal(rows.length, 30);
    assert.equal(new Set(rows.map((row) => row.homeTeamSlug)).size, 30);
    assert.equal(resolveNbaHomeVenue("Los Angeles Lakers")?.venueSlug, "crypto-com-arena");
    assert.equal(resolveNbaHomeVenue("LA Clippers")?.venueSlug, "intuit-dome");
    assert.equal(resolveNbaHomeVenue("Boston Celtics")?.venueSlug, "td-garden");
    assert.equal(resolveNbaHomeVenue("Chicago Bulls")?.venueSlug, "united-center");
    assert.equal(resolveNbaHomeVenue("Philadelphia 76ers")?.venueSlug, "wells-fargo-center");
    assert.equal(resolveNbaHomeVenue("Phoenix Suns")?.venueSlug, "footprint-center");
  });

  it("maps renamed arenas and special sites onto existing or explicit slugs", () => {
    assert.equal(resolveNbaVenueSlug("Xfinity Mobile Arena"), "wells-fargo-center");
    assert.equal(resolveNbaVenueSlug("Mortgage Matchup Center"), "footprint-center");
    assert.equal(resolveNbaVenueSlug("crypto.com Arena"), "crypto-com-arena");
    assert.equal(resolveNbaVenueSlug("Toyota Center (Houston)"), "toyota-center");
    assert.equal(resolveNbaVenueSlug("Moody Center"), "moody-center");
    assert.equal(resolveNbaVenueSlug("Arena CDMX"), "arena-cdmx");
    assert.equal(resolveNbaVenueSlug("Accor Arena"), "accor-arena");
    assert.equal(resolveNbaVenueSlug("Co-op Live"), "co-op-live");
  });
});

describe("NBA regular-season mapping", () => {
  it("maps an ordinary Wednesday game in Eastern Time", () => {
    const { mapped, skipped } = mapNbaScheduleEvents([
      event({
        eventId: "401909834",
        startsAt: "2026-10-21T23:00Z",
        homeTeamName: "Orlando Magic",
        awayTeamName: "Atlanta Hawks",
        venueName: "Kia Center"
      })
    ]);
    assert.equal(skipped.length, 0);
    const game = mapped[0]!;
    assert.equal(game.externalId, "nba-401909834");
    assert.equal(game.season, NBA_SEASON);
    assert.equal(game.venueSlug, "kia-center");
    assert.equal(game.isNeutralSite, false);
    const ct = zoneParts(game.startsAt.toISOString(), "America/Chicago");
    assert.equal(ct.weekday, "Wednesday");
    assert.equal(ct.hour, "6 PM");
    const et = zoneParts(game.startsAt.toISOString(), "America/New_York");
    assert.equal(et.weekday, "Wednesday");
    assert.equal(et.hour, "7 PM");
  });

  it("maps a weekend tip without shifting the UTC instant", () => {
    const startsAt = parseArenaStartInstant("2026-11-07T23:00Z");
    assert.ok(startsAt);
    assert.equal(startsAt.toISOString(), "2026-11-07T23:00:00.000Z");
    assert.equal(parseArenaStartInstant("2026-11-07T23:00"), null);
    const ct = zoneParts("2026-11-07T23:00Z", "America/Chicago");
    assert.equal(ct.weekday, "Saturday");
    assert.equal(ct.hour, "5 PM");
    const { mapped } = mapNbaScheduleEvents([
      event({
        eventId: "weekend-1",
        startsAt: "2026-11-07T23:00Z",
        homeTeamName: "Los Angeles Lakers",
        awayTeamName: "Boston Celtics",
        venueName: "crypto.com Arena"
      })
    ]);
    assert.equal(mapped[0]!.venueSlug, "crypto-com-arena");
    assert.equal(mapped[0]!.homeTeamSlug, "los-angeles-lakers");
  });

  it("keeps NBA Cup group-play games as one regular-season row", () => {
    const cup = event({
      eventId: "cup-1",
      startsAt: "2026-10-30T23:30Z",
      homeTeamName: "Boston Celtics",
      awayTeamName: "Chicago Bulls",
      venueName: "TD Garden",
      notes: [NBA_CUP_GROUP_PLAY_NOTE]
    });
    const { mapped, skipped } = mapNbaScheduleEvents([cup, cup]);
    assert.equal(skipped.length, 0);
    assert.equal(mapped.length, 1);
    assert.equal(mapped[0]!.externalId, "nba-cup-1");
    assert.equal(mapped[0]!.venueSlug, "td-garden");
    assert.equal(mapped[0]!.isNeutralSite, false);
    assert.deepEqual(mapped[0]!.eventNotes, [NBA_CUP_GROUP_PLAY_NOTE]);
  });

  it("maps neutral international games and Austin games off the everyday arena", () => {
    const { mapped } = mapNbaScheduleEvents([
      event({
        eventId: "401909938",
        startsAt: "2026-11-07T22:00Z",
        homeTeamName: "Indiana Pacers",
        awayTeamName: "Denver Nuggets",
        venueName: "Arena CDMX",
        isNeutralSite: true,
        notes: ["NBA Mexico City Game"]
      }),
      event({
        eventId: "401909096",
        startsAt: "2026-10-24T01:30Z",
        homeTeamName: "San Antonio Spurs",
        awayTeamName: "Houston Rockets",
        venueName: "Moody Center"
      })
    ]);
    assert.equal(mapped[0]!.venueSlug, "arena-cdmx");
    assert.equal(mapped[0]!.isNeutralSite, true);
    assert.notEqual(mapped[0]!.venueSlug, "gainbridge-fieldhouse");
    assert.equal(mapped[1]!.venueSlug, "moody-center");
    assert.equal(mapped[1]!.isNeutralSite, false);
    assert.notEqual(mapped[1]!.venueSlug, "frost-bank-center");
    assert.equal(getVenueTimeZone({ slug: "arena-cdmx" }), "America/Mexico_City");
    assert.equal(getVenueTimeZone({ slug: "accor-arena" }), "Europe/Paris");
  });

  it("excludes preseason", () => {
    const { mapped, skipped } = mapNbaScheduleEvents([
      event({
        eventId: "pre-1",
        startsAt: "2026-10-10T22:30Z",
        seasonTypeId: 1,
        seasonTypeName: "Preseason",
        homeTeamName: "Toronto Raptors",
        awayTeamName: "LA Clippers",
        venueName: "Rogers Arena",
        notes: ["NBA Canada Games 2026"]
      })
    ]);
    assert.equal(mapped.length, 0);
    assert.equal(skipped[0]!.reason, "not-regular-season");
  });
});

describe("NBA review windows and idempotency", () => {
  it("opens 90 minutes before tip and closes five hours after, including FINAL games still inside the window", () => {
    const { mapped } = mapNbaScheduleEvents([
      event({
        eventId: "window-1",
        startsAt: "2026-10-27T00:30Z",
        statusName: "STATUS_FINAL",
        homeTeamName: "Houston Rockets",
        awayTeamName: "Atlanta Hawks",
        venueName: "Toyota Center (Houston)"
      })
    ]);
    const game = mapped[0]!;
    assert.equal(
      game.pollingOpensAt.getTime(),
      game.startsAt.getTime() - GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START * 60_000
    );
    assert.equal(
      game.pollingClosesAt.getTime(),
      game.startsAt.getTime() + GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START * 60_000
    );
    assert.equal(
      isGameDayActive(game, new Date(game.startsAt.getTime() + 60 * 60_000)),
      true
    );
    assert.equal(
      isGameDayActive(game, new Date(game.pollingClosesAt.getTime())),
      false
    );
  });

  it("updates an existing external id instead of creating a second game", () => {
    const first = mapNbaScheduleEvents([
      event({
        eventId: "401909834",
        startsAt: "2026-10-21T23:00Z",
        homeTeamName: "Orlando Magic",
        awayTeamName: "Atlanta Hawks",
        venueName: "Kia Center"
      })
    ]).mapped;
    const second = mapNbaScheduleEvents([
      event({
        eventId: "401909834",
        startsAt: "2026-10-21T23:00Z",
        statusName: "STATUS_FINAL",
        homeTeamName: "Orlando Magic",
        awayTeamName: "Atlanta Hawks",
        venueName: "Kia Center"
      })
    ]).mapped;
    const plan = planArenaScheduleWrites(
      [
        {
          externalId: first[0]!.externalId,
          startsAt: first[0]!.startsAt,
          status: first[0]!.status,
          venueSlug: first[0]!.venueSlug,
          homeTeamSlug: first[0]!.homeTeamSlug,
          homeTeamName: first[0]!.homeTeamName,
          awayTeamName: first[0]!.awayTeamName,
          isNeutralSite: first[0]!.isNeutralSite,
          season: first[0]!.season,
          pollingOpensAt: first[0]!.pollingOpensAt,
          pollingClosesAt: first[0]!.pollingClosesAt,
          estimatedEndsAt: first[0]!.estimatedEndsAt
        }
      ],
      second
    );
    assert.equal(plan.create.length, 0);
    assert.equal(plan.update.length, 1);
    assert.equal(plan.unchanged.length, 0);
    assert.equal(plan.update[0]!.status, "FINAL");
    assert.equal(arenaExternalId("nba", "401909834"), "nba-401909834");
    assert.notEqual(arenaExternalId("nba", "401909834"), "nfl-401909834");
  });
});

describe("fetched 2026–27 NBA regular season", () => {
  it("maps the full regular season once, with Cup games and neutral sites included", () => {
    const file = loadNbaScheduleFile();
    assert.equal(file.season, NBA_SEASON);
    assert.equal(file.espnSeasonYear, 2027);
    assert.equal(file.events.length, NBA_REGULAR_SEASON_GAME_COUNT);
    const { mapped, skipped, duplicateEventIds } = mapNbaScheduleFile(file);
    assert.equal(skipped.length, 0);
    assert.equal(duplicateEventIds.length, 0);
    assert.equal(mapped.length, NBA_REGULAR_SEASON_GAME_COUNT);
    assert.equal(new Set(mapped.map((game) => game.externalId)).size, mapped.length);
    assert.ok(mapped.every((game) => game.season === 2026));
    assert.ok(mapped.every((game) => game.externalId.startsWith("nba-")));
    const cup = mapped.filter((game) => game.eventNotes.includes(NBA_CUP_GROUP_PLAY_NOTE));
    assert.equal(cup.length, 60);
    const mexico = mapped.find((game) => game.eventId === "401909938");
    assert.equal(mexico?.venueSlug, "arena-cdmx");
    assert.equal(mexico?.isNeutralSite, true);
    const paris = mapped.find((game) => game.venueSlug === "accor-arena");
    const manchester = mapped.find((game) => game.venueSlug === "co-op-live");
    assert.equal(paris?.isNeutralSite, true);
    assert.equal(manchester?.isNeutralSite, true);
    const moody = mapped.filter((game) => game.venueSlug === "moody-center");
    assert.equal(moody.length, 3);
    assert.ok(moody.every((game) => game.isNeutralSite === false));
    const deduped = dedupeEspnArenaEvents([...file.events, ...file.events]);
    assert.equal(deduped.events.length, file.events.length);
    assert.equal(deduped.duplicateIds.length, 0);
  });
});
