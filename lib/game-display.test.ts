/**
 * Game matchup display — must use Game participants, never venue.teams[0].
 *
 *   npx tsx --test lib/game-display.test.ts
 *   npm run test:game-display
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatGameDisplayName,
  resolveGameHomeTeamLabel,
  type GameDisplayFields
} from "./game-display";

function game( partial: Partial<GameDisplayFields> & Pick<GameDisplayFields, "awayTeamName" | "homeTeamSlug">): GameDisplayFields {
  return {
    league: "MLS",
    homeTeamName: null,
    isNeutralSite: false,
    externalId: "test-1",
    ...partial
  };
}

describe("formatGameDisplayName", () => {
  it("single-team venue uses game homeTeamName", () => {
    assert.equal(
      formatGameDisplayName(
        game({
          league: "MLB",
          homeTeamSlug: "detroit-tigers",
          homeTeamName: "Detroit Tigers",
          awayTeamName: "Cleveland Guardians"
        })
      ),
      "Cleveland Guardians at Detroit Tigers"
    );
  });

  it("shared NFL venue uses game home team, not venue primary", () => {
    assert.equal(
      formatGameDisplayName(
        game({
          league: "NFL",
          homeTeamSlug: "los-angeles-chargers",
          homeTeamName: "Los Angeles Chargers",
          awayTeamName: "Kansas City Chiefs"
        })
      ),
      "Kansas City Chiefs at Los Angeles Chargers"
    );
  });

  it("shared NFL/MLS venue (Gillette) uses Revolution for MLS, not Patriots", () => {
    assert.equal(
      formatGameDisplayName(
        game({
          league: "MLS",
          homeTeamSlug: "new-england-revolution",
          homeTeamName: "New England Revolution",
          awayTeamName: "Houston Dynamo FC"
        })
      ),
      "Houston Dynamo FC at New England Revolution"
    );
  });

  it("shared NBA/NHL arena uses the game’s home club", () => {
    assert.equal(
      formatGameDisplayName(
        game({
          league: "NHL",
          homeTeamSlug: "chicago-blackhawks",
          homeTeamName: "Chicago Blackhawks",
          awayTeamName: "Detroit Red Wings"
        })
      ),
      "Detroit Red Wings at Chicago Blackhawks"
    );
  });

  it("neutral-site / World Cup uses vs and both game participants", () => {
    assert.equal(
      formatGameDisplayName(
        game({
          league: "World Cup",
          homeTeamSlug: "haiti",
          homeTeamName: "Haiti",
          awayTeamName: "Scotland",
          isNeutralSite: true
        })
      ),
      "Haiti vs Scotland"
    );
  });

  it("missing homeTeamName falls back to title-cased homeTeamSlug (not venue tenant)", () => {
    assert.equal(
      resolveGameHomeTeamLabel(
        game({
          homeTeamSlug: "new-england-revolution",
          homeTeamName: null,
          awayTeamName: "Houston Dynamo FC"
        })
      ),
      "New England Revolution"
    );
    assert.equal(
      formatGameDisplayName(
        game({
          homeTeamSlug: "new-england-revolution",
          homeTeamName: null,
          awayTeamName: "Houston Dynamo FC"
        })
      ),
      "Houston Dynamo FC at New England Revolution"
    );
    assert.equal(
      formatGameDisplayName(
        game({
          homeTeamSlug: "new-england-revolution",
          homeTeamName: "   ",
          awayTeamName: "Toronto FC"
        })
      ),
      "Toronto FC at New England Revolution"
    );
  });
});
