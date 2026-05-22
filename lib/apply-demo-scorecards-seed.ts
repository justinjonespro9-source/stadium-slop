import {
  ConsensusLabel,
  PhotoType,
  PriceCheck,
  PrismaClient,
  ReplayValue
} from "@prisma/client";

import {
  assertDevDemoScorecardsAllowed,
  resolveDemoScorecardTargetFromEnv
} from "@/lib/dev-demo-scorecards";
import { DEMO_USERS, slugifyDemoEmailLocalPart } from "@/lib/demo-density-seed";

const DEV_SCORECARD_PREFIX = "dev-scorecard";
const SEASON_LABEL = String(new Date().getFullYear());

/** Stable Picsum URLs for local flip/Rolodex testing (dev seed only). */
const DEV_PHOTO_URLS = [
  "https://picsum.photos/seed/stadium-slop-scorecard-1/480/600",
  "https://picsum.photos/seed/stadium-slop-scorecard-2/480/600",
  "https://picsum.photos/seed/stadium-slop-scorecard-3/480/600"
] as const;

type DevScorecardSpec = {
  suffix: string;
  userIdx: number;
  slopScore: number;
  napkinRating: 1 | 2 | 3 | 4 | 5;
  labels: ConsensusLabel[];
  replayValue: ReplayValue;
  priceCheck: PriceCheck;
  note: string;
  helpfulLikers: number[];
  photoUrl: string;
  photoEmoji?: string;
  verifiedGameDay?: boolean;
};

function devScorecardSpecs(): DevScorecardSpec[] {
  return [
    {
      suffix: "01",
      userIdx: 0,
      slopScore: 8.7,
      napkinRating: 3,
      labels: [ConsensusLabel.RUN_IT_BACK, ConsensusLabel.WORTH_THE_WALK],
      replayValue: ReplayValue.GAME_DAY_STARTER,
      priceCheck: PriceCheck.WORTH_THE_PRICE_OF_ADMISSION,
      note: "Elote cup hits — lime and cotija pop without drowning the corn.",
      helpfulLikers: [1, 2, 4],
      photoUrl: DEV_PHOTO_URLS[0],
      photoEmoji: "🌽"
    },
    {
      suffix: "02",
      userIdx: 2,
      slopScore: 4.2,
      napkinRating: 4,
      labels: [ConsensusLabel.STADIUM_TAX, ConsensusLabel.BENCH_IT],
      replayValue: ReplayValue.CUT_FROM_THE_ROSTER,
      priceCheck: PriceCheck.STADIUM_TAX,
      note: "Line chaos, lukewarm cup — needed the photo to prove it.",
      helpfulLikers: [3],
      photoUrl: DEV_PHOTO_URLS[1],
      photoEmoji: "🌽",
      verifiedGameDay: false
    },
    {
      suffix: "03",
      userIdx: 5,
      slopScore: 9.1,
      napkinRating: 2,
      labels: [ConsensusLabel.RUN_IT_BACK, ConsensusLabel.STEAL],
      replayValue: ReplayValue.GAME_DAY_STARTER,
      priceCheck: PriceCheck.FAIR_DEAL,
      note: "Would detour from any section for this again.",
      helpfulLikers: [6, 7, 8, 9],
      photoUrl: DEV_PHOTO_URLS[2],
      photoEmoji: "🌽"
    }
  ];
}

export type DemoScorecardsSeedResult = {
  venueSlug: string;
  foodSlug: string;
  itemPath: string;
  reviewsUpserted: number;
  photosUpserted: number;
  helpfulUpserted: number;
  skipped: boolean;
  skipReason?: string;
};

