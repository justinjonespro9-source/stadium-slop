import "server-only";

import { PhotoType } from "@prisma/client";

import { normalizePublicImageUrl } from "./image-url";
import { prisma } from "./prisma";
import { cachePublicRead } from "./public-read-cache";
import { isFairVenueSlug } from "@/lib/fair-preview";
import {
  isDeprecatedPublicVenueSlug,
  resolveCanonicalPublicVenueSlug
} from "./venue-public-slug";
import {
  foodItems,
  foodPhotos,
  getFoodItemsByVenueSlug,
  vendors,
  venues,
  type FoodItem,
  type FoodPhoto,
  type Vendor,
  type Venue
} from "./sample-data";
import { venueTypeLabel } from "./venue-display";
import { resolveVenueTeams } from "./venue-teams";

type DbVenue = {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  region: string;
  leagues: string[];
  teams: string[];
  sports: string[];
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  venueType: string;
  primarySport?: string | null;
  recurringEvents?: string[];
  surfaceType?: string | null;
  partnerName?: string | null;
  partnerLogoUrl?: string | null;
  partnerUrl?: string | null;
  partnerCtaText?: string | null;
  ticketsUrl?: string | null;
  teamShopUrl?: string | null;
  xHandle?: string | null;
  instagramHandle?: string | null;
  primaryHashtag?: string | null;
  foundingVenuePartner?: boolean;
};

type DbVendor = {
  slug: string;
  name: string;
  section: string;
  location: string;
  venue: { slug: string };
  lineIntel: string | null;
};

type DbFoodItem = {
  id: string;
  slug: string;
  name: string;
  itemType: string;
  category: string;
  customCategoryLabel: string | null;
  alcoholic: boolean;
  ageRestricted: boolean;
  beverageStyle: string | null;
  location: string;
  sections: string[];
  description: string;
  basePrice: unknown;
  reportedPrice: unknown;
  priceLastConfirmedLabel: string | null;
  priceReportCount: number;
  tags: string[];
  isPromoted: boolean;
  sponsorName: string | null;
  sponsorDisclosure: string | null;
  isNewThisSeason: boolean;
  seasonIntroduced: string | null;
  availabilityStatus: string | null;
  lastConfirmed: string | null;
  venueBadge: string | null;
  freshWindowLabel: string | null;
  freshSignal: string | null;
  freshSignalReason: string | null;
  venue: { slug: string };
  vendor: { slug: string };
  reviews?: { slopScore: unknown; napkinRating: number }[];
};

export function slugFilterInsensitive(value: string) {
  return { equals: value.trim(), mode: "insensitive" as const };
}

function titleCaseEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapVenueType(value: string): Venue["venueType"] {
  return venueTypeLabel(value);
}

function mapItemType(value: string): FoodItem["itemType"] {
  if (value === "ALCOHOLIC_DRINK") {
    return "Alcoholic Drink";
  }

  if (value === "NON_ALCOHOLIC_DRINK") {
    return "Non-Alcoholic Drink";
  }

  return "Food";
}

function mapBeverageStyle(value: string | null): FoodItem["beverageStyle"] {
  if (!value) {
    return undefined;
  }

  if (value === "NON_ALCOHOLIC") {
    return "Non-Alcoholic";
  }

  return titleCaseEnum(value) as FoodItem["beverageStyle"];
}

function mapAvailability(
  value: string | null
): FoodItem["availabilityStatus"] | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "FAN_REPORTED") {
    return "Fan reported";
  }

  if (value === "VENUE_VERIFIED") {
    return "Venue verified";
  }

  return titleCaseEnum(value) as FoodItem["availabilityStatus"];
}

function mapFreshSignal(value: string | null): FoodItem["freshSignal"] | undefined {
  if (!value) {
    return undefined;
  }

  return titleCaseEnum(value) as FoodItem["freshSignal"];
}

function mapVenueBadge(value: string | null): FoodItem["venueBadge"] | undefined {
  if (!value) {
    return undefined;
  }

  return titleCaseEnum(value) as FoodItem["venueBadge"];
}

