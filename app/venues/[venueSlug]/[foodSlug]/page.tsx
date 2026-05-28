import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  getPublicFoodItemBySlug,
  getPublicFoodItemsByVenueSlug,
  getPublicFoodItemsByVendorSlug,
  getPublicPhotosForFoodItem,
  getPublicVendorForFoodItem,
  getPublicVenueBySlug,
  slugFilterInsensitive
} from "@/lib/public-data";
import type { FoodReview } from "@/lib/sample-data";
import { prisma } from "@/lib/prisma";
import { getDbBackedItemSlopStats, getSlopScoreTier, type ConsensusStat } from "@/lib/slop-stats";
import { getContributorUserId, requireContributorUserId } from "@/lib/auth/contributor-id";
import { isNapkinEligibleItem } from "@/lib/item-eligibility";
import { findTodaysReviewForItem } from "@/lib/review-draft";
import { getVenueActiveGame } from "@/lib/game-day";
import { buildItemFanPhotoLayout } from "@/lib/fan-photo-layout";
import { sortScorecardReviews, DEFAULT_SCORECARD_SORT } from "@/lib/scorecard-carousel-sort";
import { normalizePublicImageUrl } from "@/lib/image-url";

import { ReportContentLink } from "@/components/report-content-link";
import type { ReportContentContext } from "@/lib/report-content";
import { venueTypeGlyph } from "@/lib/venue-display";
import {
  FanSignalsPendingPanel,
  GameDayFreshPendingBlock,
  isUnratedItemStats,
  PhotoBackedReviewsEmpty
} from "@/components/food-item-empty-states";
import { BrandBadgeIcon } from "@/components/brand-badge-icon";
import { FoodItemScorecardDeck } from "@/components/food-item-scorecard-deck";
import { FoodItemHero } from "@/components/food-item/food-item-hero";
import { FoodItemStatsStrip } from "@/components/food-item-stats-strip";
import { SlopScorecardHelpfulAnchor } from "@/components/slop-scorecard-helpful-anchor";
import {
  SlopCardShareModule,
  type SlopCardSharePreview
} from "@/components/slop-card-share-module";
import {
  formatSlopCardMetaRow,
  pickSlopCardHighlights,
  slopCardLocationLine
} from "@/lib/slop-card-display";
import {
  getScorecardShareDescription,
  getScorecardShareTitle,
  getScorecardShareUrl
} from "@/lib/scorecard-share";
import { photoErrorMessageFromQuery } from "@/lib/review-photo-errors";
import { itemPathWithHelpfulStatus } from "@/lib/review-celebration";
import { resolveFoodItemForPriceReport } from "@/lib/price-report";
import { getAbsoluteUrl, SITE_TAGLINE_SHORT } from "@/lib/site-metadata";
import { formatVenueTeamsInline } from "@/lib/venue-teams";
import {
  computeVenueFanFavoriteBadges,
  deriveFoodItemAwardChips,
  getFanFavoriteBadgesForItem
} from "@/lib/venue-awards";
import { FoodItemAwardChips } from "@/components/food-item-award-chips";
import { AdSlot } from "@/components/ads/ad-slot";
import { ClaimListingCta } from "@/components/claim-listing-cta";
import { SuggestCorrectionLink } from "@/components/suggest-correction-link";
import { FanPoweredGuideBadge } from "@/components/fan-powered-guide-note";
import { isAlcoholRelatedFoodItem } from "@/lib/alcohol-content";
import { AgeGateProvider } from "@/components/age-gate/age-gate-context";
import { FoodItemAgeGate } from "@/components/age-gate/food-item-age-gate";

export const dynamic = "force-dynamic";

