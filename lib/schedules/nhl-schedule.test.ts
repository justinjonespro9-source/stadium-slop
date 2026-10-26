/**
 * NHL 2026–27 schedule mapping tests.
 *   npx tsx --test lib/schedules/nhl-schedule.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START,
  isGameDayActive
} from "../game-day";
import { getVenueTimeZone } from "../venue-timezone";
import { parseArenaStartInstant, planArenaScheduleWrites } from "./arena-schedule";
import {
  loadNhlScheduleFile,
  mapNhlScheduleEvents,
  mapNhlScheduleFile,
  NHL_REGULAR_SEASON_GAME_COUNT,
  NHL_SEASON
} from "./nhl-schedule";
import {
  listNhlHomeVenueMappings,
  resolveNhlHomeVenue,
  resolveNhlVenueSlug
} from "./nhl-team-venue-map";
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

describe("NHL team → venue mapping", () => {
  it("maps all 32 clubs onto shared buildings instead of new arenas", () => {
    const rows = listNhlHomeVenueMappings();
    assert.equal(rows.length, 32);
    assert.equal(new Set(rows.map((row) => row.homeTeamSlug)).size, 32);
    assert.equal(resolveNhlHomeVenue("Boston Bruins")?.venueSlug, "td-garden");
    assert.equal(resolveNhlHomeVenue("Los Angeles Kings")?.venueSlug, "crypto-com-arena");
    assert.equal(resolveNhlHomeVenue("New York Islanders")?.venueSlug, "ubs-arena");
    assert.equal(resolveNhlHomeVenue("Utah Mammoth")?.venueSlug, "delta-center");
    assert.equal(resolveNhlHomeVenue("Utah Hockey Club")?.venueSlug, "delta-center");
    assert.equal(resolveNhlHomeVenue("Utah Hockey Club")?.homeTeamName, "Utah Mammoth");
    assert.equal(resolveNhlVenueSlug("Xfinity Mobile Arena"), "wells-fargo-center");
    assert.equal(resolveNhlVenueSlug("Grand Casino Arena"), "grand-casino-arena");
    assert.equal(resolveNhlVenueSlug("SAP Center at San Jose"), "sap-center");
    assert.equal(resolveNhlVenueSlug("AT&T Stadium"), "att-stadium");
    assert.equal(resolveNhlVenueSlug("Rice-Eccles Stadium"), "rice-eccles-stadium");
    assert.equal(resolveNhlVenueSlug("Princess Auto Stadium"), "princess-auto-stadium");
    assert.equal(resolveNhlVenueSlug("Veikkaus Arena"), "veikkaus-arena");
    assert.equal(resolveNhlVenueSlug("PSD Bank Dome"), "psd-bank-dome");
  });
});

describe("NHL regular-season mapping", () => {
  it("maps an ordinary puck drop and converts it to Central Time", () => {
    const instant = parseArenaStartInstant("2026-10-10T17:00Z");
    assert.ok(instant);
    assert.equal(instant.toISOString(), "2026-10-10T17:00:00.000Z");
    assert.equal(parseArenaStartInstant("2026-10-10T17:00"), null);
    const { mapped, skipped } = mapNhlScheduleEvents([
      event({
        eventId: "ordinary-1",
        startsAt: "2026-10-10T17:00Z",
        homeTeamName: "Boston Bruins",
        awayTeamName: "Philadelphia Flyers",
        venueName: "TD Garden"
      })
    ]);
    assert.equal(skipped.length, 0);
    const game = mapped[0]!;
    assert.equal(game.externalId, "nhl-ordinary-1");
    assert.equal(game.season, NHL_SEASON);
    assert.equal(game.venueSlug, "td-garden");
    assert.equal(game.homeTeamSlug, "boston-bruins");
    const ct = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      weekday: "short"
    }).format(game.startsAt);
    assert.match(ct, /Sat/);
    assert.match(ct, /12:00 PM/);
    assert.equal(
      game.pollingOpensAt.getTime(),
      game.startsAt.getTime() - GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START * 60_000
    );
  });

  it("maps shared-arena, outdoor, and international games onto the building in the feed", () => {
    const { mapped } = mapNhlScheduleEvents([
      event({
        eventId: "kings-1",
        startsAt: "2026-10-15T02:00Z",
        homeTeamName: "Los Angeles Kings",
        awayTeamName: "Vegas Golden Knights",
        venueName: "crypto.com Arena"
      }),
      event({
        eventId: "401891813",
        startsAt: "2027-02-21T01:00Z",
        homeTeamName: "Dallas Stars",
        awayTeamName: "Vegas Golden Knights",
        venueName: "AT&T Stadium",
        notes: ["Navy Federal Credit Union Stadium Series"]
      }),
      event({
        eventId: "401891812",
        startsAt: "2026-12-31T23:00Z",
        homeTeamName: "Utah Mammoth",
        awayTeamName: "Colorado Avalanche",
        venueName: "Rice-Eccles Stadium",
        notes: ["NHL Winter Classic"]
      }),
      event({
        eventId: "401891807",
        startsAt: "2026-10-25T23:00Z",
        statusName: "STATUS_FINAL",
        homeTeamName: "Winnipeg Jets",
        awayTeamName: "Montreal Canadiens",
        venueName: "Princess Auto Stadium",
        notes: ["Heritage Classic"]
      }),
      event({
        eventId: "401891808",
        startsAt: "2026-11-12T17:00Z",
        homeTeamName: "Seattle Kraken",
        awayTeamName: "Carolina Hurricanes",
        venueName: "Veikkaus Arena",
        isNeutralSite: true,
        notes: ["NHL Global Series"]
      })
    ]);
    assert.equal(mapped[0]!.venueSlug, "crypto-com-arena");
    assert.equal(mapped[1]!.venueSlug, "att-stadium");
    assert.equal(mapped[1]!.isNeutralSite, false);
    assert.notEqual(mapped[1]!.venueSlug, "american-airlines-center");
    assert.equal(mapped[2]!.venueSlug, "rice-eccles-stadium");
    assert.notEqual(mapped[2]!.venueSlug, "delta-center");
    assert.equal(mapped[3]!.venueSlug, "princess-auto-stadium");
    assert.equal(mapped[3]!.status, "FINAL");
    assert.equal(mapped[4]!.venueSlug, "veikkaus-arena");
    assert.equal(mapped[4]!.isNeutralSite, true);
    assert.notEqual(mapped[4]!.venueSlug, "climate-pledge-arena");
    assert.equal(getVenueTimeZone({ slug: "veikkaus-arena" }), "Europe/Helsinki");
    assert.equal(getVenueTimeZone({ slug: "psd-bank-dome" }), "Europe/Berlin");
    assert.equal(getVenueTimeZone({ slug: "grand-casino-arena", state: "MN" }), "America/Chicago");
  });

  it("excludes preseason and does not duplicate an external id", () => {
    const regular = event({
      eventId: "401891810",
      startsAt: "2026-12-18T18:00Z",
      homeTeamName: "Ottawa Senators",
      awayTeamName: "Chicago Blackhawks",
      venueName: "PSD Bank Dome",
      isNeutralSite: true,
      notes: ["NHL Global Series"]
    });
    const { mapped, skipped, duplicateEventIds } = mapNhlScheduleEvents([
      regular,
      regular,
      event({
        eventId: "pre-1",
        startsAt: "2026-09-20T21:00Z",
        seasonTypeId: 1,
        seasonTypeName: "Preseason",
        homeTeamName: "Boston Bruins",
        awayTeamName: "Washington Capitals",
        venueName: "TD Garden"
      })
    ]);
    assert.equal(duplicateEventIds.length, 1);
    assert.equal(mapped.length, 1);
    assert.equal(mapped[0]!.venueSlug, "psd-bank-dome");
    assert.equal(skipped.length, 1);
    assert.equal(skipped[0]!.reason, "not-regular-season");
    const plan = planArenaScheduleWrites([], mapped);
    const again = planArenaScheduleWrites(
      mapped.map((game) => ({
        externalId: game.externalId,
        startsAt: game.startsAt,
        status: game.status,
        venueSlug: game.venueSlug,
        homeTeamSlug: game.homeTeamSlug,
        homeTeamName: game.homeTeamName,
        awayTeamName: game.awayTeamName,
        isNeutralSite: game.isNeutralSite,
        season: game.season,
        pollingOpensAt: game.pollingOpensAt,
        pollingClosesAt: game.pollingClosesAt,
        estimatedEndsAt: game.estimatedEndsAt
      })),
      mapped
    );
    assert.equal(plan.create.length, 1);
    assert.equal(again.create.length, 0);
    assert.equal(again.unchanged.length, 1);
    assert.equal(again.update.length, 0);
    const during = new Date(mapped[0]!.startsAt.getTime() + 30 * 60_000);
    assert.equal(isGameDayActive(mapped[0]!, during), true);
  });
});

describe("fetched 2026–27 NHL regular season", () => {
  it("maps every regular-season game once, including special sites", () => {
    const file = loadNhlScheduleFile();
    assert.equal(file.season, NHL_SEASON);
    assert.equal(file.espnSeasonYear, 2027);
    assert.equal(file.events.length, NHL_REGULAR_SEASON_GAME_COUNT);
    const { mapped, skipped, duplicateEventIds } = mapNhlScheduleFile(file);
    assert.equal(skipped.length, 0);
    assert.equal(duplicateEventIds.length, 0);
    assert.equal(mapped.length, NHL_REGULAR_SEASON_GAME_COUNT);
    assert.equal(new Set(mapped.map((game) => game.externalId)).size, mapped.length);
    assert.ok(mapped.every((game) => game.season === 2026));
    assert.ok(mapped.every((game) => game.externalId.startsWith("nhl-")));
    assert.equal(mapped.filter((game) => game.isNeutralSite).length, 4);
    assert.equal(
      mapped.filter((game) => game.venueSlug === "veikkaus-arena").length,
      2
    );
    assert.equal(mapped.filter((game) => game.venueSlug === "psd-bank-dome").length, 2);
    assert.equal(mapped.filter((game) => game.venueSlug === "att-stadium").length, 1);
    assert.equal(mapped.filter((game) => game.venueSlug === "rice-eccles-stadium").length, 1);
    assert.equal(
      mapped.filter((game) => game.venueSlug === "princess-auto-stadium").length,
      1
    );
    const preseason = file.events.filter((row) => row.seasonTypeId === 1);
    assert.equal(preseason.length, 0);
  });
});
