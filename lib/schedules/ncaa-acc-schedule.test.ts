/**
 * ACC 2026 schedule mapping tests.
 *   npx tsx --test lib/schedules/ncaa-acc-schedule.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isGameDayActive } from "../game-day";
import {
  NCAA_ACC_2026_EXCLUDED_NEUTRALS,
  NCAA_ACC_2026_HOME_FIXTURES
} from "./ncaa-acc-2026-data";
import {
  mapAllAcc2026HomeGames,
  mapAccFixture,
  ncaaAccExternalId
} from "./ncaa-acc-schedule";
import { parseEasternKickoff } from "./ncaa-big-ten-schedule";

describe("ncaa acc external ids", () => {
  it("are deterministic and unique across the curated slate", () => {
    const ids = NCAA_ACC_2026_HOME_FIXTURES.map(ncaaAccExternalId);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids[0]!.startsWith("ncaa-fb-2026-"));
  });
});

describe("TBD kickoff convention", () => {
  it("never opens a review window from a fabricated noon timestamp", () => {
    const tbd = NCAA_ACC_2026_HOME_FIXTURES.find((f) => f.kickoffTbd)!;
    const mapped = mapAccFixture(tbd);
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
    const known = NCAA_ACC_2026_HOME_FIXTURES.find((f) => !f.kickoffTbd)!;
    const mapped = mapAccFixture(known);
    assert.equal(mapped.kickoffTbd, false);
    assert.ok(mapped.pollingClosesAt.getTime() > mapped.pollingOpensAt.getTime());
  });
});

describe("neutral / non-campus exclusions", () => {
  it("documents key non-campus ACC games", () => {
    assert.ok(NCAA_ACC_2026_EXCLUDED_NEUTRALS.length >= 4);
  });

  it("records College Football Brasil as NC State at Virginia (not Virginia Tech)", () => {
    const brazil = NCAA_ACC_2026_EXCLUDED_NEUTRALS.find((row) =>
      /Nilton Santos|Rio de Janeiro|Brasil/i.test(row.location)
    );
    assert.ok(brazil);
    assert.equal(brazil!.homeTeamName, "Virginia Cavaliers");
    assert.equal(brazil!.awayTeamName, "NC State Wolfpack");
    assert.equal(brazil!.date, "2026-08-29");
    assert.match(brazil!.location, /Nilton Santos Stadium/);
    assert.match(brazil!.location, /Rio de Janeiro/);
    assert.doesNotMatch(brazil!.homeTeamName, /Virginia Tech/i);
    assert.doesNotMatch(brazil!.awayTeamName, /Virginia Tech/i);
    assert.doesNotMatch(brazil!.reason, /Virginia Tech/i);
  });

  it("does not assign Dublin or Brazil openers to campus stadiums", () => {
    const keys = new Set(
      NCAA_ACC_2026_HOME_FIXTURES.map(
        (f) => `${f.date}|${f.homeTeamSlug}|${f.awayTeamName}|${f.venueSlug}`
      )
    );
    assert.equal(
      [...keys].some((k) =>
        k.startsWith(
          "2026-08-29|north-carolina-tar-heels|TCU Horned Frogs|kenan-memorial-stadium"
        )
      ),
      false
    );
    assert.equal(
      [...keys].some((k) =>
        k.startsWith(
          "2026-08-29|virginia-cavaliers|NC State Wolfpack|scott-stadium"
        )
      ),
      false
    );
    // Brazil is Virginia (Cavaliers) designated home — never Scott Stadium, never VT.
    assert.equal(
      NCAA_ACC_2026_HOME_FIXTURES.some(
        (f) =>
          f.date === "2026-08-29" &&
          f.venueSlug === "scott-stadium" &&
          /NC State/i.test(f.awayTeamName)
      ),
      false
    );
    assert.equal(
      NCAA_ACC_2026_HOME_FIXTURES.some(
        (f) =>
          f.date === "2026-08-29" &&
          f.homeTeamSlug === "virginia-tech-hokies" &&
          /NC State/i.test(f.awayTeamName)
      ),
      false
    );
  });

  it("keeps Miami and Pitt campus-shared NFL homes on Hard Rock / Acrisure", () => {
    const miami = NCAA_ACC_2026_HOME_FIXTURES.find(
      (f) => f.homeTeamSlug === "miami-hurricanes"
    );
    const pitt = NCAA_ACC_2026_HOME_FIXTURES.find(
      (f) => f.homeTeamSlug === "pittsburgh-panthers"
    );
    assert.equal(miami!.venueSlug, "hard-rock-stadium");
    assert.equal(pitt!.venueSlug, "acrisure-stadium");
  });
});

describe("slate size", () => {
  it("maps 109 campus home games across 17 ACC programs", () => {
    assert.equal(mapAllAcc2026HomeGames().length, 109);
    const homes = new Set(
      NCAA_ACC_2026_HOME_FIXTURES.map((f) => f.homeTeamSlug)
    );
    assert.equal(homes.size, 17);
  });
});