const PUBLIC_VENUE_SELECT = {
  slug: true,
  name: true,
  city: true,
  state: true,
  country: true,
  region: true,
  leagues: true,
  teams: true,
  sports: true,
  latitude: true,
  longitude: true,
  reviewRadiusMeters: true,
  venueType: true,
  primarySport: true,
  recurringEvents: true,
  surfaceType: true,
  partnerName: true,
  partnerLogoUrl: true,
  partnerUrl: true,
  partnerCtaText: true,
  ticketsUrl: true,
  teamShopUrl: true,
  xHandle: true,
  instagramHandle: true,
  primaryHashtag: true,
  foundingVenuePartner: true
} as const;

const PUBLIC_FOOD_ITEM_LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  itemType: true,
  category: true,
  customCategoryLabel: true,
  alcoholic: true,
  ageRestricted: true,
  beverageStyle: true,
  location: true,
  sections: true,
  description: true,
  basePrice: true,
  reportedPrice: true,
  priceLastConfirmedLabel: true,
  priceReportCount: true,
  tags: true,
  isPromoted: true,
  sponsorName: true,
  sponsorDisclosure: true,
  isNewThisSeason: true,
  seasonIntroduced: true,
  availabilityStatus: true,
  lastConfirmed: true,
  venueBadge: true,
  freshWindowLabel: true,
  freshSignal: true,
  freshSignalReason: true,
  venue: { select: { slug: true } },
  vendor: { select: { slug: true } },
  reviews: {
    where: { status: "ACTIVE" as const, isTestReview: false },
    select: { slopScore: true, napkinRating: true }
  }
} as const;

const PUBLIC_VENDOR_SELECT = {
  slug: true,
  name: true,
  section: true,
  location: true,
  lineIntel: true,
  venue: { select: { slug: true } }
} as const;

const MAX_PUBLIC_FOOD_PHOTOS = 48;

function getAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getVerdict(score: number): FoodItem["verdict"] {
  if (score >= 8.8) {
    return "Hall of Fame Bite";
  }

  if (score >= 8) {
    return "Starter Every Game";
  }

  if (score >= 6.5) {
    return "Solid Role Player";
  }

  if (score >= 4) {
    return "Bench It";
  }

  return "Slop Alert";
}

export function mapVenueFromDb(venue: DbVenue): Venue {
  return {
    slug: venue.slug,
    name: venue.name,
    city: venue.city,
    state: venue.state,
    leagues: venue.leagues,
    teams: resolveVenueTeams(venue.slug, venue.teams),
    sports: venue.sports,
    country: venue.country,
    region: venue.region,
    latitude: venue.latitude,
    longitude: venue.longitude,
    reviewRadiusMeters: venue.reviewRadiusMeters,
    venueType: mapVenueType(venue.venueType),
    venueTypeKey: venue.venueType,
    primarySport: venue.primarySport ?? undefined,
    recurringEvents: venue.recurringEvents?.length
      ? [...venue.recurringEvents]
      : undefined,
    surfaceType: venue.surfaceType ?? undefined,
    partnerName: venue.partnerName,
    partnerLogoUrl: venue.partnerLogoUrl,
    partnerUrl: venue.partnerUrl,
    partnerCtaText: venue.partnerCtaText,
    ticketsUrl: venue.ticketsUrl,
    teamShopUrl: venue.teamShopUrl,
    xHandle: venue.xHandle,
    instagramHandle: venue.instagramHandle,
    primaryHashtag: venue.primaryHashtag,
    foundingVenuePartner: venue.foundingVenuePartner ?? false
  };
}

export function mapVendorFromDb(vendor: DbVendor): Vendor {
  return {
    slug: vendor.slug,
    name: vendor.name,
    venueSlug: vendor.venue.slug,
    section: vendor.section,
    location: vendor.location,
    averageSlopScore: 0,
    lineIntel: vendor.lineIntel ?? undefined
  };
}

