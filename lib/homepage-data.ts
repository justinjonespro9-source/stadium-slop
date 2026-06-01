import "server-only";

import { EntityStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { cachePublicRead } from "@/lib/public-read-cache";

export type HomepageStats = {
  venueCount: number;
  menuItemCount: number;
};

export type HomepageFeaturedItem = {
  name: string;
  venueSlug: string;
  venueName: string;
  foodSlug: string;
  slopScore?: number;
  reviewCount: number;
  badge?: string;
  imageUrl?: string;
};

const EMPTY_STATS: HomepageStats = {
  venueCount: 0,
  menuItemCount: 0
};

export async function getHomepageStats(): Promise<HomepageStats> {
  return cachePublicRead(["homepage-stats"], loadHomepageStats)();
}

async function loadHomepageStats(): Promise<HomepageStats> {
  try {
    const [venueCount, menuItemCount] = await Promise.all([
      prisma.venue.count({ where: { status: EntityStatus.ACTIVE } }),
      prisma.foodItem.count({ where: { status: EntityStatus.ACTIVE } })
    ]);

    return {
      venueCount,
      menuItemCount
    };
  } catch (error) {
    console.warn("[homepage] Failed to load stats", error);
    return EMPTY_STATS;
  }
}

function averageSlopScore(scores: number[]): number | undefined {
  if (scores.length === 0) {
    return undefined;
  }
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

const featuredPhotoInclude = {
  where: { status: EntityStatus.ACTIVE, url: { not: null } },
  take: 1,
  orderBy: { createdAt: "desc" as const },
  select: { url: true }
};

async function mapFeaturedRows(
  rows: {
    slug: string;
    name: string;
    venue: { slug: string; name: string };
    isPromoted: boolean;
    venueBadge: string | null;
    reviews: { slopScore: { toNumber(): number } }[];
    photos?: { url: string | null }[];
    createdAt: Date;
  }[]
): Promise<HomepageFeaturedItem[]> {
  return rows
    .map((item) => {
      const scores = item.reviews.map((r) => r.slopScore.toNumber());
      const photoUrl = item.photos?.[0]?.url?.trim();
      return {
        name: item.name,
        venueSlug: item.venue.slug,
        venueName: item.venue.name,
        foodSlug: item.slug,
        slopScore: averageSlopScore(scores),
        reviewCount: scores.length,
        imageUrl: photoUrl || undefined,
        badge: item.isPromoted
          ? "Promoted"
          : item.venueBadge
            ? item.venueBadge.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : undefined
      };
    })
    .filter((item) => item.reviewCount > 0 || item.badge);
}

export async function getHomepageTopSlopItems(
  limit = 6
): Promise<HomepageFeaturedItem[]> {
  return cachePublicRead(["homepage-top-slop", String(limit)], () =>
    loadHomepageTopSlopItems(limit)
  )();
}

async function loadHomepageTopSlopItems(limit: number): Promise<HomepageFeaturedItem[]> {
  try {
    const items = await prisma.foodItem.findMany({
      where: {
        status: EntityStatus.ACTIVE,
        reviews: {
          some: {
            status: EntityStatus.ACTIVE,
            isTestReview: false
          }
        }
      },
      select: {
        slug: true,
        name: true,
        isPromoted: true,
        venueBadge: true,
        createdAt: true,
        venue: { select: { slug: true, name: true } },
        reviews: {
          where: { status: EntityStatus.ACTIVE, isTestReview: false },
          select: { slopScore: true }
        },
        photos: featuredPhotoInclude
      },
      take: Math.max(limit * 6, 24)
    });

    const ranked = items
      .map((item) => ({
        item,
        avg: averageSlopScore(item.reviews.map((r) => r.slopScore.toNumber())) ?? 0
      }))
      .sort((a, b) => b.avg - a.avg || b.item.reviews.length - a.item.reviews.length)
      .slice(0, limit)
      .map(({ item }) => item);

    return mapFeaturedRows(ranked);
  } catch (error) {
    console.warn("[homepage] Failed to load top slop items", error);
    return [];
  }
}

export async function getHomepageRecentlyAddedItems(
  limit = 6
): Promise<HomepageFeaturedItem[]> {
  return cachePublicRead(["homepage-recent", String(limit)], () =>
    loadHomepageRecentlyAddedItems(limit)
  )();
}

async function loadHomepageRecentlyAddedItems(
  limit: number
): Promise<HomepageFeaturedItem[]> {
  try {
    const items = await prisma.foodItem.findMany({
      where: { status: EntityStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        slug: true,
        name: true,
        isPromoted: true,
        venueBadge: true,
        createdAt: true,
        venue: { select: { slug: true, name: true } },
        reviews: {
          where: { status: EntityStatus.ACTIVE, isTestReview: false },
          select: { slopScore: true }
        },
        photos: featuredPhotoInclude
      }
    });

    return mapFeaturedRows(items);
  } catch (error) {
    console.warn("[homepage] Failed to load recent items", error);
    return [];
  }
}
