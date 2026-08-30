import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseMinnesotaStateFairFairFinder2026 } from "./parsers/minnesota-state-fair-fair-finder-2026";
import { MINNESOTA_FAIR_FINDER_2026_EXPANSION } from "./parsers/minnesota-state-fair-fair-finder-2026-data";
import { fairImportTagsForSource } from "./sources";
import { isNewThisSeasonFromImportTags } from "../venue-menu-import/apply";

describe("Minnesota Fair Finder 2026 expansion", () => {
  it("includes the approved 179 additions plus All You Can Drink Milk", () => {
    assert.equal(MINNESOTA_FAIR_FINDER_2026_EXPANSION.length, 180);
    assert.ok(
      MINNESOTA_FAIR_FINDER_2026_EXPANSION.some(
        (item) => item.name === "All You Can Drink Milk" && item.vendor === "All You Can Drink Milk"
      )
    );
    assert.ok(
      MINNESOTA_FAIR_FINDER_2026_EXPANSION.some(
        (item) => item.name === "Mangonada Drink" && item.vendor.includes("El Taco Torro")
      )
    );
  });

  it("tags only the 93 new Specialty Sips as new-2026", () => {
    const tagged = MINNESOTA_FAIR_FINDER_2026_EXPANSION.filter((item) =>
      (item.extraTags ?? []).includes("new-2026")
    );
    assert.equal(tagged.length, 93);
    assert.ok(tagged.every((item) => (item.extraTags ?? []).includes("specialty-sips")));
    assert.ok(
      !MINNESOTA_FAIR_FINDER_2026_EXPANSION.some(
        (item) =>
          item.name === "Orange Shandy" && (item.extraTags ?? []).includes("new-2026")
      )
    );
  });

  it("does not stamp new-food on the fair-finder-2026 import source", () => {
    const tags = fairImportTagsForSource("fair-finder-2026", "minnesota-state-fair", 2026);
    assert.ok(!tags.includes("new-food"));
    assert.ok(!tags.includes("2026-preview"));
    assert.ok(tags.includes("fair-finder"));
  });

  it("parses all expansion rows including specialty beverages", async () => {
    const parsed = await parseMinnesotaStateFairFairFinder2026();
    assert.equal(parsed.skippedDrinks, 0);
    assert.equal(parsed.skippedItems.length, 0);
    assert.equal(parsed.items.length, 180);
    assert.equal(
      parsed.items.filter((item) => (item.importTags ?? []).includes("new-2026")).length,
      93
    );
    assert.equal(
      parsed.items.filter((item) => item.category === "Alcoholic Drink").length,
      122
    );
  });
});

describe("isNewThisSeasonFromImportTags", () => {
  it("keeps stadium imports new when no import tags are present", () => {
    assert.equal(isNewThisSeasonFromImportTags(undefined), true);
    assert.equal(isNewThisSeasonFromImportTags([]), true);
  });

  it("marks fair items new only for new-season tags", () => {
    assert.equal(
      isNewThisSeasonFromImportTags(["state-fair", "minnesota-state-fair", "fair-finder"]),
      false
    );
    assert.equal(
      isNewThisSeasonFromImportTags([
        "state-fair",
        "minnesota-state-fair",
        "fair-finder",
        "new-2026"
      ]),
      true
    );
    assert.equal(
      isNewThisSeasonFromImportTags(["state-fair", "2026-preview", "new-food"]),
      true
    );
  });
});
