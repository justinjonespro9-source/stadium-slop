import "server-only";

import { PhotoType } from "@prisma/client";

import { normalizePublicImageUrl } from "@/lib/image-url";
import { handleDisplayFromStored } from "@/lib/profile-identity-display";
import {
  buildReviewerExternalLinks,
  reviewerSocialForScorecard,
  type ReviewerExternalLink
} from "@/lib/profile-social-links";
import { prisma } from "@/lib/prisma";
import { slugFilterInsensitive } from "@/lib/public-data";
import { allowsVenueContextHistory } from "@/lib/reviewer-visibility";

export type VenueReviewerHistoryReview = {
  id: string;
  foodSlug: string;
  foodName: string;
  slopScore: number;
  dateLabel: string;
  photoUrl: string | undefined;
  photoPlaceholder: string | undefined;
  photoAlt: string;
  itemPath: string;
  verifiedGameDay: boolean;
};

export type VenueReviewerHistoryView = {
  venueName: string;
  venueSlug: string;
  displayName: string;
  handleDisplay: string | null;
  avatarUrl: string | undefined;
  initials: string;
  reviews: VenueReviewerHistoryReview[];
  externalLinks: ReviewerExternalLink[];
};

function reviewerInitials(displayName: string, handle: string): string {
  const source = displayName.trim() || handle.replace(/^@+/, "") || "?";
  return (
    source
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export async function getVenueReviewerHistory(
  venueSlug: string,
  reviewerId: string
): Promise<VenueReviewerHistoryView | null> {
  const normalizedVenue = venueSlug.trim();
  const normalizedReviewer = reviewerId.trim();
  if (!normalizedVenue || !normalizedReviewer) {
    return null;
  }

  try {
    const venue = await prisma.venue.findFirst({
      where: {
        slug: slugFilterInsensitive(normalizedVenue),
        status: "ACTIVE"
      },
      select: { id: true, slug: true, name: true }
    });

    if (!venue) {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: normalizedReviewer,
        status: "ACTIVE"
      },
      select: {
        id: true,
        displayName: true,
        handle: true,
        avatarUrl: true,
        reviewHistoryVisibility: true,
        instagramUrl: true,
        tiktokUrl: true,
        youtubeUrl: true,
        xUrl: true,
        websiteUrl: true,
        socialLinksPublic: true
      }
    });

    if (!user || !allowsVenueContextHistory(user.reviewHistoryVisibility)) {
      return null;
    }

    const rows = await prisma.review.findMany({
      where: {
        userId: user.id,
        venueId: venue.id,
        status: "ACTIVE",
        isTestReview: false
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slopScore: true,
        verifiedGameDay: true,
        updatedAt: true,
        foodItem: {
          select: {
            slug: true,
            name: true,
            status: true
          }
        },
        photos: {
          where: {
            status: "ACTIVE",
            photoType: PhotoType.FOOD
          },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            url: true,
            placeholder: true,
            alt: true
          }
        }
      }
    });

    const reviews: VenueReviewerHistoryReview[] = rows
      .filter((row) => row.foodItem.status === "ACTIVE")
      .map((row) => {
        const photo = row.photos[0];
        const photoUrl = normalizePublicImageUrl(photo?.url);
        const photoPlaceholder = photo?.placeholder?.trim() || undefined;

        return {
          id: row.id,
          foodSlug: row.foodItem.slug,
          foodName: row.foodItem.name,
          slopScore: Number(row.slopScore),
          dateLabel: row.updatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
          photoUrl,
          photoPlaceholder,
          photoAlt: photo?.alt ?? `Fan photo for ${row.foodItem.name}`,
          itemPath: `/venues/${venue.slug}/${row.foodItem.slug}`,
          verifiedGameDay: row.verifiedGameDay
        };
      });

    const social = reviewerSocialForScorecard(user);
    const externalLinks = social ? buildReviewerExternalLinks(social) : [];

    return {
      venueName: venue.name,
      venueSlug: venue.slug,
      displayName: user.displayName.trim() || "Stadium fan",
      handleDisplay: user.handle
        ? handleDisplayFromStored(user.handle)
        : null,
      avatarUrl: normalizePublicImageUrl(user.avatarUrl) ?? undefined,
      initials: reviewerInitials(user.displayName, user.handle),
      reviews,
      externalLinks
    };
  } catch (error) {
    console.warn("Venue reviewer history lookup failed", error);
    return null;
  }
}
