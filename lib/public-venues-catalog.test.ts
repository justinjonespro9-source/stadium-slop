/**
 * Public venue catalog cache policy.
 *
 *   npx tsx --test lib/public-venues-catalog.test.ts
 *   npm run test:public-venues-catalog
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { venues as sampleVenues } from "./sample-data";
import {
  PUBLIC_VENUES_CACHE_KEY_PARTS,
  SAMPLE_VENUE_CATALOG_FALLBACK_ENV,
  allowSampleVenueCatalogFallback,
  formatPublicVenueCatalogFailureLog,
  resolvePublicVenueCatalogFailureAction
} from "./public-venues-catalog";
import { resolveVenueTypeKey, venueTypeLabel } from "./venue-display";

describe("public venues cache configuration", () => {
  it("uses a versioned cache key (not bare public-venues)", () => {
    assert.deepEqual([...PUBLIC_VENUES_CACHE_KEY_PARTS], [
      "public-venues",
      "v7-acc"
    ]);
    assert.notEqual(PUBLIC_VENUES_CACHE_KEY_PARTS.length, 1);
  });
});

describe("production catalog failure policy", () => {
  it("does not allow sample fallback by default", () => {
    assert.equal(allowSampleVenueCatalogFallback({}), false);
    assert.equal(resolvePublicVenueCatalogFailureAction({}), "rethrow");
  });

  it("allows sample fallback only when explicitly configured", () => {
    assert.equal(
      allowSampleVenueCatalogFallback({ [SAMPLE_VENUE_CATALOG_FALLBACK_ENV]: "1" }),
      true
    );
    assert.equal(
      resolvePublicVenueCatalogFailureAction({
        [SAMPLE_VENUE_CATALOG_FALLBACK_ENV]: "1"
      }),
      "sample"
    );
  });

  it("logs useful context and never implies sample is the production catalog", () => {
    const log = formatPublicVenueCatalogFailureLog(new Error("prisma enum boom"));
    assert.match(log.message, /prisma enum boom/);
    assert.deepEqual(log.cacheKey, ["public-venues", "v7-acc"]);
    assert.equal(log.sampleFallbackAllowed, allowSampleVenueCatalogFallback());
  });

  it("sample catalog size is the unsafe 32-row fallback, not the full ACTIVE set", () => {
    assert.equal(sampleVenues.length, 32);
    assert.ok(sampleVenues.length < 100);
  });
});

describe("FAIRGROUNDS enum mapping for catalog rows", () => {
  it("maps DB FAIRGROUNDS venueType to Fairgrounds badge key/label", () => {
    const key = resolveVenueTypeKey({
      venueType: "FAIRGROUNDS",
      slug: "wisconsin-state-fair",
      primarySport: "State fair"
    });
    assert.equal(key, "FAIRGROUNDS");
    assert.equal(venueTypeLabel(key), "Fairgrounds");
  });
});
