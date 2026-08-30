import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyLiveTrackedFoodCounts,
  formatTrackedFoodCount,
  STATE_FAIR_DIRECTORY_ENTRIES
} from "./state-fair-directory";

describe("applyLiveTrackedFoodCounts", () => {
  it("replaces the hardcoded Minnesota fallback with the live ACTIVE count", () => {
    const minnesota = STATE_FAIR_DIRECTORY_ENTRIES.find(
      (entry) => entry.slug === "minnesota-state-fair"
    );
    assert.equal(minnesota?.trackedFoodCount, 225);
    assert.equal(minnesota?.statusLabel, "225 foods tracked");

    const [updated] = applyLiveTrackedFoodCounts([minnesota!], {
      "minnesota-state-fair": 229
    });
    assert.equal(updated.trackedFoodCount, 229);
    assert.equal(updated.statusLabel, formatTrackedFoodCount(229));
    assert.equal(updated.status, "preview-loaded");
  });

  it("keeps static metadata when a fair has no live count", () => {
    const iowa = STATE_FAIR_DIRECTORY_ENTRIES.find((entry) => entry.slug === "iowa-state-fair")!;
    const [updated] = applyLiveTrackedFoodCounts([iowa], {});
    assert.equal(updated.trackedFoodCount, iowa.trackedFoodCount);
    assert.equal(updated.statusLabel, iowa.statusLabel);
  });

  it("leaves a venue shell with zero live items unchanged", () => {
    const bigE = STATE_FAIR_DIRECTORY_ENTRIES.find((entry) => entry.slug === "the-big-e")!;
    const [updated] = applyLiveTrackedFoodCounts([bigE], { "the-big-e": 0 });
    assert.equal(updated.status, "venue-shell");
    assert.equal(updated.statusLabel, "Guide shell only");
    assert.equal(updated.trackedFoodCount, null);
  });
});
