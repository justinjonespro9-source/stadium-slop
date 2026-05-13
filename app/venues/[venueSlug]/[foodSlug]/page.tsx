import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  getPublicFoodItemBySlug,
  getPublicFoodItemsByVendorSlug,
  getPublicPhotosForFoodItem,
  getPublicVendorForFoodItem,
  getPublicVenueBySlug
} from "@/lib/public-data";
import type { FoodPhoto, FoodReview } from "@/lib/sample-data";
import { prisma } from "@/lib/prisma";
import { getDbBackedItemSlopStats, getSlopScoreTier } from "@/lib/slop-stats";
import {
  MOCK_REVIEWER_USER_ID,
  MOCK_USER_COOKIE_NAME,
  hasMockUserAccess
} from "@/lib/user-auth";
import { ensureMockReviewerUser } from "@/lib/mock-user";
import { isNapkinEligibleItem } from "@/lib/item-eligibility";

export const dynamic = "force-dynamic";

type FoodPageProps = {
  params: Promise<{
    venueSlug: string;
    foodSlug: string;
  }>;
  searchParams?: Promise<{
    reviewSubmitted?: string;
    photoError?: string;
  }>;
};

function getReviewerInitials(review: {
  reviewerName?: string;
  reviewerHandle?: string;
}) {
  const label = review.reviewerName ?? review.reviewerHandle ?? "Fan";
  const words = label.replace("@", "").split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getPrimaryConsensusLabel(review: { labels: string[] }) {
  return review.labels[0] ?? "Fan Rating";
}

/** Newest review photos first, then other fan photos; URLs deduped so the hero is not repeated downstream. */
function buildFanPhotoLayout(
  reviews: FoodReview[],
  photos: FoodPhoto[],
  foodName: string
) {
  const orderedUnique: {
    url: string;
    alt: string;
    review: FoodReview | null;
  }[] = [];
  const seenUrls = new Set<string>();

  for (const review of reviews) {
    if (!review.photoUrl || seenUrls.has(review.photoUrl)) {
      continue;
    }
    seenUrls.add(review.photoUrl);
    orderedUnique.push({
      url: review.photoUrl,
      alt: review.photoAlt ?? `Fan-uploaded photo for ${foodName}`,
      review
    });
  }

  for (const photo of photos) {
    if (!photo.imageUrl || seenUrls.has(photo.imageUrl)) {
      continue;
    }
    seenUrls.add(photo.imageUrl);
    orderedUnique.push({
      url: photo.imageUrl,
      alt: photo.alt,
      review: null
    });
  }

  const heroEntry = orderedUnique[0];
  const additionalFanPhotos = orderedUnique.slice(1);
  const photoBackedReviews = orderedUnique
    .map((entry) => entry.review)
    .filter((r): r is FoodReview => r != null);

  return {
    heroEntry,
    additionalFanPhotos,
    photoBackedReviews
  };
}

async function markReviewHelpful(formData: FormData) {
  "use server";

  const venueSlug = String(formData.get("venueSlug") ?? "");
  const foodSlug = String(formData.get("foodSlug") ?? "");
  const reviewId = String(formData.get("reviewId") ?? "");
  const itemPath = `/venues/${venueSlug}/${foodSlug}`;
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );

  if (!isSignedIn) {
    redirect(`/login?next=${encodeURIComponent(itemPath)}`);
  }

  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      status: "ACTIVE",
      foodItem: {
        slug: foodSlug,
        venue: {
          slug: venueSlug
        }
      }
    },
    include: {
      venue: true
    }
  });

  if (!review) {
    redirect(itemPath);
  }

  const user = await ensureMockReviewerUser(review.venueId);

  await prisma.helpfulLike.upsert({
    where: {
      userId_reviewId: {
        userId: user.id,
        reviewId: review.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      reviewId: review.id
    }
  });

  revalidatePath(itemPath);
  redirect(`${itemPath}?helpful=marked`);
}

