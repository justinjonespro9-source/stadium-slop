import {
  buildReviewerExternalLinks,
  type ReviewerExternalLink
} from "@/lib/profile-social-links";
import { allowsVenueContextHistory } from "@/lib/reviewer-visibility";
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

/** Resolved external links for scorecard back (empty when hidden or none saved). */
export function getReviewerExternalLinksForScorecard(
  review: FoodReview
): ReviewerExternalLink[] {
  if (review.reviewerExternalLinks?.length) {
    return review.reviewerExternalLinks;
  }
  if (!review.reviewerSocialLinks) {
    return [];
  }
  return buildReviewerExternalLinks(review.reviewerSocialLinks);
}

export function reviewerVenueHistoryPath(
  venueSlug: string,
  reviewerId: string
): string {
  const venue = venueSlug.trim();
  const reviewer = reviewerId.trim();
  return `/venues/${encodeURIComponent(venue)}/reviewers/${encodeURIComponent(reviewer)}`;
}

export function reviewerVenueHistoryHrefForReview(
  review: Pick<
    FoodReview,
    "venueSlug" | "reviewerId" | "reviewerHistoryVisibility"
  >
): string | undefined {
  const reviewerId = review.reviewerId?.trim();
  const venueSlug = review.venueSlug?.trim();
  if (!reviewerId || !venueSlug || !review.reviewerHistoryVisibility) {
    return undefined;
  }
  if (!allowsVenueContextHistory(review.reviewerHistoryVisibility)) {
    return undefined;
  }
  return reviewerVenueHistoryPath(venueSlug, reviewerId);
}
