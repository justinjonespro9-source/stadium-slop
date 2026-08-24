import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getGameDayReviewErrorMessage,
  getReviewCtaLabel
} from "./venue-copy-context";

describe("Minnesota fair review copy", () => {
  it("uses Fair hours on item CTAs without changing stadium copy", () => {
    assert.equal(
      getReviewCtaLabel("minnesota-state-fair", false, false),
      "Reviews open during Fair hours"
    );
    assert.equal(
      getReviewCtaLabel("minnesota-state-fair", false, true),
      "Review this item — fair-hours certified"
    );
    assert.equal(
      getReviewCtaLabel("target-field", false, false),
      "Reviews open during home games"
    );
    assert.equal(
      getReviewCtaLabel("target-field", true, true),
      "Edit today’s review"
    );
  });

  it("uses fairgrounds error copy only for fair venues", () => {
    assert.equal(
      getGameDayReviewErrorMessage("no-active-game", "minnesota-state-fair"),
      "Reviews open during Fair hours only."
    );
    assert.equal(
      getGameDayReviewErrorMessage("outside-radius", "minnesota-state-fair"),
      "You must be at the fairgrounds to submit a certified review."
    );
    assert.equal(
      getGameDayReviewErrorMessage("no-active-game", "target-field"),
      "Reviews open during active home-game windows only."
    );
  });
});
