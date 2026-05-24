import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  updateProfileSocialSettings,
  updateScorecardIdentity,
  uploadProfileAvatar
} from "@/app/account/actions";
import { signOut } from "@/auth";
import { ProfileDashboardBody } from "@/components/account/profile-dashboard-body";
import { ProfileSocialEditor } from "@/components/account/profile-social-editor";
import { ScorecardIdentityEditor } from "@/components/account/scorecard-identity-editor";
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
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import type { StoredProfileSocial } from "@/lib/profile-social-links";
import { handleDisplayFromStored } from "@/lib/profile-identity-display";
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
    saved?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const query = (await searchParams) ?? {};
  const uploadError = query.error;
  const savedNotice = query.saved;
  const notAdminError = query.error === "not-admin";
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
    instagramUrl: string | null;
    tiktokUrl: string | null;
    youtubeUrl: string | null;
    xUrl: string | null;
    websiteUrl: string | null;
    socialLinksPublic: boolean;
    reviewHistoryVisibility: StoredProfileSocial["reviewHistoryVisibility"];
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
  let profileLoadFailed = false;

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
          instagramUrl: true,
          tiktokUrl: true,
          youtubeUrl: true,
          xUrl: true,
          websiteUrl: true,
          socialLinksPublic: true,
          reviewHistoryVisibility: true,
          homeVenue: { select: { name: true } }
        }
      }),
      prisma.review.count({
        where: { userId, status: "ACTIVE", isTestReview: false }
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
        where: { userId, status: "ACTIVE", isTestReview: false },
        orderBy: { venueId: "asc" }
      }),
      prisma.review.count({
        where: { userId, status: "ACTIVE", verifiedGameDay: true, isTestReview: false }
      }),
      prisma.review.count({
        where: {
          userId,
          status: "ACTIVE",
          isTestReview: false,
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
    profileLoadFailed = true;
    console.error("Account dashboard DB read failed", error);
  }

  const displayName =
    dbUser?.displayName ??
    sessionUser?.name ??
    (allowMockUserAccess() ? mockReviewerProfile.displayName : "Stadium fan");
  const handle =
    dbUser?.handle ??
    (allowMockUserAccess() ? mockReviewerProfile.handle : "@fan");
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

  const handleDisplay = handleDisplayFromStored(handle);

  const socialProfile: StoredProfileSocial = {
    instagramUrl: dbUser?.instagramUrl ?? null,
    tiktokUrl: dbUser?.tiktokUrl ?? null,
    youtubeUrl: dbUser?.youtubeUrl ?? null,
    xUrl: dbUser?.xUrl ?? null,
    websiteUrl: dbUser?.websiteUrl ?? null,
    socialLinksPublic: dbUser?.socialLinksPublic ?? false,
    reviewHistoryVisibility: dbUser?.reviewHistoryVisibility ?? "VENUE_CONTEXT_ONLY"
  };

  const identityErrorMessage =
    uploadError === "identity-handle-taken"
      ? "That handle is already taken. Try another."
      : uploadError === "identity-handle"
        ? "Handle must be 3–24 characters (letters, numbers, underscores)."
        : uploadError === "identity-name"
          ? "Display name must be 2–40 characters."
          : uploadError === "identity-invalid"
            ? "Check your display name and handle, then try again."
            : uploadError === "identity-save"
              ? "Could not save identity. Try again."
              : null;

  const socialErrorMessage =
    uploadError === "social-field"
      ? "Check your social link handles or URLs and try again."
      : uploadError === "social-visibility"
        ? "Choose a review history visibility option."
        : uploadError === "social-invalid"
          ? "Could not save reviewer profile. Check your entries."
          : uploadError === "social-save"
            ? "Could not save reviewer profile. Try again."
            : null;

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

  const profileLoadErrorMessage = profileLoadFailed
    ? "Could not load your saved profile from the database. Identity and photo saves may not appear until migrations are applied (npm run db:migrate:deploy) or the connection is fixed."
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
        {notAdminError ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Admin access</p>
            <p className="mt-0.5 text-amber-100/95">
              This account is signed in but is not an admin. Admin tools require{" "}
              <code className="text-amber-50">User.role = ADMIN</code> in the database.
            </p>
          </div>
        ) : null}
        {profileLoadErrorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Profile data</p>
            <p className="mt-0.5 text-amber-100/95">{profileLoadErrorMessage}</p>
          </div>
        ) : null}
        {savedNotice === "identity" ? (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-800/70 bg-emerald-950/40 px-3 py-2.5 text-sm text-emerald-100"
          >
            Scorecard identity saved. It will show on your Slop Scorecards.
          </div>
        ) : savedNotice === "avatar" ? (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-800/70 bg-emerald-950/40 px-3 py-2.5 text-sm text-emerald-100"
          >
            Profile photo saved.
          </div>
        ) : savedNotice === "social" ? (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-800/70 bg-emerald-950/40 px-3 py-2.5 text-sm text-emerald-100"
          >
            Reviewer profile saved.
          </div>
        ) : null}
        {identityErrorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Scorecard identity</p>
            <p className="mt-0.5 text-amber-100/95">{identityErrorMessage}</p>
          </div>
        ) : null}
        {uploadErrorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Profile photo</p>
            <p className="mt-0.5 text-amber-100/95">{uploadErrorMessage}</p>
          </div>
        ) : null}
        {socialErrorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            <p className="font-bold">Reviewer profile</p>
            <p className="mt-0.5 text-amber-100/95">{socialErrorMessage}</p>
          </div>
        ) : null}

        <div className="brand-card rounded-2xl border border-[var(--slop-gold)]/35 px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--slop-gold-dim)]">
            Scorecard identity
          </p>
          <p className="mt-1 max-w-2xl text-xs leading-snug text-[var(--slop-cream-dim)]">
            What other fans see on your Slop Scorecards — name, handle, and photo.
          </p>
          <div className="mt-4">
            <ScorecardIdentityEditor
              initialDisplayName={displayName}
              initialHandle={handle}
              initials={initials}
              avatarUrl={avatarUrl}
              venuesReviewed={venuesReviewed}
              itemsReviewed={totalReviews}
              helpfulEarned={helpfulLikesReceived}
              cloudinaryReady={cloudinaryReady}
              updateScorecardIdentity={updateScorecardIdentity}
              uploadProfileAvatar={uploadProfileAvatar}
            />
          </div>
        </div>

        <div
          id="reviewer-profile"
          className="brand-card mt-4 rounded-2xl border border-[var(--slop-line-strong)] px-4 py-4 sm:mt-5 sm:px-5 sm:py-5"
        >
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--slop-gold-dim)]">
            Find me elsewhere
          </p>
          <p className="mt-1 max-w-2xl text-xs leading-snug text-[var(--slop-cream-dim)]">
            Optional external links and history visibility. Stadium Slop is not a follower
            platform — reviews stay on food items and venues.
          </p>
          <div className="mt-4">
            <ProfileSocialEditor
              initialSocial={socialProfile}
              updateProfileSocialSettings={updateProfileSocialSettings}
            />
          </div>
        </div>

        <ProfileDashboardBody
          displayName={displayName}
          handleDisplay={handleDisplay}
          joinedLabel={joinedLabel}
          homeVenueLabel={homeVenueLabel}
          initials={initials}
          avatarUrl={avatarUrl}
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
