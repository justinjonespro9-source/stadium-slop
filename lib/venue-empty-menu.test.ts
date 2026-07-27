/**
 * Empty-menu venue copy.
 *   npx tsx --test lib/venue-empty-menu.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isNcaaMenuPendingVenue,
  venueEmptyMenuMessage
} from "./venue-empty-menu";

describe("venue empty menu", () => {
  it("flags Ryan Field, Ross-Ade, and SHI as menu-pending", () => {
    assert.equal(isNcaaMenuPendingVenue("ryan-field"), true);
    assert.equal(isNcaaMenuPendingVenue("ross-ade-stadium"), true);
    assert.equal(isNcaaMenuPendingVenue("shi-stadium"), true);
    assert.equal(isNcaaMenuPendingVenue("michigan-stadium"), false);
  });

  it("uses Menu coming soon copy for empty menus", () => {
    assert.match(venueEmptyMenuMessage("ryan-field"), /Menu coming soon/);
    assert.match(venueEmptyMenuMessage("camp-randall-stadium"), /Menu coming soon/);
    assert.doesNotMatch(venueEmptyMenuMessage("ryan-field"), /match these filters/);
  });
});
