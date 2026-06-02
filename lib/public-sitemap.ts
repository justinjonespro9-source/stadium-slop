import "server-only";

import { EntityStatus } from "@prisma/client";
import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { getAbsoluteUrl } from "@/lib/site-metadata";
import {
  WORLD_CUP_GUIDE_PATH_EN,
  WORLD_CUP_GUIDE_PATH_ES
} from "@/lib/world-cup-stadium-food-guide-content";
import {
  isDeprecatedPublicVenueSlug,
  resolveCanonicalPublicVenueSlug
} from "@/lib/venue-public-slug";

export type PublicSitemapUrlCounts = {
  homepage: number;
  worldCupGuide: number;
  venues: number;
  foodItems: number;
  total: number;
};

const SITEMAP_PRIORITY = {
  homepage: 1,
  worldCupGuide: 0.9,
  venue: 0.8,
  foodItem: 0.65
} as const;

export async function loadPublicSitemapEntries(): Promise<{
  entries: MetadataRoute.Sitemap;
  counts: PublicSitemapUrlCounts;
}> {
  const now = new Date();

  const homepageEntries: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: SITEMAP_PRIORITY.homepage
    }
  ];

  const worldCupEntries: MetadataRoute.Sitemap = [
    WORLD_CUP_GUIDE_PATH_EN,
    WORLD_CUP_GUIDE_PATH_ES
  ].map((path) => ({
    url: getAbsoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: SITEMAP_PRIORITY.worldCupGuide
  }));

  const [venueRows, foodRows] = await Promise.all([
    prisma.venue.findMany({
      where: { status: EntityStatus.ACTIVE },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" }
    }),
    prisma.foodItem.findMany({
      where: {
        status: EntityStatus.ACTIVE,
        venue: { status: EntityStatus.ACTIVE }
      },
      select: {
        slug: true,
        updatedAt: true,
        venue: { select: { slug: true } }
      },
      orderBy: [{ venue: { slug: "asc" } }, { slug: "asc" }]
    })
  ]);

  const venueEntries: MetadataRoute.Sitemap = venueRows
    .filter((venue) => !isDeprecatedPublicVenueSlug(venue.slug))
    .map((venue) => {
      const canonicalSlug = resolveCanonicalPublicVenueSlug(venue.slug);
      return {
        url: getAbsoluteUrl(`/venues/${canonicalSlug}`),
        lastModified: venue.updatedAt,
        changeFrequency: "weekly" as const,
        priority: SITEMAP_PRIORITY.venue
      };
    });

  const foodEntries: MetadataRoute.Sitemap = foodRows
    .filter((item) => !isDeprecatedPublicVenueSlug(item.venue.slug))
    .map((item) => {
      const venueSlug = resolveCanonicalPublicVenueSlug(item.venue.slug);
      return {
        url: getAbsoluteUrl(`/venues/${venueSlug}/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "monthly" as const,
        priority: SITEMAP_PRIORITY.foodItem
      };
    });

  const counts: PublicSitemapUrlCounts = {
    homepage: homepageEntries.length,
    worldCupGuide: worldCupEntries.length,
    venues: venueEntries.length,
    foodItems: foodEntries.length,
    total:
      homepageEntries.length +
      worldCupEntries.length +
      venueEntries.length +
      foodEntries.length
  };

  return {
    entries: [...homepageEntries, ...worldCupEntries, ...venueEntries, ...foodEntries],
    counts
  };
}