export async function applyDemoScorecardsSeed(
  prisma: PrismaClient,
  seedNow = new Date()
): Promise<DemoScorecardsSeedResult> {
  assertDevDemoScorecardsAllowed("applyDemoScorecardsSeed");

  const { venueSlug, foodSlug } = resolveDemoScorecardTargetFromEnv();
  const itemPath = `/venues/${venueSlug}/${foodSlug}#fan-photo-reviews`;

  const venue = await prisma.venue.findFirst({
    where: { slug: venueSlug, status: "ACTIVE" },
    select: { id: true, slug: true, leagues: true }
  });

  const foodItem = venue
    ? await prisma.foodItem.findFirst({
        where: {
          venueId: venue.id,
          slug: foodSlug,
          status: "ACTIVE"
        },
        select: { id: true, slug: true, name: true }
      })
    : null;

  if (!venue || !foodItem) {
    return {
      venueSlug,
      foodSlug,
      itemPath,
      reviewsUpserted: 0,
      photosUpserted: 0,
      helpfulUpserted: 0,
      skipped: true,
      skipReason: `Missing ACTIVE venue/item (${venueSlug} / ${foodSlug}). Import MLB menu first.`
    };
  }

  const isMlb =
    venue.leagues.some((l) => l.toUpperCase().includes("MLB")) ||
    venue.leagues.some((l) => l.toLowerCase().includes("baseball"));

  if (!isMlb) {
    console.warn(
      `[${DEV_SCORECARD_PREFIX}] target venue ${venueSlug} is not tagged MLB — seeding anyway for UI testing.`
    );
  }

  for (const u of DEMO_USERS) {
    const emailLocal = slugifyDemoEmailLocalPart(u.id);
    await prisma.user.upsert({
      where: { id: u.id },
      update: { displayName: u.displayName, handle: u.handle },
      create: {
        id: u.id,
        email: `${emailLocal}@demo.stadium-slop.invalid`,
        displayName: u.displayName,
        handle: u.handle
      }
    });
  }

  let reviewsUpserted = 0;
  let photosUpserted = 0;
  let helpfulUpserted = 0;

  for (const spec of devScorecardSpecs()) {
    const user = DEMO_USERS[spec.userIdx];
    if (!user) {
      throw new Error(`Invalid demo userIdx ${spec.userIdx}`);
    }

    const reviewId = `${DEV_SCORECARD_PREFIX}-review-${venueSlug}-${spec.suffix}`;
    const photoId = `${DEV_SCORECARD_PREFIX}-photo-${venueSlug}-${spec.suffix}`;
    const gameDayKey = `${SEASON_LABEL}-${venueSlug}-${DEV_SCORECARD_PREFIX}-${spec.suffix}`;
    const createdAt = new Date(
      seedNow.getTime() - Number(spec.suffix) * 86_400_000
    );

    await prisma.review.upsert({
      where: { id: reviewId },
      update: {
        userId: user.id,
        foodItemId: foodItem.id,
        venueId: venue.id,
        gameDayKey,
        slopScore: spec.slopScore,
        napkinRating: spec.napkinRating,
        labels: spec.labels,
        replayValue: spec.replayValue,
        priceCheck: spec.priceCheck,
        verifiedGameDay: spec.verifiedGameDay ?? false,
        seasonLabel: SEASON_LABEL,
        note: spec.note,
        status: "ACTIVE",
        createdAt
      },
      create: {
        id: reviewId,
        userId: user.id,
        foodItemId: foodItem.id,
        venueId: venue.id,
        gameDayKey,
        slopScore: spec.slopScore,
        napkinRating: spec.napkinRating,
        labels: spec.labels,
        replayValue: spec.replayValue,
        priceCheck: spec.priceCheck,
        verifiedGameDay: spec.verifiedGameDay ?? false,
        seasonLabel: SEASON_LABEL,
        note: spec.note,
        status: "ACTIVE",
        createdAt
      }
    });
    reviewsUpserted += 1;

    await prisma.foodPhoto.upsert({
      where: { id: photoId },
      update: {
        foodItemId: foodItem.id,
        venueId: venue.id,
        reviewId,
        uploaderUserId: user.id,
        photoType: PhotoType.FOOD,
        url: spec.photoUrl,
        placeholder: spec.photoEmoji ?? null,
        alt: `Dev scorecard photo — ${foodItem.name}`,
        caption: spec.note,
        verifiedOnSite: spec.verifiedGameDay ?? false,
        status: "ACTIVE",
        createdAt
      },
      create: {
        id: photoId,
        foodItemId: foodItem.id,
        venueId: venue.id,
        reviewId,
        uploaderUserId: user.id,
        photoType: PhotoType.FOOD,
        url: spec.photoUrl,
        placeholder: spec.photoEmoji ?? null,
        alt: `Dev scorecard photo — ${foodItem.name}`,
        caption: spec.note,
        verifiedOnSite: spec.verifiedGameDay ?? false,
        status: "ACTIVE",
        createdAt
      }
    });
    photosUpserted += 1;

    for (const likerIdx of spec.helpfulLikers) {
      const liker = DEMO_USERS[likerIdx];
      if (!liker || liker.id === user.id) {
        continue;
      }
      await prisma.helpfulLike.upsert({
        where: {
          userId_reviewId: {
            userId: liker.id,
            reviewId
          }
        },
        update: {},
        create: {
          userId: liker.id,
          reviewId
        }
      });
      helpfulUpserted += 1;
    }
  }

  return {
    venueSlug,
    foodSlug,
    itemPath,
    reviewsUpserted,
    photosUpserted,
    helpfulUpserted,
    skipped: false
  };
}
