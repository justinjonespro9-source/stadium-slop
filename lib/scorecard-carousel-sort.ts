/** Server-safe re-exports — implementation lives in {@link ./scorecard-sort-client}. */
export {
  compareFreshest,
  compareHighest,
  compareLowest,
  currentSeasonLabel,
  DEFAULT_SCORECARD_SORT,
  getScorecardSortOptions,
  hasNewThisSeasonReviews,
  isGameDayFreshTodayReview,
  reviewRecencyMs,
  sortScorecardReviews,
  type ScorecardSortContext,
  type ScorecardSortMode,
  type ScorecardSortOption
} from "@/lib/scorecard-sort-client";
