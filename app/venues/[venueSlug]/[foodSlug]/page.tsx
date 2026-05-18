import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
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
import { venueTypeGlyph } from "@/lib/venue-display";
import {
  FanSignalsPendingPanel,
  FoodItemHeroPlaceholder,
  GameDayFreshPendingBlock,
  isUnratedItemStats,
  PhotoBackedReviewsEmpty
} from "@/components/food-item-empty-states";
import { BrandBadgeIcon } from "@/components/brand-badge-icon";
import { ReviewSlopCard } from "@/components/review-slop-card";
import { SlopCardShareModule } from "@/components/slop-card-share-module";
import { getAbsoluteUrl, SITE_TAGLINE_SHORT } from "@/lib/site-metadata";
import { formatVenueTeamsInline } from "@/lib/venue-teams";
import { deriveFoodItemAwardChips } from "@/lib/venue-awards";
import { FoodItemAwardChips } from "@/components/food-item-award-chips";
import {
  FanPoweredGuideBadge,
  FanPoweredGuideNote
} from "@/components/fan-powered-guide-note";
import { formatItemGuideTimestamp } from "@/lib/guide-disclaimers";

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

export async function generateMetadata({
  params
}: Pick<FoodPageProps, "params">): Promise<Metadata> {
  const { venueSlug, foodSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);
  const foodItem = venue
    ? await getPublicFoodItemBySlug(venue.slug, foodSlug)
    : await getPublicFoodItemBySlug(venueSlug, foodSlug);

  if (
    !venue ||
    !foodItem ||
    foodItem.venueSlug.trim().toLowerCase() !== venue.slug.trim().toLowerCase()
  ) {
    return {
      title: "Concession item",
      description: SITE_TAGLINE_SHORT,
      robots: { index: false, follow: true }
    };
  }

  const [seasonStats, freshStats] = await Promise.all([
    getDbBackedItemSlopStats(venue.slug, foodItem.slug, "season"),
    getDbBackedItemSlopStats(venue.slug, foodItem.slug, "gameDayFresh")
  ]);

  const unrated = isUnratedItemStats(seasonStats.reviewCount);
  const scorePart = unrated
    ? "Season Slop Score awaits the first bite."
    : `Season Slop Score ${seasonStats.averageSlopScore.toFixed(1)} (${getSlopScoreTier(seasonStats.averageSlopScore)})`;

  const freshPart = freshStats.hasFreshToday
    ? `Game Day Fresh ${freshStats.averageSlopScore.toFixed(1)} today.`
    : "Game Day Fresh signal quiet so far.";

  const description = `${foodItem.name} at ${venue.name}. ${scorePart} ${freshPart} ${SITE_TAGLINE_SHORT}`;
  const path = `/venues/${venue.slug}/${foodItem.slug}`;

  return {
    title: foodItem.name,
    description,
    alternates: { canonical: getAbsoluteUrl(path) },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Stadium Slop",
      url: getAbsoluteUrl(path),
      title: `${foodItem.name} · ${venue.name}`,
      description
    },
    twitter: {
      card: "summary_large_image",
      title: foodItem.name,
      description
    }
  };
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
    <div className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.85)] p-2.5 sm:p-3">
      <h3 className="text-xs font-black uppercase tracking-[0.08em] text-[var(--slop-cream-muted)]">
        {title}
      </h3>
      <div className="mt-1.5 space-y-1.5">
        {stats.map((stat) => {
          const isTop = topPct > 0 && stat.percentage === topPct;

          return (
            <div
              key={stat.label}
              className={`rounded-lg px-2 py-1.5 ${
                isTop ? "border border-emerald-500/55 bg-emerald-950/35" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[0.7rem]">
                <span
                  className={
                    isTop ? "font-bold text-emerald-100" : "font-bold text-[var(--slop-cream-dim)]"
                  }
                >
                  {stat.label}
                </span>
                <span
                  className={
                    isTop ? "font-black text-emerald-300" : "text-[var(--slop-cream-dim)]"
                  }
                >
                  {stat.percentage}%
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-[color:rgba(0,0,0,0.35)]">
                <div
                  className={`h-full rounded-full ${
                    isTop ? "bg-emerald-400" : "bg-[var(--slop-cream-dim)]"
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

  const reviewPath = `/venues/${venue.slug}/${foodItem.slug}/review`;
  const itemPath = `/venues/${venue.slug}/${foodItem.slug}`;
  const itemShareUrl = getAbsoluteUrl(itemPath);
  const unratedSeason = isUnratedItemStats(seasonStats.reviewCount);
  const hasGameDayFreshToday = freshStats.hasFreshToday;
  const awardChips = deriveFoodItemAwardChips(
    foodItem,
    seasonStats,
    freshStats,
    photoBackedReviews.length
  );

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <Link
          href={`/venues/${venue.slug}`}
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)] sm:text-sm"
        >
          ← {venue.name}
        </Link>

        {showReportThanks ? (
          <div
            role="status"
            className="mt-2 rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)] px-3 py-2 text-xs text-[var(--slop-cream-muted)] sm:text-sm"
          >
            <p className="font-bold text-[var(--slop-cream)]">Report logged</p>
            <p className="mt-0.5 text-[var(--slop-cream-dim)]">
              Moderators review flags.
            </p>
          </div>
        ) : null}

        {reportErrorMsg ? (
          <div
            role="alert"
            className="mt-2 rounded-xl border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-xs text-amber-100 sm:text-sm"
          >
            <p className="font-bold">Report not sent</p>
            <p className="mt-0.5 text-amber-200/90">{reportErrorMsg}</p>
          </div>
        ) : null}

        {showReviewSaved ? (
          <SlopCardShareModule
            itemHref={itemPath}
            shareUrl={itemShareUrl}
            shareTitle={`${foodItem.name} · ${venue.name}`}
            shareDescription={`Slop Score and fan signals for ${foodItem.name} at ${venue.name} on Stadium Slop.`}
            photoErrorMessage={photoErrorFollowUp}
            photoRetryHref={
              showPhotoRetryCta ? `${reviewPath}?photoRetry=1` : null
            }
          />
        ) : null}

        <header className="space-y-2.5 pt-2 sm:space-y-3 sm:pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {foodItem.isPromoted || foodItem.venueBadge || foodItem.isNewThisSeason ? (
              <BrandBadgeIcon size={22} title="Featured on Stadium Slop" />
            ) : null}
            <p className="inline-flex rounded-full border border-[var(--slop-line-strong)] bg-[rgba(245,233,208,0.06)] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)] sm:px-2.5 sm:text-xs">
              {foodItem.itemType} · {foodItem.category}
            </p>
            {foodItem.ageRestricted ? (
              <p className="inline-flex rounded-full border border-[var(--slop-line-strong)] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)] sm:text-xs">
                21+
              </p>
            ) : null}
            {foodItem.isPromoted ? (
              <p className="inline-flex rounded-full border border-[var(--slop-gold)] bg-[rgba(244,179,33,0.1)] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-bright)] sm:text-xs">
                Promoted
              </p>
            ) : null}
            {foodItem.isNewThisSeason ? (
              <p className="inline-flex rounded-full border border-[var(--slop-line-strong)] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)] sm:text-xs">
                New
              </p>
            ) : null}
            {foodItem.venueBadge ? (
              <p className="inline-flex rounded-full border border-[var(--slop-gold)] bg-[rgba(244,179,33,0.08)] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-bright)] sm:text-xs">
                {foodItem.venueBadge}
              </p>
            ) : null}
          </div>

          <h1 className="brand-headline max-w-4xl text-2xl leading-[1.08] tracking-tight text-[var(--slop-cream)] sm:text-5xl">
            {foodItem.name}
          </h1>

          <FoodItemAwardChips chips={awardChips} />

          <div className="flex flex-wrap items-center gap-2">
            <FanPoweredGuideBadge />
            <FanPoweredGuideNote
              preset="food-scores"
              className="min-w-0 flex-1"
            />
          </div>

          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:gap-2.5">
            <div className="slop-score-callout relative overflow-hidden rounded-xl px-3 py-2.5 sm:col-span-5 sm:rounded-lg sm:px-4 sm:py-3">
              <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
                Slop score
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums leading-none tracking-tight text-[var(--slop-orange)] sm:text-4xl">
                {unratedSeason ? "—" : seasonStats.averageSlopScore.toFixed(1)}
              </p>
              {!unratedSeason ? (
                <p className="mt-1 text-[0.65rem] font-bold leading-snug text-[var(--slop-cream-muted)]">
                  {slopTier}
                </p>
              ) : (
                <p className="mt-1 text-[0.65rem] text-[var(--slop-cream-dim)]">
                  Awaiting first season score
                </p>
              )}
            </div>

            <div
              className={`relative overflow-hidden rounded-xl px-3 py-2.5 sm:col-span-4 sm:rounded-lg sm:px-4 sm:py-3 ${
                hasGameDayFreshToday
                  ? "slop-fresh-glow border border-emerald-400/40 bg-[color:rgba(6,22,16,0.55)]"
                  : "border border-[var(--slop-line-strong)] bg-[color:rgba(11,27,43,0.88)] shadow-[var(--slop-shadow-inset)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-emerald-200/95">
                  Fresh signal
                </p>
                {hasGameDayFreshToday ? (
                  <span className="inline-flex items-center gap-1 rounded border border-emerald-400/45 bg-emerald-950/55 px-1.5 py-0.5 text-[0.45rem] font-black uppercase tracking-wider text-emerald-100">
                    <span
                      className="slop-live-dot inline-block h-1 w-1 rounded-full bg-emerald-400"
                      aria-hidden
                    />
                    Live
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-2xl font-black tabular-nums leading-none text-[var(--slop-cream)] sm:text-3xl">
                {hasGameDayFreshToday ? freshStats.averageSlopScore.toFixed(1) : "—"}
              </p>
              <p className="mt-1 text-[0.58rem] font-semibold text-[var(--slop-cream-dim)]">
                {hasGameDayFreshToday
                  ? foodItem.freshWindowLabel
                    ? `Window · ${foodItem.freshWindowLabel}`
                    : "Game-day takes"
                  : "No Game Day Fresh yet."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:col-span-3 sm:grid-cols-1 sm:gap-2">
              <div className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(11,27,43,0.88)] px-2.5 py-2 shadow-[var(--slop-shadow-inset)] sm:rounded-lg sm:px-3 sm:py-2.5">
                <p className="text-[0.5rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                  Reviews
                </p>
                <p className="mt-0.5 text-lg font-black tabular-nums text-[var(--slop-cream)] sm:text-xl">
                  {seasonStats.reviewCount}
                </p>
                {napkinEligible ? (
                  <p className="text-[0.55rem] text-[var(--slop-cream-dim)]">
                    {seasonStats.roundedNapkinRating}/5 napkins
                  </p>
                ) : (
                  <p className="text-[0.55rem] text-[var(--slop-cream-dim)]">Season scope</p>
                )}
              </div>
              <div className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-2.5 py-2 shadow-[var(--slop-shadow-inset)] sm:rounded-lg sm:px-3 sm:py-2.5">
                <p className="text-[0.5rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                  Price
                </p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-[var(--slop-cream-muted)] sm:text-lg">
                  {priceIntel.displayPrice
                    ? `$${Number(priceIntel.displayPrice).toFixed(2)}`
                    : "—"}
                </p>
                <p className="truncate text-[0.55rem] text-[var(--slop-cream-dim)]">
                  {foodItem.priceLastConfirmedLabel
                    ? foodItem.priceLastConfirmedLabel
                    : priceIntel.reportCount
                      ? `${priceIntel.reportCount} reports`
                      : "Fan reports"}
                </p>
              </div>
            </div>
          </div>

          <div
            aria-label={heroAlt}
            className="brand-card relative aspect-[16/10] overflow-hidden rounded-2xl border bg-black sm:aspect-[16/9]"
          >
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={heroAlt}
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 100vw, 640px"
                priority
              />
            ) : (
              <FoodItemHeroPlaceholder
                foodName={foodItem.name}
                emoji={heroEmoji}
                reviewHref={reviewPath}
              />
            )}
          </div>

          <Link
            href={reviewPath}
            className="brand-cta inline-flex w-full justify-center rounded-full px-5 py-2.5 text-sm font-black transition sm:w-auto sm:py-3"
          >
            {hasTodaysReview
              ? "Edit today’s review"
              : unratedSeason
                ? "First review"
                : "Review"}
          </Link>
          {isSignedIn ? (
            <p className="text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
              One review per item per game day — edits replace today&apos;s card.
            </p>
          ) : null}

          <p className="text-xs text-[var(--slop-cream-dim)]">
            {venue.name} · {vendor ? vendor.name : "Vendor TBD"} · {foodItem.location}
          </p>

          {foodItem.description ? (
            <p className="line-clamp-2 text-sm leading-snug text-[var(--slop-cream-muted)]">
              {foodItem.description}
            </p>
          ) : null}
          <FanPoweredGuideNote
            preset="food-menu"
            className="pt-0.5"
            lastUpdated={formatItemGuideTimestamp(foodItem)}
          />
        </header>

        {!hasGameDayFreshToday ? (
          <div className="mt-2">
            <GameDayFreshPendingBlock />
          </div>
        ) : foodItem.freshSignal ? (
          <section className="relative mt-2 overflow-hidden rounded-xl border border-emerald-500/35 bg-[color:rgba(6,22,16,0.45)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_24px_rgba(52,211,153,0.08)] sm:py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded border border-emerald-400/45 bg-emerald-950/45 px-1.5 py-0.5 text-[0.45rem] font-black uppercase tracking-wider text-emerald-100">
                <span
                  className="slop-live-dot inline-block h-1 w-1 rounded-full bg-emerald-400"
                  aria-hidden
                />
                Live board
              </span>
              <span className="rounded border border-[var(--slop-line)] px-1.5 py-0.5 text-[0.6rem] font-bold text-[var(--slop-cream-muted)]">
                {foodItem.freshReviewCount} takes · {foodItem.freshWindowLabel ?? "today"}
              </span>
            </div>
            <h2 className="mt-1.5 text-base font-black leading-tight text-[var(--slop-cream)] sm:text-lg">
              {foodItem.freshSignal}
            </h2>
            {foodItem.freshSignalReason ? (
              <p className="mt-1 line-clamp-2 text-[0.7rem] leading-snug text-[var(--slop-cream-muted)]">
                {foodItem.freshSignalReason}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="mt-3 border-t border-[var(--slop-line-strong)] pt-3 sm:mt-4 sm:pt-4">
          <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Fan signals
          </h2>
          {unratedSeason ? (
            <div className="mt-2">
              <FanSignalsPendingPanel />
            </div>
          ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 sm:gap-2.5">
              <FanSignalBreakdown title="Replay value" stats={seasonStats.replayValue} />
              <FanSignalBreakdown title="Price check" stats={seasonStats.priceCheck} />
            </div>
          )}
        </section>

        <section className="border-t border-[var(--slop-line-strong)] py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
              Photo reviews
            </h2>
            <FanPoweredGuideBadge />
          </div>
          <FanPoweredGuideNote preset="food-reviews" className="mt-1.5" />
          <div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-2 sm:gap-3">
            {photoBackedReviews.length > 0 ? (
              photoBackedReviews.map((review) => {
                const photoUrlNorm = normalizePublicImageUrl(review.photoUrl);
                const heroDup =
                  Boolean(heroImageUrl) && photoUrlNorm === heroImageUrl;
                const captionLine =
                  review.photoLabel?.trim() || foodItem.name;

                const helpfulSlot = isSignedIn ? (
                  likedReviewIds.has(review.id) ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-full border border-[var(--slop-orange)] px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-orange)]"
                    >
                      Marked helpful · {review.helpfulLikes}
                    </button>
                  ) : (
                    <form action={markReviewHelpful}>
                      <input type="hidden" name="venueSlug" value={venue.slug} />
                      <input type="hidden" name="foodSlug" value={foodItem.slug} />
                      <input type="hidden" name="reviewId" value={review.id} />
                      <button
                        type="submit"
                        className="w-full rounded-full border border-zinc-800 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
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
                    className="inline-flex w-full justify-center rounded-full border border-zinc-800 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
                  >
                    Sign in to mark helpful · {review.helpfulLikes}
                  </Link>
                );

                const reportSlot = isSignedIn ? (
                  <details className="group">
                    <summary className="cursor-pointer list-none text-[0.65rem] font-bold uppercase tracking-[0.18em] text-zinc-600 marker:content-none [&::-webkit-details-marker]:hidden hover:text-zinc-400">
                      Report
                    </summary>
                    <form
                      action={submitContentReport}
                      className="mt-2 grid gap-2 text-xs text-zinc-400"
                    >
                      <input type="hidden" name="venueSlug" value={venue.slug} />
                      <input type="hidden" name="foodSlug" value={foodItem.slug} />
                      <input type="hidden" name="reviewId" value={review.id} />
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
                );

                return (
                  <ReviewSlopCard
                    key={review.id}
                    review={review}
                    photoUrl={photoUrlNorm}
                    photoAlt={review.photoAlt ?? `Fan photo for ${foodItem.name}`}
                    napkinEligible={napkinEligible}
                    captionLine={captionLine}
                    signalLine={getPrimaryConsensusLabel(review)}
                    duplicateHeroBadge={heroDup}
                    helpfulSlot={helpfulSlot}
                    reportSlot={reportSlot}
                  />
                );
              })
            ) : (
              <PhotoBackedReviewsEmpty
                reviewHref={reviewPath}
                venueSlug={venue.slug}
                foodSlug={foodItem.slug}
              />
            )}
          </div>

          <p className="mt-1.5 text-[0.65rem] text-[var(--slop-cream-dim)]">
            Structured scores · helpful likes need sign-in
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
          <section className="border-t border-[var(--slop-line-strong)] py-4 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black text-[var(--slop-cream)]">
                More · {vendor.name}
              </h2>
              <Link
                href={`/venues/${venue.slug}/vendors/${vendor.slug}`}
                className="shrink-0 text-xs font-bold text-[var(--slop-gold)] hover:text-[var(--slop-gold-bright)]"
              >
                Vendor →
              </Link>
            </div>

            <div className="mt-2 overflow-hidden rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)]">
              {moreFromVendor.map((item) => (
                <Link
                  key={item.slug}
                  href={`/venues/${venue.slug}/${item.slug}`}
                  className="flex items-center justify-between gap-3 border-b border-[var(--slop-line)] px-3 py-2.5 transition last:border-b-0 hover:bg-[var(--slop-ink)] sm:px-4"
                >
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.itemType} · {item.location}
                    </p>
                  </div>
                  <span className="text-sm font-black text-[var(--slop-orange)]">
                    {item.reviewCount === 0 ? (
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                        Unrated
                      </span>
                    ) : (
                      item.slopScore.toFixed(1)
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-[var(--slop-line-strong)] py-4 sm:py-5">
          <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Listing · price
          </h2>
          <p className="mt-1.5 text-xs text-[var(--slop-cream-dim)]">
            {venue.city}, {venue.state} ·{" "}
            <span className="inline-flex items-center gap-1">
              {venue.venueTypeKey ? (
                <span className="text-sm leading-none opacity-90" aria-hidden>
                  {venueTypeGlyph(venue.venueTypeKey) ?? ""}
                </span>
              ) : null}
              {venue.venueType}
            </span>{" "}
            · {formatVenueTeamsInline(venue.teams)} · {foodItem.category} ·{" "}
            {foodItem.itemType}
            {foodItem.beverageStyle ? ` · ${foodItem.beverageStyle}` : ""}
            {foodItem.ageRestricted ? " · 21+" : ""}
            {foodItem.venueBadge ? ` · ${foodItem.venueBadge}` : ""}
            {foodItem.seasonIntroduced ? ` · Since ${foodItem.seasonIntroduced}` : ""}
            {foodItem.lastConfirmed ? ` · Confirmed ${foodItem.lastConfirmed}` : ""}
          </p>
          <p className="mt-1 text-xs text-[var(--slop-cream-muted)]">
            {priceIntel.displayPrice
              ? `$${Number(priceIntel.displayPrice).toFixed(2)}`
              : "—"}{" "}
            · {priceIntel.reportCount} reports
            {foodItem.priceLastConfirmedLabel
              ? ` · ${foodItem.priceLastConfirmedLabel}`
              : ""}{" "}
            · {foodItem.availabilityStatus ?? "Availability TBD"}
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
