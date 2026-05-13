import Image from "next/image";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { PriceCheck, ReplayValue } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getPublicFoodItemBySlug, getPublicVenueBySlug, slugFilterInsensitive } from "@/lib/public-data";
import { buildGameDayKey } from "@/lib/game-day";
import { findTodaysReviewForItem } from "@/lib/review-draft";
import {
  isCloudinaryConfigured,
  logUploadFailure,
  photoErrorQueryFromUploadFailure,
  uploadImageFile,
  validateImageFile
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { isNapkinEligibleFromPrisma, isNapkinEligibleItem } from "@/lib/item-eligibility";
import {
  MOCK_REVIEWER_EMAIL,
  MOCK_REVIEWER_USER_ID,
  MOCK_USER_COOKIE_NAME,
  hasMockUserAccess,
  mockReviewerProfile
} from "@/lib/user-auth";

const slopScoreOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
  defaultSelected
}: {
  label: string;
  name: string;
  value: string;
  defaultSelected?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        className="peer sr-only"
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultSelected}
      />
      <span className="block rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm font-bold text-zinc-400 peer-checked:border-[var(--slop-orange)] peer-checked:bg-[var(--slop-orange)] peer-checked:text-[var(--slop-ink)]">
        {label}
      </span>
    </label>
  );
}

function ScoreButton({
  score,
  defaultSelected
}: {
  score: number;
  defaultSelected?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        className="peer sr-only"
        type="radio"
        name="slopScore"
        value={score}
        required
        defaultChecked={defaultSelected}
      />
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-lg font-black text-zinc-300 peer-checked:border-[var(--slop-orange)] peer-checked:bg-[var(--slop-orange)] peer-checked:text-[var(--slop-ink)]">
        {score}
      </span>
    </label>
  );
}

function NapkinButton({
  value,
  label,
  defaultSelected
}: {
  value: number;
  label: string;
  defaultSelected?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        className="peer sr-only"
        type="radio"
        name="napkinRating"
        value={value}
        required
        defaultChecked={defaultSelected}
      />
      <span className="block rounded-2xl border border-zinc-800 bg-black p-3 text-left peer-checked:border-[var(--slop-orange)] peer-checked:bg-[color:rgba(255,159,28,0.14)]">
        <span className="block text-lg">{"▰".repeat(value)}</span>
        <span className="mt-1 block text-sm font-bold text-zinc-300">
          {value}/5 napkins
        </span>
        <span className="mt-1 block text-xs text-zinc-500">{label}</span>
      </span>
    </label>
  );
}

