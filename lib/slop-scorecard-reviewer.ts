import type { FoodReview } from "@/lib/sample-data";

/** Shown when contributor aggregate stats are not loaded on the card yet. */
export const REVIEWER_PROFILE_STAT_PLACEHOLDER = "—";

export type SlopScorecardReviewerProfile = {
  displayName: string;
  handle: string | null;
  initials: string;
  venuesReviewed: string;
  itemsReviewed: string;
  helpfulEarned: string;
  datePosted: string | null;
  showFanScout: boolean;
  verifiedGameDay: boolean;
};

/** Public-safe reviewer surface for scorecard back (no profile page). */
function formatCareerStat(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return REVIEWER_PROFILE_STAT_PLACEHOLDER;
  }
  return String(value);
}

export function getSlopScorecardReviewerProfile(
  review: FoodReview
): SlopScorecardReviewerProfile {
  return {
    displayName: getReviewerDisplayName(review),
    handle: getReviewerHandleLabel(review),
    initials: getReviewerInitials(review),
    venuesReviewed: formatCareerStat(review.reviewerVenuesReviewed),
    itemsReviewed: formatCareerStat(review.reviewerItemsReviewed),
    helpfulEarned: formatCareerStat(review.reviewerHelpfulEarned),
    datePosted: review.dateLabel?.trim() || null,
    showFanScout: showFanScoutBadge(review),
    verifiedGameDay: review.verifiedGameDay
  };
}

export function getReviewerDisplayName(review: FoodReview): string {
  return review.reviewerName?.trim() || "Stadium fan";
}

export function getReviewerHandleLabel(review: FoodReview): string | null {
  const raw = review.reviewerHandle?.trim();
  if (!raw) {
    return null;
  }
  return `@${raw.replace(/^@/, "")}`;
}

export function getReviewerInitials(review: FoodReview): string {
  const source = (review.reviewerName ?? review.reviewerHandle ?? "?").trim();
  if (!source) {
    return "?";
  }
  return source
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function showFanScoutBadge(review: FoodReview): boolean {
  return review.verifiedGameDay || review.helpfulLikes >= 2;
}
