/**
 * Big 12 2026 schedule mapping tests.
 *   npx tsx --test lib/schedules/ncaa-big-12-schedule.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isGameDayActive } from "../game-day";
import {
  NCAA_BIG_12_2026_EXCLUDED_NEUTRALS,
  NCAA_BIG_12_2026_HOME_FIXTURES
} from "./ncaa-big-12-2026-data";
import {
  mapAllBig122026HomeGames,
  mapBig12Fixture,
  ncaaBig12ExternalId
} from "./ncaa-big-12-schedule";
import { parseEasternKickoff } from "./ncaa-big-ten-schedule";

describe("ncaa big 12 external ids", () => {
  it("are deterministic and unique across the curated slate", () => {
    const ids = NCAA_BIG_12_2026_HOME_FIXTURES.map(ncaaBig12ExternalId);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids[0]!.startsWith("ncaa-fb-2026-"));
  });
});

describe("TBD kickoff convention", () => {
  it("never opens a review window from a fabricated noon timestamp", () => {
    const tbd = NCAA_BIG_12_2026_HOME_FIXTURES.find((f) => f.kickoffTbd)!;
    const mapped = mapBig12Fixture(tbd);
    assert.equal(mapped.kickoffTbd, true);
    assert.equal(mapped.pollingOpensAt.getTime(), mapped.pollingClosesAt.getTime());
    assert.equal(
      isGameDayActive(
        {
          pollingOpensAt: mapped.pollingOpensAt,
          pollingClosesAt: mapped.pollingClosesAt,
          status: mapped.status
        },
        mapped.startsAt
      ),
      false
    );
  });
});

describe("known kickoffs", () => {
  it("parse ESPN Eastern times to UTC instants", () => {
    const d = parseEasternKickoff("2026-09-05", "3:30 PM");
    assert.equal(d.toISOString(), "2026-09-05T19:30:00.000Z");
  });

  it("applies game-day windows for known kickoffs", () => {
    const known = NCAA_BIG_12_2026_HOME_FIXTURES.find((f) => !f.kickoffTbd)!;
    const mapped = mapBig12Fixture(known);
    assert.equal(mapped.kickoffTbd, false);
    assert.ok(mapped.pollingClosesAt.getTime() > mapped.pollingOpensAt.getTime());
  });
});

describe("neutral / non-campus exclusions", () => {
  it("documents key non-campus Big 12 games", () => {
    assert.ok(NCAA_BIG_12_2026_EXCLUDED_NEUTRALS.length >= 3);
  });

  it("does not assign Dublin, Wembley, or TQL games to campus stadiums", () => {
    const keys = new Set(
      NCAA_BIG_12_2026_HOME_FIXTURES.map(
        (f) => `${f.date}|${f.homeTeamSlug}|${f.awayTeamName}|${f.venueSlug}`
      )
    );
    assert.equal(
      [...keys].some((k) =>
        k.startsWith("2026-08-29|tcu-horned-frogs|North Carolina Tar Heels|amon-g-carter-stadium")
      ),
      false
    );
    assert.equal(
      [...keys].some((k) =>
        k.startsWith(
          "2026-09-19|kansas-jayhawks|Arizona State Sun Devils|david-booth-kansas-memorial-stadium"
        )
      ),
      false
    );
    assert.equal(
      [...keys].some((k) =>
        k.startsWith(
          "2026-09-19|cincinnati-bearcats|Miami (OH) RedHawks|nippert-stadium"
        )
      ),
      false
    );
  });

  it("keeps Missouri at Kansas as a David Booth campus home", () => {
    const mizzou = NCAA_BIG_12_2026_HOME_FIXTURES.find(
      (f) =>
        f.homeTeamSlug === "kansas-jayhawks" &&
        f.awayTeamName === "Missouri Tigers"
    );
    assert.ok(mizzou);
    assert.equal(mizzou!.venueSlug, "david-booth-kansas-memorial-stadium");
  });
});

describe("slate size", () => {
  it("maps 105 campus home games across 16 Big 12 programs", () => {
    assert.equal(mapAllBig122026HomeGames().length, 105);
    const homes = new Set(
      NCAA_BIG_12_2026_HOME_FIXTURES.map((f) => f.homeTeamSlug)
    );
    assert.equal(homes.size, 16);
  });
});