export function mapFoodItemFromDb(item: DbFoodItem): FoodItem {
  const reviewScores = item.reviews?.map((review) => Number(review.slopScore)) ?? [];
  const napkinRatings = item.reviews?.map((review) => review.napkinRating) ?? [];
  const slopScore = getAverage(reviewScores);
  const napkinRating = Math.min(
    5,
    Math.max(1, Math.round(getAverage(napkinRatings) || 1))
  ) as 1 | 2 | 3 | 4 | 5;
  const price = Number(item.basePrice ?? item.reportedPrice ?? 0);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    venueSlug: item.venue.slug,
    vendorSlug: item.vendor.slug,
    itemType: mapItemType(item.itemType),
    alcoholic: item.alcoholic,
    ageRestricted: item.ageRestricted,
    beverageStyle: mapBeverageStyle(item.beverageStyle),
    category: item.customCategoryLabel ?? titleCaseEnum(item.category),
    location: item.location,
    sections: item.sections,
    price,
    reportedPrice:
      item.reportedPrice === null || item.reportedPrice === undefined
        ? undefined
        : Number(item.reportedPrice),
    priceLastConfirmedLabel: item.priceLastConfirmedLabel ?? undefined,
    priceReportCount: item.priceReportCount,
    rating: slopScore ? slopScore / 2 : 0,
    worthItScore: slopScore ? Math.round(slopScore * 10) : 0,
    slopScore,
    verdict: getVerdict(slopScore),
    runItBackPercent: slopScore ? Math.round(slopScore * 10) : 0,
    valueLabel: "Fair Deal",
    servedRightLabel: "Not Applicable",
    lineWaitLabel: "Not Applicable",
    napkinRating,
    napkinLabel: "Safe at Your Seat",
    reviewCount: item.reviews?.length ?? 0,
    tags: item.tags,
    description: item.description,
    isPromoted: item.isPromoted,
    sponsorName: item.sponsorName ?? undefined,
    sponsorDisclosure: item.sponsorDisclosure ?? undefined,
    isNewThisSeason: item.isNewThisSeason,
    seasonIntroduced: item.seasonIntroduced ?? undefined,
    availabilityStatus: mapAvailability(item.availabilityStatus),
    lastConfirmed: item.lastConfirmed ?? undefined,
    venueBadge: mapVenueBadge(item.venueBadge),
    freshReviewCount: (item.reviews ?? []).filter(
      (review) => Number(review.slopScore) > 0
    ).length,
    freshWindowLabel: item.freshWindowLabel ?? undefined,
    freshSignal: mapFreshSignal(item.freshSignal),
    freshSignalReason: item.freshSignalReason ?? undefined
  };
}

function fallback<T>(value: T[], fallbackValue: T[]) {
  return value.length > 0 ? value : fallbackValue;
}

/** Avoid hanging SSR when Postgres is down or TCP stalls (errors are caught; hangs are not). */
function publicDataDbTimeoutMs() {
  const raw = process.env.STADIUM_SLOP_DB_QUERY_TIMEOUT_MS;
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 200 && n <= 60_000) {
    return n;
  }
  return 4000;
}

