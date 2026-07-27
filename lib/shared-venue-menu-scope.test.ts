/**
 * Shared NFL/college venue menu scope.
 *   npx tsx --test lib/shared-venue-menu-scope.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ACRISURE_SHARED_ITEM_SLUGS,
  ACRISURE_STEELERS_ONLY_ITEM_SLUGS,
  classifySharedVenueMenuItem,
  collegeMenuPendingMessage,
  filterItemsForCollegeMenuContext,
  resolveCollegeMenuContext,
  sharedStadiumCollegePendingNotice,
  summarizeSharedVenueMenuScopes
} from "./shared-venue-menu-scope";

describe("Acrisure classification sets", () => {
  it("partitions 19 known slugs into shared + Steelers-only without overlap", () => {
    assert.equal(ACRISURE_SHARED_ITEM_SLUGS.size, 10);
    assert.equal(ACRISURE_STEELERS_ONLY_ITEM_SLUGS.size, 9);
    for (const slug of ACRISURE_SHARED_ITEM_SLUGS) {
      assert.equal(ACRISURE_STEELERS_ONLY_ITEM_SLUGS.has(slug), false);
    }
  });
});

describe("resolveCollegeMenuContext", () => {
  it("uses ?team=pitt aliases but not bare upcoming schedules", () => {
    assert.deepEqual(
      resolveCollegeMenuContext({
        venueSlug: "acrisure-stadium",
        teamQuery: "pittsburgh-panthers"
      }),
      { venueSlug: "acrisure-stadium", collegeTenantSlug: "pittsburgh-panthers" }
    );
    assert.equal(
      resolveCollegeMenuContext({
        venueSlug: "acrisure-stadium",
        teamQuery: "pittsburgh-steelers"
      }),
      null
    );
    assert.equal(
      resolveCollegeMenuContext({
        venueSlug: "acrisure-stadium",
        activeHomeTeamSlug: null
      }),
      null
    );
  });

  it("applies filter when the active game is the college tenant", () => {
    assert.deepEqual(
      resolveCollegeMenuContext({
        venueSlug: "acrisure-stadium",
        activeHomeTeamSlug: "pittsburgh-panthers",
        activeLeague: "NCAA Football"
      }),
      { venueSlug: "acrisure-stadium", collegeTenantSlug: "pittsburgh-panthers" }
    );
  });
});

describe("college filter behavior", () => {
  it("hides Steelers-only Acrisure rows under Pitt context", () => {
    const items = [
      {
        name: "Primanti Bros.",
        slug: "primanti-bros-primanti-bros",
        tags: ["NFL"]
      },
      {
        name: "The Franco Pizza",
        slug: "the-franco-pizza-the-franco-pizza",
        tags: ["NFL"]
      },
      {
        name: "Cuban Sandwich",
        slug: "cuban-sandwich",
        tags: ["ncaa", "college-confirmed", "tenant:miami-hurricanes"]
      }
    ];
    assert.equal(classifySharedVenueMenuItem("acrisure-stadium", items[0]!), "shared");
    assert.equal(classifySharedVenueMenuItem("acrisure-stadium", items[1]!), "nfl-only");
    const filtered = filterItemsForCollegeMenuContext(
      "acrisure-stadium",
      items.slice(0, 2),
      "pittsburgh-panthers"
    );
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]!.slug, "primanti-bros-primanti-bros");
  });

  it("hides Hard Rock NFL-only rows under Miami context but keeps college-confirmed", () => {
    const items = [
      {
        name: "The Beef Hammer",
        slug: "the-beef-hammer",
        tags: ["NFL", "Import"]
      },
      {
        name: "Cuban Sandwich",
        slug: "cuban-sandwich",
        tags: [
          "ncaa",
          "college-football",
          "college-confirmed",
          "tenant:miami-hurricanes"
        ]
      },
      {
        name: "Stadium Hot Dog",
        slug: "stadium-hot-dog",
        tags: ["Meals"]
      }
    ];
    const counts = summarizeSharedVenueMenuScopes("hard-rock-stadium", items);
    assert.equal(counts["nfl-only"], 1);
    assert.equal(counts["college-confirmed"], 1);
    assert.equal(counts.shared, 1);
    const filtered = filterItemsForCollegeMenuContext(
      "hard-rock-stadium",
      items,
      "miami-hurricanes"
    );
    assert.equal(filtered.length, 2);
    assert.equal(
      filtered.some((i) => i.slug === "the-beef-hammer"),
      false
    );
  });

  it("surfaces Pitt pending copy when none qualify", () => {
    assert.match(
      collegeMenuPendingMessage("acrisure-stadium", "pittsburgh-panthers"),
      /Pitt menu still being verified/
    );
    assert.match(
      sharedStadiumCollegePendingNotice("acrisure-stadium") ?? "",
      /not Pitt-verified/
    );
  });
});
