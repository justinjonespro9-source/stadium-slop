/**
 * Venue type badge / fairgrounds display mapping.
 *
 *   npx tsx --test lib/venue-display.test.ts
 *   npm run test:venue-display
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isFairgroundsVenue,
  resolveVenueTypeKey,
  venueTypeGlyph,
  venueTypeLabel
} from "./venue-display";

describe("resolveVenueTypeKey / fairgrounds badge", () => {
  it("state fair venue → FAIRGROUNDS", () => {
    assert.equal(
      resolveVenueTypeKey({
        venueType: "OTHER",
        slug: "wisconsin-state-fair",
        primarySport: "State fair",
        recurringEvents: ["Wisconsin State Fair"]
      }),
      "FAIRGROUNDS"
    );
    assert.equal(venueTypeLabel("FAIRGROUNDS"), "Fairgrounds");
    assert.equal(venueTypeGlyph("FAIRGROUNDS"), "🎡");
  });

  it("standard stadium stays STADIUM", () => {
    assert.equal(
      resolveVenueTypeKey({
        venueType: "STADIUM",
        slug: "lambeau-field",
        primarySport: "Football"
      }),
      "STADIUM"
    );
  });

  it("college stadium stays COLLEGE_STADIUM", () => {
    assert.equal(
      resolveVenueTypeKey({
        venueType: "COLLEGE_STADIUM",
        slug: "michigan-stadium",
        primarySport: "Football"
      }),
      "COLLEGE_STADIUM"
    );
  });

  it("arena stays ARENA", () => {
    assert.equal(
      resolveVenueTypeKey({
        venueType: "ARENA",
        slug: "united-center",
        primarySport: "Basketball"
      }),
      "ARENA"
    );
  });

  it("mixed-use stadium (Snapdragon) stays STADIUM", () => {
    assert.equal(
      resolveVenueTypeKey({
        venueType: "STADIUM",
        slug: "snapdragon-stadium",
        primarySport: "Soccer"
      }),
      "STADIUM"
    );
    assert.equal(isFairgroundsVenue({ venueType: "STADIUM", slug: "snapdragon-stadium" }), false);
  });

  it("truly uncategorized venue → OTHER", () => {
    assert.equal(
      resolveVenueTypeKey({
        venueType: "OTHER",
        slug: "mystery-pavilion",
        primarySport: null,
        sports: [],
        recurringEvents: []
      }),
      "OTHER"
    );
    assert.equal(venueTypeLabel("OTHER"), "Other");
  });
});
