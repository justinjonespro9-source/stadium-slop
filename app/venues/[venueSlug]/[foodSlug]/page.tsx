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
  getPublicVenueBySlug,
  slugFilterInsensitive
} from "@/lib/public-data";
import type { FoodReview } from "@/lib/sample-data";
import { prisma } from "@/lib/prisma";
import { getDbBackedItemSlopStats, getSlopScoreTier, type ConsensusStat } from "@/lib/slop-stats";
import {
  MOCK_REVIEWER_USER_ID,
  MOCK_USER_COOKIE_NAME,
  hasMockUserAccess
} from "@/lib/user-auth";
import { ensureMockReviewerUser } from "@/lib/mock-user";
import { isNapkinEligibleItem } from "@/lib/item-eligibility";
import { findTodaysReviewForItem } from "@/lib/review-draft";
import { buildItemFanPhotoLayout } from "@/lib/fan-photo-layout";
import { normalizePublicImageUrl } from "@/lib/image-url";
import {
  FAN_REPORT_REASON_LABELS,
  FAN_REPORT_REASON_VALUES,
  parseFanReportReason,
  parseReportTargetType,
  REPORT_NOTE_MAX
} from "@/lib/reports";

export const dynamic = "force-dynamic";

type FoodPageProps = {
  params: Promise<{
    venueSlug: string;
    foodSlug: string;
  }>;
  searchParams?: Promise<{
    reviewSubmitted?: string;
    photoError?: string;
    reported?: string;
    report?: string;
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

function maxConsensusPercentage(stats: ConsensusStat[]) {
  return stats.reduce((max, row) => Math.max(max, row.percentage), 0);
}

function FanSignalBreakdown({
  title,
  stats
}: {
  title: string;
  stats: ConsensusStat[];
}) {
  const topPct = maxConsensusPercentage(stats);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-3 sm:p-4">
      <h3 className="text-sm font-black text-zinc-200">{title}</h3>
      <div className="mt-2 space-y-2">
        {stats.map((stat) => {
          const isTop = topPct > 0 && stat.percentage === topPct;

          return (
            <div
              key={stat.label}
              className={`rounded-lg px-2 py-1.5 ${
                isTop ? "border border-emerald-500/55 bg-emerald-950/35" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span
                  className={
                    isTop ? "font-bold text-emerald-100" : "font-bold text-zinc-400"
                  }
                >
                  {stat.label}
                </span>
                <span
                  className={
                    isTop ? "font-black text-emerald-300" : "text-zinc-500"
                  }
                >
                  {stat.percentage}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className={`h-full rounded-full ${
                    isTop ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

async function submitContentReport(formData: FormData) {
  "use server";

  const venueSlug = String(formData.get("venueSlug") ?? "").trim();
  const foodSlug = String(formData.get("foodSlug") ?? "").trim();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const reportTarget = parseReportTargetType(
    String(formData.get("reportTarget") ?? "REVIEW")
  );
  const reasonRaw = String(formData.get("reason") ?? "");
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, REPORT_NOTE_MAX);
  const photoIdFromForm = String(formData.get("photoId") ?? "").trim();

  const itemPath = `/venues/${venueSlug}/${foodSlug}`;
  const cookieStore = await cookies();
  if (!hasMockUserAccess(cookieStore.get(MOCK_USER_COOKIE_NAME)?.value)) {
    redirect(`/login?next=${encodeURIComponent(itemPath)}`);
  }

  const venue = await prisma.venue.findFirst({
    where: { slug: slugFilterInsensitive(venueSlug), status: "ACTIVE" },
    select: { id: true, slug: true }
  });
  if (!venue) {
    redirect(`${itemPath}?report=invalid`);
  }

  const foodRow = await prisma.foodItem.findFirst({
    where: {
      slug: slugFilterInsensitive(foodSlug),
      status: "ACTIVE",
      venueId: venue.id
    },
    select: { id: true, slug: true }
  });
  if (!foodRow) {
    redirect(`${itemPath}?report=invalid`);
  }

  const canonicalPath = `/venues/${venue.slug}/${foodRow.slug}`;
  const user = await ensureMockReviewerUser(venue.id);
  const reason = parseFanReportReason(reasonRaw);
  if (!reason) {
    redirect(`${canonicalPath}?report=reason`);
  }
  if (!reportTarget) {
    redirect(`${canonicalPath}?report=target`);
  }

  if (reportTarget === "REVIEW") {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        status: "ACTIVE",
        foodItemId: foodRow.id
      },
      select: { id: true, userId: true }
    });
    if (!review) {
      redirect(`${canonicalPath}?report=invalid`);
    }
    if (review.userId === user.id) {
      redirect(`${canonicalPath}?report=self`);
    }
    const dup = await prisma.reportFlag.findFirst({
      where: {
        reporterUserId: user.id,
        targetType: "REVIEW",
        targetId: review.id,
        status: "OPEN"
      }
    });
    if (dup) {
      redirect(`${canonicalPath}?report=duplicate`);
    }
    await prisma.reportFlag.create({
      data: {
        reporterUserId: user.id,
        targetType: "REVIEW",
        targetId: review.id,
        reviewId: review.id,
        reason,
        note: note || null,
        status: "OPEN"
      }
    });
  } else {
    const pid = photoIdFromForm;
    if (!pid) {
      redirect(`${canonicalPath}?report=invalid`);
    }
    const photo = await prisma.foodPhoto.findFirst({
      where: {
        id: pid,
        status: "ACTIVE",
        photoType: "FOOD",
        foodItemId: foodRow.id,
        reviewId
      },
      select: { id: true, uploaderUserId: true, reviewId: true }
    });
    if (!photo) {
      redirect(`${canonicalPath}?report=invalid`);
    }
    if (photo.uploaderUserId === user.id) {
      redirect(`${canonicalPath}?report=self`);
    }
    const dup = await prisma.reportFlag.findFirst({
      where: {
        reporterUserId: user.id,
        targetType: "PHOTO",
        targetId: photo.id,
        status: "OPEN"
      }
    });
    if (dup) {
      redirect(`${canonicalPath}?report=duplicate`);
    }
    await prisma.reportFlag.create({
      data: {
        reporterUserId: user.id,
        targetType: "PHOTO",
        targetId: photo.id,
        reviewId: photo.reviewId,
        photoId: photo.id,
        reason,
        note: note || null,
        status: "OPEN"
      }
    });
  }

  revalidatePath(canonicalPath);
  redirect(`${canonicalPath}?reported=1`);
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
      ? "Your ratings are live, but the photo was over the upload size limit (about 8MB). Try a smaller JPEG or PNG."
      : photoError === "heic"
        ? "Your ratings are live, but HEIC/HEIF is not supported yet. On iPhone use Settings → Camera → Formats → “Most Compatible”, or export the shot as JPEG, then add it from Review this item."
        : photoError === "unsupported"
          ? "Your ratings are live, but that file was not a supported image type. Use JPEG, PNG, WebP, or GIF."
          : photoError === "cloudinary"
            ? "Your ratings are live, but the server is not configured for photo uploads (missing Cloudinary env vars)."
            : photoError === "photo_save"
              ? "Your ratings are live and the image reached our host, but saving the photo link failed. Try submitting the photo again from Review this item."
              : photoError === "upload" || photoError
                ? "Your ratings are live, but the fan photo failed to upload. Check your connection and try again with JPEG or PNG under about 8MB."
                : null;

  const showPhotoRetryCta =
    Boolean(photoError) && showReviewSaved && photoError !== "cloudinary";

  const showReportThanks = query.reported === "1";
  const reportErrKey = query.report;
  const reportErrorMsg =
    reportErrKey === "duplicate"
      ? "You already have an open report for this."
      : reportErrKey === "self"
        ? "You cannot report your own content."
        : reportErrKey === "reason"
          ? "Pick a report reason."
          : reportErrKey === "target"
            ? "Invalid report target."
            : reportErrKey === "invalid"
              ? "That report could not be submitted."
              : null;

  const venue = await getPublicVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const foodItem = await getPublicFoodItemBySlug(venue.slug, foodSlug);

  if (
    !foodItem ||
    foodItem.venueSlug.trim().toLowerCase() !== venue.slug.trim().toLowerCase()
  ) {
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

  const { heroEntry, additionalFanPhotos, photoBackedReviews } = buildItemFanPhotoLayout(
    careerStats.reviews,
    foodPhotos,
    foodItem.name
  );

  const heroImageUrl = normalizePublicImageUrl(heroEntry?.url);
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
  let hasTodaysReview = false;
  if (isSignedIn && foodItem.id) {
    const todaysRow = await findTodaysReviewForItem({
      userId: MOCK_REVIEWER_USER_ID,
      foodItemId: foodItem.id,
      venueSlug: venue.slug
    });
    hasTodaysReview = Boolean(todaysRow);
  }
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

        {showReportThanks ? (
          <div
            role="status"
            className="mt-4 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-200"
          >
            <p className="font-bold">Thanks — we logged your report</p>
            <p className="mt-1 text-zinc-400">
              Moderators review flags; nothing is deleted automatically.
            </p>
          </div>
        ) : null}

        {reportErrorMsg ? (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-amber-800/80 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
          >
            <p className="font-bold">Report not sent</p>
            <p className="mt-1 text-amber-200/90">{reportErrorMsg}</p>
          </div>
        ) : null}

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
            {showPhotoRetryCta ? (
              <p className="mt-2 text-sm text-amber-50/95">
                <Link
                  href={`/venues/${venue.slug}/${foodItem.slug}/review?photoRetry=1`}
                  className="font-bold text-white underline decoration-[var(--slop-orange)] underline-offset-2 hover:text-[var(--slop-orange)]"
                >
                  Try photo again
                </Link>
                {" "}
                — same-day submit updates your saved review (one per item per
                game day), so you are not creating a duplicate scorecard.
              </p>
            ) : null}
          </div>
        ) : null}

        <header className="grid gap-4 py-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div
            aria-label={heroAlt}
            className="brand-card relative aspect-[16/11] overflow-hidden rounded-3xl border bg-black lg:order-2"
          >
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={heroAlt}
                fill
                className="object-contain object-center"
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
            <Link
              href={`/venues/${venue.slug}/${foodItem.slug}/review`}
              className="brand-cta mt-3 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-black transition sm:w-auto"
            >
              {hasTodaysReview ? "Edit Today’s Review" : "Submit a Review"}
            </Link>
            {isSignedIn ? (
              <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500">
                You can update today&apos;s review; it replaces your earlier score for
                this item (one saved review per item per game day).
              </p>
            ) : null}
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

        <section className="mt-2 border-t border-zinc-800 pt-3 sm:border-t-0 sm:pt-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Fan Signals
          </p>
          <h2 className="mt-1 text-lg font-black text-zinc-100 sm:text-xl">
            Replay value · Price check
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Season-scope review signals (deduped per fan and game day). Highest
            share in each group is highlighted.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FanSignalBreakdown title="Replay Value" stats={seasonStats.replayValue} />
            <FanSignalBreakdown title="Price Check" stats={seasonStats.priceCheck} />
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
                  Boolean(heroImageUrl) &&
                  normalizePublicImageUrl(review.photoUrl) === heroImageUrl;

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
                          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-zinc-950"
                        >
                          {normalizePublicImageUrl(review.photoUrl) ? (
                            <Image
                              src={normalizePublicImageUrl(review.photoUrl)!}
                              alt={
                                review.photoAlt ?? `Fan photo for ${foodItem.name}`
                              }
                              fill
                              className="object-contain object-center"
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
                        <div className="mt-3 border-t border-zinc-800 pt-3">
                          {isSignedIn ? (
                            <details className="group">
                              <summary className="cursor-pointer list-none text-[0.65rem] font-bold uppercase tracking-[0.18em] text-zinc-600 marker:content-none [&::-webkit-details-marker]:hidden hover:text-zinc-400">
                                Report
                              </summary>
                              <form
                                action={submitContentReport}
                                className="mt-2 grid gap-2 text-xs text-zinc-400"
                              >
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
                                {review.primaryFoodPhotoId ? (
                                  <input
                                    type="hidden"
                                    name="photoId"
                                    value={review.primaryFoodPhotoId}
                                  />
                                ) : null}
                                <label className="grid gap-1">
                                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                    What is wrong?
                                  </span>
                                  <select
                                    name="reportTarget"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-zinc-200"
                                    defaultValue="REVIEW"
                                  >
                                    <option value="REVIEW">This review</option>
                                    {review.primaryFoodPhotoId ? (
                                      <option value="PHOTO">Fan photo only</option>
                                    ) : null}
                                  </select>
                                </label>
                                <label className="grid gap-1">
                                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                    Reason
                                  </span>
                                  <select
                                    name="reason"
                                    required
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-zinc-200"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>
                                      Choose…
                                    </option>
                                    {FAN_REPORT_REASON_VALUES.map((value) => (
                                      <option key={value} value={value}>
                                        {FAN_REPORT_REASON_LABELS[value]}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label className="grid gap-1">
                                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                    Note (optional)
                                  </span>
                                  <textarea
                                    name="note"
                                    rows={2}
                                    maxLength={REPORT_NOTE_MAX}
                                    placeholder="Short context for moderators"
                                    className="resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-zinc-200 placeholder:text-zinc-600"
                                  />
                                </label>
                                <button
                                  type="submit"
                                  className="justify-self-start rounded-full border border-zinc-700 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-amber-700/80 hover:text-amber-200/90"
                                >
                                  Submit report
                                </button>
                              </form>
                            </details>
                          ) : (
                            <p className="text-[0.65rem] leading-5 text-zinc-600">
                              <Link
                                href={`/login?next=${encodeURIComponent(
                                  `/venues/${venue.slug}/${foodItem.slug}`
                                )}`}
                                className="font-bold text-zinc-400 underline-offset-2 hover:text-[var(--slop-orange)] hover:underline"
                              >
                                Sign in
                              </Link>{" "}
                              to report a concern about this card.
                            </p>
                          )}
                        </div>
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

        <section className="border-t border-zinc-800 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Listing & price
          </p>
          <p className="mt-2 text-sm font-bold text-zinc-200">
            {venue.name} · {vendor ? vendor.name : "Vendor TBD"} · {foodItem.location}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {venue.city}, {venue.state} · {venue.venueType} ·{" "}
            {venue.teams.slice(0, 2).join(", ")}
            {venue.teams.length > 2 ? "…" : ""} · {foodItem.category} ·{" "}
            {foodItem.itemType}
            {foodItem.beverageStyle ? ` · ${foodItem.beverageStyle}` : ""}
            {foodItem.ageRestricted ? " · 21+" : ""}
            {foodItem.venueBadge ? ` · ${foodItem.venueBadge}` : ""}
            {foodItem.seasonIntroduced ? ` · Since ${foodItem.seasonIntroduced}` : ""}
            {foodItem.lastConfirmed ? ` · Last confirmed ${foodItem.lastConfirmed}` : ""}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Price{" "}
            {priceIntel.displayPrice
              ? `$${Number(priceIntel.displayPrice).toFixed(2)}`
              : "pending"}{" "}
            · {priceIntel.reportCount} {priceIntel.source} reports
            {foodItem.priceLastConfirmedLabel
              ? ` · ${foodItem.priceLastConfirmedLabel}`
              : ""}
            {" · "}
            {foodItem.availabilityStatus ?? "Availability pending"}
          </p>
          {foodItem.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {foodItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-800 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Report price change
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Functional reports only — pending admin review.
            </p>
            {isSignedIn ? (
              <form
                action={submitPriceReport}
                className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <input type="hidden" name="venueSlug" value={venue.slug} />
                <input type="hidden" name="foodSlug" value={foodItem.slug} />
                <input
                  name="reportedPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="13.99"
                  className="min-w-[8rem] flex-1 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 sm:max-w-[10rem]"
                />
                <textarea
                  name="priceNote"
                  maxLength={240}
                  placeholder="Optional note"
                  className="min-h-[2.75rem] min-w-0 flex-[2] rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 sm:min-h-0"
                />
                <button
                  type="submit"
                  className="brand-cta shrink-0 rounded-full px-4 py-2 text-xs font-black sm:text-sm"
                >
                  Submit
                </button>
              </form>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(
                  `/venues/${venue.slug}/${foodItem.slug}`
                )}`}
                className="mt-3 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-xs font-black text-zinc-400"
              >
                Sign in to report price
              </Link>
            )}
          </div>

          {foodItem.isPromoted && foodItem.sponsorDisclosure ? (
            <article className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                Sponsor disclosure
              </p>
              <p className="mt-2 text-sm text-zinc-300">{foodItem.sponsorDisclosure}</p>
              {foodItem.sponsorName ? (
                <p className="mt-1 text-xs text-zinc-500">Sponsor: {foodItem.sponsorName}</p>
              ) : null}
            </article>
          ) : null}

          {foodItem.alcoholic ? (
            <article className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                Responsible drinking
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Alcohol availability varies by venue. Must be 21+ to purchase. Please
                drink responsibly.
              </p>
            </article>
          ) : null}
        </section>
      </section>
    </main>
  );
}
