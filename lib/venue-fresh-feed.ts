import "server-only";

import { PhotoType, type ReviewHistoryVisibility } from "@prisma/client";

import { isGameDayKeyTodayForVenue } from "./game-day";
import { normalizePublicImageUrl } from "./image-url";
import { prisma } from "./prisma";
import { slugFilterInsensitive } from "./public-data";
import { reviewerCareerStatsByUserId } from "./scorecard-reviewer-stats";
import {
  reviewerSocialForScorecard,
  buildReviewerExternalLinks
} from "./profile-social-links";
import { reviewerVenueHistoryHrefForReview } from "./slop-scorecard-reviewer";
import type {
  FoodReview,
  PriceCheckLabel,
  ReplayValueLabel,
  ReviewConsensusLabel
} from "./sample-data";

const MAX_VENUE_FRESH_CARDS = 12;

function consensusLabelFromDb(raw: string): ReviewConsensusLabel {
  return raw as ReviewConsensusLabel;
}

function replayValueFromDb(raw: string | null): ReplayValueLabel | undefined {
  return (raw as ReplayValueLabel) ?? undefined;
}

function priceCheckFromDb(raw: string | null): PriceCheckLabel | undefined {
  return (raw as PriceCheckLabel) ?? undefined;
}

export type VenueFreshReview = FoodReview & {
  foodItemName: string;
  foodItemSlug: string;
};

/**
 * Fetch the freshest photo-backed reviews across all items at a venue.
 * Game-day fresh today → then newest reviewPhotoCreatedAt.
 * Limited to MAX_VENUE_FRESH_CARDS. Returns [] if venue not found or no reviews.
 */
export async function getVenueFreshFeedReviews(
  venueSlug: string
): Promise<VenueFreshReview[]> {
  const normalized = venueSlug.trim();

  let dbReviews;
  try {
    dbReviews = await prisma.review.findMany({
      where: {
        status: "ACTIVE",
        isTestReview: false,
        photos: { some: { status: "ACTIVE", photoType: PhotoType.FOOD } },
        foodItem: {
          status: "ACTIVE",
          venue: { slug: slugFilterInsensitive(normalized), status: "ACTIVE" }
        }
      },
      orderBy: { createdAt: "desc" },
      take: MAX_VENUE_FRESH_CARDS * 3,
      include: {
        foodItem: { select: { name: true, slug: true } },
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
  } catch {
    return [];
  }

  if (!dbReviews.length) return [];

  const userIds = [...new Set(dbReviews.map((r) => r.user.id))];
  const careerStats = await reviewerCareerStatsByUserId(userIds);

  const mapped: VenueFreshReview[] = [];

  for (const review of dbReviews) {
    const usablePhotos = review.photos
      .filter((p) => normalizePublicImageUrl(p.url) || Boolean(p.placeholder?.trim()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const primaryPhoto = usablePhotos[0];
    if (!primaryPhoto) continue;

    const photoUrl = normalizePublicImageUrl(primaryPhoto.url);
    const photoPlaceholder = primaryPhoto.placeholder?.trim() || undefined;
    if (!photoUrl && !photoPlaceholder) continue;

    const stats = careerStats.get(review.user.id);
    const reviewerSocialLinks = reviewerSocialForScorecard(review.user);
    const reviewerExternalLinks = reviewerSocialLinks
      ? buildReviewerExternalLinks(reviewerSocialLinks)
      : undefined;
    const reviewerHistoryVisibility: ReviewHistoryVisibility =
      review.user.reviewHistoryVisibility;
    const reviewerVenueHistoryHref = reviewerVenueHistoryHrefForReview({
      venueSlug: normalized,
      reviewerId: review.user.id,
      reviewerHistoryVisibility
    });

    mapped.push({
      id: review.id,
      foodSlug: review.foodItem.slug,
      foodItemSlug: review.foodItem.slug,
      foodItemName: review.foodItem.name,
      venueSlug: normalized,
      reviewerId: review.user.id,
      reviewerName: review.user.displayName,
      reviewerHandle: review.user.handle,
      reviewerAvatarUrl: normalizePublicImageUrl(review.user.avatarUrl) ?? undefined,
      reviewerVenuesReviewed: stats?.venuesReviewed,
      reviewerItemsReviewed: stats?.itemsReviewed,
      reviewerHelpfulEarned: stats?.helpfulEarned,
      slopScore: Number(review.slopScore),
      napkinRating: Math.min(5, Math.max(1, review.napkinRating)) as 1 | 2 | 3 | 4 | 5,
      labels: review.labels.map(consensusLabelFromDb),
      replayValue: replayValueFromDb(review.replayValue),
      priceCheck: priceCheckFromDb(review.priceCheck),
      helpfulLikes: review._count.helpfulLikes,
      verifiedGameDay: review.verifiedGameDay,
      isTestReview: false,
      seasonLabel: review.seasonLabel,
      gameDayKey: review.gameDayKey,
      dateLabel: review.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      hasPhoto: true,
      photoUrl,
      photoAlt: primaryPhoto.alt,
      photoPlaceholder,
      reviewPhotoCreatedAt: primaryPhoto.createdAt?.toISOString(),
      primaryFoodPhotoId: primaryPhoto.id,
      note: review.note ?? undefined,
      reviewerSocialLinks,
      reviewerExternalLinks:
        reviewerExternalLinks && reviewerExternalLinks.length > 0
          ? reviewerExternalLinks
          : undefined,
      reviewerHistoryVisibility,
      reviewerVenueHistoryHref
    });
  }

  mapped.sort((a, b) => {
    const aFresh = isGameDayKeyTodayForVenue(a.gameDayKey ?? "", normalized) ? 1 : 0;
    const bFresh = isGameDayKeyTodayForVenue(b.gameDayKey ?? "", normalized) ? 1 : 0;
    if (bFresh !== aFresh) return bFresh - aFresh;
    const aMs = a.reviewPhotoCreatedAt ? Date.parse(a.reviewPhotoCreatedAt) : 0;
    const bMs = b.reviewPhotoCreatedAt ? Date.parse(b.reviewPhotoCreatedAt) : 0;
    return bMs - aMs;
  });

  return mapped.slice(0, MAX_VENUE_FRESH_CARDS);
}
