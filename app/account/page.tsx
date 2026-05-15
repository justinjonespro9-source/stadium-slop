import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  AuthPageScaffold,
  authFieldClass,
  authLabelClass
} from "@/components/auth-ui";
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
    <AuthPageScaffold
      eyebrow="Fan account"
      title="Sign in to continue"
      subtitle="Post reviews, upload photos, and mark helpful from one profile."
      footer={
        <p className="text-center text-[0.7rem] leading-relaxed text-[var(--slop-cream-dim)]">
          Demo cookie session — swap for production auth later.
        </p>
      }
    >
      <div className="mt-5 grid gap-2.5">
        <Link
          href="/login?next=/account"
          className="brand-cta rounded-xl px-4 py-3 text-center text-sm font-black"
        >
          Sign in
        </Link>
        <Link
          href="/signup?next=/account"
          className="brand-cta-secondary rounded-xl px-4 py-3 text-center text-sm font-black"
        >
          Create account
        </Link>
      </div>
    </AuthPageScaffold>
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
    createdAt: Date;
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
          createdAt: true,
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

  const joinedLabel = dbUser?.createdAt
    ? dbUser.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : null;

  const handleDisplay =
    handle.startsWith("@") || handle.length === 0 ? handle : `@${handle}`;

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
    <main className="brand-page relative min-h-dvh">
      <section className="relative z-10 mx-auto w-full max-w-lg px-4 py-4 pb-10 sm:px-5 sm:py-6">
        {uploadErrorMessage ? (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Profile photo</p>
            <p className="mt-0.5 text-amber-100/95">{uploadErrorMessage}</p>
          </div>
        ) : null}

        <header className="brand-card rounded-2xl border border-[var(--slop-line-strong)] px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Profile
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex shrink-0 gap-3 sm:flex-col sm:items-stretch">
              <div className="relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-[var(--slop-gold)]/70 bg-[var(--slop-cream)] text-lg font-black text-[var(--slop-ink)] sm:h-20 sm:w-20 sm:text-2xl">
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
                  <label className={`grid gap-1.5 ${authLabelClass}`}>
                    Avatar
                    <input
                      name="avatar"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className={`${authFieldClass} py-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--slop-orange)] file:px-3 file:py-2 file:text-xs file:font-black file:text-[var(--slop-ink)]`}
                    />
                  </label>
                  <button
                    type="submit"
                    className="brand-cta mt-2 w-full rounded-xl px-3 py-2 text-xs font-black"
                  >
                    Save avatar
                  </button>
                </form>
              ) : (
                <p className="max-w-[12rem] text-[0.7rem] leading-snug text-[var(--slop-cream-dim)]">
                  Add Cloudinary env vars to upload an avatar (~8MB, JPEG/PNG/WebP/GIF).
                </p>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-2xl">
                {displayName}
              </h1>
              <p className="mt-1 font-semibold text-[var(--slop-cream-muted)]">
                {handleDisplay}
              </p>
              {joinedLabel ? (
                <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--slop-cream-dim)]">
                  Joined {joinedLabel}
                </p>
              ) : null}
              <p className="mt-2 text-[0.7rem] leading-snug text-[var(--slop-cream-dim)]">
                Home venue ·{" "}
                <span className="font-semibold text-[var(--slop-cream-muted)]">
                  {homeVenueLabel}
                </span>
              </p>
              <p className="mt-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
                Item fan photos live on reviews — this photo is your profile badge only.
              </p>
            </div>
          </div>
        </header>

        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {statTiles.map((t) => (
            <li
              key={t.label}
              className="brand-card rounded-xl border border-[var(--slop-line-strong)] px-2.5 py-2.5 text-center sm:py-3"
            >
              <p className="text-lg font-black tabular-nums text-[var(--slop-gold-bright)] sm:text-xl">
                {t.value}
              </p>
              <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)] sm:text-[0.6rem]">
                {t.label}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          One profile for Slop scores, review photos, and helpful marks.
        </p>

        <section className="mt-5" aria-labelledby="activity-heading">
          <div className="flex items-baseline justify-between gap-2">
            <h2
              id="activity-heading"
              className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]"
            >
              Your activity
            </h2>
            <Link
              href="/venues"
              className="shrink-0 text-[0.65rem] font-bold text-[var(--slop-gold)] underline-offset-2 hover:underline"
            >
              Explore venues
            </Link>
          </div>

          <div className="mt-2.5 divide-y divide-[var(--slop-line)] overflow-hidden rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.75)]">
            {reviewHistory.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm font-black text-[var(--slop-cream)]">No reviews yet</p>
                <p className="mt-1 text-[0.7rem] text-[var(--slop-cream-dim)]">
                  Rate something at any venue — it shows up here.
                </p>
                <Link
                  href="/venues"
                  className="brand-cta mt-4 inline-flex rounded-xl px-5 py-2.5 text-xs font-black"
                >
                  Explore venues
                </Link>
              </div>
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
                        <h3 className="text-sm font-black leading-snug text-[var(--slop-cream)] sm:text-base">
                          {review.foodName}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-[var(--slop-cream-dim)]">
                          {review.venueName}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-black tabular-nums text-[var(--slop-orange)]">
                          {review.slopScore.toFixed(1)}
                        </p>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                          Slop
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.65rem] text-[var(--slop-cream-dim)] sm:text-xs">
                      <span className="truncate">{dateLine}</span>
                      <span className="text-[var(--slop-line)]" aria-hidden>
                        ·
                      </span>
                      <span>{review.napkinRating}/5 napkins</span>
                      {review.photoCount > 0 ? (
                        <>
                          <span className="text-[var(--slop-line)]" aria-hidden>
                            ·
                          </span>
                          <span className="font-bold text-[var(--slop-cream-muted)]" title="Review includes a photo">
                            Photo
                          </span>
                        </>
                      ) : null}
                      <span className="text-[var(--slop-line)]" aria-hidden>
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
                          className="inline-flex rounded-xl border border-[var(--slop-orange)] bg-[color:rgba(255,159,28,0.12)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--slop-orange)] transition hover:bg-[color:rgba(255,159,28,0.2)]"
                        >
                          Edit today&apos;s review
                        </Link>
                      ) : null}
                      <Link
                        href={itemUrl}
                        className="inline-flex rounded-xl border border-[var(--slop-line-strong)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)] hover:text-[var(--slop-cream)]"
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

        <footer className="mt-8 flex flex-col gap-3 border-t border-[var(--slop-line-strong)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.65rem] text-[var(--slop-cream-dim)]">
            Demo cookie session — replace with real auth when you ship.
          </p>
          <form action={mockUserSignOut}>
            <button
              type="submit"
              className="brand-cta-secondary w-full rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] sm:w-auto sm:py-3"
            >
              Sign out
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
