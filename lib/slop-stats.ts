import { PhotoType } from "@prisma/client";

import { localCalendarDateKey, utcCalendarDateKey } from "./game-day";
import { normalizePublicImageUrl } from "./image-url";
import { prisma } from "./prisma";
import { slugFilterInsensitive } from "./public-data";
import {
  foodReviews,
  type FoodReview,
  type PriceCheckLabel,
  type ReplayValueLabel,
  type ReviewConsensusLabel
} from "./sample-data";

export type SlopStatsMode = "allTime" | "season" | "gameDayFresh";

export type ConsensusStat = {
  label: ReviewConsensusLabel | ReplayValueLabel | PriceCheckLabel;
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
  replayValue: ConsensusStat[];
  priceCheck: ConsensusStat[];
  topConsensus?: ConsensusStat;
  topReplayValue?: ConsensusStat;
  topPriceCheck?: ConsensusStat;
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

const replayValueLabels: ReplayValueLabel[] = [
  "Game Day Starter",
  "Solid Rotation Pick",
  "Bench Option",
  "Cut From the Roster"
];

const priceCheckLabels: PriceCheckLabel[] = [
  "Worth the Price of Admission",
  "Fair Deal",
  "Stadium Tax"
];

export function getSlopScoreTier(score: number) {
  if (score >= 9.5) return "Legend of the Game";
  if (score >= 9) return "Hall of Fame";
  if (score >= 8) return "All-Star";
  if (score >= 7) return "Starter Quality";
  if (score >= 5.5) return "Bench Depth";
  if (score >= 4.5) return "Needs a Rebuild";
  if (score >= 3.5) return "On the Trading Block";
  if (score >= 2.5) return "Sent to the Minors";
  return "First-Round Bust";
}

function fallbackReplayValue(review: FoodReview): ReplayValueLabel {
  if (review.slopScore >= 8) return "Game Day Starter";
  if (review.slopScore >= 7) return "Solid Rotation Pick";
  if (review.slopScore >= 5.5) return "Bench Option";
  return "Cut From the Roster";
}

function fallbackPriceCheck(review: FoodReview): PriceCheckLabel {
  if (review.labels.includes("Stadium Tax")) return "Stadium Tax";
  if (review.labels.includes("Steal")) return "Worth the Price of Admission";
  return "Fair Deal";
}

function calculateDistribution<TLabel extends string>(
  labels: TLabel[],
  reviews: FoodReview[],
  getLabel: (review: FoodReview) => TLabel | undefined
) {
  const labelCounts = new Map<TLabel, number>();

  labels.forEach((label) => {
    labelCounts.set(label, 0);
  });

  reviews.forEach((review) => {
    const label = getLabel(review);

    if (label && labels.includes(label)) {
      labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
    }
  });

  const labeledReviewCount = Array.from(labelCounts.values()).reduce(
    (total, count) => total + count,
    0
  );

  if (labeledReviewCount === 0) {
    return labels.map((label) => ({
      label,
      count: 0,
      percentage: 0
    }));
  }

  const stats = labels.map((label) => {
    const count = labelCounts.get(label) ?? 0;
    const rawPercentage = (count / labeledReviewCount) * 100;

    return {
      label,
      count,
      rawPercentage,
      percentage: Math.floor(rawPercentage)
    };
  });
  const remainder = 100 - stats.reduce((total, stat) => total + stat.percentage, 0);
  const fractionalRemainders = stats
    .map((stat, index) => ({
      index,
      remainder: stat.rawPercentage - stat.percentage
    }))
    .sort((a, b) => b.remainder - a.remainder);

  fractionalRemainders.slice(0, remainder).forEach(({ index }) => {
    stats[index].percentage += 1;
  });

  return stats
    .map((stat) => ({
      label: stat.label,
      count: stat.count,
      percentage: stat.percentage
    }))
    .sort((a, b) => b.percentage - a.percentage || b.count - a.count);
}

function getReplayValueStats(reviews: FoodReview[]) {
  return calculateDistribution(replayValueLabels, reviews, (review) =>
    review.replayValue ?? fallbackReplayValue(review)
  );
}

function getPriceCheckStats(reviews: FoodReview[]) {
  return calculateDistribution(priceCheckLabels, reviews, (review) =>
    review.priceCheck ?? fallbackPriceCheck(review)
  );
}

function dedupeReviewsByUserItemGameDay(reviews: FoodReview[]) {
  const reviewsByKey = new Map<string, FoodReview>();

  const photoTime = (review: FoodReview) => {
    if (review.reviewPhotoCreatedAt) {
      const t = Date.parse(review.reviewPhotoCreatedAt);
      return Number.isFinite(t) ? t : 0;
    }
    return 0;
  };

  reviews.forEach((review) => {
    const key = `${review.reviewerId ?? review.id}:${review.foodSlug}:${review.gameDayKey ?? review.dateLabel}`;
    const existing = reviewsByKey.get(key);
    if (!existing) {
      reviewsByKey.set(key, review);
      return;
    }
    const nextHas = Boolean(normalizePublicImageUrl(review.photoUrl));
    const prevHas = Boolean(normalizePublicImageUrl(existing.photoUrl));
    let pick = existing;
    if (nextHas && !prevHas) {
      pick = review;
    } else if (!nextHas && prevHas) {
      pick = existing;
    } else if (review.helpfulLikes !== existing.helpfulLikes) {
      pick = review.helpfulLikes > existing.helpfulLikes ? review : existing;
    } else {
      pick = photoTime(review) >= photoTime(existing) ? review : existing;
    }
    reviewsByKey.set(key, pick);
  });

  return Array.from(reviewsByKey.values());
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
  const fallbackReviews = dedupeReviewsByUserItemGameDay(
    reviews.length > 0 ? reviews : getReviewsForItem(itemSlug)
  );
  const reviewCount = fallbackReviews.length;
  const averageSlopScore = average(fallbackReviews.map((review) => review.slopScore));
  const averageNapkinRating = average(
    fallbackReviews.map((review) => review.napkinRating)
  );
  const replayValue = getReplayValueStats(fallbackReviews);
  const priceCheck = getPriceCheckStats(fallbackReviews);

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
    consensus: replayValue,
    replayValue,
    priceCheck,
    topConsensus: replayValue[0],
    topReplayValue: replayValue[0],
    topPriceCheck: priceCheck[0],
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

function replayValueFromDb(label: string | null): ReplayValueLabel | undefined {
  const labels: Record<string, ReplayValueLabel> = {
    GAME_DAY_STARTER: "Game Day Starter",
    SOLID_ROTATION_PICK: "Solid Rotation Pick",
    BENCH_OPTION: "Bench Option",
    CUT_FROM_THE_ROSTER: "Cut From the Roster"
  };

  return label ? labels[label] : undefined;
}

function priceCheckFromDb(label: string | null): PriceCheckLabel | undefined {
  const labels: Record<string, PriceCheckLabel> = {
    WORTH_THE_PRICE_OF_ADMISSION: "Worth the Price of Admission",
    FAIR_DEAL: "Fair Deal",
    STADIUM_TAX: "Stadium Tax"
  };

  return label ? labels[label] : undefined;
}

function getDbReviewsForMode(
  reviews: Array<{
    id: string;
    slopScore: unknown;
    napkinRating: number;
    labels: string[];
    replayValue: string | null;
    priceCheck: string | null;
    verifiedGameDay: boolean;
    seasonLabel: string;
    gameDayKey: string;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    photos: {
      url: string | null;
      placeholder: string | null;
      alt: string;
      caption: string | null;
      createdAt: Date;
      id: string;
    }[];
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
    const localD = localCalendarDateKey();
    const utcD = utcCalendarDateKey();
    return reviews.filter(
      (review) =>
        review.verifiedGameDay &&
        (review.gameDayKey.endsWith(`-${localD}`) ||
          review.gameDayKey.endsWith(`-${utcD}`))
    );
  }

  if (mode === "season") {
    const year = String(new Date().getFullYear());
    return reviews.filter((review) => review.seasonLabel === year);
  }

  return reviews;
}

function getStatsFromReviews(
  itemSlug: string,
  mode: SlopStatsMode,
  reviews: FoodReview[]
): ItemSlopStats {
  const dedupedReviews = dedupeReviewsByUserItemGameDay(reviews);
  const reviewCount = dedupedReviews.length;
  const averageSlopScore = average(dedupedReviews.map((review) => review.slopScore));
  const averageNapkinRating = average(
    dedupedReviews.map((review) => review.napkinRating)
  );
  const replayValue = getReplayValueStats(dedupedReviews);
  const priceCheck = getPriceCheckStats(dedupedReviews);

  return {
    itemSlug,
    mode,
    reviews: dedupedReviews,
    averageSlopScore,
    averageNapkinRating,
    roundedNapkinRating: roundNapkins(averageNapkinRating),
    reviewCount,
    helpfulLikesTotal: dedupedReviews.reduce(
      (total, review) => total + review.helpfulLikes,
      0
    ),
    consensus: replayValue,
    replayValue,
    priceCheck,
    topConsensus: replayValue[0],
    topReplayValue: replayValue[0],
    topPriceCheck: priceCheck[0],
    freshSignalScore:
      mode === "gameDayFresh"
        ? average(dedupedReviews.map((review) => review.slopScore))
        : undefined
  };
}

export async function getDbBackedItemSlopStats(
  venueSlug: string,
  itemSlug: string,
  mode: SlopStatsMode = "allTime"
): Promise<ItemSlopStats> {
  const normalizedVenue = venueSlug.trim();
  const normalizedSlug = itemSlug.trim();

  let item = null;

  try {
    item = await prisma.foodItem.findFirst({
      where: {
        slug: slugFilterInsensitive(normalizedSlug),
        status: "ACTIVE",
        venue: {
          slug: slugFilterInsensitive(normalizedVenue),
          status: "ACTIVE"
        }
      },
      include: {
        reviews: {
          where: {
            status: "ACTIVE"
          },
          orderBy: { createdAt: "desc" },
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
            },
            photos: {
              where: {
                status: "ACTIVE",
                photoType: PhotoType.FOOD
              },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                url: true,
                placeholder: true,
                alt: true,
                caption: true,
                createdAt: true
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.warn("Falling back to sample Slop stats (DB unavailable)", error);
    return getItemSlopStats(normalizedSlug, mode);
  }

  if (!item) {
    return getItemSlopStats(normalizedSlug, mode);
  }

  if (item.reviews.length === 0) {
    return getStatsFromReviews(normalizedSlug, mode, []);
  }

  try {
    const reviewsForMode = getDbReviewsForMode(item.reviews, mode);
    const fallbackReviews =
      reviewsForMode.length > 0 ? reviewsForMode : getDbReviewsForMode(item.reviews, "allTime");

    const reviews = fallbackReviews.map<FoodReview>((review) => {
      const usableFanPhotos = [...review.photos]
        .filter((p) => normalizePublicImageUrl(p.url))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      const primaryPhoto = usableFanPhotos[0];
      const photoUrl = normalizePublicImageUrl(primaryPhoto?.url);

      return {
        id: review.id,
        foodSlug: normalizedSlug,
        venueSlug: normalizedVenue,
        reviewerId: review.user.id,
        reviewerName: review.user.displayName,
        reviewerHandle: review.user.handle,
        slopScore: Number(review.slopScore),
        napkinRating: Math.min(5, Math.max(1, review.napkinRating)) as 1 | 2 | 3 | 4 | 5,
        labels: review.labels.map(consensusLabelFromDb),
        replayValue: replayValueFromDb(review.replayValue),
        priceCheck: priceCheckFromDb(review.priceCheck),
        helpfulLikes: review._count.helpfulLikes,
        verifiedGameDay: review.verifiedGameDay,
        seasonLabel: review.seasonLabel,
        gameDayKey: review.gameDayKey,
        dateLabel: review.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        hasPhoto: Boolean(photoUrl),
        photoUrl,
        photoAlt: primaryPhoto?.alt,
        photoLabel: primaryPhoto?.caption ?? undefined,
        photoPlaceholder: primaryPhoto?.placeholder ?? undefined,
        reviewPhotoCreatedAt: primaryPhoto?.createdAt?.toISOString(),
        primaryFoodPhotoId: primaryPhoto?.id,
        note: review.note ?? undefined
      };
    });

    return getStatsFromReviews(normalizedSlug, mode, reviews);
  } catch (error) {
    console.warn("Slop stats mapping failed; using empty rollups for DB item", error);
    return getStatsFromReviews(normalizedSlug, mode, []);
  }
}
