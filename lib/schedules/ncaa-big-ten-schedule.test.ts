/**
 * Big Ten 2026 schedule mapping tests.
 *   npx tsx --test lib/schedules/ncaa-big-ten-schedule.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isGameDayActive } from "../game-day";
import { NCAA_BIG_TEN_2026_HOME_FIXTURES } from "./ncaa-big-ten-2026-data";
import {
  mapAllBigTen2026HomeGames,
  mapBigTenFixture,
  ncaaBigTenExternalId,
  parseEasternKickoff
} from "./ncaa-big-ten-schedule";

describe("ncaa big ten external ids", () => {
  it("are deterministic and unique across the curated slate", () => {
    const ids = NCAA_BIG_TEN_2026_HOME_FIXTURES.map(ncaaBigTenExternalId);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids[0]!.startsWith("ncaa-fb-2026-"));
  });
});

describe("TBD kickoff convention", () => {
  it("never opens a review window from a fabricated noon timestamp", () => {
    const tbd = NCAA_BIG_TEN_2026_HOME_FIXTURES.find((f) => f.kickoffTbd)!;
    const mapped = mapBigTenFixture(tbd);
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
    const d = parseEasternKickoff("2026-09-05", "7:30 PM");
    assert.ok(d instanceof Date);
    assert.ok(!Number.isNaN(d.getTime()));
    // 7:30 PM ET in early September is EDT (UTC-4) → 23:30Z
    assert.equal(d.toISOString(), "2026-09-05T23:30:00.000Z");
  });

  it("applies game-day windows for known kickoffs", () => {
    const known = NCAA_BIG_TEN_2026_HOME_FIXTURES.find((f) => !f.kickoffTbd)!;
    const mapped = mapBigTenFixture(known);
    assert.equal(mapped.kickoffTbd, false);
    assert.ok(mapped.pollingClosesAt.getTime() > mapped.pollingOpensAt.getTime());
  });
});

describe("Northwestern venue split", () => {
  it("puts early homes at Martin Stadium and later homes at Ryan Field", () => {
    const nu = NCAA_BIG_TEN_2026_HOME_FIXTURES.filter(
      (f) => f.homeTeamSlug === "northwestern-wildcats"
    );
    assert.equal(nu.length, 7);
    assert.equal(nu[0]!.venueSlug, "northwestern-medicine-field-at-martin-stadium");
    assert.equal(nu[1]!.venueSlug, "northwestern-medicine-field-at-martin-stadium");
    assert.ok(nu.slice(2).every((f) => f.venueSlug === "ryan-field"));
  });
});

describe("slate size", () => {
  it("maps 127 campus home games (Lambeau ND excluded)", () => {
    assert.equal(mapAllBigTen2026HomeGames().length, 127);
  });
});
