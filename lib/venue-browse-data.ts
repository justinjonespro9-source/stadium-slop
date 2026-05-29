import "server-only";

import { cachePublicRead } from "@/lib/public-read-cache";
import type {
  VenueBrowseSummariesBySlug,
  VenueBrowseTopItem
} from "@/lib/venue-browse-types";
import { prisma } from "@/lib/prisma";
import { slugFilterInsensitive } from "@/lib/public-data";

export type {
  VenueBrowseSummariesBySlug,
  VenueBrowseSummary,
  VenueBrowseTopItem
} from "@/lib/venue-browse-types";
export { EMPTY_VENUE_BROWSE_SUMMARY } from "@/lib/venue-browse-types";

const browseSummarySelect = {
  name: true,
  itemType: true,
  ageRestricted: true,
  tags: true,
  venue: { select: { slug: true } },
  vendor: { select: { slug: true } },
  reviews: {
    where: { status: "ACTIVE" as const, isTestReview: false },
    select: { slopScore: true }
  }
} as const;

import type { FoodItem } from "@/lib/sample-data";

type BrowseSummaryRow = {
  name: string;
  itemType: string;
  ageRestricted: boolean;
  tags: string[];
  venue: { slug: string };
  vendor: { slug: string };
  reviews: { slopScore: unknown }[];
};

function mapItemType(value: string): FoodItem["itemType"] {
  if (value === "ALCOHOLIC_DRINK") {
    return "Alcoholic Drink";
  }
  if (value === "NON_ALCOHOLIC_DRINK") {
    return "Non-Alcoholic Drink";
  }
  return "Food";
}

function averageSlopScore(reviews: { slopScore: unknown }[]): number {
  const scores = reviews
    .map((review) => Number(review.slopScore))
    .filter((score) => Number.isFinite(score));
  if (scores.length === 0) {
    return 0;
  }
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function buildSummariesFromRows(rows: BrowseSummaryRow[]): VenueBrowseSummariesBySlug {
  const byVenue = new Map<
    string,
    {
      vendors: Set<string>;
      tags: Set<string>;
      topItem: VenueBrowseTopItem | null;
      itemCount: number;
    }
  >();

  for (const row of rows) {
    const venueSlug = row.venue.slug;
    let bucket = byVenue.get(venueSlug);
    if (!bucket) {
      bucket = {
        vendors: new Set<string>(),
        tags: new Set<string>(),
        topItem: null,
        itemCount: 0
      };
      byVenue.set(venueSlug, bucket);
    }

    bucket.itemCount += 1;
    bucket.vendors.add(row.vendor.slug);
    for (const tag of row.tags) {
      const trimmed = tag.trim();
      if (trimmed) {
        bucket.tags.add(trimmed);
      }
    }

    const slopScore = averageSlopScore(row.reviews);
    const candidate: VenueBrowseTopItem = {
      name: row.name,
      slopScore,
      itemType: mapItemType(row.itemType),
      ageRestricted: row.ageRestricted
    };
    if (!bucket.topItem || candidate.slopScore > bucket.topItem.slopScore) {
      bucket.topItem = candidate;
    }
  }

  const grouped: VenueBrowseSummariesBySlug = {};
  for (const [slug, bucket] of byVenue) {
    grouped[slug] = {
      itemCount: bucket.itemCount,
      vendorCount: bucket.vendors.size,
      tags: [...bucket.tags],
      topItem: bucket.topItem
    };
  }

  return grouped;
}

async function loadVenueBrowseCountries(): Promise<string[]> {
  const rows = await prisma.venue.findMany({
    where: { status: "ACTIVE" },
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" }
  });

  return rows.map((row) => row.country);
}

const getVenueBrowseCountriesCached = cachePublicRead(
  ["venue-browse-countries"],
  loadVenueBrowseCountries
);

async function loadVenueBrowseSummariesForCountry(
  country: string
): Promise<VenueBrowseSummariesBySlug> {
  const rows = await prisma.foodItem.findMany({
    where: {
      status: "ACTIVE",
      venue: { status: "ACTIVE", country }
    },
    select: browseSummarySelect,
    orderBy: [{ venue: { name: "asc" } }, { name: "asc" }]
  });

  return buildSummariesFromRows(rows);
}

function getVenueBrowseSummariesForCountryCached(country: string) {
  return cachePublicRead(
    ["venue-browse-summaries", country],
    () => loadVenueBrowseSummariesForCountry(country)
  );
}

/** Merges per-country summary caches — each chunk stays well under Next's 2MB limit. */
export async function getVenueBrowseSummariesByVenueSlug(): Promise<VenueBrowseSummariesBySlug> {
  const countries = await getVenueBrowseCountriesCached();
  if (countries.length === 0) {
    return {};
  }

  const chunks = await Promise.all(
    countries.map((country) => getVenueBrowseSummariesForCountryCached(country)())
  );

  return Object.assign({}, ...chunks);
}

async function loadVenueFoodItemCountsForSlugs(
  venueSlugs: string[]
): Promise<Record<string, number>> {
  const normalized = [...new Set(venueSlugs.map((slug) => slug.trim()).filter(Boolean))];
  if (normalized.length === 0) {
    return {};
  }

  const venues = await prisma.venue.findMany({
    where: {
      status: "ACTIVE",
      OR: normalized.map((slug) => ({
        slug: slugFilterInsensitive(slug)
      }))
    },
    select: {
      slug: true,
      _count: {
        select: {
          items: {
            where: { status: "ACTIVE" }
          }
        }
      }
    }
  });

  const counts: Record<string, number> = {};
  for (const venue of venues) {
    counts[venue.slug] = venue._count.items;
  }
  return counts;
}

/** World Cup hosts only — small count payload, not the full catalog. */
export async function getVenueFoodItemCountsForSlugs(
  venueSlugs: string[]
): Promise<Record<string, number>> {
  const normalized = [...new Set(venueSlugs.map((slug) => slug.trim()).filter(Boolean))];
  if (normalized.length === 0) {
    return {};
  }

  const cacheKey = normalized.slice().sort().join("|");
  return cachePublicRead(
    ["venue-food-item-counts", cacheKey],
    () => loadVenueFoodItemCountsForSlugs(normalized)
  )();
}
