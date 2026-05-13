import { prisma } from "./prisma";
import {
  foodItems,
  foodPhotos,
  vendors,
  venues,
  type FoodItem,
  type FoodPhoto,
  type Vendor,
  type Venue
} from "./sample-data";

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

function titleCaseEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapVenueType(value: string): Venue["venueType"] {
  if (value === "BALLPARK") {
    return "Ballpark";
  }

  if (value === "ARENA") {
    return "Arena";
  }

  return "Stadium";
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
    teams: venue.teams,
    sports: venue.sports,
    country: venue.country,
    region: venue.region,
    latitude: venue.latitude,
    longitude: venue.longitude,
    reviewRadiusMeters: venue.reviewRadiusMeters,
    venueType: mapVenueType(venue.venueType)
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
    freshReviewCount: item.reviews?.filter((review) => Number(review.slopScore) > 0).length,
    freshWindowLabel: item.freshWindowLabel ?? undefined,
    freshSignal: mapFreshSignal(item.freshSignal),
    freshSignalReason: item.freshSignalReason ?? undefined
  };
}

function fallback<T>(value: T[], fallbackValue: T[]) {
  return value.length > 0 ? value : fallbackValue;
}

export async function getPublicVenues() {
  try {
    const dbVenues = await prisma.venue.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ state: "asc" }, { name: "asc" }]
    });

    return fallback(dbVenues.map(mapVenueFromDb), venues);
  } catch (error) {
    console.warn("Falling back to sample venues", error);
    return venues;
  }
}

export async function getPublicVenueBySlug(slug: string) {
  try {
    const venue = await prisma.venue.findFirst({
      where: { slug, status: "ACTIVE" }
    });

    return venue ? mapVenueFromDb(venue) : venues.find((item) => item.slug === slug);
  } catch (error) {
    console.warn("Falling back to sample venue", error);
    return venues.find((item) => item.slug === slug);
  }
}

export async function getPublicVendorsByVenueSlug(venueSlug: string) {
  try {
    const dbVendors = await prisma.vendor.findMany({
      where: { status: "ACTIVE", venue: { slug: venueSlug } },
      include: { venue: { select: { slug: true } } },
      orderBy: { name: "asc" }
    });

    return fallback(
      dbVendors.map(mapVendorFromDb),
      vendors.filter((vendor) => vendor.venueSlug === venueSlug)
    );
  } catch (error) {
    console.warn("Falling back to sample vendors", error);
    return vendors.filter((vendor) => vendor.venueSlug === venueSlug);
  }
}

export async function getPublicVendorBySlug(venueSlug: string, vendorSlug: string) {
  const dbVendors = await getPublicVendorsByVenueSlug(venueSlug);
  return dbVendors.find((vendor) => vendor.slug === vendorSlug);
}

export async function getPublicFoodItemsByVenueSlug(venueSlug: string) {
  try {
    const dbItems = await prisma.foodItem.findMany({
      where: { status: "ACTIVE", venue: { slug: venueSlug } },
      include: {
        venue: { select: { slug: true } },
        vendor: { select: { slug: true } },
        reviews: { where: { status: "ACTIVE" } }
      },
      orderBy: { name: "asc" }
    });

    return fallback(
      dbItems.map(mapFoodItemFromDb),
      foodItems.filter((item) => item.venueSlug === venueSlug)
    );
  } catch (error) {
    console.warn("Falling back to sample venue items", error);
    return foodItems.filter((item) => item.venueSlug === venueSlug);
  }
}

export async function getPublicFoodItemsByVendorSlug(
  venueSlug: string,
  vendorSlug: string
) {
  const items = await getPublicFoodItemsByVenueSlug(venueSlug);
  return items.filter((item) => item.vendorSlug === vendorSlug);
}

export async function getPublicFoodItemBySlug(venueSlug: string, foodSlug: string) {
  const items = await getPublicFoodItemsByVenueSlug(venueSlug);
  return items.find((item) => item.slug === foodSlug);
}

export async function getPublicVendorForFoodItem(item: FoodItem) {
  const vendorsForVenue = await getPublicVendorsByVenueSlug(item.venueSlug);
  return vendorsForVenue.find((vendor) => vendor.slug === item.vendorSlug);
}

export async function getPublicPhotosForFoodItem(venueSlug: string, foodSlug: string) {
  try {
    const dbPhotos = await prisma.foodPhoto.findMany({
      where: {
        status: "ACTIVE",
        foodItem: { slug: foodSlug, venue: { slug: venueSlug } }
      },
      include: {
        foodItem: { select: { slug: true } },
        venue: { select: { slug: true } },
        uploader: { select: { displayName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const mappedPhotos: FoodPhoto[] = dbPhotos.map((photo) => ({
      id: photo.id,
      foodSlug: photo.foodItem?.slug ?? foodSlug,
      venueSlug: photo.venue?.slug ?? venueSlug,
      reviewId: photo.reviewId ?? undefined,
      uploaderUserId: photo.uploaderUserId,
      photoType:
        photo.photoType === "MENU_PRICE_PROOF" ? "menu-price-proof" : "food",
      alt: photo.alt,
      caption: photo.caption ?? "Fan-uploaded stadium food photo",
      uploadedBy: photo.uploader.displayName,
      verifiedOnSite: photo.verifiedOnSite,
      createdAt: photo.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      }),
      imagePlaceholder: photo.placeholder ?? "🍔"
    }));

    return fallback(
      mappedPhotos,
      foodPhotos.filter(
        (photo) => photo.venueSlug === venueSlug && photo.foodSlug === foodSlug
      )
    );
  } catch (error) {
    console.warn("Falling back to sample photos", error);
    return foodPhotos.filter(
      (photo) => photo.venueSlug === venueSlug && photo.foodSlug === foodSlug
    );
  }
}
