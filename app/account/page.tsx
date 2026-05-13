import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isCloudinaryConfigured, uploadImageFile } from "@/lib/cloudinary";
import { ensureMockReviewerUser } from "@/lib/mock-user";

import {
  getFoodItemBySlug,
  getVendorForFoodItem,
  getVenueForFoodItem
} from "@/lib/sample-data";
import { prisma } from "@/lib/prisma";
import {
  MOCK_REVIEWER_USER_ID,
  MOCK_USER_COOKIE_NAME,
  hasMockUserAccess,
  mockReviewerProfile
} from "@/lib/user-auth";

const mockProfile = {
  ...mockReviewerProfile,
  stats: {
    totalReviews: 18,
    helpfulLikes: 142,
    verifiedGameDayReviews: 14,
    photosUploaded: 11
  }
};

const mockSignedOutState = {
  headline: "Create your fan profile",
  copy: "Sign in or sign up to submit verified reviews, receive helpful likes, and keep your review history tied to one profile."
};

const mockReviewHistory = [
  {
    foodSlug: "loaded-cheese-curds",
    slopScore: 9.2,
    napkinRating: 3,
    helpfulLikes: 18,
    dateLabel: "Today"
  },
  {
    foodSlug: "frozen-lemonade",
    slopScore: 8.6,
    napkinRating: 2,
    helpfulLikes: 11,
    dateLabel: "Last homestand"
  },
  {
    foodSlug: "north-loop-old-fashioned",
    slopScore: 7.4,
    napkinRating: 1,
    helpfulLikes: 7,
    dateLabel: "May 2026"
  }
];

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
        avatarUrl: secureUrl,
        photoUploadCount: { increment: 1 }
      }
    });
  } catch (error) {
    console.warn("Profile avatar upload failed", error);
    redirect("/account?error=upload");
  }

  revalidatePath("/account");
  redirect("/account");
}

async function getHelpfulLikesReceived() {
  try {
    return await prisma.helpfulLike.count({
      where: {
        review: {
          userId: MOCK_REVIEWER_USER_ID
        }
      }
    });
  } catch (error) {
    console.warn("Falling back to mock helpful-like total", error);
    return mockProfile.stats.helpfulLikes;
  }
}

function SignedOutAccount() {
  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
        <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
          Signed out
        </p>

        <section className="brand-panel mt-5 rounded-[2rem] border p-5 sm:p-7">
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {mockSignedOutState.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            {mockSignedOutState.copy} Profile photos, helpful likes, and review
            history will belong to your mock reviewer account.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/login"
              className="brand-cta rounded-full px-6 py-4 text-center text-sm font-black transition"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-[var(--slop-line)] px-6 py-4 text-center text-sm font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-blue)] hover:text-[var(--slop-blue)]"
            >
              Sign up
            </Link>
          </div>

          <p className="mt-5 text-xs leading-5 text-zinc-500">
            Temporary mock auth only. No real passwords, database records, or
            external auth provider are connected yet.
          </p>
        </section>
      </section>
    </main>
  );
}

