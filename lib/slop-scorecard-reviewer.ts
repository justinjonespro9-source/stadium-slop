import type { FoodReview } from "@/lib/sample-data";

export type SlopScorecardReviewerStatLine = {
  label: string;
  value: string;
};

/** Public-safe reviewer lines for scorecard back (no profile page). */
export function getSlopScorecardReviewerStatLines(
  review: FoodReview
): SlopScorecardReviewerStatLine[] {
  const lines: SlopScorecardReviewerStatLine[] = [];

  if (review.verifiedGameDay) {
    lines.push({ label: "Certified", value: "Game day at venue" });
  }

  if (review.dateLabel?.trim()) {
    lines.push({ label: "Posted", value: review.dateLabel.trim() });
  }

  if (review.seasonLabel?.trim()) {
    lines.push({ label: "Season", value: review.seasonLabel.trim() });
  }

  if (review.helpfulLikes > 0) {
    lines.push({
      label: "This card",
      value: `${review.helpfulLikes} helpful ${review.helpfulLikes === 1 ? "vote" : "votes"}`
    });
  }

  return lines;
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
