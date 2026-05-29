import { revalidatePath } from "next/cache";
import { PriceCheck, ReplayValue } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getPublicFoodItemBySlug, getPublicVenueBySlug, slugFilterInsensitive } from "@/lib/public-data";
import {
  buildGameDayKey,
  buildTestReviewGameDayKey,
  formatGameDateTimeForVenue,
  formatGameDayPollingWindowHoursLabel,
  getVenueTimeZone,
  GAME_DAY_REVIEW_ERROR_MESSAGES,
  getVenueActiveGame,
  getVenueUpcomingGame,
  parseReviewLocationFromForm,
  resolveVenueReviewRadiusMeters,
  validateGameDayReviewSubmission,
  type GameDayReviewErrorCode
} from "@/lib/game-day";
import { findTodaysReviewForItem } from "@/lib/review-draft";
import {
  getFileDebug,
  isCloudinaryConfigured,
  logUploadFailure,
  photoErrorQueryFromUploadFailure,
  uploadImageFile,
  validateImageFile
} from "@/lib/cloudinary";
import { enforceRateLimit } from "@/lib/rate-limit";
import { reviewPagePhotoErrorMessage } from "@/lib/review-photo-errors";
import { prisma } from "@/lib/prisma";
import { normalizePublicImageUrl } from "@/lib/image-url";
import { isNapkinEligibleFromPrisma, isNapkinEligibleItem } from "@/lib/item-eligibility";
import { AuthConfigAlert } from "@/components/auth-config-alert";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { isGoogleSignInConfigured } from "@/lib/auth/env";
import { ReviewPageHero } from "@/components/review/review-page-hero";
import { ReviewFormLocation } from "@/components/review-form-location";
import { ReviewScorecardFormClient } from "@/components/review-scorecard-form-client";
import {
  canSubmitTestReviews,
  getTestReviewModeStatus
} from "@/lib/admin/test-reviews";
import { getContributorUserId, requireContributorUserId } from "@/lib/auth/contributor-id";
import {
  LOW_SCORE_PHOTO_MESSAGE,
  SLOP_SCORE_DEFAULT,
  clampSlopScore,
  parseSlopScoreInput,
  requiresLowScorePhoto
} from "@/lib/review-scorecard";
const replayValueOptions = [
  { label: "Game Day Starter", value: ReplayValue.GAME_DAY_STARTER },
  { label: "Solid Rotation Pick", value: ReplayValue.SOLID_ROTATION_PICK },
  { label: "Bench Option", value: ReplayValue.BENCH_OPTION },
  { label: "Cut From the Roster", value: ReplayValue.CUT_FROM_THE_ROSTER }
];
const priceCheckOptions = [
  {
    label: "Worth the Price of Admission",
    value: PriceCheck.WORTH_THE_PRICE_OF_ADMISSION
  },
  { label: "Fair Deal", value: PriceCheck.FAIR_DEAL },
  { label: "Stadium Tax", value: PriceCheck.STADIUM_TAX }
];
const napkinOptions = [
  { value: 1, label: "Clean Win" },
  { value: 2, label: "Safe at Your Seat" },
  { value: 3, label: "Two-Handed Problem" },
  { value: 4, label: "Jersey Danger" },
  { value: 5, label: "Full Cleanup Crew" }
];

type ReviewPageProps = {
  params: Promise<{
    venueSlug: string;
    foodSlug: string;
  }>;
  searchParams?: Promise<{
    photoRetry?: string;
    photoError?: string;
    error?: string;
  }>;
};

type SignalField = "replayValue" | "priceCheck";

function getReviewPhotoFromForm(formData: FormData): File | null {
  const field = formData.get("reviewPhoto");
  if (!(field instanceof File)) {
    if (field != null && String(field).trim()) {
      console.warn("[reviewPhotoUpload] unexpected reviewPhoto field type", {
        type: typeof field
      });
    }
    return null;
  }
  if (field.size === 0) {
    return null;
  }
  return field;
}