async function submitPriceReport(formData: FormData) {
  "use server";

  const venueSlug = String(formData.get("venueSlug") ?? "");
  const foodSlug = String(formData.get("foodSlug") ?? "");
  const itemPath = `/venues/${venueSlug}/${foodSlug}`;
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );

  if (!isSignedIn) {
    redirect(`/login?next=${encodeURIComponent(itemPath)}`);
  }

  const reportedPrice = Number(formData.get("reportedPrice"));
  const note = String(formData.get("priceNote") ?? "").trim();

  if (!Number.isFinite(reportedPrice) || reportedPrice <= 0) {
    redirect(`${itemPath}?price=invalid`);
  }

  const venue = await prisma.venue.findUnique({ where: { slug: venueSlug } });
  const foodItem = venue
    ? await prisma.foodItem.findUnique({
        where: {
          venueId_slug: {
            venueId: venue.id,
            slug: foodSlug
          }
        }
      })
    : null;

  if (!venue || !foodItem) {
    redirect(itemPath);
  }

  const user = await ensureMockReviewerUser(venue.id);

  await prisma.priceReport.create({
    data: {
      userId: user.id,
      venueId: venue.id,
      foodItemId: foodItem.id,
      reportedPrice,
      note: note ? note.slice(0, 240) : null
    }
  });

  revalidatePath(itemPath);
  redirect(`${itemPath}?price=reported`);
}

async function getPriceIntel(
  venueSlug: string,
  foodSlug: string,
  fallbackItem: {
    price: number;
    reportedPrice?: number;
    priceReportCount?: number;
  }
) {
  try {
    const item = await prisma.foodItem.findFirst({
      where: {
        slug: foodSlug,
        venue: {
          slug: venueSlug
        }
      },
      include: {
        priceReports: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            reportedPrice: true,
            status: true
          }
        },
        _count: {
          select: {
            priceReports: true
          }
        }
      }
    });

    const approvedReport = item?.priceReports.find(
      (report) => report.status === "APPROVED" || report.status === "MERGED"
    );

    return {
      displayPrice:
        approvedReport?.reportedPrice ??
        item?.reportedPrice ??
        item?.basePrice ??
        null,
      reportCount: item?._count.priceReports ?? 0,
      source: approvedReport ? "approved fan report" : "fan reported"
    };
  } catch (error) {
    console.warn("Falling back to sample price intel", error);
    return {
      displayPrice: fallbackItem.reportedPrice ?? fallbackItem.price,
      reportCount: fallbackItem.priceReportCount ?? 0,
      source: "fan reported"
    };
  }
}

async function getLikedReviewIds(reviewIds: string[]) {
  if (reviewIds.length === 0) {
    return new Set<string>();
  }

  try {
    const helpfulLikes = await prisma.helpfulLike.findMany({
      where: {
        userId: MOCK_REVIEWER_USER_ID,
        reviewId: {
          in: reviewIds
        }
      },
      select: {
        reviewId: true
      }
    });

    return new Set(helpfulLikes.map((like) => like.reviewId));
  } catch (error) {
    console.warn("Falling back to unliked review cards", error);
    return new Set<string>();
  }
}

