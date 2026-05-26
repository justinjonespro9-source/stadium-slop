import { isGameDayKeyTodayForVenue } from "@/lib/game-day-client";
import type { FoodReview } from "@/lib/sample-data";

export type ScorecardSortMode =
  | "freshest"
  | "highest"
  | "lowest"
  | "new-this-season";

export const DEFAULT_SCORECARD_SORT: ScorecardSortMode = "freshest";

export type ScorecardSortOption = {
  value: ScorecardSortMode;
  label: string;
};

export type ScorecardSortContext = {
  venueSlug: string;
};

export function currentSeasonLabel(): string {
  return String(new Date().getFullYear());
}

export function reviewRecencyMs(review: FoodReview): number {
  if (review.reviewPhotoCreatedAt) {
    const parsed = Date.parse(review.reviewPhotoCreatedAt);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

export function isGameDayFreshTodayReview(
  review: FoodReview,
  venueSlug: string
): boolean {
  return Boolean(
    review.verifiedGameDay &&
      review.gameDayKey &&
      isGameDayKeyTodayForVenue(review.gameDayKey, venueSlug)
  );
}

/** Game-day fresh today first, then newest fan photo / review time. */
export function compareFreshest(
  a: FoodReview,
  b: FoodReview,
  venueSlug: string
): number {
  const aFresh = isGameDayFreshTodayReview(a, venueSlug) ? 1 : 0;
  const bFresh = isGameDayFreshTodayReview(b, venueSlug) ? 1 : 0;
  if (bFresh !== aFresh) {
    return bFresh - aFresh;
  }
  return reviewRecencyMs(b) - reviewRecencyMs(a);
}

export function compareHighest(a: FoodReview, b: FoodReview): number {
  if (b.slopScore !== a.slopScore) {
    return b.slopScore - a.slopScore;
  }
  return compareFreshest(a, b, a.venueSlug);
}

export function compareLowest(a: FoodReview, b: FoodReview): number {
  if (a.slopScore !== b.slopScore) {
    return a.slopScore - b.slopScore;
  }
  return compareFreshest(a, b, a.venueSlug);
}

export function hasNewThisSeasonReviews(reviews: FoodReview[]): boolean {
  const season = currentSeasonLabel();
  return reviews.some((review) => review.seasonLabel === season);
}

export function getScorecardSortOptions(
  reviews: FoodReview[]
): ScorecardSortOption[] {
  const options: ScorecardSortOption[] = [
    { value: "freshest", label: "Freshest" },
    { value: "highest", label: "Highest" },
    { value: "lowest", label: "Lowest" }
  ];

  if (hasNewThisSeasonReviews(reviews)) {
    options.push({ value: "new-this-season", label: "New this season" });
  }

  return options;
}

export function sortScorecardReviews(
  reviews: FoodReview[],
  mode: ScorecardSortMode,
  context: ScorecardSortContext
): FoodReview[] {
  const venueSlug = context.venueSlug.trim();
  const list = [...reviews];

  if (mode === "new-this-season") {
    const season = currentSeasonLabel();
    const filtered = list.filter((review) => review.seasonLabel === season);
    return filtered.sort((a, b) => compareFreshest(a, b, venueSlug));
  }

  if (mode === "highest") {
    return list.sort((a, b) => compareHighest(a, b));
  }

  if (mode === "lowest") {
    return list.sort((a, b) => compareLowest(a, b));
  }

  return list.sort((a, b) => compareFreshest(a, b, venueSlug));
}
