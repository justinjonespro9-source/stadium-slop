import {
  AvailabilityStatus,
  BeverageStyle,
  ConsensusLabel,
  FreshSignal,
  ItemCategory,
  ItemType,
  PhotoType,
  VenueBadge,
  VenueType
} from "@prisma/client";

import { applyDemoDensitySeed } from "../lib/demo-density-seed";
import { buildGameDayKey } from "../lib/game-day";
import { prisma } from "../lib/prisma";
import {
  foodItems,
  foodPhotos,
  foodReviews,
  vendors,
  venues,
  type FoodItem,
  type FoodReview,
  type ReviewConsensusLabel
} from "../lib/sample-data";

type SeedUser = {
  id: string;
  displayName: string;
  handle: string;
  homeVenueSlug?: string;
};

const fallbackUser: SeedUser = {
  id: "user-stadium-slop-fan",
  displayName: "Stadium Slop Fan",
  handle: "@stadiumslopfan",
  homeVenueSlug: "target-field"
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toGameDayKey(review: FoodReview, seedNow: Date) {
  if (review.dateLabel === "Today" || review.dateLabel.startsWith("Last ")) {
    return buildGameDayKey(review.venueSlug, seedNow);
  }

  return `${review.seasonLabel}-${review.venueSlug}-${slugify(review.dateLabel)}`;
}

function toCreatedAt(label: string, seedNow: Date) {
  if (label === "Today") {
    return seedNow;
  }

  const lastMinutes = /^Last (\d+) minutes$/.exec(label);
  if (lastMinutes) {
    const mins = Number(lastMinutes[1]);
    return new Date(seedNow.getTime() - mins * 60_000);
  }

  if (label === "May 2026") {
    return new Date("2026-05-01T18:00:00.000Z");
  }

  return new Date("2026-04-01T18:00:00.000Z");
}

function venueTypeFromSampleLabel(value: string): VenueType {
  const key = value.trim().toLowerCase();
  const map: Record<string, VenueType> = {
    ballpark: VenueType.BALLPARK,
    stadium: VenueType.STADIUM,
    arena: VenueType.ARENA,
    "tennis center": VenueType.TENNIS_CENTER,
    tennis_center: VenueType.TENNIS_CENTER,
    raceway: VenueType.RACETRACK,
    racetrack: VenueType.RACETRACK,
    "golf course": VenueType.GOLF_COURSE,
    "horse track": VenueType.HORSE_TRACK,
    "college stadium": VenueType.COLLEGE_STADIUM,
    other: VenueType.OTHER
  };
  return map[key] ?? VenueType.STADIUM;
}

function itemType(value: FoodItem["itemType"]) {
  if (value === "Alcoholic Drink") {
    return ItemType.ALCOHOLIC_DRINK;
  }

  if (value === "Non-Alcoholic Drink") {
    return ItemType.NON_ALCOHOLIC_DRINK;
  }

  return ItemType.FOOD;
}

function itemCategory(item: FoodItem) {
  const category = `${item.category} ${item.tags.join(" ")}`.toLowerCase();

  if (item.itemType === "Alcoholic Drink") {
    return ItemCategory.ALCOHOLIC_BEVERAGE;
  }

  if (item.itemType === "Non-Alcoholic Drink") {
    return ItemCategory.BEVERAGE;
  }

  if (["sweet", "dessert", "treat", "lemonade"].some((word) => category.includes(word))) {
    return ItemCategory.SWEET;
  }

  if (["snack", "nachos", "curds"].some((word) => category.includes(word))) {
    return ItemCategory.SNACK;
  }

  if (
    [
      "bbq",
      "seafood",
      "basket",
      "sandwich",
      "burger",
      "hot_dog",
      "pizza",
      "taco",
      "chicken",
      "vegan",
      "gluten",
      "burrito",
      "waffle",
      "sausage",
      "steak",
      "cuban",
      "chili",
      "pork",
      "tikka",
      "brisket",
      "mac",
      "slider",
      "tot",
      "poutine",
      "nacho",
      "stew",
      "curry",
      "pretzel",
      "ceviche",
      "gyro",
      "knish",
      "cheesesteak",
      "custard",
      "gelato",
      "cannoli",
      "lobster",
      "taquito",
      "loco",
      "sampler",
      "footlong",
      "helmet",
      "sliders",
      "sundae",
      "churro",
      "margarita",
      "martini",
      "boba",
      "espresso"
    ].some((word) => category.includes(word))
  ) {
    return ItemCategory.SAVORY;
  }

  return ItemCategory.OTHER;
}

function beverageStyle(value: FoodItem["beverageStyle"]) {
  if (!value) {
    return null;
  }

  const styles = {
    Beer: BeverageStyle.BEER,
    Cocktail: BeverageStyle.COCKTAIL,
    Wine: BeverageStyle.WINE,
    Seltzer: BeverageStyle.SELTZER,
    "Non-Alcoholic": BeverageStyle.NON_ALCOHOLIC,
    Other: BeverageStyle.OTHER
  } satisfies Record<NonNullable<FoodItem["beverageStyle"]>, BeverageStyle>;

  return styles[value];
}

function availabilityStatus(value: FoodItem["availabilityStatus"]) {
  if (!value) {
    return null;
  }

  const statuses = {
    Available: AvailabilityStatus.AVAILABLE,
    Seasonal: AvailabilityStatus.SEASONAL,
    Retired: AvailabilityStatus.RETIRED,
    "Fan reported": AvailabilityStatus.FAN_REPORTED,
    "Venue verified": AvailabilityStatus.VENUE_VERIFIED
  } satisfies Record<NonNullable<FoodItem["availabilityStatus"]>, AvailabilityStatus>;

  return statuses[value];
}

function venueBadge(value: FoodItem["venueBadge"]) {
  if (!value) {
    return null;
  }

  const badges = {
    "Venue MVP": VenueBadge.VENUE_MVP,
    "Fan Favorite": VenueBadge.FAN_FAVORITE,
    "Best Value": VenueBadge.BEST_VALUE,
    "Worth the Line": VenueBadge.WORTH_THE_LINE,
    "New This Season": VenueBadge.NEW_THIS_SEASON,
    "Napkin Nightmare": VenueBadge.NAPKIN_NIGHTMARE,
    "Slop Alert": VenueBadge.SLOP_ALERT,
    "Hidden Gem": VenueBadge.HIDDEN_GEM,
    "Most Improved": VenueBadge.MOST_IMPROVED,
    "Falling Fast": VenueBadge.FALLING_FAST
  } satisfies Record<NonNullable<FoodItem["venueBadge"]>, VenueBadge>;

  return badges[value];
}

function freshSignal(value: FoodItem["freshSignal"]) {
  if (!value) {
    return null;
  }

  const signals = {
    "Hot Today": FreshSignal.HOT_TODAY,
    "Holding Strong": FreshSignal.HOLDING_STRONG,
    "Mixed Signals": FreshSignal.MIXED_SIGNALS,
    "Falling Fast": FreshSignal.FALLING_FAST,
    "Fans Say Skip": FreshSignal.FANS_SAY_SKIP,
    "Cold Streak": FreshSignal.COLD_STREAK,
    "Line Trouble": FreshSignal.LINE_TROUBLE
  } satisfies Record<NonNullable<FoodItem["freshSignal"]>, FreshSignal>;

  return signals[value];
}

function consensusLabel(value: ReviewConsensusLabel) {
  const labels = {
    "Run It Back": ConsensusLabel.RUN_IT_BACK,
    "Worth the Walk": ConsensusLabel.WORTH_THE_WALK,
    "Stadium Tax": ConsensusLabel.STADIUM_TAX,
    Steal: ConsensusLabel.STEAL,
    "Bench It": ConsensusLabel.BENCH_IT
  } satisfies Record<ReviewConsensusLabel, ConsensusLabel>;

  return labels[value];
}

function reviewerForReview(review: FoodReview): SeedUser {
  if (!review.reviewerId || !review.reviewerName || !review.reviewerHandle) {
    return {
      id: `user-${review.id}`,
      displayName: "Stadium Slop Reviewer",
      handle: `@${slugify(review.id)}`,
      homeVenueSlug: review.venueSlug
    };
  }

  return {
    id: review.reviewerId,
    displayName: review.reviewerName,
    handle: review.reviewerHandle,
    homeVenueSlug: review.venueSlug
  };
}

function uploaderForName(name: string, venueSlug: string): SeedUser {
  return {
    id: `user-${slugify(name)}`,
    displayName: name,
    handle: `@${slugify(name)}`,
    homeVenueSlug: venueSlug
  };
}

async function upsertUser(user: SeedUser) {
  const homeVenue = user.homeVenueSlug
    ? await prisma.venue.findUnique({ where: { slug: user.homeVenueSlug } })
    : null;

  return prisma.user.upsert({
    where: { id: user.id },
    update: {
      displayName: user.displayName,
      handle: user.handle,
      homeVenueId: homeVenue?.id
    },
    create: {
      id: user.id,
      email: `${slugify(user.handle)}@example.com`,
      displayName: user.displayName,
      handle: user.handle,
      homeVenueId: homeVenue?.id
    }
  });
}

async function main() {
  const seedNow = new Date();

  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {
        name: venue.name,
        city: venue.city,
        state: venue.state,
        country: venue.country,
        region: venue.region,
        leagues: venue.leagues,
        teams: venue.teams,
        sports: venue.sports,
        latitude: venue.latitude,
        longitude: venue.longitude,
        reviewRadiusMeters: venue.reviewRadiusMeters,
        venueType: venueTypeFromSampleLabel(venue.venueType),
        primarySport: venue.primarySport ?? null,
        recurringEvents: venue.recurringEvents ?? [],
        surfaceType: venue.surfaceType ?? null
      },
      create: {
        slug: venue.slug,
        name: venue.name,
        city: venue.city,
        state: venue.state,
        country: venue.country,
        region: venue.region,
        leagues: venue.leagues,
        teams: venue.teams,
        sports: venue.sports,
        latitude: venue.latitude,
        longitude: venue.longitude,
        reviewRadiusMeters: venue.reviewRadiusMeters,
        venueType: venueTypeFromSampleLabel(venue.venueType),
        primarySport: venue.primarySport ?? null,
        recurringEvents: venue.recurringEvents ?? [],
        surfaceType: venue.surfaceType ?? null
      }
    });
  }

  await upsertUser(fallbackUser);

  for (const vendor of vendors) {
    const venue = await prisma.venue.findUniqueOrThrow({
      where: { slug: vendor.venueSlug }
    });

    await prisma.vendor.upsert({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: vendor.slug
        }
      },
      update: {
        name: vendor.name,
        section: vendor.section,
        location: vendor.location,
        lineIntel: vendor.lineIntel
      },
      create: {
        slug: vendor.slug,
        name: vendor.name,
        venueId: venue.id,
        section: vendor.section,
        location: vendor.location,
        lineIntel: vendor.lineIntel
      }
    });
  }

  for (const item of foodItems) {
    const venue = await prisma.venue.findUniqueOrThrow({
      where: { slug: item.venueSlug }
    });
    const vendor = await prisma.vendor.findUniqueOrThrow({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: item.vendorSlug
        }
      }
    });

    await prisma.foodItem.upsert({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: item.slug
        }
      },
      update: {
        name: item.name,
        vendorId: vendor.id,
        itemType: itemType(item.itemType),
        category: itemCategory(item),
        customCategoryLabel: item.category,
        alcoholic: item.alcoholic ?? false,
        ageRestricted: item.ageRestricted ?? false,
        beverageStyle: beverageStyle(item.beverageStyle),
        location: item.location,
        sections: item.sections ?? [],
        description: item.description,
        basePrice:
          item.priceLastConfirmedLabel === "Unreported" ? null : item.price,
        reportedPrice: item.reportedPrice,
        priceLastConfirmedLabel: item.priceLastConfirmedLabel,
        priceReportCount: item.priceReportCount ?? 0,
        tags: item.tags,
        isPromoted: item.isPromoted ?? false,
        sponsorName: item.sponsorName,
        sponsorDisclosure: item.sponsorDisclosure,
        isNewThisSeason: item.isNewThisSeason ?? false,
        seasonIntroduced: item.seasonIntroduced,
        availabilityStatus: availabilityStatus(item.availabilityStatus),
        lastConfirmed: item.lastConfirmed,
        venueBadge: venueBadge(item.venueBadge),
        freshWindowLabel: item.freshWindowLabel,
        freshSignal: freshSignal(item.freshSignal),
        freshSignalReason: item.freshSignalReason
      },
      create: {
        slug: item.slug,
        name: item.name,
        venueId: venue.id,
        vendorId: vendor.id,
        itemType: itemType(item.itemType),
        category: itemCategory(item),
        customCategoryLabel: item.category,
        alcoholic: item.alcoholic ?? false,
        ageRestricted: item.ageRestricted ?? false,
        beverageStyle: beverageStyle(item.beverageStyle),
        location: item.location,
        sections: item.sections ?? [],
        description: item.description,
        basePrice:
          item.priceLastConfirmedLabel === "Unreported" ? null : item.price,
        reportedPrice: item.reportedPrice,
        priceLastConfirmedLabel: item.priceLastConfirmedLabel,
        priceReportCount: item.priceReportCount ?? 0,
        tags: item.tags,
        isPromoted: item.isPromoted ?? false,
        sponsorName: item.sponsorName,
        sponsorDisclosure: item.sponsorDisclosure,
        isNewThisSeason: item.isNewThisSeason ?? false,
        seasonIntroduced: item.seasonIntroduced,
        availabilityStatus: availabilityStatus(item.availabilityStatus),
        lastConfirmed: item.lastConfirmed,
        venueBadge: venueBadge(item.venueBadge),
        freshWindowLabel: item.freshWindowLabel,
        freshSignal: freshSignal(item.freshSignal),
        freshSignalReason: item.freshSignalReason
      }
    });
  }

  for (const review of foodReviews) {
    await upsertUser(reviewerForReview(review));

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: reviewerForReview(review).id }
    });
    const venue = await prisma.venue.findUniqueOrThrow({
      where: { slug: review.venueSlug }
    });
    const foodItem = await prisma.foodItem.findUniqueOrThrow({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: review.foodSlug
        }
      }
    });

    await prisma.review.upsert({
      where: { id: review.id },
      update: {
        userId: user.id,
        foodItemId: foodItem.id,
        venueId: venue.id,
        gameDayKey: toGameDayKey(review, seedNow),
        slopScore: review.slopScore,
        napkinRating: review.napkinRating,
        labels: review.labels.map(consensusLabel),
        verifiedGameDay: review.verifiedGameDay,
        seasonLabel: review.seasonLabel,
        note: review.note,
        createdAt: toCreatedAt(review.dateLabel, seedNow)
      },
      create: {
        id: review.id,
        userId: user.id,
        foodItemId: foodItem.id,
        venueId: venue.id,
        gameDayKey: toGameDayKey(review, seedNow),
        slopScore: review.slopScore,
        napkinRating: review.napkinRating,
        labels: review.labels.map(consensusLabel),
        verifiedGameDay: review.verifiedGameDay,
        seasonLabel: review.seasonLabel,
        note: review.note,
        createdAt: toCreatedAt(review.dateLabel, seedNow)
      }
    });

    if (review.hasPhoto) {
      await prisma.foodPhoto.upsert({
        where: { id: `photo-${review.id}` },
        update: {
          foodItemId: foodItem.id,
          venueId: venue.id,
          reviewId: review.id,
          uploaderUserId: user.id,
          photoType: review.hasMenuPriceProof
            ? PhotoType.MENU_PRICE_PROOF
            : PhotoType.FOOD,
          placeholder: review.photoPlaceholder,
          alt: review.photoAlt ?? `Fan-uploaded photo for ${foodItem.name}`,
          caption: review.photoLabel,
          verifiedOnSite: review.verifiedGameDay,
          createdAt: toCreatedAt(review.dateLabel, seedNow)
        },
        create: {
          id: `photo-${review.id}`,
          foodItemId: foodItem.id,
          venueId: venue.id,
          reviewId: review.id,
          uploaderUserId: user.id,
          photoType: review.hasMenuPriceProof
            ? PhotoType.MENU_PRICE_PROOF
            : PhotoType.FOOD,
          placeholder: review.photoPlaceholder,
          alt: review.photoAlt ?? `Fan-uploaded photo for ${foodItem.name}`,
          caption: review.photoLabel,
          verifiedOnSite: review.verifiedGameDay,
          createdAt: toCreatedAt(review.dateLabel, seedNow)
        }
      });
    }
  }

  for (const photo of foodPhotos) {
    await upsertUser(uploaderForName(photo.uploadedBy, photo.venueSlug));

    const uploader = await prisma.user.findUniqueOrThrow({
      where: { id: `user-${slugify(photo.uploadedBy)}` }
    });
    const venue = await prisma.venue.findUniqueOrThrow({
      where: { slug: photo.venueSlug }
    });
    const foodItem = await prisma.foodItem.findUniqueOrThrow({
      where: {
        venueId_slug: {
          venueId: venue.id,
          slug: photo.foodSlug
        }
      }
    });

    await prisma.foodPhoto.upsert({
      where: { id: photo.id },
      update: {
        foodItemId: foodItem.id,
        venueId: venue.id,
        uploaderUserId: uploader.id,
        photoType: PhotoType.FOOD,
        placeholder: photo.imagePlaceholder,
        alt: photo.alt,
        caption: photo.caption,
        verifiedOnSite: photo.verifiedOnSite,
        createdAt: toCreatedAt(photo.createdAt, seedNow)
      },
      create: {
        id: photo.id,
        foodItemId: foodItem.id,
        venueId: venue.id,
        uploaderUserId: uploader.id,
        photoType: PhotoType.FOOD,
        placeholder: photo.imagePlaceholder,
        alt: photo.alt,
        caption: photo.caption,
        verifiedOnSite: photo.verifiedOnSite,
        createdAt: toCreatedAt(photo.createdAt, seedNow)
      }
    });
  }

  const density = await applyDemoDensitySeed(prisma, seedNow);

  console.log(
    `Seeded ${venues.length} venues, ${vendors.length} vendors, ${foodItems.length} items, ${foodReviews.length} reviews, ${foodPhotos.length} sample photos, ${density.demoReviewsUpserted} demo-density reviews (${density.demoPhotosUpserted} placeholder photos, ${density.demoHelpfulUpserted} helpful likes). ` +
      (density.demoReviewsSkippedMissingItem
        ? `Skipped ${density.demoReviewsSkippedMissingItem} demo rows (missing venue/item).`
        : "")
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
