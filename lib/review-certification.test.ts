/**
 * Admin location override certification.
 *
 *   npx tsx --test lib/review-certification.test.ts
 *   npm run test:review-certification
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GameStatus, type Game } from "@prisma/client";

import { buildGameDayKey, buildTestReviewGameDayKey, getGameDayWindow } from "./game-day";
import {
  isAdminLocationOverrideRequested,
  resolveReviewSubmissionCertification
} from "./review-certification";
import { FAIR_VENUE_DEFINITIONS } from "./fair-import/venues";
import {
  buildFairEventGameData,
  MINNESOTA_STATE_FAIR_2026_WINDOW
} from "./schedules/fair-event-window";

const MINNESOTA = FAIR_VENUE_DEFINITIONS.find(
  (venue) => venue.slug === "minnesota-state-fair"
)!;

function offsetMeters(
  lat: number,
  lng: number,
  northMeters: number,
  eastMeters: number
): { latitude: number; longitude: number } {
  const dLat = northMeters / 111_320;
  const dLng = eastMeters / (111_320 * Math.cos((lat * Math.PI) / 180));
  return { latitude: lat + dLat, longitude: lng + dLng };
}

function mockGame(overrides: Partial<Game> = {}): Game {
  const startsAt = new Date("2026-06-15T23:10:00.000Z");
  const window = getGameDayWindow(startsAt);
  return {
    id: "game-1",
    league: "MLB",
    season: 2026,
    homeTeamSlug: "minnesota-twins",
    homeTeamName: "Minnesota Twins",
    awayTeamName: "Boston Red Sox",
    isNeutralSite: false,
    venueId: "venue-1",
    startsAt,
    estimatedEndsAt: window.estimatedEndsAt,
    pollingOpensAt: window.pollingOpensAt,
    pollingClosesAt: window.pollingClosesAt,
    status: GameStatus.SCHEDULED,
    externalId: "test-game-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

function minnesotaFairGame(overrides: Partial<Game> = {}): Game {
  const fields = buildFairEventGameData(MINNESOTA_STATE_FAIR_2026_WINDOW);
  return mockGame({
    ...fields,
    id: "fair-mn-2026",
    venueId: "minnesota-state-fair-id",
    ...overrides
  });
}

const minnesotaBase = {
  venueLatitude: MINNESOTA.latitude,
  venueLongitude: MINNESOTA.longitude,
  reviewRadiusMeters: MINNESOTA.reviewRadiusMeters
} as const;

describe("isAdminLocationOverrideRequested", () => {
  it("is true only for explicit form values", () => {
    const on = new FormData();
    on.set("adminLocationOverride", "1");
    assert.equal(isAdminLocationOverrideRequested(on), true);

    const checked = new FormData();
    checked.set("adminLocationOverride", "on");
    assert.equal(isAdminLocationOverrideRequested(checked), true);

    const empty = new FormData();
    assert.equal(isAdminLocationOverrideRequested(empty), false);

    const forgedEmpty = new FormData();
    forgedEmpty.set("adminLocationOverride", "");
    assert.equal(isAdminLocationOverrideRequested(forgedEmpty), false);
  });
});

describe("resolveReviewSubmissionCertification — admin location override", () => {
  it("admin + override + active window succeeds without GPS and counts publicly", () => {
    const result = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: true,
      testReviewMode: false,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: null
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.mode, "override");
    assert.equal(result.verifiedGameDay, true);
    assert.equal(result.isTestReview, false);
    assert.equal(result.adminLocationOverride, true);
    assert.equal(result.distanceFromVenueMeters, null);
    assert.equal(result.locationVerifiedAt, null);
    assert.equal(result.gameId, "fair-mn-2026");
    assert.equal(result.gameDayKeyKind, "normal");
  });

  it("admin without override still requires GPS (missing location)", () => {
    const result = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: false,
      testReviewMode: false,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: null
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, "missing-location");
  });

  it("admin without override still uses Minnesota's 1200m radius", () => {
    assert.equal(MINNESOTA.reviewRadiusMeters, 1200);
    const justOutside = offsetMeters(
      MINNESOTA.latitude,
      MINNESOTA.longitude,
      0,
      MINNESOTA.reviewRadiusMeters + 250
    );

    const result = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: false,
      testReviewMode: false,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: justOutside
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, "outside-radius");
  });

  it("non-admin forging override cannot bypass GPS", () => {
    const missing = resolveReviewSubmissionCertification({
      isAdmin: false,
      adminLocationOverrideRequested: true,
      testReviewMode: false,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: null
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.equal(missing.code, "missing-location");
    }

    const justOutside = offsetMeters(
      MINNESOTA.latitude,
      MINNESOTA.longitude,
      0,
      MINNESOTA.reviewRadiusMeters + 50
    );
    const outside = resolveReviewSubmissionCertification({
      isAdmin: false,
      adminLocationOverrideRequested: true,
      testReviewMode: false,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: justOutside
    });
    assert.equal(outside.ok, false);
    if (!outside.ok) {
      assert.equal(outside.code, "outside-radius");
    }
  });

  it("override outside an active event window is rejected", () => {
    const result = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: true,
      testReviewMode: false,
      activeGame: null,
      ...minnesotaBase,
      location: null
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, "no-active-game");
  });

  it("override review flags are verifiedGameDay=true, isTestReview=false, adminLocationOverride=true", () => {
    const result = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: true,
      testReviewMode: true,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: null
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verifiedGameDay, true);
    assert.equal(result.isTestReview, false);
    assert.equal(result.adminLocationOverride, true);
    assert.equal(result.mode, "override");
  });

  it("explicit admin override takes precedence over test-review mode", () => {
    const result = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: true,
      testReviewMode: true,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: null
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.mode, "override");
    assert.equal(result.isTestReview, false);
    assert.equal(result.gameDayKeyKind, "normal");
  });

  it("test-review mode behaves as before when override is not selected", () => {
    const result = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: false,
      testReviewMode: true,
      activeGame: null,
      ...minnesotaBase,
      location: null
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.mode, "test");
    assert.equal(result.verifiedGameDay, false);
    assert.equal(result.isTestReview, true);
    assert.equal(result.adminLocationOverride, false);
    assert.equal(result.gameId, null);
    assert.equal(result.distanceFromVenueMeters, null);
    assert.equal(result.gameDayKeyKind, "test");
  });

  it("one-review-per-item-per-day uses the same gameDayKey as a normal certified review", () => {
    const when = new Date("2026-08-30T18:00:00.000Z");
    const venueSlug = MINNESOTA.slug;

    const override = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: true,
      testReviewMode: false,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: null
    });
    const gps = resolveReviewSubmissionCertification({
      isAdmin: false,
      adminLocationOverrideRequested: false,
      testReviewMode: false,
      activeGame: minnesotaFairGame(),
      ...minnesotaBase,
      location: { latitude: MINNESOTA.latitude, longitude: MINNESOTA.longitude }
    });
    const testReview = resolveReviewSubmissionCertification({
      isAdmin: true,
      adminLocationOverrideRequested: false,
      testReviewMode: true,
      activeGame: null,
      ...minnesotaBase,
      location: null
    });

    assert.equal(override.ok && override.gameDayKeyKind === "normal", true);
    assert.equal(gps.ok && gps.gameDayKeyKind === "normal", true);
    assert.equal(testReview.ok && testReview.gameDayKeyKind === "test", true);

    const uniquenessKey = (kind: "normal" | "test") =>
      kind === "test"
        ? buildTestReviewGameDayKey(venueSlug, when)
        : buildGameDayKey(venueSlug, when);

    if (override.ok && gps.ok && testReview.ok) {
      assert.equal(
        uniquenessKey(override.gameDayKeyKind),
        uniquenessKey(gps.gameDayKeyKind)
      );
      assert.notEqual(
        uniquenessKey(override.gameDayKeyKind),
        uniquenessKey(testReview.gameDayKeyKind)
      );
    }
  });
});
