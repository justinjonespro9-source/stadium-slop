import "server-only";

import { PhotoType } from "@prisma/client";
import { notFound } from "next/navigation";

import { isNapkinEligibleFromPrisma } from "@/lib/item-eligibility";
import { normalizePublicImageUrl } from "@/lib/image-url";
import { prisma } from "@/lib/prisma";
import { reviewerSocialForScorecard } from "@/lib/profile-social-links";
import { reviewerCareerStatsByUserId } from "@/lib/scorecard-reviewer-stats";
import {
  formatSlopCardMetaRow,
  slopCardLocationLine
} from "@/lib/slop-card-display";
import type {
  FoodReview,
  PriceCheckLabel,
  ReplayValueLabel,
  ReviewConsensusLabel
} from "@/lib/sample-data";
import { getScorecardShareDescription, getScorecardShareTitle } from "@/lib/scorecard-share";
import type { ReviewHistoryVisibility } from "@/lib/reviewer-visibility";

export type PublicScorecardView = {
  review: FoodReview;
  itemName: string;
  venueName: string;
  venueSlug: string;
  foodSlug: string;
  itemPath: string;
  photoUrl: string | undefined;
  photoAlt: string;
  photoPlaceholderEmoji?: string;
  napkinEligible: boolean;
  metaLine: string;
  shareTitle: string;
  shareDescription: string;
  reviewerHistoryVisibility: ReviewHistoryVisibility;
};

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

export async function getPublicScorecardByReviewId(
  reviewId: string
): Promise<PublicScorecardView | null> {
  const id = reviewId.trim();
  if (!id) {
    return null;
  }

  let row;
  try {
    row = await prisma.review.findFirst({
      where: { id, status: "ACTIVE" },
      include: {
        foodItem: {
          include: {
            venue: { select: { slug: true, name: true, status: true } },
            vendor: { select: { name: true, section: true, location: true } }
          }
        },
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatarUrl: true,
            instagramUrl: true,
            tiktokUrl: true,
            youtubeUrl: true,
            xUrl: true,
            websiteUrl: true,
            socialLinksPublic: true,
            reviewHistoryVisibility: true
          }
        },
        _count: { select: { helpfulLikes: true } },
        photos: {
          where: { status: "ACTIVE", photoType: PhotoType.FOOD },
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
    });
  } catch (error) {
    console.warn("Public scorecard lookup failed", error);
    return null;
  }

  if (
    !row ||
    row.foodItem.status !== "ACTIVE" ||
    row.foodItem.venue.status !== "ACTIVE"
  ) {
    return null;
  }

  const careerStats = await reviewerCareerStatsByUserId([row.user.id]);
  const stats = careerStats.get(row.user.id);

  const usableFanPhotos = [...row.photos]
    .filter((p) => normalizePublicImageUrl(p.url) || Boolean(p.placeholder?.trim()))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const primaryPhoto = usableFanPhotos[0];
  const photoUrl = normalizePublicImageUrl(primaryPhoto?.url);
  const photoPlaceholder = primaryPhoto?.placeholder?.trim() || undefined;

  const foodItem = row.foodItem;
  const venue = foodItem.venue;
  const vendor = foodItem.vendor;
  const napkinEligible = isNapkinEligibleFromPrisma(foodItem);

  const foodSlug = foodItem.slug;
  const venueSlug = venue.slug;
  const itemPath = `/venues/${venueSlug}/${foodSlug}`;

  const locationLine = slopCardLocationLine(
    { location: foodItem.location, sections: foodItem.sections },
    vendor ? { section: vendor.section } : null
  );

  const dateLabel = row.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const review: FoodReview = {
    id: row.id,
    foodSlug,
    venueSlug,
    reviewerId: row.user.id,
    reviewerName: row.user.displayName,
    reviewerHandle: row.user.handle,
    reviewerAvatarUrl: normalizePublicImageUrl(row.user.avatarUrl) ?? undefined,
    reviewerVenuesReviewed: stats?.venuesReviewed,
    reviewerItemsReviewed: stats?.itemsReviewed,
    reviewerHelpfulEarned: stats?.helpfulEarned,
    slopScore: Number(row.slopScore),
    napkinRating: Math.min(5, Math.max(1, row.napkinRating)) as 1 | 2 | 3 | 4 | 5,
    labels: row.labels.map(consensusLabelFromDb),
    replayValue: replayValueFromDb(row.replayValue),
    priceCheck: priceCheckFromDb(row.priceCheck),
    helpfulLikes: row._count.helpfulLikes,
    verifiedGameDay: row.verifiedGameDay,
    isTestReview: row.isTestReview,
    seasonLabel: row.seasonLabel,
    gameDayKey: row.gameDayKey,
    dateLabel,
    hasPhoto: Boolean(photoUrl || photoPlaceholder),
    photoUrl,
    photoAlt: primaryPhoto?.alt,
    photoPlaceholder,
    reviewPhotoCreatedAt: primaryPhoto?.createdAt?.toISOString(),
    primaryFoodPhotoId: primaryPhoto?.id,
    note: row.note ?? undefined,
    reviewerSocialLinks: reviewerSocialForScorecard(row.user)
  };

  const metaLine = formatSlopCardMetaRow({
    locationLine,
    verifiedGameDay: review.verifiedGameDay,
    dateLabel: review.dateLabel
  });

  return {
    review,
    itemName: foodItem.name,
    venueName: venue.name,
    venueSlug,
    foodSlug,
    itemPath,
    photoUrl,
    photoAlt: primaryPhoto?.alt ?? `Fan photo for ${foodItem.name}`,
    photoPlaceholderEmoji: photoPlaceholder,
    napkinEligible,
    metaLine,
    shareTitle: getScorecardShareTitle(foodItem.name, venue.name),
    shareDescription: getScorecardShareDescription(
      foodItem.name,
      venue.name,
      review.slopScore
    ),
    reviewerHistoryVisibility: row.user.reviewHistoryVisibility
  };
}

export async function requirePublicScorecard(reviewId: string): Promise<PublicScorecardView> {
  const view = await getPublicScorecardByReviewId(reviewId);
  if (!view) {
    notFound();
  }
  return view;
}