type FoodPageProps = {
  params: Promise<{
    venueSlug: string;
    foodSlug: string;
  }>;
  searchParams?: Promise<{
    reviewSubmitted?: string;
    photoError?: string;
    price?: string;
    helpful?: string;
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
    <div className="media-panel-card p-3 sm:p-3.5">
      <h3 className="text-xs font-black uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
        {title}
      </h3>
      <div className="mt-2 space-y-2">
        {stats.map((stat) => {
          const isTop = topPct > 0 && stat.percentage === topPct;

          return (
            <div
              key={stat.label}
              className={`rounded-lg px-2 py-1.5 ${
                isTop ? "border border-[rgba(255,107,26,0.28)] bg-[rgba(255,107,26,0.06)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[0.7rem]">
                <span
                  className={
                    isTop
                      ? "font-bold text-[var(--media-orange-deep)]"
                      : "font-bold text-[var(--media-ink-muted)]"
                  }
                >
                  {stat.label}
                </span>
                <span
                  className={
                    isTop
                      ? "font-black text-[var(--media-orange)]"
                      : "text-[var(--media-ink-dim)]"
                  }
                >
                  {stat.percentage}%
                </span>
              </div>
              <div className="media-signal-bar-track mt-1.5">
                <div
                  className={`media-signal-bar-fill ${isTop ? "media-signal-bar-fill--top" : ""}`}
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
  await requireContributorUserId(itemPath);

  const userId = await requireContributorUserId(itemPath);

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
    select: {
      id: true,
      userId: true
    }
  });

  if (!review) {
    redirect(itemPath);
  }

  if (review.userId === userId) {
    redirect(itemPathWithHelpfulStatus(itemPath, "own"));
  }

  await prisma.helpfulLike.upsert({
    where: {
      userId_reviewId: {
        userId,
        reviewId: review.id
      }
    },
    update: {},
    create: {
      userId,
      reviewId: review.id
    }
  });

  revalidatePath(itemPath);
  redirect(itemPathWithHelpfulStatus(itemPath, "marked"));
}

async function submitPriceReport(formData: FormData) {
  "use server";

  const venueSlug = String(formData.get("venueSlug") ?? "").trim();
  const foodSlug = String(formData.get("foodSlug") ?? "").trim();
  const itemPath = `/venues/${venueSlug}/${foodSlug}`;
  const reportedPrice = Number(formData.get("reportedPrice"));
  const note = String(formData.get("priceNote") ?? "").trim();

  if (!Number.isFinite(reportedPrice) || reportedPrice <= 0) {
    redirect(`${itemPath}?price=invalid`);
  }

  const resolved = await resolveFoodItemForPriceReport(venueSlug, foodSlug);
  if (!resolved) {
    redirect(`${itemPath}?price=unavailable`);
  }

  const { venue, foodItem } = resolved;
  const canonicalPath = `/venues/${venue.slug}/${foodItem.slug}`;

  const userId = await requireContributorUserId(itemPath);

  await prisma.priceReport.create({
    data: {
      userId,
      venueId: venue.id,
      foodItemId: foodItem.id,
      reportedPrice,
      note: note ? note.slice(0, 240) : null,
      status: "PENDING"
    }
  });

  revalidatePath(canonicalPath);
  revalidatePath("/admin");
  redirect(`${canonicalPath}?price=reported`);
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
        slug: slugFilterInsensitive(foodSlug.trim()),
        status: "ACTIVE",
        venue: {
          slug: slugFilterInsensitive(venueSlug.trim()),
          status: "ACTIVE"
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

async function getLikedReviewIds(userId: string, reviewIds: string[]) {
  if (reviewIds.length === 0 || !userId) {
    return new Set<string>();
  }

  try {
    const helpfulLikes = await prisma.helpfulLike.findMany({
      where: {
        userId,
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

  const photoErrorFollowUp = photoErrorMessageFromQuery(photoError);

  const showPhotoRetryCta =
    Boolean(photoError) && showReviewSaved && photoError !== "cloudinary";

  const priceQuery = query.price;
  const priceStatusMessage =
    priceQuery === "reported"
      ? "Price report submitted — pending admin review."
      : priceQuery === "invalid"
        ? "Enter a valid price greater than $0."
        : priceQuery === "unavailable"
          ? "This menu item is not in our live database yet, so we cannot save a price report. Try an imported stadium menu item instead."
          : null;

  const helpfulQuery = query.helpful;
  const helpfulStatusMessage =
    helpfulQuery === "own"
      ? "You can't mark your own Slop Scorecard as helpful — thanks for posting though."
      : helpfulQuery === "marked"
        ? "Marked helpful. One vote per fan per scorecard."
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
  const priceReportDbReady = Boolean(foodItem.id);

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

  const venueMenuItems = await getPublicFoodItemsByVenueSlug(venue.slug);
  const fanFavoriteByItem = computeVenueFanFavoriteBadges(
    await Promise.all(
      venueMenuItems.map(async (menuItem) => ({
        itemSlug: menuItem.slug,
        allTime: await getDbBackedItemSlopStats(venue.slug, menuItem.slug, "allTime"),
        season: await getDbBackedItemSlopStats(venue.slug, menuItem.slug, "season")
      }))
    )
  );
  const fanFavoriteBadges = getFanFavoriteBadgesForItem(
    fanFavoriteByItem,
    foodItem.slug
  );

  const scorecardReviews = [
    ...careerStats.reviews,
    ...(careerStats.testReviews ?? [])
  ];
  const { heroEntry, photoBackedReviews } = buildItemFanPhotoLayout(
    scorecardReviews,
    foodPhotos,
    foodItem.name
  );

  const heroImageUrl = normalizePublicImageUrl(heroEntry?.url);
  const contributorUserId = await getContributorUserId();
  const isSignedIn = Boolean(contributorUserId);
  let hasTodaysReview = false;
  let todaysReviewId: string | null = null;
  if (contributorUserId && foodItem.id) {
    const todaysRow = await findTodaysReviewForItem({
      userId: contributorUserId,
      foodItemId: foodItem.id,
      venueSlug: venue.slug
    });
    hasTodaysReview = Boolean(todaysRow);
    todaysReviewId = todaysRow?.id ?? null;
  }
  const likedReviewIds = contributorUserId
    ? await getLikedReviewIds(
        contributorUserId,
        photoBackedReviews.map((review) => review.id)
      )
    : new Set<string>();
  const moreFromVendor = vendor
    ? (await getPublicFoodItemsByVendorSlug(venue.slug, vendor.slug)).filter(
        (item) => item.slug !== foodItem.slug
      )
    : [];

  const reviewPath = `/venues/${venue.slug}/${foodItem.slug}/review`;
  const dbVenue = await prisma.venue.findUnique({
    where: { slug: venue.slug },
    select: { id: true }
  });
  let activeGame: Awaited<ReturnType<typeof getVenueActiveGame>> = null;
  if (dbVenue?.id) {
    try {
      activeGame = await getVenueActiveGame(dbVenue.id);
    } catch (error) {
      console.warn("Active game lookup failed on item page", error);
    }
  }
  const reviewCtaLabel = hasTodaysReview
    ? "Edit today’s review"
    : activeGame
      ? "Review this item — game-day certified"
      : "Reviews open during home games";
  const itemPath = `/venues/${venue.slug}/${foodItem.slug}`;
  const itemPageWithReviewsAnchor = `${itemPath}#fan-photo-reviews`;
  const baseReportContext: Omit<ReportContentContext, "reviewId" | "photoUrl"> =
    {
      venueName: venue.name,
      venueSlug: venue.slug,
      vendorName: vendor?.name,
      vendorSlug: vendor?.slug,
      itemName: foodItem.name,
      itemSlug: foodItem.slug,
      pagePath: itemPageWithReviewsAnchor
    };
  const itemShareUrl = getAbsoluteUrl(itemPath);
  const unratedSeason = isUnratedItemStats(seasonStats.reviewCount);
  const hasGameDayFreshToday = freshStats.hasFreshToday;
  const awardChips = deriveFoodItemAwardChips(fanFavoriteBadges, freshStats);
  const editorialVenueBadge =
    foodItem.venueBadge &&
    foodItem.venueBadge !== "Fan Favorite" &&
    foodItem.venueBadge !== "Best Value"
      ? foodItem.venueBadge
      : null;
  const alcoholRelated = isAlcoholRelatedFoodItem(foodItem, vendor);
  const slopCardLocation = slopCardLocationLine(foodItem, vendor);
  const awardLabelPool = awardChips.map((chip) => chip.label);
  const defaultSortedReviews = sortScorecardReviews(photoBackedReviews, DEFAULT_SCORECARD_SORT, {
    venueSlug: venue.slug
  });
  const leadReview = defaultSortedReviews[0];
  const submittedReview = todaysReviewId
    ? photoBackedReviews.find((review) => review.id === todaysReviewId)
    : undefined;
  const celebrationShareUrl = submittedReview
    ? getScorecardShareUrl(submittedReview.id)
    : itemShareUrl;
  const celebrationShareTitle = submittedReview
    ? getScorecardShareTitle(foodItem.name, venue.name)
    : `${foodItem.name} · ${venue.name}`;
  const celebrationShareDescription = submittedReview
    ? getScorecardShareDescription(
        foodItem.name,
        venue.name,
        submittedReview.slopScore
      )
    : `Slop Score and fan signals for ${foodItem.name} at ${venue.name} on Stadium Slop.`;
  const shareSlopPreview: SlopCardSharePreview | null = leadReview
    ? {
        itemName: foodItem.name,
        venueName: venue.name,
        metaLine: formatSlopCardMetaRow({
          locationLine: slopCardLocation,
          verifiedGameDay: leadReview.verifiedGameDay,
          dateLabel: leadReview.dateLabel
        }),
        slopScore: leadReview.slopScore,
        highlightLabels: pickSlopCardHighlights(
          leadReview.labels,
          awardLabelPool
        )
      }
    : {
        itemName: foodItem.name,
        venueName: venue.name,
        metaLine: formatSlopCardMetaRow({ locationLine: slopCardLocation }),
        highlightLabels: awardLabelPool.slice(0, 2)
      };

  const venueHref = `/venues/${venue.slug}`;
  const itemMetaLine = (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <span>{venue.name}</span>
      <span className="text-white/35">·</span>
      <span>
        {venue.city}, {venue.state}
      </span>
      {venue.primarySport || venue.sports[0] ? (
        <>
          <span className="text-white/35">·</span>
          <span>{venue.primarySport ?? venue.sports[0]}</span>
        </>
      ) : null}
      <span className="text-white/35">·</span>
      <span>{vendor ? vendor.name : "Vendor TBD"}</span>
      <span className="text-white/35">·</span>
      <span>{foodItem.location}</span>
    </span>
  );
  const reviewHint = isSignedIn
    ? activeGame
      ? "Certified reviews during this home game."
      : "Reviews open during verified home-game windows."
    : activeGame
      ? "Sign in to review during this home game."
      : "Browse anytime — reviews open on game day.";
  const heroBadges = (
    <>
      {foodItem.isPromoted || foodItem.venueBadge || foodItem.isNewThisSeason ? (
        <BrandBadgeIcon size={20} title="Featured on Stadium Slop" />
      ) : null}
      <span className="media-item-hero-badge">
        {foodItem.itemType} · {foodItem.category}
      </span>
      {foodItem.ageRestricted ? <span className="media-item-hero-badge">21+</span> : null}
      {foodItem.isPromoted ? (
        <span className="media-item-hero-badge media-item-hero-badge--accent">Promoted</span>
      ) : null}
      {foodItem.isNewThisSeason ? <span className="media-item-hero-badge">New</span> : null}
      {editorialVenueBadge ? (
        <span className="media-item-hero-badge media-item-hero-badge--accent">
          {editorialVenueBadge}
        </span>
      ) : null}
      <FoodItemAwardChips chips={awardChips} tone="media" />
    </>
  );

  return (
    <main className="media-page-shell min-h-screen">
      <FoodItemHero
        foodName={foodItem.name}
        venueName={venue.name}
        venueHref={venueHref}
        metaLine={itemMetaLine}
        reviewHref={reviewPath}
        reviewCtaLabel={reviewCtaLabel}
        reviewHint={reviewHint}
        badges={heroBadges}
        heroImageUrl={heroImageUrl}
        heroImageAlt={heroEntry?.alt ?? `Fan photo for ${foodItem.name}`}
        stats={
          <FoodItemStatsStrip
            tone="media"
            slopScore={unratedSeason ? "—" : seasonStats.averageSlopScore.toFixed(1)}
            slopDetail={unratedSeason ? undefined : slopTier}
            slopUnrated={unratedSeason}
            freshScore={
              hasGameDayFreshToday ? freshStats.averageSlopScore.toFixed(1) : "—"
            }
            freshLive={hasGameDayFreshToday}
            freshDetail={
              hasGameDayFreshToday
                ? foodItem.freshWindowLabel
                  ? foodItem.freshWindowLabel
                  : "Game-day takes"
                : "Opens on game day"
            }
            reviewCount={seasonStats.reviewCount}
            reviewDetail={
              napkinEligible
                ? `${seasonStats.roundedNapkinRating}/5 napkins`
                : "Season scope"
            }
            priceDisplay={
              priceIntel.displayPrice
                ? `$${Number(priceIntel.displayPrice).toFixed(2)}`
                : "—"
            }
            priceDetail={
              foodItem.priceLastConfirmedLabel ??
              (priceIntel.reportCount ? `${priceIntel.reportCount} reports` : "Fan reports")
            }
            replayLabel={unratedSeason ? undefined : seasonStats.topReplayValue?.label}
            replayDetail={
              seasonStats.topReplayValue && seasonStats.topReplayValue.percentage > 0
                ? `${seasonStats.topReplayValue.percentage}% fans`
                : undefined
            }
          />
        }
      />

      <div className="media-venue-content">
        <AgeGateProvider>
          <FoodItemAgeGate alcoholRelated={alcoholRelated} tone="media">
            <Suspense fallback={null}>
              <SlopCardShareModule
                itemPath={itemPath}
                celebrationFromServer={showReviewSaved}
                photoErrorCode={photoError ?? null}
                shareUrl={celebrationShareUrl}
                shareTitle={celebrationShareTitle}
                shareDescription={celebrationShareDescription}
                photoErrorMessage={photoErrorFollowUp}
                photoRetryHref={
                  showPhotoRetryCta ? `${reviewPath}?photoRetry=1` : null
                }
                preview={shareSlopPreview}
              />
            </Suspense>

            {showReviewSaved ? (
              <AdSlot
                placementKey="review.confirmation"
                variant="card"
                tone="media"
                className="mt-4"
                label="Sponsored"
              />
            ) : null}

            <article className="media-content-card media-content-section">
              <p className="media-section-eyebrow">Your review</p>
              <h2 className="media-section-title">Share your take</h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--media-ink-muted)]">
                {reviewHint}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link href={reviewPath} className="media-primary-button w-full justify-center sm:w-auto">
                  {reviewCtaLabel}
                </Link>
                <Link href={venueHref} className="media-cta-outline w-full justify-center sm:w-auto">
                  Back to {venue.name}
                </Link>
              </div>
            </article>

            <AdSlot
              placementKey="item.detail.inline"
              variant="inline"
              className="mt-4 sm:mt-5"
            />

            <section
              id="fan-photo-reviews"
              className="media-content-card media-content-section scroll-mt-24 sm:scroll-mt-20"
            >
              <div className="media-section-heading">
                <div>
                  <p className="media-section-eyebrow">Fan photos</p>
                  <h2 className="media-section-title">Slop Scorecards</h2>
                </div>
                {helpfulStatusMessage ? (
                  <p
                    className="text-[0.7rem] font-semibold text-[var(--media-ink-muted)]"
                    role="status"
                  >
                    {helpfulStatusMessage}
                  </p>
                ) : null}
              </div>
              <Suspense fallback={null}>
                <SlopScorecardHelpfulAnchor />
              </Suspense>
              <div className="mt-4">
                {photoBackedReviews.length > 0 ? (
                  <FoodItemScorecardDeck
                    reviews={photoBackedReviews}
                    venueSlug={venue.slug}
                    foodSlug={foodItem.slug}
                    foodName={foodItem.name}
                    venueName={venue.name}
                    napkinEligible={napkinEligible}
                    slopCardLocation={slopCardLocation}
                    contributorUserId={contributorUserId}
                    likedReviewIds={[...likedReviewIds]}
                    photoPlaceholderDefault={foodPhotos[0]?.imagePlaceholder}
                    isSignedIn={isSignedIn}
                    itemPageWithReviewsAnchor={itemPageWithReviewsAnchor}
                    baseReportContext={baseReportContext}
                    markReviewHelpful={markReviewHelpful}
                  />
                ) : (
                  <PhotoBackedReviewsEmpty
                    reviewHref={reviewPath}
                    venueSlug={venue.slug}
                    foodSlug={foodItem.slug}
                    tone="media"
                  />
                )}
              </div>
            </section>

            {!hasGameDayFreshToday ? (
              <div className="media-content-section">
                <GameDayFreshPendingBlock tone="media" />
              </div>
            ) : foodItem.freshSignal ? (
              <section className="media-content-card media-content-section">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="media-section-eyebrow">Fresh signal</p>
                  {hasGameDayFreshToday ? (
                    <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-emerald-600">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                      Live · {foodItem.freshReviewCount} takes
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-black text-[var(--media-ink)]">
                  {foodItem.freshSignal}
                </p>
                {foodItem.freshSignalReason ? (
                  <p className="mt-1 line-clamp-2 text-[0.8125rem] text-[var(--media-ink-muted)]">
                    {foodItem.freshSignalReason}
                  </p>
                ) : null}
              </section>
            ) : null}

            <section className="media-content-card media-content-section">
              <p className="media-section-eyebrow">Community</p>
              <h2 className="media-section-title">Fan signals</h2>
              {unratedSeason ? (
                <div className="mt-3">
                  <FanSignalsPendingPanel tone="media" />
                </div>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FanSignalBreakdown title="Replay value" stats={seasonStats.replayValue} />
                  <FanSignalBreakdown title="Price check" stats={seasonStats.priceCheck} />
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.7rem] text-[var(--media-ink-dim)]">
                <FanPoweredGuideBadge className="media-guide-badge" />
                <ReportContentLink context={baseReportContext} variant="section" />
                <SuggestCorrectionLink
                  className="text-[var(--media-ink-dim)]"
                  context={{
                    kind: "item",
                    venueName: venue.name,
                    venueSlug: venue.slug,
                    vendorName: vendor?.name,
                    vendorSlug: vendor?.slug,
                    itemName: foodItem.name,
                    itemSlug: foodItem.slug,
                    pagePath: `/venues/${venue.slug}/${foodItem.slug}`
                  }}
                />
              </div>
            </section>

            {vendor && moreFromVendor.length > 0 ? (
              <section className="media-content-section">
                <div className="media-section-heading">
                  <h2 className="media-section-title">More · {vendor.name}</h2>
                  <Link href={`/venues/${venue.slug}/vendors/${vendor.slug}`} className="media-section-link">
                    Vendor →
                  </Link>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {moreFromVendor.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/venues/${venue.slug}/${item.slug}`} className="media-card block">
                        <p className="media-rank-card-title">{item.name}</p>
                        <p className="media-rank-card-meta">
                          {item.itemType} · {item.location}
                        </p>
                        <p className="media-rank-score mt-2">
                          {item.reviewCount === 0 ? "Unrated" : item.slopScore.toFixed(1)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="media-content-card media-content-section">
              <p className="media-section-eyebrow">Listing</p>
              <h2 className="media-section-title">Item details</h2>
              {foodItem.description ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--media-ink-muted)]">
                  {foodItem.description}
                </p>
              ) : null}
              <p className="mt-3 text-xs leading-relaxed text-[var(--media-ink-muted)]">
                {venue.city}, {venue.state} ·{" "}
                <span className="inline-flex items-center gap-1">
                  {venue.venueTypeKey ? (
                    <span className="text-sm leading-none" aria-hidden>
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
              <p className="mt-2 text-xs text-[var(--media-ink-dim)]">
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
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {foodItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--media-border)] bg-[var(--media-surface)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--media-ink-dim)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="media-panel-card mt-4 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--media-ink-dim)]">
                  Report price change
                </p>
                <p className="mt-1 text-xs text-[var(--media-ink-muted)]">
                  Functional reports only — pending admin review.
                </p>
                {priceStatusMessage ? (
                  <p
                    role="status"
                    className={`mt-2 text-xs leading-snug ${
                      priceQuery === "reported"
                        ? "text-emerald-700"
                        : "text-[var(--media-orange-deep)]"
                    }`}
                  >
                    {priceStatusMessage}
                  </p>
                ) : null}
                {!priceReportDbReady ? (
                  <p className="mt-2 text-xs leading-snug text-[var(--media-orange-deep)]">
                    Price reports need a live menu record for this item. Sample-only
                    listings cannot accept reports — browse imported stadium menus to
                    submit a price.
                  </p>
                ) : null}
                {isSignedIn && priceReportDbReady ? (
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
                      className="min-w-[8rem] flex-1 rounded-xl border border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-2 text-sm text-[var(--media-ink)] outline-none placeholder:text-[var(--media-ink-dim)] focus:border-[var(--media-orange)] sm:max-w-[10rem]"
                    />
                    <textarea
                      name="priceNote"
                      maxLength={240}
                      placeholder="Optional note"
                      className="min-h-[2.75rem] min-w-0 flex-[2] rounded-xl border border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-2 text-sm text-[var(--media-ink)] outline-none placeholder:text-[var(--media-ink-dim)] focus:border-[var(--media-orange)] sm:min-h-0"
                    />
                    <button type="submit" className="media-primary-button shrink-0 px-4 py-2 text-xs sm:text-sm">
                      Submit
                    </button>
                  </form>
                ) : !priceReportDbReady ? null : (
                  <Link
                    href={`/login?next=${encodeURIComponent(
                      `/venues/${venue.slug}/${foodItem.slug}`
                    )}`}
                    className="media-cta-outline mt-3 inline-flex px-4 py-2 text-xs"
                  >
                    Sign in to report price
                  </Link>
                )}
              </div>

              {foodItem.isPromoted && foodItem.sponsorDisclosure ? (
                <article className="media-panel-card mt-4 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--media-ink-dim)]">
                    Sponsor disclosure
                  </p>
                  <p className="mt-2 text-sm text-[var(--media-ink-muted)]">
                    {foodItem.sponsorDisclosure}
                  </p>
                  {foodItem.sponsorName ? (
                    <p className="mt-1 text-xs text-[var(--media-ink-dim)]">
                      Sponsor: {foodItem.sponsorName}
                    </p>
                  ) : null}
                </article>
              ) : null}

              {foodItem.alcoholic ? (
                <article className="media-panel-card mt-4 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--media-ink-dim)]">
                    Responsible drinking
                  </p>
                  <p className="mt-2 text-sm text-[var(--media-ink-muted)]">
                    Alcohol availability varies by venue. Must be 21+ to purchase. Please
                    drink responsibly.
                  </p>
                </article>
              ) : null}

              <ClaimListingCta
                className="media-panel-card mt-4 p-4 sm:p-5 [&_p]:text-[var(--media-ink-muted)] [&_p:nth-child(2)]:text-[var(--media-ink)] [&_p:first-child]:text-[var(--media-orange-deep)] [&_a]:border-[rgba(255,107,26,0.35)] [&_a]:bg-[rgba(255,107,26,0.08)] [&_a]:text-[var(--media-orange-deep)]"
                context={{
                  kind: "item",
                  venueName: venue.name,
                  venueSlug: venue.slug,
                  vendorName: vendor?.name,
                  vendorSlug: vendor?.slug,
                  itemName: foodItem.name,
                  itemSlug: foodItem.slug,
                  pagePath: `/venues/${venue.slug}/${foodItem.slug}`
                }}
              />
            </section>
          </FoodItemAgeGate>
        </AgeGateProvider>
      </div>
    </main>
  );
}