async function withDbTimeout<T>(label: string, run: () => Promise<T>): Promise<T> {
  const ms = publicDataDbTimeoutMs();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label}: database query timed out after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([run(), timeout]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

async function loadPublicVenues() {
  try {
    const dbVenues = await withDbTimeout("getPublicVenues", () =>
      prisma.venue.findMany({
        where: { status: "ACTIVE" },
        select: PUBLIC_VENUE_SELECT,
        orderBy: [{ state: "asc" }, { name: "asc" }]
      })
    );

    return fallback(
      dbVenues
        .filter((venue) => !isDeprecatedPublicVenueSlug(venue.slug))
        .map(mapVenueFromDb),
      venues.filter((venue) => !isDeprecatedPublicVenueSlug(venue.slug))
    );
  } catch (error) {
    console.warn("Falling back to sample venues", error);
    return venues;
  }
}

const getPublicVenuesCached = cachePublicRead(["public-venues"], loadPublicVenues);

export async function getPublicVenues() {
  return getPublicVenuesCached();
}

export async function getPublicVenueBySlug(slug: string) {
  const normalized = slug.trim();
  const canonical = resolveCanonicalPublicVenueSlug(normalized);
  const slugsToTry =
    canonical.toLowerCase() === normalized.toLowerCase()
      ? [canonical]
      : [canonical, normalized];

  try {
    for (const trySlug of slugsToTry) {
      const venue = await prisma.venue.findFirst({
        where: { slug: slugFilterInsensitive(trySlug), status: "ACTIVE" },
        select: PUBLIC_VENUE_SELECT
      });
      if (venue) {
        return mapVenueFromDb(venue);
      }
    }
  } catch (error) {
    console.warn("Falling back to sample venue", error);
  }

  for (const trySlug of slugsToTry) {
    const sample = venues.find(
      (item) => item.slug.toLowerCase() === trySlug.toLowerCase()
    );
    if (sample) {
      return sample;
    }
  }

  return undefined;
}

export async function getPublicVendorsByVenueSlug(venueSlug: string) {
  const normalizedVenueSlug = venueSlug.trim();

  try {
    const dbVendors = await prisma.vendor.findMany({
      where: {
        status: "ACTIVE",
        venue: { slug: slugFilterInsensitive(normalizedVenueSlug), status: "ACTIVE" }
      },
      select: PUBLIC_VENDOR_SELECT,
      orderBy: { name: "asc" }
    });

    return fallback(
      dbVendors.map(mapVendorFromDb),
      vendors.filter(
        (vendor) =>
          vendor.venueSlug.toLowerCase() === normalizedVenueSlug.toLowerCase()
      )
    );
  } catch (error) {
    console.warn("Falling back to sample vendors", error);
    return vendors.filter(
      (vendor) =>
        vendor.venueSlug.toLowerCase() === normalizedVenueSlug.toLowerCase()
    );
  }
}

export async function getPublicVendorBySlug(venueSlug: string, vendorSlug: string) {
  const dbVendors = await getPublicVendorsByVenueSlug(venueSlug);
  return dbVendors.find((vendor) => vendor.slug === vendorSlug);
}

async function loadPublicFoodItemsByVenueSlug(venueSlug: string) {
  const normalizedVenueSlug = venueSlug.trim();

  try {
    const dbItems = await prisma.foodItem.findMany({
      where: {
        status: "ACTIVE",
        venue: { slug: slugFilterInsensitive(normalizedVenueSlug), status: "ACTIVE" }
      },
      select: PUBLIC_FOOD_ITEM_LIST_SELECT,
      orderBy: { name: "asc" }
    });

    return fallback(
      dbItems.map(mapFoodItemFromDb),
      foodItems.filter(
        (item) => item.venueSlug.toLowerCase() === normalizedVenueSlug.toLowerCase()
      )
    );
  } catch (error) {
    console.warn("Falling back to sample venue items", error);
    return foodItems.filter(
      (item) => item.venueSlug.toLowerCase() === normalizedVenueSlug.toLowerCase()
    );
  }
}

export async function getPublicFoodItemsByVenueSlug(venueSlug: string) {
  const normalized = venueSlug.trim();
  // Fair catalog imports can jump in size; include a cache generation so new rows show without waiting for TTL.
  const cacheKey = isFairVenueSlug(normalized)
    ? ["public-food-items", normalized, "fair-catalog-v2"]
    : ["public-food-items", normalized];
  return cachePublicRead(cacheKey, () => loadPublicFoodItemsByVenueSlug(normalized))();
}

export async function getPublicFoodItemsByVendorSlug(
  venueSlug: string,
  vendorSlug: string
) {
  const normalizedVenueSlug = venueSlug.trim();
  const normalizedVendorSlug = vendorSlug.trim();

  try {
    const dbItems = await prisma.foodItem.findMany({
      where: {
        status: "ACTIVE",
        vendor: {
          slug: slugFilterInsensitive(normalizedVendorSlug),
          status: "ACTIVE",
          venue: {
            slug: slugFilterInsensitive(normalizedVenueSlug),
            status: "ACTIVE"
          }
        }
      },
      select: PUBLIC_FOOD_ITEM_LIST_SELECT,
      orderBy: { name: "asc" }
    });

    if (dbItems.length > 0) {
      return dbItems.map(mapFoodItemFromDb);
    }
  } catch (error) {
    console.warn("DB vendor items failed, trying venue filter", error);
  }

  const items = await getPublicFoodItemsByVenueSlug(normalizedVenueSlug);
  return items.filter((item) => item.vendorSlug === normalizedVendorSlug);
}

export async function getPublicFoodItemBySlug(venueSlug: string, foodSlug: string) {
  const normalizedVenueSlug = venueSlug.trim();
  const normalizedFoodSlug = decodeURIComponent(foodSlug).trim();

  try {
    const row = await prisma.foodItem.findFirst({
      where: {
        slug: slugFilterInsensitive(normalizedFoodSlug),
        status: "ACTIVE",
        venue: { slug: slugFilterInsensitive(normalizedVenueSlug), status: "ACTIVE" }
      },
      select: PUBLIC_FOOD_ITEM_LIST_SELECT
    });

    if (row) {
      return mapFoodItemFromDb(row as DbFoodItem);
    }
  } catch (error) {
    console.warn("DB food item by slug failed, trying sample", error);
  }

  const vKey = normalizedVenueSlug.toLowerCase();
  const fKey = normalizedFoodSlug.toLowerCase();

  const fromVenue = getFoodItemsByVenueSlug(normalizedVenueSlug).find(
    (item) =>
      item.slug.toLowerCase() === fKey && item.venueSlug.toLowerCase() === vKey
  );

  if (fromVenue) {
    return fromVenue;
  }

  return foodItems.find(
    (item) =>
      item.slug.toLowerCase() === fKey && item.venueSlug.toLowerCase() === vKey
  );
}

export async function getPublicVendorForFoodItem(item: FoodItem) {
  const vendorsForVenue = await getPublicVendorsByVenueSlug(item.venueSlug);
  return vendorsForVenue.find((vendor) => vendor.slug === item.vendorSlug);
}

export async function getPublicPhotosForFoodItem(venueSlug: string, foodSlug: string) {
  const normalizedVenueSlug = venueSlug.trim();
  const normalizedFoodSlug = decodeURIComponent(foodSlug).trim();

  const sampleForSlug = foodPhotos.filter(
    (photo) =>
      photo.venueSlug.toLowerCase() === normalizedVenueSlug.toLowerCase() &&
      photo.foodSlug.toLowerCase() === normalizedFoodSlug.toLowerCase()
  );

  try {
    const dbItem = await prisma.foodItem.findFirst({
      where: {
        slug: slugFilterInsensitive(normalizedFoodSlug),
        status: "ACTIVE",
        venue: { slug: slugFilterInsensitive(normalizedVenueSlug), status: "ACTIVE" }
      },
      select: { id: true }
    });

    const dbPhotos = await prisma.foodPhoto.findMany({
      where: {
        status: "ACTIVE",
        photoType: PhotoType.FOOD,
        OR: [{ reviewId: null }, { review: { is: { status: "ACTIVE" } } }],
        foodItem: {
          slug: slugFilterInsensitive(normalizedFoodSlug),
          venue: { slug: slugFilterInsensitive(normalizedVenueSlug), status: "ACTIVE" }
        }
      },
      select: {
        id: true,
        url: true,
        placeholder: true,
        alt: true,
        caption: true,
        verifiedOnSite: true,
        createdAt: true,
        reviewId: true,
        uploaderUserId: true,
        foodItem: { select: { slug: true } },
        venue: { select: { slug: true } },
        uploader: { select: { displayName: true } }
      },
      orderBy: { createdAt: "desc" },
      take: MAX_PUBLIC_FOOD_PHOTOS
    });

    const mappedPhotos: FoodPhoto[] = dbPhotos
      .map((photo) => ({
        id: photo.id,
        foodSlug: photo.foodItem?.slug ?? normalizedFoodSlug,
        venueSlug: photo.venue?.slug ?? normalizedVenueSlug,
        reviewId: photo.reviewId ?? undefined,
        uploaderUserId: photo.uploaderUserId,
        photoType: "food" as const,
        alt: photo.alt,
        caption: photo.caption ?? "Fan-uploaded stadium food photo",
        uploadedBy: photo.uploader.displayName,
        verifiedOnSite: photo.verifiedOnSite,
        createdAt: photo.createdAt.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric"
        }),
        sortTimestamp: photo.createdAt.getTime(),
        imageUrl: normalizePublicImageUrl(photo.url),
        imagePlaceholder: photo.placeholder ?? "🍔"
      }))
      .filter((p) => Boolean(p.imageUrl));

    if (dbItem) {
      return mappedPhotos;
    }

    return fallback(mappedPhotos, sampleForSlug);
  } catch (error) {
    console.warn("Falling back to sample photos", error);
    return sampleForSlug;
  }
}
