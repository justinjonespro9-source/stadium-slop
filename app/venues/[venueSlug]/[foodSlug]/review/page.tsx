import Link from "next/link";
import { revalidatePath } from "next/cache";
import { PriceCheck, ReplayValue } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getPublicFoodItemBySlug, getPublicVenueBySlug, slugFilterInsensitive } from "@/lib/public-data";
import { buildGameDayKey } from "@/lib/game-day";
import { findTodaysReviewForItem } from "@/lib/review-draft";
import {
  getFileDebug,
  isCloudinaryConfigured,
  logUploadFailure,
  photoErrorQueryFromUploadFailure,
  uploadImageFile,
  validateImageFile
} from "@/lib/cloudinary";
import { reviewPagePhotoErrorMessage } from "@/lib/review-photo-errors";
import { prisma } from "@/lib/prisma";
import { PhotoCropUpload } from "@/components/photo-crop-upload";
import { normalizePublicImageUrl } from "@/lib/image-url";
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
  required: radioRequired
}: {
  label: string;
  name: SignalField;
  value: string;
  defaultSelected?: boolean;
  required?: boolean;
}) {
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
      <span className="flex min-h-11 items-center justify-center rounded-full border border-zinc-800 bg-black px-3 py-2.5 text-center text-xs font-bold leading-snug text-zinc-400 peer-checked:border-[var(--slop-orange)] peer-checked:bg-[var(--slop-orange)] peer-checked:text-[var(--slop-ink)] sm:min-h-12 sm:px-4 sm:text-sm">
        {label}
      </span>
    </label>
  );
}

function ScoreButton({
  score,
  defaultSelected,
  radioRequired
}: {
  score: number;
  defaultSelected?: boolean;
  radioRequired?: boolean;
}) {
  return (
    <label className="cursor-pointer touch-manipulation">
      <input
        className="peer sr-only"
        type="radio"
        name="slopScore"
        value={score}
        required={radioRequired}
        defaultChecked={defaultSelected}
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-black text-base font-black text-zinc-300 peer-checked:border-[var(--slop-orange)] peer-checked:bg-[var(--slop-orange)] peer-checked:text-[var(--slop-ink)] sm:h-12 sm:w-12 sm:rounded-2xl sm:text-lg">
        {score}
      </span>
    </label>
  );
}

