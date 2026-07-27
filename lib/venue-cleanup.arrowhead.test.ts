/**
 * Arrowhead / duplicate-group public browse regression.
 *
 *   npx tsx --test lib/venue-cleanup.arrowhead.test.ts
 *   npm run test:venue-cleanup-arrowhead
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { KNOWN_DUPLICATE_GROUPS } from "./venue-cleanup";

/** Mirrors `lib/venue-public-slug.ts` without importing `server-only`. */
function deprecatedPublicVenueSlugs(): Set<string> {
  return new Set(
    KNOWN_DUPLICATE_GROUPS.flatMap((group) =>
      group.aliasSlugs.map((alias) => alias.trim().toLowerCase())
    )
  );
}

function resolveCanonicalPublicVenueSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  for (const group of KNOWN_DUPLICATE_GROUPS) {
    if (group.aliasSlugs.some((alias) => alias.trim().toLowerCase() === normalized)) {
      return group.canonicalSlug;
    }
  }
  return slug.trim();
}

function isDeprecatedPublicVenueSlug(slug: string): boolean {
  return deprecatedPublicVenueSlugs().has(slug.trim().toLowerCase());
}

describe("Arrowhead duplicate group (production: only geha-field exists)", () => {
  const arrowheadGroup = KNOWN_DUPLICATE_GROUPS.find((g) =>
    g.label.toLowerCase().includes("arrowhead")
  );

  it("uses geha-field-at-arrowhead-stadium as the canonical public slug", () => {
    assert.ok(arrowheadGroup);
    assert.equal(arrowheadGroup!.canonicalSlug, "geha-field-at-arrowhead-stadium");
    assert.deepEqual(arrowheadGroup!.aliasSlugs, ["arrowhead-stadium", "arrowhead"]);
  });

  it("keeps GEHA Field in the public browse set when it is the only ACTIVE row", () => {
    const activeSlugs = ["geha-field-at-arrowhead-stadium", "lambeau-field", "target-field"];
    const publicSlugs = activeSlugs.filter((slug) => !isDeprecatedPublicVenueSlug(slug));
    assert.equal(publicSlugs.length, 3);
    assert.ok(publicSlugs.includes("geha-field-at-arrowhead-stadium"));
    assert.equal(isDeprecatedPublicVenueSlug("geha-field-at-arrowhead-stadium"), false);
  });

  it("does not drop GEHA Field when shorter aliases are absent from the DB", () => {
    const activeOnlyGeha = ["geha-field-at-arrowhead-stadium"];
    const publicSlugs = activeOnlyGeha.filter((slug) => !isDeprecatedPublicVenueSlug(slug));
    assert.deepEqual(publicSlugs, ["geha-field-at-arrowhead-stadium"]);
  });

  it("resolves alias URLs to the GEHA Field canonical slug", () => {
    assert.equal(
      resolveCanonicalPublicVenueSlug("arrowhead-stadium"),
      "geha-field-at-arrowhead-stadium"
    );
    assert.equal(resolveCanonicalPublicVenueSlug("arrowhead"), "geha-field-at-arrowhead-stadium");
    assert.equal(
      resolveCanonicalPublicVenueSlug("geha-field-at-arrowhead-stadium"),
      "geha-field-at-arrowhead-stadium"
    );
  });

  it("does not alter other duplicate groups", () => {
    const usBank = KNOWN_DUPLICATE_GROUPS.find((g) => g.canonicalSlug === "u-s-bank-stadium");
    const grandCasino = KNOWN_DUPLICATE_GROUPS.find(
      (g) => g.canonicalSlug === "grand-casino-arena"
    );
    const att = KNOWN_DUPLICATE_GROUPS.find((g) => g.canonicalSlug === "att-stadium");
    assert.deepEqual(usBank?.aliasSlugs, ["us-bank-stadium"]);
    assert.deepEqual(grandCasino?.aliasSlugs, ["xcel-energy-center"]);
    assert.deepEqual(att?.aliasSlugs, ["at-t-stadium", "cowboys-stadium"]);
  });
});
