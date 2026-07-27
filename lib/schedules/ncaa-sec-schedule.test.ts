/**
 * SEC 2026 schedule mapping tests.
 *   npx tsx --test lib/schedules/ncaa-sec-schedule.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isGameDayActive } from "../game-day";
import {
  NCAA_SEC_2026_EXCLUDED_NEUTRALS,
  NCAA_SEC_2026_HOME_FIXTURES
} from "./ncaa-sec-2026-data";
import {
  mapAllSec2026HomeGames,
  mapSecFixture,
  ncaaSecExternalId
} from "./ncaa-sec-schedule";
import { parseEasternKickoff } from "./ncaa-big-ten-schedule";

describe("ncaa sec external ids", () => {
  it("are deterministic and unique across the curated slate", () => {
    const ids = NCAA_SEC_2026_HOME_FIXTURES.map(ncaaSecExternalId);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids[0]!.startsWith("ncaa-fb-2026-"));
  });
});

describe("TBD kickoff convention", () => {
  it("never opens a review window from a fabricated noon timestamp", () => {
    const tbd = NCAA_SEC_2026_HOME_FIXTURES.find((f) => f.kickoffTbd)!;
    const mapped = mapSecFixture(tbd);
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
    assert.equal(d.toISOString(), "2026-09-05T23:30:00.000Z");
  });

  it("applies game-day windows for known kickoffs", () => {
    const known = NCAA_SEC_2026_HOME_FIXTURES.find((f) => !f.kickoffTbd)!;
    const mapped = mapSecFixture(known);
    assert.equal(mapped.kickoffTbd, false);
    assert.ok(mapped.pollingClosesAt.getTime() > mapped.pollingOpensAt.getTime());
  });
});

describe("neutral exclusions", () => {
  it("documents four non-campus SEC games", () => {
    assert.equal(NCAA_SEC_2026_EXCLUDED_NEUTRALS.length, 4);
  });

  it("does not seed Cocktail Party, Red River, or kickoff classics on campus", () => {
    const keys = new Set(
      NCAA_SEC_2026_HOME_FIXTURES.map(
        (f) => `${f.date}|${f.homeTeamSlug}|${f.awayTeamName}`
      )
    );
    assert.equal(
      keys.has("2026-09-05|auburn-tigers|Baylor Bears"),
      false
    );
    assert.equal(
      keys.has("2026-09-06|ole-miss-rebels|Louisville Cardinals"),
      false
    );
    assert.equal(
      keys.has("2026-10-31|georgia-bulldogs|Florida Gators"),
      false
    );
    assert.equal(
      keys.has("2026-10-10|oklahoma-sooners|Texas Longhorns"),
      false
    );
  });
});

describe("slate size", () => {
  it("maps 109 campus home games across 16 SEC programs", () => {
    assert.equal(mapAllSec2026HomeGames().length, 109);
    const homes = new Set(
      NCAA_SEC_2026_HOME_FIXTURES.map((f) => f.homeTeamSlug)
    );
    assert.equal(homes.size, 16);
  });
});
