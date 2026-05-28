/**
 * Dev-only Slop Scorecard fixtures — never weaken production review guardrails.
 */

export const DEMO_SCORECARD_DEFAULT_VENUE_SLUG = "target-field";
export const DEMO_SCORECARD_DEFAULT_FOOD_SLUG = "la-madre-street-elote";

/** Stable id prefix for dev scorecard seed rows (`dev-scorecard-review-…`). */
export const DEV_SCORECARD_PREFIX = "dev-scorecard";

/** Run seed script / open dev tools when not production, or when explicitly opted in. */
export function isDevDemoScorecardsEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return process.env.ENABLE_DEMO_SCORECARDS === "true";
}

/** Scripts must not run in production unless ENABLE_DEMO_SCORECARDS=true. */
export function assertDevDemoScorecardsAllowed(context: string): void {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_SCORECARDS !== "true") {
    throw new Error(
      `${context} blocked in production. Set ENABLE_DEMO_SCORECARDS=true only on intentional staging.`
    );
  }
}

export function resolveDemoScorecardTargetFromEnv(): {
  venueSlug: string;
  foodSlug: string;
} {
  return {
    venueSlug:
      process.env.DEMO_SCORECARD_VENUE_SLUG?.trim() || DEMO_SCORECARD_DEFAULT_VENUE_SLUG,
    foodSlug:
      process.env.DEMO_SCORECARD_FOOD_SLUG?.trim() || DEMO_SCORECARD_DEFAULT_FOOD_SLUG
  };
}

export function demoScorecardItemPath(venueSlug: string, foodSlug: string): string {
  return `/venues/${venueSlug}/${foodSlug}#fan-photo-reviews`;
}
