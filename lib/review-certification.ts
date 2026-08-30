import type { Game } from "@prisma/client";

import {
  validateGameDayReviewSubmission,
  type GameDayReviewLocation
} from "@/lib/game-day";
import type { GameDayReviewErrorCode } from "@/lib/game-day-review-errors";

export function isAdminLocationOverrideRequested(formData: FormData): boolean {
  const raw = formData.get("adminLocationOverride");
  return raw === "1" || raw === "on" || raw === "true";
}

export type ReviewCertificationSuccess = {
  ok: true;
  mode: "override" | "test" | "certified";
  gameId: string | null;
  verifiedGameDay: boolean;
  locationVerifiedAt: Date | null;
  distanceFromVenueMeters: number | null;
  isTestReview: boolean;
  adminLocationOverride: boolean;
  gameDayKeyKind: "normal" | "test";
};

export type ReviewCertificationResult =
  | ReviewCertificationSuccess
  | { ok: false; code: GameDayReviewErrorCode };

/**
 * Server-authoritative review certification.
 * Admin location override is trusted only when `isAdmin` was confirmed from the DB.
 * A forged override flag from a non-admin is ignored and GPS rules apply.
 */
export function resolveReviewSubmissionCertification(options: {
  isAdmin: boolean;
  adminLocationOverrideRequested: boolean;
  testReviewMode: boolean;
  activeGame: Game | null;
  venueLatitude: number;
  venueLongitude: number;
  reviewRadiusMeters: number;
  location: GameDayReviewLocation | null;
}): ReviewCertificationResult {
  const useAdminLocationOverride =
    options.adminLocationOverrideRequested && options.isAdmin;

  if (useAdminLocationOverride) {
    if (!options.activeGame) {
      return { ok: false, code: "no-active-game" };
    }

    return {
      ok: true,
      mode: "override",
      gameId: options.activeGame.id,
      verifiedGameDay: true,
      locationVerifiedAt: null,
      distanceFromVenueMeters: null,
      isTestReview: false,
      adminLocationOverride: true,
      gameDayKeyKind: "normal"
    };
  }

  if (options.testReviewMode) {
    return {
      ok: true,
      mode: "test",
      gameId: null,
      verifiedGameDay: false,
      locationVerifiedAt: null,
      distanceFromVenueMeters: null,
      isTestReview: true,
      adminLocationOverride: false,
      gameDayKeyKind: "test"
    };
  }

  const check = validateGameDayReviewSubmission({
    activeGame: options.activeGame,
    venueLatitude: options.venueLatitude,
    venueLongitude: options.venueLongitude,
    reviewRadiusMeters: options.reviewRadiusMeters,
    location: options.location
  });

  if (!check.ok) {
    return check;
  }

  return {
    ok: true,
    mode: "certified",
    gameId: check.game.id,
    verifiedGameDay: true,
    locationVerifiedAt: new Date(),
    distanceFromVenueMeters: check.distanceFromVenueMeters,
    isTestReview: false,
    adminLocationOverride: false,
    gameDayKeyKind: "normal"
  };
}
