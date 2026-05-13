import { prisma } from "./prisma";
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

function consensusLabelFromDb(label: string): ReviewConsensusLabel {
  const labels: Record<string, ReviewConsensusLabel> = {
    RUN_IT_BACK: "Run It Back",
    WORTH_THE_WALK: "Worth the Walk",
    STADIUM_TAX: "Stadium Tax",
    STEAL: "Steal",
    BENCH_IT: "Bench It"
  };

  return labels[label] ?? "Run It Back";
}

function getDbReviewsForMode(
  reviews: Array<{
    id: string;
    slopScore: unknown;
    napkinRating: number;
    labels: string[];
    verifiedGameDay: boolean;
    seasonLabel: string;
    note: string | null;
    createdAt: Date;
    user: {
      id: string;
      displayName: string;
      handle: string;
    };
    _count: {
      helpfulLikes: number;
    };
  }>,
  mode: SlopStatsMode
) {
  if (mode === "gameDayFresh") {
    return reviews.filter((review) => review.verifiedGameDay);
  }

  if (mode === "season") {
    return reviews.filter((review) => review.seasonLabel === "2026");
  }

  return reviews;
}

function getStatsFromReviews(
  itemSlug: string,
  mode: SlopStatsMode,
  reviews: FoodReview[]
): ItemSlopStats {
  const reviewCount = reviews.length;
  const averageSlopScore = average(reviews.map((review) => review.slopScore));
  const averageNapkinRating = average(reviews.map((review) => review.napkinRating));
  const labelCounts = new Map<ReviewConsensusLabel, number>();

  reviews.forEach((review) => {
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
    reviews,
    averageSlopScore,
    averageNapkinRating,
    roundedNapkinRating: roundNapkins(averageNapkinRating),
    reviewCount,
    helpfulLikesTotal: reviews.reduce(
      (total, review) => total + review.helpfulLikes,
      0
    ),
    consensus,
    topConsensus: consensus[0],
    freshSignalScore:
      mode === "gameDayFresh"
        ? average(reviews.map((review) => review.slopScore))
        : undefined
  };
}

export async function getDbBackedItemSlopStats(
  venueSlug: string,
  itemSlug: string,
  mode: SlopStatsMode = "allTime"
): Promise<ItemSlopStats> {
  try {
    const item = await prisma.foodItem.findFirst({
      where: {
        slug: itemSlug,
        venue: {
          slug: venueSlug
        }
      },
      include: {
        reviews: {
          where: {
            status: "ACTIVE"
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                handle: true
              }
            },
            _count: {
              select: {
                helpfulLikes: true
              }
            }
          }
        }
      }
    });

    if (!item || item.reviews.length === 0) {
      return getItemSlopStats(itemSlug, mode);
    }

    const reviewsForMode = getDbReviewsForMode(item.reviews, mode);
    const fallbackReviews =
      reviewsForMode.length > 0 ? reviewsForMode : getDbReviewsForMode(item.reviews, "allTime");

    const reviews = fallbackReviews.map<FoodReview>((review) => ({
      id: review.id,
      foodSlug: itemSlug,
      venueSlug,
      reviewerId: review.user.id,
      reviewerName: review.user.displayName,
      reviewerHandle: review.user.handle,
      slopScore: Number(review.slopScore),
      napkinRating: Math.min(5, Math.max(1, review.napkinRating)) as 1 | 2 | 3 | 4 | 5,
      labels: review.labels.map(consensusLabelFromDb),
      helpfulLikes: review._count.helpfulLikes,
      verifiedGameDay: review.verifiedGameDay,
      seasonLabel: review.seasonLabel,
      dateLabel: review.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      note: review.note ?? undefined
    }));

    return getStatsFromReviews(itemSlug, mode, reviews);
  } catch (error) {
    console.warn("Falling back to sample Slop stats", error);
    return getItemSlopStats(itemSlug, mode);
  }
}
