import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  isCloudinaryConfigured,
  logUploadFailure,
  photoErrorQueryFromUploadFailure,
  uploadImageFile
} from "@/lib/cloudinary";
import { ensureMockReviewerUser } from "@/lib/mock-user";
import { prisma } from "@/lib/prisma";
import { isGameDayKeyTodayForVenue } from "@/lib/game-day";
import {
  MOCK_REVIEWER_USER_ID,
  MOCK_USER_COOKIE_NAME,
  hasMockUserAccess,
  mockReviewerProfile
} from "@/lib/user-auth";

async function mockUserSignOut() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.delete(MOCK_USER_COOKIE_NAME);
  redirect("/account");
}

async function uploadProfileAvatar(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  if (!hasMockUserAccess(cookieStore.get(MOCK_USER_COOKIE_NAME)?.value)) {
    redirect("/login?next=/account");
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/account?error=no-file");
  }

  if (!isCloudinaryConfigured()) {
    redirect("/account?error=cloudinary");
  }

  await ensureMockReviewerUser();

  try {
    const { secureUrl } = await uploadImageFile(file, {
      folder: `stadium-slop/profiles/${MOCK_REVIEWER_USER_ID}`,
      publicId: `${MOCK_REVIEWER_USER_ID}-avatar`
    });

    await prisma.user.update({
      where: { id: MOCK_REVIEWER_USER_ID },
      data: {
        avatarUrl: secureUrl
      }
    });
  } catch (err) {
    logUploadFailure("accountAvatar", file, err);
    const code = photoErrorQueryFromUploadFailure(err);
    redirect(`/account?error=${encodeURIComponent(code)}`);
  }

  revalidatePath("/account");
  redirect("/account");
}

function reviewRowDateLabel(
  gameDayKey: string,
  venueSlug: string,
  verifiedGameDay: boolean,
  updatedAt: Date
): string {
  if (isGameDayKeyTodayForVenue(gameDayKey, venueSlug)) {
    return "Today · game day";
  }
  const tail = gameDayKey.match(/(\d{4}-\d{2}-\d{2})$/);
  let dateStr = updatedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  if (tail) {
    const [y, mo, da] = tail[1].split("-").map(Number);
    dateStr = new Date(y, mo - 1, da).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }
  return verifiedGameDay
    ? `${dateStr} · verified at park`
    : `${dateStr} · logged`;
}

function SignedOutAccount() {
  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-lg px-5 py-10 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
          Stadium Slop
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-4xl">
          Your reviewer dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Sign in to track Slop Scores, fan photos, helpful likes, and every park
          you&apos;ve rated—verified when you&apos;re at the venue.
        </p>

        <div className="mt-8 grid gap-3">
          <Link
            href="/login?next=/account"
            className="brand-cta rounded-full px-6 py-3.5 text-center text-sm font-black"
          >
            Sign in
          </Link>
          <Link
            href="/signup?next=/account"
            className="rounded-full border border-[var(--slop-line)] px-6 py-3.5 text-center text-sm font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-blue)] hover:text-[var(--slop-blue)]"
          >
            Create free profile
          </Link>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-zinc-600">
          Demo auth today—no passwords or email provider wired yet. Your history
          still saves to the database while you test.
        </p>
      </section>
    </main>
  );
}

type AccountPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const query = (await searchParams) ?? {};
  const uploadError = query.error;
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );

  if (!isSignedIn) {
    return <SignedOutAccount />;
  }

  const cloudinaryReady = isCloudinaryConfigured();
  const userId = MOCK_REVIEWER_USER_ID;

  let dbUser: {
    avatarUrl: string | null;
    displayName: string;
    handle: string;
    homeVenue: { name: string } | null;
  } | null = null;
  let totalReviews = 0;
  let helpfulLikesReceived = 0;
  let fanPhotoUploads = 0;
  let venuesReviewed = 0;
  let reviewHistory: {
    id: string;
    gameDayKey: string;
    verifiedGameDay: boolean;
    slopScore: number;
    napkinRating: number;
    helpfulLikes: number;
    photoCount: number;
    foodName: string;
    foodSlug: string;
    venueSlug: string;
    venueName: string;
    updatedAt: Date;
  }[] = [];

  try {
    await ensureMockReviewerUser();
    const [
      userRow,
      reviewCount,
      likeCount,
      photoCount,
      venueGroups,
      rows
    ] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          avatarUrl: true,
          displayName: true,
          handle: true,
          homeVenue: { select: { name: true } }
        }
      }),
      prisma.review.count({
        where: { userId, status: "ACTIVE" }
      }),
      prisma.helpfulLike.count({
        where: { review: { userId, status: "ACTIVE" } }
      }),
      prisma.foodPhoto.count({
        where: {
          uploaderUserId: userId,
          status: "ACTIVE",
          photoType: { in: ["FOOD", "MENU_PRICE_PROOF"] }
        }
      }),
      prisma.review.groupBy({
        by: ["venueId"],
        where: { userId, status: "ACTIVE" },
        orderBy: { venueId: "asc" }
      }),
      prisma.review.findMany({
        where: { userId, status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: {
          foodItem: {
            select: {
              name: true,
              slug: true,
              venue: { select: { slug: true, name: true } }
            }
          },
          _count: {
            select: {
              helpfulLikes: true,
              photos: { where: { status: "ACTIVE" } }
            }
          }
        }
      })
    ]);

    dbUser = userRow;
    totalReviews = reviewCount;
    helpfulLikesReceived = likeCount;
    fanPhotoUploads = photoCount;
    venuesReviewed = venueGroups.length;
    reviewHistory = rows.map((r) => ({
      id: r.id,
      gameDayKey: r.gameDayKey,
      verifiedGameDay: r.verifiedGameDay,
      slopScore: Number(r.slopScore),
      napkinRating: r.napkinRating,
      helpfulLikes: r._count.helpfulLikes,
      photoCount: r._count.photos,
      foodName: r.foodItem.name,
      foodSlug: r.foodItem.slug,
      venueSlug: r.foodItem.venue.slug,
      venueName: r.foodItem.venue.name,
      updatedAt: r.updatedAt
    }));
  } catch (error) {
    console.warn("Account dashboard DB read failed", error);
  }

  const displayName = dbUser?.displayName ?? mockReviewerProfile.displayName;
  const handle = dbUser?.handle ?? mockReviewerProfile.handle;
  const homeVenueLabel =
    dbUser?.homeVenue?.name ?? mockReviewerProfile.homeVenue;

  const uploadErrorMessage =
    uploadError === "too_large"
      ? "Photo was over the upload limit (about 8MB). Try a smaller JPEG or PNG."
      : uploadError === "heic"
        ? "HEIC/HEIF is not supported yet. Use “Most Compatible” in iPhone camera settings or export as JPEG."
        : uploadError === "unsupported"
          ? "That file type is not supported. Use JPEG, PNG, WebP, or GIF."
          : uploadError === "cloudinary"
            ? "Photo uploads are disabled until Cloudinary env vars are set on the server."
            : uploadError === "upload"
              ? "Photo upload failed. Check your connection and try a JPEG or PNG under about 8MB."
              : uploadError === "no-file"
                ? "Choose a photo file before saving."
                : null;

  const statTiles = [
    { label: "Reviews", value: totalReviews },
    { label: "Venues", value: venuesReviewed },
    { label: "Fan photos", value: fanPhotoUploads },
    { label: "Helpful likes", value: helpfulLikesReceived }
  ];

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:max-w-3xl lg:px-8">
        {uploadErrorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Profile photo</p>
            <p className="mt-0.5 text-amber-100/95">{uploadErrorMessage}</p>
          </div>
        ) : null}

        <header className="rounded-2xl border border-[var(--slop-line)] bg-[color:rgba(11,15,20,0.55)] p-4 sm:p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Reviewer dashboard
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex shrink-0 gap-4 sm:flex-col sm:items-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-dashed border-[var(--slop-orange)] bg-[var(--slop-cream)] text-xl font-black text-[var(--slop-ink)] sm:h-20 sm:w-20 sm:text-2xl">
                {dbUser?.avatarUrl ? (
                  <Image
                    src={dbUser.avatarUrl}
                    alt={`${displayName} profile photo`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {mockReviewerProfile.initials}
                  </span>
                )}
              </div>
              {cloudinaryReady ? (
                <form action={uploadProfileAvatar} className="min-w-0 flex-1 sm:w-full">
                  <label className="block">
                    <span className="sr-only">Upload profile photo</span>
                    <input
                      name="avatar"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="w-full text-xs text-zinc-400 file:mr-2 file:rounded-full file:border-0 file:bg-[var(--slop-orange)] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[var(--slop-ink)]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="brand-cta mt-2 w-full rounded-full px-3 py-2 text-xs font-black sm:py-1.5"
                  >
                    Save avatar
                  </button>
                </form>
              ) : (
                <p className="max-w-[11rem] text-xs leading-snug text-zinc-500">
                  Set Cloudinary env vars to upload a profile photo.
                </p>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">{handle}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                Home park · {homeVenueLabel}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                JPEG/PNG/WebP/GIF, ~8MB max. Fan photos on reviews stay separate
                from this avatar.
              </p>
            </div>
          </div>
        </header>

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {statTiles.map((t) => (
            <li
              key={t.label}
              className="rounded-xl border border-[var(--slop-line)] bg-[var(--slop-surface)] px-3 py-3 text-center sm:px-4 sm:py-3.5"
            >
              <p className="text-xl font-black tabular-nums text-white sm:text-2xl">
                {t.value}
              </p>
              <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-zinc-500 sm:text-[0.65rem]">
                {t.label}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs leading-relaxed text-zinc-600">
          Helpful likes only—no followers, DMs, or comment threads. Stats pull
          from your live reviews and photos.
        </p>

        <section className="mt-6" aria-labelledby="history-heading">
          <div className="flex items-baseline justify-between gap-2">
            <h2
              id="history-heading"
              className="text-sm font-black uppercase tracking-[0.16em] text-zinc-400"
            >
              Review history
            </h2>
            <Link
              href="/venues"
              className="shrink-0 text-xs font-bold text-[var(--slop-blue)] underline-offset-2 hover:underline"
            >
              Find food
            </Link>
          </div>

          <div className="mt-3 divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            {reviewHistory.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-zinc-500">
                No reviews yet. Open any menu item and drop your first Slop Score.
              </p>
            ) : (
              reviewHistory.map((review) => {
                const itemUrl = `/venues/${review.venueSlug}/${review.foodSlug}`;
                const reviewUrl = `${itemUrl}/review`;
                const canEditToday = isGameDayKeyTodayForVenue(
                  review.gameDayKey,
                  review.venueSlug
                );
                const dateLine = reviewRowDateLabel(
                  review.gameDayKey,
                  review.venueSlug,
                  review.verifiedGameDay,
                  review.updatedAt
                );

                return (
                  <article key={review.id} className="px-3 py-3 sm:px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black leading-snug text-white sm:text-base">
                          {review.foodName}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {review.venueName}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-black tabular-nums text-[var(--slop-orange)]">
                          {review.slopScore.toFixed(1)}
                        </p>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-zinc-600">
                          Slop
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.65rem] text-zinc-500 sm:text-xs">
                      <span className="truncate">{dateLine}</span>
                      <span className="text-zinc-700" aria-hidden>
                        ·
                      </span>
                      <span>{review.napkinRating}/5 napkins</span>
                      {review.photoCount > 0 ? (
                        <>
                          <span className="text-zinc-700" aria-hidden>
                            ·
                          </span>
                          <span className="font-bold text-zinc-300" title="Review includes a photo">
                            Photo
                          </span>
                        </>
                      ) : null}
                      <span className="text-zinc-700" aria-hidden>
                        ·
                      </span>
                      <span>
                        {review.helpfulLikes}{" "}
                        {review.helpfulLikes === 1 ? "helpful like" : "helpful likes"}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {canEditToday ? (
                        <Link
                          href={reviewUrl}
                          className="inline-flex rounded-full border border-[var(--slop-orange)] bg-[color:rgba(255,106,0,0.1)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--slop-orange)] transition hover:bg-[color:rgba(255,106,0,0.18)]"
                        >
                          Edit today&apos;s review
                        </Link>
                      ) : null}
                      <Link
                        href={itemUrl}
                        className="inline-flex rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                      >
                        View item
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            Demo session cookie—swap for real auth when you ship it.
          </p>
          <form action={mockUserSignOut}>
            <button
              type="submit"
              className="w-full rounded-full border border-zinc-700 px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)] sm:w-auto"
            >
              Sign out
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
