import { foodReviews, type FoodReview, type ReviewConsensusLabel } from "./sample-data";

export type SlopStatsMode = "allTime" | "season" | "gameDayFresh";

export type ConsensusStat = {
  label: ReviewConsensusLabel;
  count: number;
  percentage: number;
};

export type ItemSlopStats = {
  itemSlug: string;
  mode: SlopStatsMode;
  reviews: FoodReview[];
  averageSlopScore: number;
  averageNapkinRating: number;
  roundedNapkinRating: 1 | 2 | 3 | 4 | 5;
  reviewCount: number;
  helpfulLikesTotal: number;
  consensus: ConsensusStat[];
  topConsensus?: ConsensusStat;
  freshSignalScore?: number;
};

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundNapkins(value: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(value || 1))) as 1 | 2 | 3 | 4 | 5;
}

export function getReviewsForItem(itemSlug: string, mode: SlopStatsMode = "allTime") {
  const itemReviews = foodReviews.filter((review) => review.foodSlug === itemSlug);

  if (mode === "gameDayFresh") {
    return itemReviews.filter((review) => review.verifiedGameDay);
  }

  if (mode === "season") {
    return itemReviews.filter((review) => review.seasonLabel === "2026");
  }

  return itemReviews;
}

export function getItemSlopStats(
  itemSlug: string,
  mode: SlopStatsMode = "allTime"
): ItemSlopStats {
  const reviews = getReviewsForItem(itemSlug, mode);
  const fallbackReviews = reviews.length > 0 ? reviews : getReviewsForItem(itemSlug);
  const reviewCount = fallbackReviews.length;
  const averageSlopScore = average(fallbackReviews.map((review) => review.slopScore));
  const averageNapkinRating = average(
    fallbackReviews.map((review) => review.napkinRating)
  );
  const labelCounts = new Map<ReviewConsensusLabel, number>();

  fallbackReviews.forEach((review) => {
    review.labels.forEach((label) => {
      labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
    });
  });

  const consensus = Array.from(labelCounts.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage || b.count - a.count);

  return {
    itemSlug,
    mode,
    reviews: fallbackReviews,
    averageSlopScore,
    averageNapkinRating,
    roundedNapkinRating: roundNapkins(averageNapkinRating),
    reviewCount,
    helpfulLikesTotal: fallbackReviews.reduce(
      (total, review) => total + review.helpfulLikes,
      0
    ),
    consensus,
    topConsensus: consensus[0],
    freshSignalScore:
      mode === "gameDayFresh"
        ? average(fallbackReviews.map((review) => review.slopScore))
        : undefined
  };
}
