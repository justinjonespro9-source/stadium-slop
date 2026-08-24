import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { FoodItem, Vendor } from "@/lib/sample-data";
import { itemMatchesVenueSearch } from "./venue-standings-search";

function item(name: string, extra?: Partial<FoodItem>): FoodItem {
  return {
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    venueSlug: "minnesota-state-fair",
    vendorSlug: "test-stand",
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
    description: extra?.description ?? "",
    ...extra
  };
}

const mouthTrap: Vendor = {
  slug: "mouth-trap-cheese-curds",
  name: "Mouth Trap Cheese Curds",
  venueSlug: "minnesota-state-fair",
  section: "Food Building",
  location: "Food Building",
  averageSlopScore: 0
};

describe("itemMatchesVenueSearch", () => {
  it("matches cheese curd shorthand and vendor names", () => {
    const curds = item("Deep-Fried Cheese Curds");
    const caprese = item("Caprese Curds", {
      description: "Fried mozzarella curds over tomatoes."
    });
    assert.equal(itemMatchesVenueSearch(curds, mouthTrap, "curds"), true);
    assert.equal(itemMatchesVenueSearch(curds, mouthTrap, "cheese curds"), true);
    assert.equal(itemMatchesVenueSearch(caprese, undefined, "curds"), true);
    assert.equal(itemMatchesVenueSearch(caprese, undefined, "cheese curds"), true);
    assert.equal(itemMatchesVenueSearch(curds, mouthTrap, "mouth trap"), true);
  });

  it("matches cookie and mini-donut shorthand", () => {
    const dough = item("Birthday Cake Cookie Dough On-A-Stick");
    const minis = item("Strawberry Crunch Mini Donuts");
    assert.equal(itemMatchesVenueSearch(dough, undefined, "cookies"), true);
    assert.equal(itemMatchesVenueSearch(dough, undefined, "cookie"), true);
    assert.equal(itemMatchesVenueSearch(minis, undefined, "mini donuts"), true);
    assert.equal(itemMatchesVenueSearch(minis, undefined, "donut"), true);
  });

  it("matches fries / french fries even when the dish name only says fries", () => {
    const garlic = item("Garlic Fries");
    const french = item("Fresh-Cut French Fries");
    assert.equal(itemMatchesVenueSearch(garlic, undefined, "fries"), true);
    assert.equal(itemMatchesVenueSearch(garlic, undefined, "french fries"), true);
    assert.equal(itemMatchesVenueSearch(french, undefined, "fries"), true);
    assert.equal(itemMatchesVenueSearch(french, undefined, "french fries"), true);
  });

  it("matches pickle pizza to pickle pie and pickle pizza items", () => {
    const pie = item("Pickle Pie", { description: "Savory pickle pie." });
    const pizza = item("pickle pizza");
    assert.equal(itemMatchesVenueSearch(pie, undefined, "pickle pizza"), true);
    assert.equal(itemMatchesVenueSearch(pie, undefined, "pickle pie"), true);
    assert.equal(itemMatchesVenueSearch(pizza, undefined, "pickle pizza"), true);
    assert.equal(itemMatchesVenueSearch(pizza, undefined, "pickle"), true);
  });

  it("does not match unrelated queries", () => {
    const curds = item("Deep-Fried Cheese Curds");
    assert.equal(itemMatchesVenueSearch(curds, mouthTrap, "walleye taco"), false);
  });
});