export default async function FoodPage({ params, searchParams }: FoodPageProps) {
  const { venueSlug, foodSlug } = await params;
  const query = (await searchParams) ?? {};
  const showReviewSaved = query.reviewSubmitted === "true";
  const photoError = query.photoError;

  const photoErrorFollowUp =
    photoError === "too_large"
      ? "Your ratings are live, but the photo was over the 4MB limit. Try a smaller JPEG or PNG from your camera roll."
      : photoError === "heic"
        ? "Your ratings are live, but HEIC/HEIF is not supported yet. On iPhone use Settings → Camera → Formats → “Most Compatible”, or export the shot as JPEG, then add it from Review this item."
        : photoError === "unsupported"
          ? "Your ratings are live, but that file was not a supported image type. Use JPEG, PNG, WebP, or GIF."
          : photoError === "cloudinary"
            ? "Your ratings are live, but the server is not configured for photo uploads (missing Cloudinary env vars)."
            : photoError === "photo_save"
              ? "Your ratings are live and the image reached our host, but saving the photo link failed. Try submitting the photo again from Review this item."
              : photoError === "upload" || photoError
                ? "Your ratings are live, but the fan photo failed to upload. Check your connection and try again with JPEG or PNG under 4MB."
                : null;

  const venue = await getPublicVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const foodItem = await getPublicFoodItemBySlug(venue.slug, foodSlug);

  if (!foodItem || foodItem.venueSlug !== venue.slug) {
    notFound();
  }

  const napkinEligible = isNapkinEligibleItem(foodItem);

  const vendor = await getPublicVendorForFoodItem(foodItem);
  const foodPhotos = await getPublicPhotosForFoodItem(venue.slug, foodItem.slug);
  const priceIntel = await getPriceIntel(venue.slug, foodItem.slug, foodItem);
  const careerStats = await getDbBackedItemSlopStats(
    venue.slug,
    foodItem.slug,
    "allTime"
  );
  const seasonStats = await getDbBackedItemSlopStats(
    venue.slug,
    foodItem.slug,
    "season"
  );
  const slopTier = getSlopScoreTier(seasonStats.averageSlopScore);
  const freshStats = await getDbBackedItemSlopStats(
    venue.slug,
    foodItem.slug,
    "gameDayFresh"
  );

  const { heroEntry, additionalFanPhotos, photoBackedReviews } = buildFanPhotoLayout(
    careerStats.reviews,
    foodPhotos,
    foodItem.name
  );

  const heroImageUrl = heroEntry?.url;
  const heroAlt =
    heroEntry?.alt ?? `${foodItem.name} fan photo`;
  const heroEmoji =
    foodPhotos.find((p) => !p.imageUrl)?.imagePlaceholder ??
    foodPhotos[0]?.imagePlaceholder ??
    "🍔";
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );
  const likedReviewIds = isSignedIn
    ? await getLikedReviewIds(photoBackedReviews.map((review) => review.id))
    : new Set<string>();
  const moreFromVendor = vendor
    ? (await getPublicFoodItemsByVendorSlug(venue.slug, vendor.slug)).filter(
        (item) => item.slug !== foodItem.slug
      )
    : [];

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10">
        <Link
          href={`/venues/${venue.slug}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to {venue.name}
        </Link>

        {showReviewSaved ? (
          <div
            role="status"
            className={
              photoErrorFollowUp
                ? "mt-4 rounded-2xl border border-amber-800/80 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
                : "mt-4 rounded-2xl border border-emerald-800/80 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
            }
          >
            <p className="font-bold">Review saved</p>
            <p
              className={
                photoErrorFollowUp ? "mt-1 text-amber-100/95" : "mt-1 text-emerald-200/90"
              }
            >
              {photoErrorFollowUp ??
                "Thanks — Season Standings and Game Day Fresh update from structured signals and any fan photos you added."}
            </p>
          </div>
        ) : null}

        <header className="grid gap-4 py-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div
            aria-label={heroAlt}
            className="brand-card relative aspect-[16/10] overflow-hidden rounded-3xl border lg:order-2"
          >
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={heroAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
              />
            ) : (
              <div className="flex h-full min-h-[12rem] items-center justify-center text-7xl sm:text-8xl">
                {heroEmoji}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <p className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                {foodItem.itemType} · {foodItem.category}
              </p>
              {foodItem.ageRestricted ? (
                <p className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                  21+
                </p>
              ) : null}
              {foodItem.isPromoted ? (
                <p className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                  Promoted
                </p>
              ) : null}
              {foodItem.isNewThisSeason ? (
                <p className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                  New This Season
                </p>
              ) : null}
              {foodItem.venueBadge ? (
                <p className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                  {foodItem.venueBadge}
                </p>
              ) : null}
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-6xl">
              {foodItem.name}
            </h1>
            <p className="mt-3 text-base leading-7 text-zinc-300 sm:text-lg">
              {foodItem.description}
            </p>
            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              {venue.name} · {vendor ? vendor.name : "Vendor TBD"} ·{" "}
              {foodItem.location}
            </p>

            <div className="brand-panel mt-4 rounded-2xl border p-3">
              <p className="text-sm font-bold leading-6 text-zinc-200">
                <span className="text-[var(--slop-orange)]">
                  Slop Score {seasonStats.averageSlopScore.toFixed(1)}
                </span>{" "}
                · {slopTier}
                · Fresh
                Signal{" "}
                {freshStats.reviewCount > 0
                  ? `${freshStats.averageSlopScore.toFixed(1)} today`
                  : "pending"}{" "}
                · {seasonStats.reviewCount} reviews
                {napkinEligible ? (
                  <>
                    {" "}
                    · {seasonStats.roundedNapkinRating} Napkins
                  </>
                ) : null}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                Current price{" "}
                {priceIntel.displayPrice
                  ? `$${Number(priceIntel.displayPrice).toFixed(2)}`
                  : "pending"}{" "}
                {foodItem.priceLastConfirmedLabel
                  ? `· ${foodItem.priceLastConfirmedLabel}`
                  : ""}
                {priceIntel.reportCount
                  ? ` · ${priceIntel.reportCount} ${priceIntel.source} reports`
                  : ""}
              </p>
            </div>
          </div>
        </header>

        {foodItem.freshSignal ? (
          <section className="mt-2 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Fresh Review Signal / Fresh Meter
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black sm:text-3xl">
                {foodItem.freshSignal}
              </h2>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm font-bold text-zinc-300">
                {foodItem.freshReviewCount} fresh reviews{" "}
                {foodItem.freshWindowLabel}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
              {foodItem.freshSignalReason}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-zinc-500">
              Season Standings show the long-term read. Game Day Fresh shows
              what fans are seeing right now.
            </p>
          </section>
        ) : null}

        <section className="brand-panel mt-2 rounded-3xl border p-4 sm:p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Review this item
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Help move the Season Standings
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Help move the venue Season Standings. Verified reviews require a free
            profile and an on-site location check.
          </p>
          <Link
            href={`/venues/${venue.slug}/${foodItem.slug}/review`}
            className="brand-cta mt-4 inline-flex w-full justify-center rounded-full px-6 py-4 text-sm font-black transition sm:w-auto"
          >
            Review this item
          </Link>
        </section>

        {additionalFanPhotos.length > 0 ? (
          <section className="mt-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-3 sm:px-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              More fan shots
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {additionalFanPhotos.map((entry) => (
                <div
                  key={entry.url}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-black"
                >
                  <Image
                    src={entry.url}
                    alt={entry.alt}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-2 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Fan Signals
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Slop Score, replay, and value
          </h2>

          <div
            className={`mt-5 grid grid-cols-2 gap-2 ${napkinEligible ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
          >
            <div className="rounded-2xl bg-black p-3">
              <p className="text-sm text-zinc-500">Slop Score</p>
              <p className="mt-1 text-2xl font-black">
                {careerStats.averageSlopScore.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{slopTier}</p>
            </div>
            {napkinEligible ? (
              <div className="rounded-2xl bg-black p-3">
                <p className="text-sm text-zinc-500">Napkin Avg</p>
                <p className="mt-1 text-2xl font-black">
                  {careerStats.averageNapkinRating.toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Displays as {careerStats.roundedNapkinRating}/5
                </p>
              </div>
            ) : null}
            <div className="rounded-2xl bg-black p-3">
              <p className="text-sm text-zinc-500">Reviews</p>
              <p className="mt-1 text-2xl font-black">
                {careerStats.reviewCount}
              </p>
            </div>
            <div className="rounded-2xl bg-black p-3">
              <p className="text-sm text-zinc-500">Helpful Likes</p>
              <p className="mt-1 text-2xl font-black">
                {careerStats.helpfulLikesTotal}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              ["Replay Value", careerStats.replayValue],
              ["Price Check", careerStats.priceCheck]
            ].map(([title, stats]) => (
              <div key={title as string} className="rounded-3xl bg-black p-4">
                <h3 className="font-black">{title as string}</h3>
                <div className="mt-4 space-y-3">
                  {(stats as typeof careerStats.replayValue).map((stat) => (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-zinc-300">
                          {stat.label}
                        </span>
                        <span className="text-zinc-500">{stat.percentage}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-950">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-5 sm:py-7">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Fan Signals
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            What fans are saying
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-5">
              <p className="text-sm text-zinc-500">Slop Score</p>
              <p className="mt-1 text-2xl font-black sm:text-3xl">
                {seasonStats.averageSlopScore.toFixed(1)}
              </p>
              <p className="mt-1 text-xs font-bold text-zinc-500">{slopTier}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-5">
              <p className="text-sm text-zinc-500">Verdict</p>
              <p className="mt-1 text-base font-black sm:text-xl">
                {foodItem.verdict}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-5">
              <p className="text-sm text-zinc-500">Replay Value</p>
              <p className="mt-1 text-base font-black sm:text-xl">
                {seasonStats.topReplayValue?.label ?? "Pending"}
              </p>
              {seasonStats.topReplayValue ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {seasonStats.topReplayValue.percentage}% of signals
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-5">
              <p className="text-sm text-zinc-500">Price Check</p>
              <p className="mt-1 text-base font-black sm:text-xl">
                {seasonStats.topPriceCheck?.label ?? "Pending"}
              </p>
              {seasonStats.topPriceCheck ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {seasonStats.topPriceCheck.percentage}% of signals
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-5">
              <p className="text-sm text-zinc-500">Served Right</p>
              <p className="mt-1 text-base font-black sm:text-xl">
                {foodItem.servedRightLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-5">
              <p className="text-sm text-zinc-500">Line Wait</p>
              <p className="mt-1 text-base font-black sm:text-xl">
                {foodItem.lineWaitLabel}
              </p>
            </div>
            {napkinEligible ? (
              <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:col-span-2 sm:p-5">
                <p className="text-sm text-zinc-500">Napkin Rating</p>
                <p className="mt-1 text-base font-black sm:text-xl">
                  {seasonStats.roundedNapkinRating}/5 napkins
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {foodItem.napkinLabel}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-6 sm:py-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Photo-backed reviews
              </p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                From fans in the seats
              </h2>
            </div>
            <p className="max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
              Same photo is not repeated below the hero. Text-only reviews still
              move Season Standings and Fresh.
            </p>
          </div>

          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-3">
            {photoBackedReviews.length > 0 ? (
              photoBackedReviews.map((review) => {
                const heroDup =
                  Boolean(heroImageUrl) && review.photoUrl === heroImageUrl;

                return (
                  <article
                    key={review.id}
                    className="min-w-[min(100%,22rem)] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 sm:min-w-[20rem]"
                  >
                    {heroDup ? (
                      <div className="flex gap-3 p-4 sm:p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--slop-surface)] bg-[var(--slop-cream)] text-xs font-black text-[var(--slop-ink)]">
                          {getReviewerInitials(review)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[var(--slop-orange)] px-2 py-0.5 text-xs font-black text-[var(--slop-ink)]">
                              {review.slopScore.toFixed(1)}/10
                            </span>
                            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
                              Verified on-site
                            </span>
                            {review.verifiedGameDay ? (
                              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
                                Game-day
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-xs text-zinc-500">
                            Fan photo is the hero image above
                            {review.photoLabel ? ` · ${review.photoLabel}` : ""}.
                          </p>
                          <p className="mt-2 text-sm font-bold text-zinc-200">
                            {getPrimaryConsensusLabel(review)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {review.reviewerName ?? "Fan"} ·{" "}
                            {review.reviewerHandle ?? "reviewer"} ·{" "}
                            {review.dateLabel}
                          </p>
                          {review.note ? (
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                              {review.note}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          aria-label={
                            review.photoAlt ??
                            `Fan-uploaded photo for ${foodItem.name}`
                          }
                          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-black"
                        >
                          {review.photoUrl ? (
                            <Image
                              src={review.photoUrl}
                              alt={
                                review.photoAlt ?? `Fan photo for ${foodItem.name}`
                              }
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 90vw, 22rem"
                            />
                          ) : null}
                        </div>
                        <div className="absolute -bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--slop-surface)] bg-[var(--slop-cream)] text-xs font-black text-[var(--slop-ink)]">
                          {getReviewerInitials(review)}
                        </div>
                        <span className="absolute right-3 top-3 rounded-full bg-[var(--slop-orange)] px-2 py-0.5 text-xs font-black text-[var(--slop-ink)]">
                          {review.slopScore.toFixed(1)}/10
                        </span>
                        <span className="absolute left-3 top-3 max-w-[55%] truncate rounded-full border border-zinc-700 bg-black/80 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-300">
                          {review.photoLabel ?? "Fan photo"}
                        </span>
                      </div>
                    )}

                    <div
                      className={
                        heroDup ? "px-4 pb-4 sm:px-4" : "p-4 pt-6 sm:p-4 sm:pt-6"
                      }
                    >
                      {!heroDup ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black">
                              {getPrimaryConsensusLabel(review)}
                            </h3>
                            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-300">
                              Verified on-site
                            </span>
                            {review.verifiedGameDay ? (
                              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-300">
                                Verified game-day
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-zinc-500">
                            {review.reviewerName ?? "Fan"} ·{" "}
                            {review.reviewerHandle ?? "reviewer"}
                          </p>
                          {review.note ? (
                            <p className="mt-3 text-sm leading-6 text-zinc-300">
                              {review.note}
                            </p>
                          ) : null}
                        </>
                      ) : null}

                      <div
                        className={
                          heroDup ? "mt-3 rounded-xl bg-black p-3" : "mt-4 rounded-xl bg-black p-3"
                        }
                      >
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-zinc-600">
                          Breakdown
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-zinc-600">Consensus</p>
                            <p className="mt-0.5 font-bold text-white">
                              {getPrimaryConsensusLabel(review)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600">Slop Score</p>
                            <p className="mt-0.5 font-bold text-white">
                              {review.slopScore.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600">Review Date</p>
                            <p className="mt-0.5 font-bold text-white">
                              {review.dateLabel}
                            </p>
                          </div>
                          {napkinEligible ? (
                            <div>
                              <p className="text-xs text-zinc-600">Napkins</p>
                              <p className="mt-0.5 font-bold text-white">
                                {review.napkinRating}/5
                              </p>
                            </div>
                          ) : null}
                        </div>
                        {isSignedIn ? (
                          likedReviewIds.has(review.id) ? (
                            <button
                              type="button"
                              disabled
                              className="mt-3 cursor-not-allowed rounded-full border border-[var(--slop-orange)] px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-orange)]"
                            >
                              Marked helpful · {review.helpfulLikes}
                            </button>
                          ) : (
                            <form action={markReviewHelpful}>
                              <input
                                type="hidden"
                                name="venueSlug"
                                value={venue.slug}
                              />
                              <input
                                type="hidden"
                                name="foodSlug"
                                value={foodItem.slug}
                              />
                              <input
                                type="hidden"
                                name="reviewId"
                                value={review.id}
                              />
                              <button
                                type="submit"
                                className="mt-3 rounded-full border border-zinc-800 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                              >
                                Mark helpful · {review.helpfulLikes}
                              </button>
                            </form>
                          )
                        ) : (
                          <Link
                            href={`/login?next=${encodeURIComponent(
                              `/venues/${venue.slug}/${foodItem.slug}`
                            )}`}
                            className="mt-3 inline-flex rounded-full border border-zinc-800 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                          >
                            Sign in to mark helpful · {review.helpfulLikes}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm leading-6 text-zinc-500">
                No photo-backed reviews yet. Submit a review with a photo to show
                what showed up, or keep rating without a photo — stats still
                count.
              </p>
            )}
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-600 sm:text-sm">
            Official scores use structured signals. Helpful likes need a
            signed-in profile — no comments, dislikes, DMs, or followers.
          </p>
        </section>


        {vendor && moreFromVendor.length > 0 ? (
          <section className="border-t border-zinc-800 py-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                  More from this vendor
                </p>
                <h2 className="mt-2 text-2xl font-black">{vendor.name}</h2>
              </div>
              <Link
                href={`/venues/${venue.slug}/vendors/${vendor.slug}`}
                className="text-sm font-bold text-zinc-400 hover:text-white"
              >
                Open vendor
              </Link>
            </div>

            <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
              {moreFromVendor.map((item) => (
                <Link
                  key={item.slug}
                  href={`/venues/${venue.slug}/${item.slug}`}
                  className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-4 transition last:border-b-0 hover:bg-black"
                >
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.itemType} · {item.location}
                    </p>
                  </div>
                  <span className="text-sm font-black">
                    {item.slopScore.toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-zinc-800 py-10">
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-2">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Food Details
              </p>
              <div className="mt-6 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Venue</p>
                  <p className="mt-1 font-bold text-white">{venue.name}</p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Vendor</p>
                  <p className="mt-1 font-bold text-white">
                    {vendor ? vendor.name : "Vendor TBD"}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">City</p>
                  <p className="mt-1 font-bold text-white">
                    {venue.city}, {venue.state}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Category</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.category}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Item Type</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.itemType}
                  </p>
                </div>
                {foodItem.beverageStyle ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Beverage Style</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.beverageStyle}
                    </p>
                  </div>
                ) : null}
                {foodItem.ageRestricted ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Age Restricted</p>
                    <p className="mt-1 font-bold text-white">21+</p>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Location</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.location}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Reported Price</p>
                  <p className="mt-1 font-bold text-white">
                    {priceIntel.displayPrice
                      ? `$${Number(priceIntel.displayPrice).toFixed(2)}`
                      : "Price pending"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {priceIntel.source}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Price Confidence</p>
                  <p className="mt-1 font-bold text-white">
                    {priceIntel.reportCount
                      ? `${priceIntel.reportCount} fan reports`
                      : "Not enough reports"}
                  </p>
                  {foodItem.priceLastConfirmedLabel ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      Last confirmed {foodItem.priceLastConfirmedLabel}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Availability</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.availabilityStatus ?? "Status pending"}
                  </p>
                </div>
                {foodItem.venueBadge ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Venue Badge</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.venueBadge}
                    </p>
                  </div>
                ) : null}
                {foodItem.seasonIntroduced ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Season Introduced</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.seasonIntroduced}
                    </p>
                  </div>
                ) : null}
                {foodItem.lastConfirmed ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Last Confirmed</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.lastConfirmed}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 rounded-2xl bg-black p-4">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Listing Note
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  This listing is based on fan-reported or verified concession
                  intel. Descriptions are written by Stadium Slop, not copied
                  from official menus.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Report Price
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Help keep prices accurate. Reports stay pending approval until
                  an admin reviews them.
                </p>
                {isSignedIn ? (
                  <form action={submitPriceReport} className="mt-4 grid gap-3">
                    <input type="hidden" name="venueSlug" value={venue.slug} />
                    <input type="hidden" name="foodSlug" value={foodItem.slug} />
                    <input
                      name="reportedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="13.99"
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                    />
                    <textarea
                      name="priceNote"
                      maxLength={240}
                      placeholder="Optional: menu board, section, or date context"
                      className="min-h-20 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                    />
                    <button
                      type="submit"
                      className="brand-cta rounded-full px-5 py-3 text-sm font-black"
                    >
                      Submit price report
                    </button>
                  </form>
                ) : (
                  <Link
                    href={`/login?next=${encodeURIComponent(
                      `/venues/${venue.slug}/${foodItem.slug}`
                    )}`}
                    className="mt-4 inline-flex rounded-full border border-zinc-700 px-5 py-3 text-sm font-black text-zinc-400"
                  >
                    Sign in to report price
                  </Link>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {foodItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Venue Context
              </p>
              <p className="mt-4 text-2xl font-black">{venue.venueType}</p>
              <p className="mt-3 text-sm text-zinc-400">
                {venue.leagues.join(", ")} · {venue.teams.join(", ")}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {venue.sports.join(", ")} · {venue.region}
              </p>
            </aside>

            {foodItem.isPromoted && foodItem.sponsorDisclosure ? (
              <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Sponsor Disclosure
                </p>
                <p className="mt-3 text-zinc-300">
                  {foodItem.sponsorDisclosure}
                </p>
                {foodItem.sponsorName ? (
                  <p className="mt-2 text-sm text-zinc-500">
                    Sponsor: {foodItem.sponsorName}
                  </p>
                ) : null}
              </article>
            ) : null}

            {foodItem.alcoholic ? (
              <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Responsible Drinking
                </p>
                <p className="mt-3 text-zinc-300">
                  Alcohol availability varies by venue. Must be 21+ to purchase.
                  Please drink responsibly.
                </p>
              </article>
            ) : null}

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Accuracy
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Help keep this item accurate
              </h2>
              <p className="mt-4 max-w-3xl text-zinc-400">
                Menus change fast. Fans will be able to report price changes,
                wrong sections, new photos, or retired items.
              </p>
              <button
                type="button"
                disabled
                className="mt-6 cursor-not-allowed rounded-full border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-500"
              >
                Corrections coming soon
              </button>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
