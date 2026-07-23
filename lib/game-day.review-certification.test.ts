/**
 * Regression tests for shared review location certification.
 *
 * Covers the Target Field mobile fix root cause (empty lat/lng after “captured”)
 * and global geofence + window eligibility used by every venue.
 *
 *   npx tsx --test lib/game-day.review-certification.test.ts
 *   npm run test:review-location-certification
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GameStatus, type Game } from "@prisma/client";

import {
  distanceMetersBetween,
  getGameDayWindow,
  isGameDayActive,
  parseReviewLocationFromForm,
  validateGameDayReviewSubmission,
  GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START,
  GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START
} from "./game-day";
import { buildFairEventGameData, WISCONSIN_STATE_FAIR_2026_WINDOW } from "./schedules/fair-event-window";

/** Real Target Field DB coordinates (also in game-day-venue-coords seed). */
const TARGET_FIELD = {
  slug: "target-field",
  latitude: 44.9817,
  longitude: -93.2776,
  reviewRadiusMeters: 800
} as const;

const VENUE_SAMPLES = {
  nfl: { slug: "metlife-stadium", latitude: 40.8128, longitude: -74.0742, reviewRadiusMeters: 1000 },
  nhl: { slug: "grand-casino-arena", latitude: 44.9448, longitude: -93.1011, reviewRadiusMeters: 800 },
  mls: { slug: "bmo-stadium", latitude: 34.0128, longitude: -118.2844, reviewRadiusMeters: 750 },
  ncaa: { slug: "ohio-stadium", latitude: 40.0016, longitude: -83.0199, reviewRadiusMeters: 1100 },
  worldCup: { slug: "estadio-azteca", latitude: 19.3029, longitude: -99.1505, reviewRadiusMeters: 1000 },
  fair: { slug: "wisconsin-state-fair", latitude: 43.0207, longitude: -88.0101, reviewRadiusMeters: 1200 }
} as const;

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

function formLocation(lat: string | number, lng: string | number): FormData {
  const fd = new FormData();
  fd.set("latitude", String(lat));
  fd.set("longitude", String(lng));
  return fd;
}

/** Same helper used by server submit; “eligibility” for geofence is this check. */
function eligibilityAndSubmitAgree(options: Parameters<typeof validateGameDayReviewSubmission>[0]) {
  const result = validateGameDayReviewSubmission(options);
  // There is no separate client geofence calculator — client only requires
  // non-empty coords + pollingOpen. Server is authoritative for radius/window.
  return result;
}

describe("parseReviewLocationFromForm (Target Field empty-coords regression)", () => {
  it("returns null for empty strings (pre-fix mobile failure mode)", () => {
    const fd = new FormData();
    fd.set("latitude", "");
    fd.set("longitude", "");
    assert.equal(parseReviewLocationFromForm(fd), null);
  });

  it("returns null when fields are missing", () => {
    assert.equal(parseReviewLocationFromForm(new FormData()), null);
  });

  it("returns null for non-numeric strings", () => {
    assert.equal(parseReviewLocationFromForm(formLocation("abc", "-93.27")), null);
    assert.equal(parseReviewLocationFromForm(formLocation("44.98", "xyz")), null);
  });

  it("parses numeric strings (controlled hidden inputs after fix)", () => {
    const loc = parseReviewLocationFromForm(
      formLocation(TARGET_FIELD.latitude, TARGET_FIELD.longitude)
    );
    assert.deepEqual(loc, {
      latitude: TARGET_FIELD.latitude,
      longitude: TARGET_FIELD.longitude
    });
  });

  it("rejects out-of-range coordinates", () => {
    assert.equal(parseReviewLocationFromForm(formLocation(91, 0)), null);
    assert.equal(parseReviewLocationFromForm(formLocation(0, 181)), null);
  });
});