function revalidateFoodItemSurfaces(
  canonicalItemPath: string,
  venueSlug: string,
  vendorSlug: string
) {
  revalidatePath(canonicalItemPath);
  revalidatePath(`/venues/${venueSlug}`);
  revalidatePath(`${canonicalItemPath}/review`);
  revalidatePath(`/venues/${venueSlug}/vendors/${vendorSlug}`);
}

function SignalOption({
  label,
  name,
  value,
  defaultSelected,
  required: radioRequired,
  tone = "media"
}: {
  label: string;
  name: SignalField;
  value: string;
  defaultSelected?: boolean;
  required?: boolean;
  tone?: "brand" | "media";
}) {
  const choiceClass =
    tone === "media"
      ? "media-review-choice"
      : "flex min-h-11 items-center justify-center rounded-full border border-zinc-800 bg-black px-3 py-2.5 text-center text-xs font-bold leading-snug text-zinc-400 peer-checked:border-[var(--slop-orange)] peer-checked:bg-[var(--slop-orange)] peer-checked:text-[var(--slop-ink)] sm:min-h-12 sm:px-4 sm:text-sm";

  return (
    <label className="cursor-pointer touch-manipulation">
      <input
        className="peer sr-only"
        type="radio"
        name={name}
        value={value}
        required={radioRequired}
        defaultChecked={defaultSelected}
      />
      <span className={choiceClass}>{label}</span>
    </label>
  );
}

function NapkinButton({
  value,
  label,
  defaultSelected,
  radioRequired,
  tone = "media"
}: {
  value: number;
  label: string;
  defaultSelected?: boolean;
  radioRequired?: boolean;
  tone?: "brand" | "media";
}) {
  const napkinClass =
    tone === "media"
      ? "media-review-napkin"
      : "flex min-h-[3.25rem] flex-col justify-center rounded-xl border border-zinc-800 bg-black px-2.5 py-2 text-left peer-checked:border-[var(--slop-orange)] peer-checked:bg-[color:rgba(255,159,28,0.14)] sm:min-h-[3.5rem] sm:rounded-2xl sm:px-3";

  return (
    <label className="cursor-pointer touch-manipulation">
      <input
        className="peer sr-only"
        type="radio"
        name="napkinRating"
        value={value}
        required={radioRequired}
        defaultChecked={defaultSelected}
      />
      <span className={napkinClass}>
        {tone === "media" ? (
          <>
            <span className="media-review-napkin-bars">{"▰".repeat(value)}</span>
            <span className="media-review-napkin-value">{value}/5</span>
            <span className="media-review-napkin-label">{label}</span>
          </>
        ) : (
          <>
            <span className="block text-sm leading-none sm:text-base">
              {"▰".repeat(value)}
            </span>
            <span className="mt-1 block text-xs font-bold text-zinc-300">{value}/5</span>
            <span className="mt-0.5 line-clamp-2 text-[0.65rem] leading-tight text-zinc-500 sm:text-xs">
              {label}
            </span>
          </>
        )}
      </span>
    </label>
  );
}

