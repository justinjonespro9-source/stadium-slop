/** Slop Scorecard score bounds and validation (client + server). */

export const SLOP_SCORE_MIN = 1;
export const SLOP_SCORE_MAX = 10;
export const SLOP_SCORE_STEP = 0.1;
export const SLOP_SCORE_DEFAULT = 7;
export const LOW_SCORE_PHOTO_THRESHOLD = 5;

export const LOW_SCORE_PHOTO_MESSAGE =
  "Scores under 5 need a photo. Show the people what went wrong.";

export function clampSlopScore(value: number): number {
  const clamped = Math.min(SLOP_SCORE_MAX, Math.max(SLOP_SCORE_MIN, value));
  return Math.round(clamped * 10) / 10;
}

export function isValidSlopScoreStep(score: number): boolean {
  if (!Number.isFinite(score)) {
    return false;
  }
  const tenths = Math.round(score * 10);
  return Math.abs(score * 10 - tenths) < 1e-6;
}

export function parseSlopScoreInput(raw: FormDataEntryValue | null): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return null;
  }
  const rounded = Math.round(n * 10) / 10;
  if (rounded < SLOP_SCORE_MIN || rounded > SLOP_SCORE_MAX) {
    return null;
  }
  if (!isValidSlopScoreStep(rounded)) {
    return null;
  }
  return rounded;
}

export function requiresLowScorePhoto(slopScore: number): boolean {
  return slopScore < LOW_SCORE_PHOTO_THRESHOLD;
}
