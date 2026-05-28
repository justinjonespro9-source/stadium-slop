import Image from "next/image";
import { cookies } from "next/headers";

import {
  updateProfileSocialSettings,
  updateScorecardIdentity,
  uploadProfileAvatar
} from "@/app/account/actions";
import { signOut } from "@/auth";
import { ProfileDashboardBody } from "@/components/account/profile-dashboard-body";
import { ProfileSocialEditor } from "@/components/account/profile-social-editor";
import { ScorecardIdentityEditor } from "@/components/account/scorecard-identity-editor";
import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";
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
    <main className="media-page-shell min-h-screen">
      <DiscoveryPageHero
        eyebrow="Fan account"
        title="Sign in to continue"
        description="Post reviews, upload photos, and mark helpful from one profile."
      />
      <div className="media-venue-content mx-auto max-w-md">
        <article className="media-content-card media-content-section !mt-0">
          <AuthConfigAlert className="mb-4" />
          <GoogleSignInButton
            callbackUrl="/account"
            disabled={!isGoogleSignInConfigured()}
            className="media-cta w-full min-h-11 rounded-full px-4 py-3 text-sm font-black"
          />
          <p className="mt-5 border-t border-[var(--media-border)] pt-4 text-center text-[0.7rem] leading-relaxed text-[var(--media-ink-muted)]">
            Google sign-in keeps browsing public — only contributions need an account.
          </p>
        </article>
      </div>
    </main>
  );
}

type AccountAlertProps = {
  role: "alert" | "status";
  variant: "warn" | "success";
  title: string;
  message: string;
};

function AccountAlert({ role, variant, title, message }: AccountAlertProps) {
  const variantClass =
    variant === "success"
      ? "media-review-alert--success"
      : "media-review-alert--warn";

  return (
    <div
      role={role}
      className={`media-review-alert ${variantClass} mb-4`}
    >
      <p className="font-bold">{title}</p>
      <p className="mt-0.5">{message}</p>
    </div>
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

  const heroSubtitle = [
    handleDisplay,
    joinedLabel ? `Joined ${joinedLabel}` : null,
    `Home venue · ${homeVenueLabel}`
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="media-page-shell min-h-screen">
      <DiscoveryPageHero
        eyebrow="Fan account"
        title={displayName}
        subtitle={heroSubtitle}
        description="Build your Slop reputation through reviews, photos, and helpful votes."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/16 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-[var(--media-orange-bright)]/55 bg-[#0a1018]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`${displayName} profile photo`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-black text-white">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{displayName}</p>
              <p className="truncate text-xs font-bold text-white/65">{handleDisplay}</p>
            </div>
          </div>
          <form action={contributorSignOut} className="hidden sm:block">
            <button type="submit" className="media-secondary-button !border-white/20 !bg-white/10 !text-white/90 hover:!border-[var(--media-orange)]/45 hover:!bg-white/14 hover:!text-white">
              Sign out
            </button>
          </form>
        </div>
      </DiscoveryPageHero>

      <div className="media-venue-content">
        {notAdminError ? (
          <AccountAlert
            role="alert"
            variant="warn"
            title="Admin access"
            message="This account is signed in but is not an admin. Admin tools require User.role = ADMIN in the database."
          />
        ) : null}
        {profileLoadErrorMessage ? (
          <AccountAlert
            role="alert"
            variant="warn"
            title="Profile data"
            message={profileLoadErrorMessage}
          />
        ) : null}
        {savedNotice === "identity" ? (
          <AccountAlert
            role="status"
            variant="success"
            title="Scorecard identity"
            message="Saved. It will show on your Slop Scorecards."
          />
        ) : savedNotice === "avatar" ? (
          <AccountAlert
            role="status"
            variant="success"
            title="Profile photo"
            message="Saved."
          />
        ) : savedNotice === "social" ? (
          <AccountAlert
            role="status"
            variant="success"
            title="Reviewer profile"
            message="Saved."
          />
        ) : null}
        {identityErrorMessage ? (
          <AccountAlert
            role="alert"
            variant="warn"
            title="Scorecard identity"
            message={identityErrorMessage}
          />
        ) : null}
        {uploadErrorMessage ? (
          <AccountAlert
            role="alert"
            variant="warn"
            title="Profile photo"
            message={uploadErrorMessage}
          />
        ) : null}
        {socialErrorMessage ? (
          <AccountAlert
            role="alert"
            variant="warn"
            title="Reviewer profile"
            message={socialErrorMessage}
          />
        ) : null}

        <section className="media-content-card media-content-section !mt-0">
          <div className="media-section-heading">
            <div>
              <p className="media-section-eyebrow">Slop Scorecards</p>
              <h2 className="media-section-title">Scorecard identity</h2>
            </div>
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-snug text-[var(--media-ink-muted)]">
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
        </section>

        <section
          id="reviewer-profile"
          className="media-content-card media-content-section"
        >
          <div className="media-section-heading">
            <div>
              <p className="media-section-eyebrow">Elsewhere</p>
              <h2 className="media-section-title">Find me elsewhere</h2>
            </div>
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-snug text-[var(--media-ink-muted)]">
            Optional external links and history visibility. Stadium Slop is not a follower
            platform — reviews stay on food items and venues.
          </p>
          <div className="mt-4">
            <ProfileSocialEditor
              initialSocial={socialProfile}
              updateProfileSocialSettings={updateProfileSocialSettings}
            />
          </div>
        </section>

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
      </div>
    </main>
  );
}
