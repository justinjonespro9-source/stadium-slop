import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { signOut } from "@/auth";
import { ProfileDashboardBody } from "@/components/account/profile-dashboard-body";
import { AuthPageScaffold } from "@/components/auth-ui";
import { AuthConfigAlert } from "@/components/auth-config-alert";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { isGoogleSignInConfigured } from "@/lib/auth/env";
import { getContributorUserId } from "@/lib/auth/contributor-id";
import { getSessionUser } from "@/lib/auth/require-user";
import {
  deriveProfileBadges,
  deriveScoutRank,
  scoutActivitySummary,
  type ScoutProfileInput
} from "@/lib/account-scout-profile";
import {
  isCloudinaryConfigured,
  logUploadFailure,
  photoErrorQueryFromUploadFailure,
  uploadImageFile
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { isGameDayKeyTodayForVenue } from "@/lib/game-day";
import {
  MOCK_USER_COOKIE_NAME,
  allowMockUserAccess,
  mockReviewerProfile
} from "@/lib/user-auth";

async function contributorSignOut() {
  "use server";

  const cookieStore = await cookies();
  if (allowMockUserAccess()) {
    cookieStore.delete(MOCK_USER_COOKIE_NAME);
  }
  await signOut({ redirectTo: "/" });
}

async function uploadProfileAvatar(formData: FormData) {
  "use server";

  const userId = await getContributorUserId();
  if (!userId) {
    redirect("/login?next=/account");
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/account?error=no-file");
  }

  if (!isCloudinaryConfigured()) {
    redirect("/account?error=cloudinary");
  }

  try {
    const { secureUrl } = await uploadImageFile(file, {
      folder: `stadium-slop/profiles/${userId}`,
      publicId: `${userId}-avatar`
    });

    await prisma.user.update({
      where: { id: userId },
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
          Google sign-in keeps browsing public — only contributions need an account.
        </p>
      }
    >
      <AuthConfigAlert className="mt-4" />
      <div className="mt-5">
        <GoogleSignInButton
          callbackUrl="/account"
          disabled={!isGoogleSignInConfigured()}
        />
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
  const sessionUser = await getSessionUser();
  const userId = await getContributorUserId();

  if (!userId) {
    return <SignedOutAccount />;
  }

  const cloudinaryReady = isCloudinaryConfigured();

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
  let verifiedReviewCount = 0;
  let worthTheWalkReviewCount = 0;
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
    const [
      userRow,
      reviewCount,
      likeCount,
      photoCount,
      venueGroups,
      verifiedCount,
      worthWalkCount,
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
      prisma.review.count({
        where: { userId, status: "ACTIVE", verifiedGameDay: true }
      }),
      prisma.review.count({
        where: {
          userId,
          status: "ACTIVE",
          labels: { has: "WORTH_THE_WALK" }
        }
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
    verifiedReviewCount = verifiedCount;
    worthTheWalkReviewCount = worthWalkCount;
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

  const displayName =
    dbUser?.displayName ?? sessionUser?.name ?? mockReviewerProfile.displayName;
  const handle = dbUser?.handle ?? mockReviewerProfile.handle;
  const homeVenueLabel =
    dbUser?.homeVenue?.name ?? mockReviewerProfile.homeVenue;
  const avatarUrl = dbUser?.avatarUrl ?? sessionUser?.image ?? null;
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SS";

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

  const scoutInput: ScoutProfileInput = {
    totalReviews,
    venuesReviewed,
    fanPhotoUploads,
    helpfulLikesReceived,
    verifiedReviewCount,
    worthTheWalkReviewCount
  };
  const scoutRank = deriveScoutRank(scoutInput);
  const profileBadges = deriveProfileBadges(scoutInput);
  const activitySummary = scoutActivitySummary(scoutInput);

  const statTiles = [
    { label: "Reviews", value: totalReviews },
    { label: "Venues", value: venuesReviewed },
    { label: "Fan photos", value: fanPhotoUploads },
    { label: "Helpful likes", value: helpfulLikesReceived }
  ];

  return (
    <main className="brand-page relative min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(32vh,220px)] bg-[radial-gradient(ellipse_85%_90%_at_50%_-15%,rgba(244,179,33,0.14),transparent_60%)]"
        aria-hidden
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-4 pb-10 sm:px-6 sm:py-6 lg:py-8">
        {uploadErrorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Profile photo</p>
            <p className="mt-0.5 text-amber-100/95">{uploadErrorMessage}</p>
          </div>
        ) : null}

        <ProfileDashboardBody
          displayName={displayName}
          handleDisplay={handleDisplay}
          joinedLabel={joinedLabel}
          homeVenueLabel={homeVenueLabel}
          initials={initials}
          avatarUrl={avatarUrl}
          cloudinaryReady={cloudinaryReady}
          uploadProfileAvatar={uploadProfileAvatar}
          mockUserSignOut={contributorSignOut}
          scoutRank={scoutRank}
          activitySummary={activitySummary}
          profileBadges={profileBadges}
          statTiles={statTiles}
          reviewHistory={reviewHistory}
          reviewDateLabel={reviewRowDateLabel}
          canEditReviewToday={isGameDayKeyTodayForVenue}
        />
      </section>
    </main>
  );
}