export default async function AccountPage() {
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );

  if (!isSignedIn) {
    return <SignedOutAccount />;
  }

  const helpfulLikesReceived = await getHelpfulLikesReceived();
  const cloudinaryReady = isCloudinaryConfigured();

  let dbUser: {
    avatarUrl: string | null;
    photoUploadCount: number;
    displayName: string;
    handle: string;
  } | null = null;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: MOCK_REVIEWER_USER_ID },
      select: {
        avatarUrl: true,
        photoUploadCount: true,
        displayName: true,
        handle: true
      }
    });
  } catch (error) {
    console.warn("Account user lookup failed", error);
  }

  const displayName = dbUser?.displayName ?? mockProfile.displayName;
  const handle = dbUser?.handle ?? mockProfile.handle;
  const photosUploaded = dbUser?.photoUploadCount ?? mockProfile.stats.photosUploaded;

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
        <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
          Signed-in profile
        </p>

        <header className="brand-panel mt-5 rounded-[2rem] border p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-[var(--slop-orange)] bg-[var(--slop-cream)] text-3xl font-black text-[var(--slop-ink)]">
                {dbUser?.avatarUrl ? (
                  <Image
                    src={dbUser.avatarUrl}
                    alt={`${displayName} profile`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  mockProfile.initials
                )}
              </div>
              {cloudinaryReady ? (
                <form action={uploadProfileAvatar} className="mt-3">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                      Profile photo
                    </span>
                    <input
                      name="avatar"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="mt-2 block w-full text-xs text-zinc-400 file:mr-2 file:rounded-full file:border-0 file:bg-[var(--slop-orange)] file:px-3 file:py-2 file:text-xs file:font-black file:text-[var(--slop-ink)]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="brand-cta mt-3 w-full rounded-full px-4 py-2 text-xs font-black sm:w-auto"
                  >
                    Save profile photo
                  </button>
                </form>
              ) : (
                <p className="mt-3 max-w-40 text-xs leading-5 text-zinc-500">
                  Add CLOUDINARY_* env vars to enable profile photo uploads.
                </p>
              )}
              <p className="mt-2 max-w-48 text-xs leading-5 text-zinc-500">
                Fan photos help power Game Day Fresh. Profile photos help fans
                trust who reviewed the slop.
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                {displayName}
              </h1>
              <p className="mt-2 text-zinc-400">{handle}</p>
              <p className="mt-3 text-sm text-zinc-500">
                Home venue: {mockProfile.homeVenue}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                Anyone can browse Stadium Slop. A free profile and on-site
                location check are required to leave verified reviews and move
                venue Season Standings.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--slop-orange)] px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-ink)]">
                  Mock signed in
                </span>
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                  Owner of {mockProfile.stats.totalReviews} reviews
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total reviews", mockProfile.stats.totalReviews],
            ["Helpful likes received", helpfulLikesReceived],
            ["Verified game-day", mockProfile.stats.verifiedGameDayReviews],
            ["Photos uploaded", photosUploaded]
          ].map(([label, value]) => (
            <div
              key={label}
              className="brand-card rounded-3xl border p-4"
            >
              <p className="text-2xl font-black">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="brand-panel mt-5 rounded-3xl border p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Reputation
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="rounded-2xl bg-black p-4 text-sm leading-6 text-zinc-400">
              Helpful likes only. No public follower counts.
            </p>
            <p className="rounded-2xl bg-black p-4 text-sm leading-6 text-zinc-400">
              Trusted reviewers earn visibility through useful game-day intel.
            </p>
            <p className="rounded-2xl bg-black p-4 text-sm leading-6 text-zinc-400 sm:col-span-2">
              No polished vendor shots. Fan profile photos and food photos help
              other fans know who reviewed it and what actually showed up.
            </p>
            <p className="rounded-2xl bg-black p-4 text-sm leading-6 text-zinc-400 sm:col-span-2">
              Helpful likes received are read from the database when available.
              Remaining profile totals are still mock placeholders.
            </p>
          </div>
        </section>

        <section className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Review history
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {mockReviewHistory.map((review) => {
              const item = getFoodItemBySlug(review.foodSlug);

              if (!item) {
                return null;
              }

              const venue = getVenueForFoodItem(item);
              const vendor = getVendorForFoodItem(item);

              return (
                <article
                  key={`${review.foodSlug}-${review.dateLabel}`}
                  className="border-b border-zinc-800 px-4 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-black">{item.name}</h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        {venue?.name ?? "Venue TBD"} ·{" "}
                        {vendor?.name ?? "Vendor TBD"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--slop-orange)] px-3 py-1 text-sm font-black text-[var(--slop-ink)]">
                      {review.slopScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>{review.napkinRating}/5 napkins</span>
                    <span>{review.helpfulLikes} helpful</span>
                    <span>{review.dateLabel}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="brand-panel mt-6 rounded-3xl border p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Mock session
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Signed in with temporary user auth
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This profile is powered by a local mock cookie for now. Real account
            storage and password security can replace it later.
          </p>
          <form action={mockUserSignOut}>
            <button
              type="submit"
              className="mt-4 rounded-full border border-zinc-700 px-6 py-3 text-sm font-black text-zinc-400 transition hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
            >
              Sign out
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
