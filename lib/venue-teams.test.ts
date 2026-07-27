/**
 * Venue card / inline team-summary formatting.
 *
 *   npx tsx --test lib/venue-teams.test.ts
 *   npm run test:venue-teams
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatVenueTeamsInline,
  normalizeVenueTeams,
  resolveVenueTeams
} from "./venue-teams";

describe("formatVenueTeamsInline", () => {
  it("hides the team line when there are no associated teams", () => {
    assert.equal(formatVenueTeamsInline([]), null);
    assert.equal(formatVenueTeamsInline(["", "  "]), null);
  });

  it("shows only the team name for a single associated team", () => {
    assert.equal(formatVenueTeamsInline(["Michigan Wolverines"]), "Michigan Wolverines");
  });

  it("shows both names for two associated teams", () => {
    assert.equal(
      formatVenueTeamsInline(["New York Jets", "New York Giants"], "metlife-stadium"),
      "New York Giants & New York Jets"
    );
  });

  it("shows primary & N more for three or more associated teams", () => {
    assert.equal(
      formatVenueTeamsInline(
        ["San Diego Wave FC", "San Diego State Aztecs", "San Diego FC"],
        "snapdragon-stadium"
      ),
      "San Diego FC & 2 more"
    );
    assert.equal(
      formatVenueTeamsInline(["A Team", "B Team", "C Team", "D Team"]),
      "A Team & 3 more"
    );
  });

  it("deduplicates team names before calculating the remaining count", () => {
    assert.equal(
      formatVenueTeamsInline(["Michigan Wolverines", "Michigan Wolverines"]),
      "Michigan Wolverines"
    );
    assert.equal(
      formatVenueTeamsInline([
        "Michigan Wolverines",
        "michigan wolverines",
        "Ohio State Buckeyes"
      ]),
      "Michigan Wolverines & Ohio State Buckeyes"
    );
    assert.equal(
      formatVenueTeamsInline(["Alpha", "Alpha", "Beta", "Beta", "Gamma"]),
      "Alpha & 2 more"
    );
  });

  it("never emits & 0 more or a negative remaining count", () => {
    const samples = [
      formatVenueTeamsInline([]),
      formatVenueTeamsInline(["Only Team"]),
      formatVenueTeamsInline(["One", "Two"]),
      formatVenueTeamsInline(["One", "Two", "Three"]),
      formatVenueTeamsInline(["Dup", "Dup"])
    ];
    for (const line of samples) {
      if (line == null) continue;
      assert.doesNotMatch(line, /&\s*-\d+\s*more/i);
      assert.doesNotMatch(line, /&\s*0\s*more/i);
    }
  });
});

describe("multi-tenant Snapdragon Stadium", () => {
  it("keeps three tenants and summarizes as primary & 2 more", () => {
    const teams = resolveVenueTeams("snapdragon-stadium", ["San Diego FC"]);
    assert.deepEqual(normalizeVenueTeams(teams, "snapdragon-stadium"), [
      "San Diego FC",
      "San Diego Wave FC",
      "San Diego State Aztecs"
    ]);
    assert.equal(
      formatVenueTeamsInline(teams, "snapdragon-stadium"),
      "San Diego FC & 2 more"
    );
  });
});

describe("standard single-team college stadium", () => {
  it("shows Michigan Stadium / Wolverines without a residual count", () => {
    assert.equal(
      formatVenueTeamsInline(["Michigan Wolverines"], "michigan-stadium"),
      "Michigan Wolverines"
    );
    assert.equal(
      formatVenueTeamsInline(["Michigan Wolverines", "Michigan Wolverines"], "michigan-stadium"),
      "Michigan Wolverines"
    );
  });
});