describe("standard stadium game window + geofence", () => {
  const venue = TARGET_FIELD;
  const game = mockGame();
  const inside = { latitude: venue.latitude, longitude: venue.longitude };
  const outside = offsetMeters(venue.latitude, venue.longitude, 0, venue.reviewRadiusMeters + 250);

  it("inside geofence + active window → allowed", () => {
    assert.equal(isGameDayActive(game, game.startsAt), true);
    const result = validateGameDayReviewSubmission({
      activeGame: game,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: inside
    });
    assert.equal(result.ok, true);
  });

  it("outside geofence + active window → blocked", () => {
    const result = validateGameDayReviewSubmission({
      activeGame: game,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: outside
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "outside-radius");
  });

  it("inside geofence + before window → blocked", () => {
    const before = new Date(game.pollingOpensAt.getTime() - 1);
    assert.equal(isGameDayActive(game, before), false);
    const result = validateGameDayReviewSubmission({
      activeGame: isGameDayActive(game, before) ? game : null,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: inside
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "no-active-game");
  });

  it("inside geofence + after window → blocked", () => {
    const after = new Date(game.pollingClosesAt.getTime());
    assert.equal(isGameDayActive(game, after), false);
    const result = validateGameDayReviewSubmission({
      activeGame: isGameDayActive(game, after) ? game : null,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: inside
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "no-active-game");
  });

  it("default stadium window remains ±90 minutes / +5 hours", () => {
    const kickoff = new Date("2026-07-01T23:10:00.000Z");
    const window = getGameDayWindow(kickoff);
    assert.equal(
      window.pollingOpensAt.getTime(),
      kickoff.getTime() - GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START * 60_000
    );
    assert.equal(
      window.pollingClosesAt.getTime(),
      kickoff.getTime() + GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START * 60_000
    );
  });
});

describe("Target Field regression (real stored coords + radius)", () => {
  const game = mockGame({
    homeTeamSlug: "minnesota-twins",
    homeTeamName: "Minnesota Twins",
    externalId: "mlb-target-field-regression"
  });

  it("coordinate clearly inside Target Field must pass", () => {
    const nearHomePlate = offsetMeters(
      TARGET_FIELD.latitude,
      TARGET_FIELD.longitude,
      40,
      -30
    );
    const dist = distanceMetersBetween(
      nearHomePlate.latitude,
      nearHomePlate.longitude,
      TARGET_FIELD.latitude,
      TARGET_FIELD.longitude
    );
    assert.ok(dist < TARGET_FIELD.reviewRadiusMeters);

    const parsed = parseReviewLocationFromForm(
      formLocation(nearHomePlate.latitude, nearHomePlate.longitude)
    );
    const result = eligibilityAndSubmitAgree({
      activeGame: game,
      venueLatitude: TARGET_FIELD.latitude,
      venueLongitude: TARGET_FIELD.longitude,
      reviewRadiusMeters: TARGET_FIELD.reviewRadiusMeters,
      location: parsed
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.ok(result.distanceFromVenueMeters <= TARGET_FIELD.reviewRadiusMeters);
      assert.equal(result.allowedRadiusMeters, 800);
    }
  });

  it("coordinate clearly outside Target Field must fail", () => {
    // Minneapolis–Saint Paul International Airport — well outside 800m
    const mspAirport = { latitude: 44.882, longitude: -93.221 };
    const dist = distanceMetersBetween(
      mspAirport.latitude,
      mspAirport.longitude,
      TARGET_FIELD.latitude,
      TARGET_FIELD.longitude
    );
    assert.ok(dist > TARGET_FIELD.reviewRadiusMeters);

    const parsed = parseReviewLocationFromForm(
      formLocation(mspAirport.latitude, mspAirport.longitude)
    );
    const result = eligibilityAndSubmitAgree({
      activeGame: game,
      venueLatitude: TARGET_FIELD.latitude,
      venueLongitude: TARGET_FIELD.longitude,
      reviewRadiusMeters: TARGET_FIELD.reviewRadiusMeters,
      location: parsed
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "outside-radius");
  });

  it("empty captured UI state (coordsCaptured true, form empty) fails submit validation", () => {
    // Reconstructs the pre-fix failure: UI ready, form posts blank fields
    const parsed = parseReviewLocationFromForm(formLocation("", ""));
    const result = validateGameDayReviewSubmission({
      activeGame: game,
      venueLatitude: TARGET_FIELD.latitude,
      venueLongitude: TARGET_FIELD.longitude,
      reviewRadiusMeters: TARGET_FIELD.reviewRadiusMeters,
      location: parsed
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "missing-location");
  });
});

describe("other venue types use the same shared validators", () => {
  for (const [kind, venue] of Object.entries(VENUE_SAMPLES)) {
    it(`${kind} (${venue.slug}): inside allowed, outside blocked`, () => {
      const game =
        kind === "fair"
          ? ({
              ...buildFairEventGameData(WISCONSIN_STATE_FAIR_2026_WINDOW),
              id: "fair-game",
              venueId: "fair-venue",
              createdAt: new Date(),
              updatedAt: new Date()
            } as Game)
          : mockGame({
              league: kind === "worldCup" ? "FIFA World Cup" : "TEST",
              isNeutralSite: kind === "worldCup",
              homeTeamName: venue.slug
            });

      const inside = { latitude: venue.latitude, longitude: venue.longitude };
      const outside = offsetMeters(
        venue.latitude,
        venue.longitude,
        0,
        venue.reviewRadiusMeters + 300
      );

      const okInside = validateGameDayReviewSubmission({
        activeGame: game,
        venueLatitude: venue.latitude,
        venueLongitude: venue.longitude,
        reviewRadiusMeters: venue.reviewRadiusMeters,
        location: inside
      });
      assert.equal(okInside.ok, true, `${kind} inside should pass`);

      const badOutside = validateGameDayReviewSubmission({
        activeGame: game,
        venueLatitude: venue.latitude,
        venueLongitude: venue.longitude,
        reviewRadiusMeters: venue.reviewRadiusMeters,
        location: outside
      });
      assert.equal(badOutside.ok, false, `${kind} outside should fail`);
      if (!badOutside.ok) assert.equal(badOutside.code, "outside-radius");
    });
  }
});

describe("edge cases", () => {
  const venue = TARGET_FIELD;
  const game = mockGame();

  it("exactly at radius boundary is allowed (distance <= radius)", () => {
    // Walk outward until rounded haversine equals radius (or just under)
    let loc = offsetMeters(venue.latitude, venue.longitude, 0, venue.reviewRadiusMeters);
    let dist = distanceMetersBetween(
      loc.latitude,
      loc.longitude,
      venue.latitude,
      venue.longitude
    );
    // Nudge inward if rounding put us 1m over
    if (dist > venue.reviewRadiusMeters) {
      loc = offsetMeters(venue.latitude, venue.longitude, 0, venue.reviewRadiusMeters - 5);
      dist = distanceMetersBetween(
        loc.latitude,
        loc.longitude,
        venue.latitude,
        venue.longitude
      );
    }
    assert.ok(dist <= venue.reviewRadiusMeters);
    const result = validateGameDayReviewSubmission({
      activeGame: game,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: loc
    });
    assert.equal(result.ok, true);
  });

  it("just outside radius is blocked", () => {
    const loc = offsetMeters(venue.latitude, venue.longitude, 0, venue.reviewRadiusMeters + 25);
    const dist = distanceMetersBetween(
      loc.latitude,
      loc.longitude,
      venue.latitude,
      venue.longitude
    );
    assert.ok(dist > venue.reviewRadiusMeters);
    const result = validateGameDayReviewSubmission({
      activeGame: game,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: loc
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "outside-radius");
  });

  it("missing latitude/longitude → missing-location", () => {
    const result = validateGameDayReviewSubmission({
      activeGame: game,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: null
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "missing-location");
  });

  it("venue missing usable coordinates (0,0) treats on-site as outside unless user is at Null Island", () => {
    const atVenueListing = { latitude: 44.9817, longitude: -93.2776 };
    const result = validateGameDayReviewSubmission({
      activeGame: game,
      venueLatitude: 0,
      venueLongitude: 0,
      reviewRadiusMeters: 800,
      location: atVenueListing
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "outside-radius");
  });

  it("no active event → no-active-game", () => {
    const result = validateGameDayReviewSubmission({
      activeGame: null,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: { latitude: venue.latitude, longitude: venue.longitude }
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "no-active-game");
  });

  it("multiple events: only the active window game is accepted", () => {
    const active = mockGame({ id: "active", externalId: "active" });
    const inactive = mockGame({
      id: "inactive",
      externalId: "inactive",
      pollingOpensAt: new Date(active.pollingClosesAt.getTime() + 60_000),
      pollingClosesAt: new Date(active.pollingClosesAt.getTime() + 3 * 60 * 60_000)
    });
    assert.equal(isGameDayActive(active, active.startsAt), true);
    assert.equal(isGameDayActive(inactive, active.startsAt), false);

    const withActive = validateGameDayReviewSubmission({
      activeGame: active,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: { latitude: venue.latitude, longitude: venue.longitude }
    });
    assert.equal(withActive.ok, true);
    if (withActive.ok) assert.equal(withActive.game.id, "active");

    const withInactive = validateGameDayReviewSubmission({
      activeGame: isGameDayActive(inactive, active.startsAt) ? inactive : null,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: { latitude: venue.latitude, longitude: venue.longitude }
    });
    assert.equal(withInactive.ok, false);
  });

  it("fair continuous window uses exclusive close (Aug 17 00:00 CT closed)", () => {
    const fair = buildFairEventGameData(WISCONSIN_STATE_FAIR_2026_WINDOW);
    assert.equal(isGameDayActive(fair, new Date("2026-08-06T05:00:00.000Z")), true);
    assert.equal(isGameDayActive(fair, new Date("2026-08-17T04:59:59.999Z")), true);
    assert.equal(isGameDayActive(fair, new Date("2026-08-17T05:00:00.000Z")), false);
  });

  it("lat/lng argument order is (lat, lon) consistently in distance calc", () => {
    // Swapped Target Field coords would be near nowhere useful; distance huge
    const correct = distanceMetersBetween(44.9817, -93.2776, 44.9817, -93.2776);
    const swappedUser = distanceMetersBetween(-93.2776, 44.9817, 44.9817, -93.2776);
    assert.equal(correct, 0);
    assert.ok(swappedUser > 5_000_000);
  });
});