function NapkinButton({
  value,
  label,
  defaultSelected,
  radioRequired
}: {
  value: number;
  label: string;
  defaultSelected?: boolean;
  radioRequired?: boolean;
}) {
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
      <span className="flex min-h-[3.25rem] flex-col justify-center rounded-xl border border-zinc-800 bg-black px-2.5 py-2 text-left peer-checked:border-[var(--slop-orange)] peer-checked:bg-[color:rgba(255,159,28,0.14)] sm:min-h-[3.5rem] sm:rounded-2xl sm:px-3">
        <span className="block text-sm leading-none sm:text-base">
          {"▰".repeat(value)}
        </span>
        <span className="mt-1 block text-xs font-bold text-zinc-300">
          {value}/5
        </span>
        <span className="mt-0.5 line-clamp-2 text-[0.65rem] leading-tight text-zinc-500 sm:text-xs">
          {label}
        </span>
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

  if (!replayValueData) {
    redirect(`${canonicalItemPath}/review?error=missing-replay`);
  }
  if (!priceCheckData) {
    redirect(`${canonicalItemPath}/review?error=missing-price`);
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
    urlError === "missing-score"
      ? "Slop Score (and Napkin Rating for food) are required."
      : urlError === "missing-replay"
        ? "Pick a Replay Value — would you order this again?"
        : urlError === "missing-price"
          ? "Pick a Price Check — how was the value?"
          : reviewPagePhotoErrorMessage(urlError);

  const photoRetryDetailMessage = reviewPagePhotoErrorMessage(urlPhotoError);

  const reviewErrorAlertTitle =
    urlError === "missing-score" ||
    urlError === "missing-replay" ||
    urlError === "missing-price"
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
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );
  const reviewPath = `/venues/${venue.slug}/${foodItem.slug}/review`;

  if (!isSignedIn) {
    return (
      <main className="brand-page min-h-screen">
        <section className="mx-auto w-full max-w-lg px-4 py-5 sm:max-w-xl sm:px-6">
          <Link
            href={`/venues/${venue.slug}/${foodItem.slug}`}
            className="inline-flex text-xs font-bold text-zinc-400 hover:text-white sm:text-sm"
          >
            ← Item
          </Link>

          <header className="pt-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Sign in required
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-white sm:text-3xl">
              Rate {foodItem.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {venue.name}
            </p>
          </header>

          <div className="mt-5 rounded-2xl border border-[var(--slop-line)] bg-[color:rgba(11,15,20,0.55)] p-4">
            <p className="text-sm leading-relaxed text-zinc-400">
              Free profile — verified at the park. Slop Scores and photos, no
              comment threads.
            </p>
            <div className="mt-4 grid gap-2">
              <Link
                href={`/login?next=${encodeURIComponent(reviewPath)}`}
                className="brand-cta rounded-full px-5 py-3.5 text-center text-sm font-black"
              >
                Sign in
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(reviewPath)}`}
                className="rounded-full border border-[var(--slop-line)] px-5 py-3.5 text-center text-sm font-black text-[var(--slop-cream)] hover:border-[var(--slop-blue)] hover:text-[var(--slop-blue)]"
              >
                Create profile
              </Link>
            </div>
            <p className="mt-3 text-[0.65rem] text-zinc-600">
              Demo auth for now — your reviews still save to the database.
            </p>
          </div>
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
  const existingPhoto =
    draft?.photos.find((p) => normalizePublicImageUrl(p.url)) ?? undefined;
  const draftCaption = existingPhoto?.caption ?? "";

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-lg px-4 py-5 sm:max-w-xl sm:px-6 lg:max-w-2xl">
        <Link
          href={`/venues/${venue.slug}/${foodItem.slug}`}
          className="inline-flex text-xs font-bold text-zinc-400 hover:text-white sm:text-sm"
        >
          ← Item
        </Link>

        <header className="py-4 sm:py-6">
          {showPhotoRetryHint || urlPhotoError ? (
            <div
              role="status"
              className="mb-3 rounded-xl border border-sky-800/80 bg-sky-950/40 px-3 py-2.5 text-sm text-sky-100"
            >
              <p className="font-bold">Photo retry</p>
              <p className="mt-1 text-xs leading-relaxed text-sky-100/90">
                Score and signals are saved. Add a JPEG/PNG/WebP/GIF (about 8MB
                max) — same-day submit replaces today&apos;s row, no duplicates.
              </p>
              {urlPhotoError ? (
                <p className="mt-2 text-[0.65rem] text-amber-200/95">
                  Last issue: {urlPhotoError.replace(/_/g, " ")}.
                </p>
              ) : null}
            </div>
          ) : null}
          {reviewFormErrorMessage ? (
            <div
              role="alert"
              className="mb-3 rounded-xl border border-amber-800/80 bg-amber-950/40 px-3 py-2.5 text-sm text-amber-100"
            >
              <p className="font-bold">{reviewErrorAlertTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/95">
                {reviewFormErrorMessage}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-zinc-300">
              Game day · {foodItem.itemType}
            </span>
            {foodItem.ageRestricted ? (
              <span className="inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-zinc-300">
                21+
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl">
            {draft ? `Edit · ${foodItem.name}` : foodItem.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {venue.name} · {venue.city}, {venue.state}
          </p>
        </header>

        <form
          id="review-form"
          action={submitReview}
          encType="multipart/form-data"
          className="rounded-2xl border border-[var(--slop-line)] bg-[color:rgba(11,15,20,0.55)] p-3 sm:p-5"
        >
          <input type="hidden" name="venueSlug" value={venue.slug} />
          <input type="hidden" name="foodSlug" value={foodItem.slug} />

          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-zinc-500">
            {napkinEligible ? "Food scorecard" : "Drink scorecard"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {napkinEligible
              ? "Slop, napkins, replay, and price are required. Photo and note are optional."
              : "Slop, replay, and price are required — no napkin row for drinks. Photo and note optional."}
          </p>

          <div className="mt-4 space-y-5">
            <section aria-labelledby="slop-label">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="slop-label" className="text-sm font-black text-white">
                  Slop Score <span className="text-[var(--slop-orange)]">*</span>
                </h2>
                <span className="text-[0.65rem] font-bold text-zinc-500">
                  1–10
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Fan score for what you got, not a restaurant write-up.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {slopScoreOptions.map((score) => (
                  <ScoreButton
                    key={score}
                    score={score}
                    defaultSelected={draftSlop === score}
                    radioRequired={score === 1}
                  />
                ))}
              </div>
            </section>

            {napkinEligible ? (
              <section aria-labelledby="napkin-label">
                <h2 id="napkin-label" className="text-sm font-black text-white">
                  Napkin rating{" "}
                  <span className="text-[var(--slop-orange)]">*</span>
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Messiness, not quality.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {napkinOptions.map((option) => (
                    <NapkinButton
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      defaultSelected={draftNapkin === option.value}
                      radioRequired={option.value === 1}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-xl border border-zinc-800 bg-black/80 p-3 sm:p-4">
              <h2 className="text-sm font-black text-white">
                Ballpark signals{" "}
                <span className="text-[var(--slop-orange)]">*</span>
              </h2>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Replay value
                  </p>
                  <p className="text-[0.65rem] text-zinc-600">Order again?</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {replayValueOptions.map((option, idx) => (
                      <SignalOption
                        key={option.value}
                        label={option.label}
                        name="replayValue"
                        value={option.value}
                        defaultSelected={draftReplay === option.value}
                        required={idx === 0}
                      />
                    ))}
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Price check
                  </p>
                  <p className="text-[0.65rem] text-zinc-600">Worth it?</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {priceCheckOptions.map((option, idx) => (
                      <SignalOption
                        key={option.value}
                        label={option.label}
                        name="priceCheck"
                        value={option.value}
                        defaultSelected={draftPrice === option.value}
                        required={idx === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-black/80 p-3 sm:p-4">
              <h2 className="text-sm font-black text-white">
                Fan photo{" "}
                <span className="font-semibold text-zinc-500">(optional)</span>
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Snap or upload only if you want — we use it for Fresh signals and
                your Slop Card. No comments or threads.
              </p>
              {cloudinaryReady ? (
                <PhotoCropUpload
                  formId="review-form"
                  inputName="reviewPhoto"
                  captionName="photoCaption"
                  defaultCaption={draftCaption}
                  existingPhotoUrl={existingPhoto?.url ?? null}
                  existingPhotoAlt={existingPhoto?.alt ?? `${foodItem.name} fan photo`}
                />
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-500">
                  Cloudinary not configured — save without a photo.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-sm font-black text-white">
                Quick note <span className="font-normal text-zinc-500">(optional)</span>
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Food-only vibe check — max 300 characters.
              </p>
              <textarea
                name="note"
                maxLength={300}
                rows={3}
                placeholder="Temp, texture, would you run it back?"
                defaultValue={draftNote}
                className="mt-2 w-full resize-y rounded-lg border border-zinc-800 bg-black px-3 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
              />
            </section>
          </div>

          <div className="mt-5 border-t border-zinc-800 pt-4">
            <p className="text-center text-[0.65rem] leading-relaxed text-zinc-500">
              {draft
                ? "Updating today replaces your earlier Slop Score and signals for this item — one row per fan per game day."
                : "One review per fan, item, and game day. You can edit later today if needed."}
            </p>
            <button
              type="submit"
              className="brand-cta mt-3 w-full touch-manipulation rounded-full px-5 py-3.5 text-sm font-black sm:py-4"
            >
              {draft ? "Update Today's Review" : "Submit Review"}
            </button>
          </div>
        </form>

        {foodItem.alcoholic ? (
          <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-center text-xs text-zinc-400">
            21+ where served. Drink responsibly — availability varies by park.
          </p>
        ) : null}

        <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-zinc-600">
          Promotions can buy visibility, not ratings. No followers, DMs, or
          comment threads.
        </p>
      </section>
    </main>
  );
}
