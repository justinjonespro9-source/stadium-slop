/** Client-safe game-day review error copy (no Prisma / server imports). */

export const GAME_DAY_REVIEW_ERROR_MESSAGES = {
  "no-active-game": "Reviews open during active home-game windows only.",
  "missing-location":
    "Location certification is required to submit a game-day review.",
  "outside-radius": "You must be at the stadium to submit a certified review."
} as const;

export type GameDayReviewErrorCode = keyof typeof GAME_DAY_REVIEW_ERROR_MESSAGES;