async function submitReview(formData: FormData) {
  "use server";

  const venueSlug = String(formData.get("venueSlug") ?? "");
  const foodSlug = String(formData.get("foodSlug") ?? "");
  const normalizedVenueSlug = venueSlug.trim();
  const normalizedFoodSlug = decodeURIComponent(foodSlug).trim();

  const venue = await prisma.venue.findFirst({
    where: { slug: slugFilterInsensitive(normalizedVenueSlug), status: "ACTIVE" },
    select: {
      id: true,
      slug: true,
      latitude: true,
      longitude: true,
      reviewRadiusMeters: true
    }
  });

  const foodItemRow = venue
    ? await prisma.foodItem.findFirst({
        where: {
          slug: slugFilterInsensitive(normalizedFoodSlug),
          venueId: venue.id,
          status: "ACTIVE"
        },
        select: {
          id: true,
          slug: true,
          name: true,
          itemType: true,
          category: true,
          customCategoryLabel: true,
          vendor: { select: { slug: true } }
        }
      })
    : null;

  if (!venue || !foodItemRow) {
    redirect(normalizedVenueSlug ? `/venues/${normalizedVenueSlug}` : "/venues");
  }

  const napkinEligible = isNapkinEligibleFromPrisma(foodItemRow);
  const canonicalItemPath = `/venues/${venue.slug}/${foodItemRow.slug}`;

  const slopScore = parseSlopScoreInput(formData.get("slopScore"));
  const napkinRaw = formData.get("napkinRating");
  let napkinRating: number;

  if (napkinEligible) {
    napkinRating = Number(napkinRaw);
  } else {
    napkinRating = 1;
  }

  const replayValue = formData.get("replayValue");
  const priceCheck = formData.get("priceCheck");
  const noteValue = String(formData.get("note") ?? "").trim();

  if (slopScore == null) {
    redirect(`${canonicalItemPath}/review?error=missing-score`);
  }

  if (
    napkinEligible &&
    (!Number.isInteger(napkinRating) || napkinRating < 1 || napkinRating > 5)
  ) {
    redirect(`${canonicalItemPath}/review?error=missing-score`);
  }

  const photoFieldPre = getReviewPhotoFromForm(formData);
  if (photoFieldPre) {
    if (!isCloudinaryConfigured()) {
      redirect(`${canonicalItemPath}/review?error=cloudinary`);
    }
    try {
      validateImageFile(photoFieldPre);
    } catch (err) {
      logUploadFailure("reviewPhotoValidate", photoFieldPre, err, {
        phase: "pre_submit"
      });
      const code = photoErrorQueryFromUploadFailure(err);
      redirect(`${canonicalItemPath}/review?photoRetry=1&photoError=${code}`);
    }
  }

  const userId = await requireContributorUserId(`${canonicalItemPath}/review`);
  const submitLimit = await enforceRateLimit("review-submit", { userId });
  if (!submitLimit.ok) {
    redirect(`${canonicalItemPath}/review?error=rate-limit`);
  }

  if (photoFieldPre) {
    const photoLimit = await enforceRateLimit("photo-upload", { userId });
    if (!photoLimit.ok) {
      redirect(`${canonicalItemPath}/review?error=rate-limit`);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { homeVenueId: venue.id }
  });

  const today = new Date();
  const seasonLabel = String(today.getFullYear());
  const testReviewMode = await canSubmitTestReviews(userId);
  const gameDayKey = testReviewMode
    ? buildTestReviewGameDayKey(venue.slug, today)
    : buildGameDayKey(venue.slug, today);
  const replayValueData =
    typeof replayValue === "string" && replayValue in ReplayValue
      ? (replayValue as ReplayValue)
      : null;
  const priceCheckData =
    typeof priceCheck === "string" && priceCheck in PriceCheck
      ? (priceCheck as PriceCheck)
      : null;

  if (!replayValueData) {
    redirect(`${canonicalItemPath}/review?error=missing-replay`);
  }
  if (!priceCheckData) {
    redirect(`${canonicalItemPath}/review?error=missing-price`);
  }

  let gameDayVerification: {
    gameId: string | null;
    verifiedGameDay: boolean;
    locationVerifiedAt: Date | null;
    distanceFromVenueMeters: number | null;
    isTestReview: boolean;
  };

  if (testReviewMode) {
    gameDayVerification = {
      gameId: null,
      verifiedGameDay: false,
      locationVerifiedAt: null,
      distanceFromVenueMeters: null,
      isTestReview: true
    };
  } else {
    const activeGame = await getVenueActiveGame(venue.id);
    const gameDayCheck = validateGameDayReviewSubmission({
      activeGame,
      venueLatitude: venue.latitude,
      venueLongitude: venue.longitude,
      reviewRadiusMeters: venue.reviewRadiusMeters,
      location: parseReviewLocationFromForm(formData)
    });

    if (!gameDayCheck.ok) {
      redirect(`${canonicalItemPath}/review?error=${gameDayCheck.code}`);
    }

    gameDayVerification = {
      gameId: gameDayCheck.game.id,
      verifiedGameDay: true,
      locationVerifiedAt: new Date(),
      distanceFromVenueMeters: gameDayCheck.distanceFromVenueMeters,
      isTestReview: false
    };
  }

  if (requiresLowScorePhoto(slopScore)) {
    const hasNewPhoto = photoFieldPre != null;
    if (!hasNewPhoto) {
      const existingWithPhoto = await prisma.review.findUnique({
        where: {
          userId_foodItemId_gameDayKey: {
            userId: user.id,
            foodItemId: foodItemRow.id,
            gameDayKey
          }
        },
        select: {
          photos: {
            where: { status: "ACTIVE" },
            take: 1,
            select: { id: true }
          }
        }
      });
      if (!existingWithPhoto || existingWithPhoto.photos.length === 0) {
        redirect(`${canonicalItemPath}/review?error=low-score-photo`);
      }
    }
  }

  const review = await prisma.review.upsert({
    where: {
      userId_foodItemId_gameDayKey: {
        userId: user.id,
        foodItemId: foodItemRow.id,
        gameDayKey
      }
    },
    update: {
      slopScore,
      napkinRating,
      labels: [],
      replayValue: replayValueData,
      priceCheck: priceCheckData,
      seasonLabel,
      note: noteValue ? noteValue.slice(0, 300) : null,
      ...gameDayVerification
    },
    create: {
      userId: user.id,
      foodItemId: foodItemRow.id,
      venueId: venue.id,
      gameDayKey,
      slopScore,
      napkinRating,
      labels: [],
      replayValue: replayValueData,
      priceCheck: priceCheckData,
      seasonLabel,
      note: noteValue ? noteValue.slice(0, 300) : null,
      ...gameDayVerification
    }
  });

  const photoField = getReviewPhotoFromForm(formData);

  if (photoField) {
    console.info("[reviewPhotoUpload] uploading", getFileDebug(photoField));
    let secureUrl: string;

    try {
      ({ secureUrl } = await uploadImageFile(photoField, {
        folder: `stadium-slop/reviews/${foodItemRow.id}`,
        publicId: `${review.id}-${Date.now()}`
      }));
    } catch (err) {
      logUploadFailure("reviewPhotoUpload", photoField, err, {
        reviewId: review.id,
        foodItemId: foodItemRow.id
      });
      revalidateFoodItemSurfaces(
        canonicalItemPath,
        venue.slug,
        foodItemRow.vendor.slug
      );
      const photoError = photoErrorQueryFromUploadFailure(err);
      redirect(
        `${canonicalItemPath}/review?photoRetry=1&photoError=${photoError}`
      );
    }

    const publicUrl = normalizePublicImageUrl(secureUrl);
    if (!publicUrl) {
      revalidateFoodItemSurfaces(
        canonicalItemPath,
        venue.slug,
        foodItemRow.vendor.slug
      );
      redirect(`${canonicalItemPath}/review?photoRetry=1&photoError=invalid_url`);
    }

    try {
      const priorPhotoCount = await prisma.foodPhoto.count({
        where: { reviewId: review.id, status: "ACTIVE" }
      });

      await prisma.foodPhoto.deleteMany({
        where: { reviewId: review.id }
      });

      await prisma.foodPhoto.create({
        data: {
          foodItemId: foodItemRow.id,
          venueId: venue.id,
          reviewId: review.id,
          uploaderUserId: user.id,
          photoType: "FOOD",
          url: publicUrl,
          alt: `${foodItemRow.name} fan photo`,
          caption: null,
          verifiedOnSite: true,
          status: "ACTIVE"
        }
      });

      if (priorPhotoCount === 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { photoUploadCount: { increment: 1 } }
        });
      }
    } catch (err) {
      console.warn("[reviewPhotoSave] DB write after Cloudinary upload failed", {
        message: err instanceof Error ? err.message : String(err),
        reviewId: review.id
      });
      revalidateFoodItemSurfaces(
        canonicalItemPath,
        venue.slug,
        foodItemRow.vendor.slug
      );
      redirect(
        `${canonicalItemPath}/review?photoRetry=1&photoError=photo_save`
      );
    }
  }

  revalidateFoodItemSurfaces(
    canonicalItemPath,
    venue.slug,
    foodItemRow.vendor.slug
  );

  redirect(`${canonicalItemPath}?reviewSubmitted=true`);
}

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const { venueSlug, foodSlug } = await params;
  const query = (await searchParams) ?? {};
  const showPhotoRetryHint = query.photoRetry === "1";
  const urlPhotoError = query.photoError;
  const urlError = query.error;

  const gameDayErrorCode =
    urlError && urlError in GAME_DAY_REVIEW_ERROR_MESSAGES
      ? (urlError as GameDayReviewErrorCode)
      : null;

  const reviewFormErrorMessage = gameDayErrorCode
    ? GAME_DAY_REVIEW_ERROR_MESSAGES[gameDayErrorCode]
    : urlError === "rate-limit"
      ? "Too many submissions in a short window. Please wait a few minutes and try again."
    : urlError === "missing-score"
      ? "Set a Slop Score from 1.0 to 10.0 (and Napkin Rating for food)."
      : urlError === "low-score-photo"
        ? LOW_SCORE_PHOTO_MESSAGE
        : urlError === "missing-replay"
        ? "Pick a Replay Value — would you order this again?"
        : urlError === "missing-price"
          ? "Pick a Price Check — how was the value?"
          : reviewPagePhotoErrorMessage(urlError);

  const photoRetryDetailMessage = reviewPagePhotoErrorMessage(urlPhotoError);

  const reviewErrorAlertTitle = gameDayErrorCode
    ? "Game-day review not accepted"
    : urlError === "missing-score" ||
        urlError === "missing-replay" ||
        urlError === "missing-price" ||
        urlError === "low-score-photo"
      ? "Finish required fields"
      : "Photo not accepted";

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
  const cloudinaryReady = isCloudinaryConfigured();
  const reviewPath = `/venues/${venue.slug}/${foodItem.slug}/review`;
  const contributorUserId = await getContributorUserId();

  const itemHref = `/venues/${venue.slug}/${foodItem.slug}`;
  const heroTitle = `Rate ${foodItem.name}`;
  const heroMeta = (
    <span>
      {venue.name} · {venue.city}, {venue.state}
    </span>
  );

  if (!contributorUserId) {
    return (
      <main className="media-page-shell min-h-screen">
        <ReviewPageHero
          title={heroTitle}
          venueName={venue.name}
          itemHref={itemHref}
          metaLine={heroMeta}
          badges={
            <span className="media-item-hero-badge media-item-hero-badge--accent">
              Sign in required
            </span>
          }
        />
        <div className="media-review-content">
          <article className="media-review-card">
            <p className="media-review-card-title">Continue with Google</p>
            <p className="media-review-card-hint">
              Sign in to submit a Slop Scorecard — score, signals, and optional fan photo.
              Browsing stays public; scorecards need your account.
            </p>
            <AuthConfigAlert className="mt-3" />
            <div className="mt-4">
              <GoogleSignInButton
                callbackUrl={reviewPath}
                className="media-primary-button w-full justify-center px-5 py-3.5 text-sm sm:w-auto"
                disabled={!isGoogleSignInConfigured()}
              />
            </div>
          </article>
        </div>
      </main>
    );
  }

  const testReviewStatus = await getTestReviewModeStatus(contributorUserId);
  const testReviewModeActive = testReviewStatus.active;

  const draft = foodItem.id
    ? await findTodaysReviewForItem({
        userId: contributorUserId,
        foodItemId: foodItem.id,
        venueSlug: venue.slug,
        testReview: testReviewModeActive
      })
    : null;

  const draftSlop =
    draft != null ? clampSlopScore(Number(draft.slopScore)) : SLOP_SCORE_DEFAULT;
  const draftNapkin = draft?.napkinRating;
  const draftReplay = draft?.replayValue ?? undefined;
  const draftPrice = draft?.priceCheck ?? undefined;
  const draftNote = draft?.note ?? "";
  const existingPhoto =
    draft?.photos.find((p) => normalizePublicImageUrl(p.url)) ?? undefined;
  const dbVenue = await prisma.venue.findUnique({
    where: { slug: venue.slug },
    select: {
      id: true,
      reviewRadiusMeters: true,
      latitude: true,
      longitude: true
    }
  });
  let activeGame: Awaited<ReturnType<typeof getVenueActiveGame>> = null;
  let upcomingGame: Awaited<ReturnType<typeof getVenueUpcomingGame>> = null;
  if (dbVenue?.id) {
    try {
      [activeGame, upcomingGame] = await Promise.all([
        getVenueActiveGame(dbVenue.id),
        getVenueUpcomingGame(dbVenue.id)
      ]);
    } catch (error) {
      console.warn("Game day lookup failed on review page", error);
    }
  }
  const pollingOpen = Boolean(activeGame);
  const reviewRadiusMeters = resolveVenueReviewRadiusMeters(
    dbVenue?.reviewRadiusMeters ?? venue.reviewRadiusMeters
  );
  const hasVenueCoords =
    Boolean(dbVenue?.latitude && dbVenue?.longitude) ||
    Boolean(venue.latitude && venue.longitude);
  const pollingWindowHoursLabel = formatGameDayPollingWindowHoursLabel();
  const venueTimeZone = getVenueTimeZone({
    slug: venue.slug,
    state: venue.state,
    country: venue.country
  });

  const statusNote = (
    <>
      {testReviewModeActive
        ? "Test review mode is on for your admin account. Submissions skip location certification and do not affect public Slop Score, Fresh Signal, or awards."
        : pollingOpen
          ? `Active home-game window (${pollingWindowHoursLabel}). Certify your location at the stadium to submit.`
          : "You can draft anytime. Certified reviews can only be submitted during an active home-game window while you're at the stadium."}
      {!pollingOpen && upcomingGame ? (
        <>
          {" "}
          Next home game:{" "}
          {formatGameDateTimeForVenue(upcomingGame.startsAt, venueTimeZone, {
            includeZone: true
          })}
          .
        </>
      ) : null}
      {!hasVenueCoords ? (
        <>
          {" "}
          Stadium coordinates are not on file for this venue yet — location certification may
          fail until coords are added.
        </>
      ) : null}
    </>
  );

  const heroAlerts = (
    <>
      {showPhotoRetryHint || urlPhotoError ? (
        <div role="status" className="media-review-alert media-review-alert--info">
          <p className="font-bold">Photo retry</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            Score and signals are saved. Add a JPEG/PNG/WebP/GIF (about 8MB max) — same-day submit
            replaces today&apos;s row, no duplicates.
          </p>
          {urlPhotoError ? (
            <p className="mt-2 text-[0.65rem] font-semibold">
              Last issue: {urlPhotoError.replace(/_/g, " ")}.
            </p>
          ) : null}
        </div>
      ) : null}
      {reviewFormErrorMessage ? (
        <div role="alert" className="media-review-alert media-review-alert--warn">
          <p className="font-bold">{reviewErrorAlertTitle}</p>
          <p className="mt-1 text-xs leading-relaxed">{reviewFormErrorMessage}</p>
        </div>
      ) : null}
    </>
  );

  return (
    <main className="media-page-shell min-h-screen">
      <ReviewPageHero
        title={draft ? `Edit · ${foodItem.name}` : foodItem.name}
        venueName={venue.name}
        itemHref={itemHref}
        metaLine={heroMeta}
        statusNote={statusNote}
        alerts={heroAlerts}
        badges={
          <>
            <span className="media-item-hero-badge">
              Game day · {foodItem.itemType}
            </span>
            {foodItem.ageRestricted ? (
              <span className="media-item-hero-badge">21+</span>
            ) : null}
          </>
        }
      />

      <div className="media-review-content">
        <form
          id="review-form"
          action={submitReview}
          encType="multipart/form-data"
          className="space-y-4"
        >
          <input type="hidden" name="venueSlug" value={venue.slug} />
          <input type="hidden" name="foodSlug" value={foodItem.slug} />

          <p className="text-center text-[0.7rem] leading-relaxed text-[var(--media-ink-muted)]">
            {napkinEligible
              ? "Slop score, napkins, replay, and price are required. Photo required under 5.0."
              : "Slop score, replay, and price are required — no napkin row for drinks. Photo required under 5.0."}
          </p>

          <ReviewScorecardFormClient
            formId="review-form"
            tone="media"
            defaultSlopScore={draftSlop}
            cloudinaryReady={cloudinaryReady}
            existingPhotoUrl={existingPhoto?.url ?? null}
            existingPhotoAlt={existingPhoto?.alt ?? `${foodItem.name} fan photo`}
          >
            {napkinEligible ? (
              <section className="media-review-card" aria-labelledby="napkin-label">
                <h2 id="napkin-label" className="media-review-card-title">
                  Napkin rating <span className="text-[var(--media-orange)]">*</span>
                </h2>
                <p className="media-review-card-hint">Messiness, not quality.</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {napkinOptions.map((option) => (
                    <NapkinButton
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      defaultSelected={draftNapkin === option.value}
                      radioRequired={option.value === 1}
                      tone="media"
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="media-review-card">
              <h2 className="media-review-card-title">
                Slop Signals <span className="text-[var(--media-orange)]">*</span>
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--media-ink-dim)]">
                    Replay value
                  </p>
                  <p className="media-review-card-hint">Order again?</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {replayValueOptions.map((option, idx) => (
                      <SignalOption
                        key={option.value}
                        label={option.label}
                        name="replayValue"
                        value={option.value}
                        defaultSelected={draftReplay === option.value}
                        required={idx === 0}
                        tone="media"
                      />
                    ))}
                  </div>
                </div>
                <div className="border-t border-[var(--media-border)] pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--media-ink-dim)]">
                    Price check
                  </p>
                  <p className="media-review-card-hint">Worth it?</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-wrap sm:flex-row">
                    {priceCheckOptions.map((option, idx) => (
                      <SignalOption
                        key={option.value}
                        label={option.label}
                        name="priceCheck"
                        value={option.value}
                        defaultSelected={draftPrice === option.value}
                        required={idx === 0}
                        tone="media"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </ReviewScorecardFormClient>

          <section className="media-review-card">
            <h2 className="media-review-card-title">
              Hot Take <span className="font-normal text-[var(--media-ink-dim)]">(optional)</span>
            </h2>
            <p className="media-review-card-hint">
              This appears on the back of your Slop Scorecard. Max 300 characters.
            </p>
            <textarea
              name="note"
              maxLength={300}
              rows={3}
              placeholder="One-liner for fans flipping your card"
              defaultValue={draftNote}
              className="media-review-textarea"
            />
          </section>

          <section className="media-review-card">
            <p className="text-center text-[0.7rem] leading-relaxed text-[var(--media-ink-muted)]">
              {draft
                ? "Updating today replaces your earlier Slop Scorecard for this item — one per fan per game day."
                : "One Slop Scorecard per fan, item, and game day. You can edit later today if needed."}
            </p>
            <ReviewFormLocation
              formId="review-form"
              tone="media"
              pollingOpen={pollingOpen}
              reviewRadiusMeters={reviewRadiusMeters}
              isDraft={Boolean(draft)}
              testReviewModeActive={testReviewModeActive}
            />
          </section>
        </form>

        {foodItem.alcoholic ? (
          <p className="media-review-card mt-4 px-3 py-2.5 text-center text-xs text-[var(--media-ink-muted)]">
            21+ where served. Drink responsibly — availability varies by park.
          </p>
        ) : null}

        <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-[var(--media-ink-dim)]">
          Promotions can buy visibility, not ratings. No followers, DMs, or comment threads.
        </p>
      </div>
    </main>
  );
}
