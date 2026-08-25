import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { FoodItem } from "@/lib/sample-data";

import {
  buildFairFoodFilterCounts,
  getFairNewFoodsFilterLabel,
  itemHasNewSeasonTag,
  itemMatchesFairFoodFilter,
  resolveFairNewFoodsSeasonYear
} from "./fair-food-filters";

function fairItem(name: string, extra?: Partial<FoodItem>): FoodItem {
  return {
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    venueSlug: "minnesota-state-fair",
    vendorSlug: "test-vendor",
    itemType: "Food",
    category: "Snacks",
    location: "Fairgrounds",
    price: 10,
    rating: 0,
    worthItScore: 0,
    slopScore: 0,
    verdict: "Solid Role Player",
    runItBackPercent: 0,
    valueLabel: "Fair Deal",
    servedRightLabel: "Not Applicable",
    lineWaitLabel: "Not Applicable",
    napkinRating: 2,
    napkinLabel: "Safe at Your Seat",
    reviewCount: 0,
    tags: [],
    description: "",
    ...extra
  };
}

describe("fair new-foods season filter", () => {
  it("derives the season year from new-YYYY tags in the catalog", () => {
    const items = [
      fairItem("Classic Corn Dog", { tags: ["2025-preview"] }),
      fairItem("New Bite A", { tags: ["new-2026"] }),
      fairItem("New Bite B", { tags: ["new-2026", "new-vendor-2026"] })
    ];
    assert.equal(resolveFairNewFoodsSeasonYear(items, 2099), 2026);
    assert.equal(getFairNewFoodsFilterLabel(2026), "New for 2026");
  });

  it("counts New for 2026 only from new-2026 tags, not the full catalog", () => {
    const items = [
      fairItem("Cheese Curds", {
        tags: ["2025-preview", "prior-year-listing"],
        isNewThisSeason: true
      }),
      fairItem("Pork Chop on a Stick", {
        tags: ["core-catalog"],
        isNewThisSeason: false
      }),
      fairItem("Pickle Pizza", { tags: ["new-2026"] }),
      fairItem("Tater Tot Hotdish", { tags: ["new-2026", "new-vendor-2026"] })
    ];

    assert.equal(items.length, 4);
    const year = resolveFairNewFoodsSeasonYear(items);
    assert.equal(year, 2026);

    const counts = buildFairFoodFilterCounts(items, year);
    assert.equal(counts["new-foods"], 2);

    assert.equal(itemHasNewSeasonTag(items[0]!, 2026), false);
    assert.equal(itemMatchesFairFoodFilter(items[0]!, "new-foods", 2026), false);
    assert.equal(itemMatchesFairFoodFilter(items[2]!, "new-foods", 2026), true);
  });

  it("does not treat 2025-preview or isNewThisSeason as New for 2026", () => {
    const previewHeavy = fairItem("Old Preview Item", {
      tags: ["2025-preview", "new-food"],
      isNewThisSeason: true,
      seasonIntroduced: "2025"
    });
    assert.equal(itemMatchesFairFoodFilter(previewHeavy, "new-foods", 2026), false);
  });
});