async function submitReview(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );
  const venueSlug = String(formData.get("venueSlug") ?? "");
  const foodSlug = String(formData.get("foodSlug") ?? "");
  const normalizedVenueSlug = venueSlug.trim();
  const normalizedFoodSlug = decodeURIComponent(foodSlug).trim();
  const draftPath = `/venues/${normalizedVenueSlug}/${normalizedFoodSlug}`;

  if (!isSignedIn) {
    redirect(`/login?next=${encodeURIComponent(`${draftPath}/review`)}`);
  }

  const venue = await prisma.venue.findFirst({
    where: { slug: slugFilterInsensitive(normalizedVenueSlug), status: "ACTIVE" }
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

  const slopScore = Number(formData.get("slopScore"));
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

  if (!Number.isFinite(slopScore) || slopScore < 1 || slopScore > 10) {
    redirect(`${canonicalItemPath}/review?error=missing-score`);
  }

  if (
    napkinEligible &&
    (!Number.isInteger(napkinRating) || napkinRating < 1 || napkinRating > 5)
  ) {
    redirect(`${canonicalItemPath}/review?error=missing-score`);
  }

  const photoFieldPre = formData.get("reviewPhoto");
  if (photoFieldPre instanceof File && photoFieldPre.size > 0) {
    if (!isCloudinaryConfigured()) {
      redirect(`${canonicalItemPath}/review?error=cloudinary`);
    }
    try {
      validateImageFile(photoFieldPre);
    } catch (err) {
      const code = photoErrorQueryFromUploadFailure(err);
      redirect(`${canonicalItemPath}/review?error=${code}`);
    }
  }

  const user = await prisma.user.upsert({
    where: { id: MOCK_REVIEWER_USER_ID },
    update: {
      email: MOCK_REVIEWER_EMAIL,
      displayName: mockReviewerProfile.displayName,
      handle: mockReviewerProfile.handle,
      homeVenueId: venue.id
    },
    create: {
      id: MOCK_REVIEWER_USER_ID,
      email: MOCK_REVIEWER_EMAIL,
      displayName: mockReviewerProfile.displayName,
      handle: mockReviewerProfile.handle,
      homeVenueId: venue.id
    }
  });

  const today = new Date();
  const seasonLabel = String(today.getFullYear());
  const gameDayKey = buildGameDayKey(venue.slug, today);
  const replayValueData =
    typeof replayValue === "string" && replayValue in ReplayValue
      ? (replayValue as ReplayValue)
      : null;
  const priceCheckData =
    typeof priceCheck === "string" && priceCheck in PriceCheck
      ? (priceCheck as PriceCheck)
      : null;

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
      verifiedGameDay: true,
      seasonLabel,
      note: noteValue ? noteValue.slice(0, 300) : null
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
      verifiedGameDay: true,
      seasonLabel,
      note: noteValue ? noteValue.slice(0, 300) : null
    }
  });

  const photoField = formData.get("reviewPhoto");

  if (photoField instanceof File && photoField.size > 0) {
    let secureUrl: string;

    try {
      ({ secureUrl } = await uploadImageFile(photoField, {
        folder: `stadium-slop/reviews/${foodItemRow.id}`,
        publicId: `${review.id}-${Date.now()}`
      }));
    } catch (err) {
      logUploadFailure("reviewPhotoUpload", photoField, err);
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

    const caption = String(formData.get("photoCaption") ?? "").trim().slice(0, 120);

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
          url: secureUrl,
          alt: caption || `${foodItemRow.name} fan photo`,
          caption: caption || null,
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

  const reviewFormErrorMessage =
    urlError === "too_large"
      ? "Image must be about 8MB or smaller. Shrink the file and try again."
      : urlError === "heic"
        ? "HEIC/HEIF is not supported. Export as JPEG or use “Most Compatible” camera format."
        : urlError === "unsupported"
          ? "Use JPEG, PNG, WebP, or GIF."
          : urlError === "cloudinary"
            ? "Photo uploads need Cloudinary configured on the server."
            : urlError === "upload"
              ? "Upload failed. Check connection and try again."
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
  const cloudinaryReady = isCloudinaryConfigured();
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );
  const reviewPath = `/venues/${venue.slug}/${foodItem.slug}/review`;

  if (!isSignedIn) {
    return (
      <main className="brand-page min-h-screen">
        <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 lg:px-10">
          <Link
            href={`/venues/${venue.slug}/${foodItem.slug}`}
            className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
          >
            Back to food details
          </Link>

          <header className="py-6 sm:py-10">
            <p className="brand-pill mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.15em]">
              Sign-in required
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Review {foodItem.name}
            </h1>
            <p className="mt-3 text-base text-zinc-300 sm:text-lg">
              {venue.name} · {venue.city}, {venue.state}
            </p>
          </header>

          <section className="brand-panel rounded-3xl border p-5 sm:p-6">
            <h2 className="text-2xl font-black sm:text-3xl">
              Sign in to submit a review
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Reviews belong to a reviewer profile so fans can trust who
              contributed the Slop Score, photos, and game-day signals. You can
              browse without signing in, but submitting reviews and marking
              helpful likes requires a profile.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/login?next=${encodeURIComponent(reviewPath)}`}
                className="brand-cta rounded-full px-6 py-4 text-center text-sm font-black transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-[var(--slop-line)] px-6 py-4 text-center text-sm font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-blue)] hover:text-[var(--slop-blue)]"
              >
                Create profile
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">
              Temporary mock auth only. No real password security or database is
              connected yet.
            </p>
          </section>
        </section>
      </main>
    );
  }

  const draft = foodItem.id
    ? await findTodaysReviewForItem({
        userId: MOCK_REVIEWER_USER_ID,
        foodItemId: foodItem.id,
        venueSlug: venue.slug
      })
    : null;

  const draftSlop =
    draft != null
      ? Math.min(10, Math.max(1, Math.round(Number(draft.slopScore))))
      : undefined;
  const draftNapkin = draft?.napkinRating;
  const draftReplay = draft?.replayValue ?? undefined;
  const draftPrice = draft?.priceCheck ?? undefined;
  const draftNote = draft?.note ?? "";
  const existingPhoto = draft?.photos[0];
  const draftCaption = existingPhoto?.caption ?? "";

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 lg:px-10">
        <Link
          href={`/venues/${venue.slug}/${foodItem.slug}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to food details
        </Link>

        <header className="py-5 sm:py-8">
          {showPhotoRetryHint || urlPhotoError ? (
            <div
              role="status"
              className="mb-4 rounded-2xl border border-sky-800/80 bg-sky-950/40 px-4 py-3 text-sm text-sky-100"
            >
              <p className="font-bold">Add or retry a fan photo</p>
              <p className="mt-1 text-sky-100/90">
                Your Slop Score and signals for today are already saved. Submit
                again with a photo (JPEG/PNG/WebP/GIF, up to about 8MB) — the
                same-day form updates your existing review; nothing is double
                counted.
              </p>
              {urlPhotoError ? (
                <p className="mt-2 text-xs text-amber-200/95">
                  Last attempt: photo issue ({urlPhotoError.replace(/_/g, " ")}).
                </p>
              ) : null}
            </div>
          ) : null}
          {reviewFormErrorMessage ? (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-amber-800/80 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
            >
              <p className="font-bold">Photo not accepted</p>
              <p className="mt-1 text-amber-100/95">{reviewFormErrorMessage}</p>
            </div>
          ) : null}
          <p className="mb-3 inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
            Mock Review Flow · {foodItem.itemType}
          </p>
          {foodItem.ageRestricted ? (
            <p className="mb-3 ml-2 inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
              21+
            </p>
          ) : null}
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {draft
              ? `Edit today’s review · ${foodItem.name}`
              : `Review ${foodItem.name}`}
          </h1>
          <p className="mt-3 text-base text-zinc-300 sm:text-lg">
            {venue.name} · {venue.city}, {venue.state}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            You can update today&apos;s review; it replaces your earlier score for
            this item. Saving uses one row per fan per item per game day — no
            duplicate scorecards.
          </p>
        </header>

        <form action={submitReview} className="brand-panel rounded-3xl border p-4 sm:p-6">
          <input type="hidden" name="venueSlug" value={venue.slug} />
          <input type="hidden" name="foodSlug" value={foodItem.slug} />
          <div className="rounded-2xl bg-black p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Mock signed in
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This review belongs to your temporary reviewer profile. Fan photos
              help power Game Day Fresh when you upload a real shot from the
              seats.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-black p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Verified game-day
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Today&apos;s reviews help power Game Day Fresh. Verified game-day
              reviews carry more weight, especially when they include a fan
              photo of what actually showed up.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Quick scorecard
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Tap it, snap it, move on.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {napkinEligible ? (
                <>
                  Slop Score and Napkin Rating are required because structured
                  signals power Season Standings. Photo and note are optional.
                </>
              ) : (
                <>
                  Slop Score is required for drinks and beverages. Napkin Rating
                  is for messy food only. Photo and note are optional.
                </>
              )}
            </p>
          </div>

          <div className="mt-6 space-y-7">
            <div>
              <h3 className="text-lg font-black">1. Slop Score</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Overall quality, 1-10. Think fan score, not restaurant review.
              </p>
              <div className="mt-3 grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
                {slopScoreOptions.map((score) => (
                  <ScoreButton
                    key={score}
                    score={score}
                    defaultSelected={draftSlop === score}
                  />
                ))}
              </div>
            </div>

            {napkinEligible ? (
              <div>
                <h3 className="text-lg font-black">2. Napkin Rating</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  How sloppy was it? This measures messiness, not quality.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-5">
                  {napkinOptions.map((option) => (
                    <NapkinButton
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      defaultSelected={draftNapkin === option.value}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-zinc-800 bg-black p-5">
              <h3 className="text-lg font-black">
                {napkinEligible ? "3." : "2."} Optional fan photo
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Fan photos help power Game Day Fresh. JPEG, PNG, WebP, or GIF up
                to about 8MB (same limit as the server upload cap). iPhone
                HEIC/HEIF is not supported yet — use “Most Compatible” camera
                format or export as JPEG. No comments, followers, or DMs —
                just the shot.
              </p>
              {existingPhoto?.url ? (
                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                    Current fan photo
                  </p>
                  <div className="relative mt-2 aspect-[4/3] max-h-52 w-full overflow-hidden rounded-xl bg-black sm:max-h-60">
                    <Image
                      src={existingPhoto.url}
                      alt={existingPhoto.alt}
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 768px) 100vw, 36rem"
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Upload a new file below to replace this photo for today&apos;s
                    review.
                  </p>
                </div>
              ) : null}
              {cloudinaryReady ? (
                <>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                      Upload
                    </span>
                    <input
                      name="reviewPhoto"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="mt-2 block w-full text-sm text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-[var(--slop-orange)] file:px-4 file:py-2 file:text-sm file:font-black file:text-[var(--slop-ink)]"
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                      Short caption (optional)
                    </span>
                    <input
                      name="photoCaption"
                      maxLength={120}
                      placeholder="e.g. Curds at first pitch"
                      defaultValue={draftCaption}
                      className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                    />
                  </label>
                </>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
                  Photo upload needs Cloudinary env vars on the server. Slop
                  Score and signals still save without a photo.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-black">
                {napkinEligible ? "4." : "3."} Optional food note
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                One quick food-focused reaction is enough. Aim for 280-300
                characters max. No comment threads, no dislikes.
              </p>
              <textarea
                name="note"
                maxLength={300}
                placeholder="Optional: hot, cold, worth it, messy, would run it back?"
                defaultValue={draftNote}
                className="mt-3 min-h-24 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-400 outline-none placeholder:text-zinc-600"
              />
            </div>

            <div className="rounded-2xl bg-black p-4">
              <p className="text-sm font-bold text-zinc-300">
                Replay Value
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Would you get this again?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {replayValueOptions.map((option) => (
                  <SignalOption
                    key={option.value}
                    label={option.label}
                    name="replayValue"
                    value={option.value}
                    defaultSelected={draftReplay === option.value}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-black p-4">
              <p className="text-sm font-bold text-zinc-300">Price Check</p>
              <p className="mt-1 text-xs text-zinc-500">How was the value?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {priceCheckOptions.map((option) => (
                  <SignalOption
                    key={option.value}
                    label={option.label}
                    name="priceCheck"
                    value={option.value}
                    defaultSelected={draftPrice === option.value}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="brand-cta mt-7 w-full rounded-full px-6 py-4 text-sm font-black"
          >
            {draft ? "Update today’s review" : "Submit review"}
          </button>
        </form>

        {foodItem.alcoholic ? (
          <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Responsible Drinking
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Alcohol availability varies by venue. Must be 21+ to purchase.
              Please drink responsibly.
            </p>
          </section>
        ) : null}

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Trust
            </p>
            <p className="mt-3 text-lg font-black">
              Promoted placements can buy visibility, not ratings.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Season Standings
            </p>
            <p className="mt-3 text-lg font-black">
              Verified reviews help keep Season Standings honest.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
