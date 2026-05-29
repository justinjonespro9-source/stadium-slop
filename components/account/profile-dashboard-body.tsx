import Link from "next/link";
import Image from "next/image";

import { ActivityReviewCard } from "@/components/account/activity-review-card";
import type { ProfileBadge, ScoutRank } from "@/lib/account-scout-profile";
import {
  getScorecardShareDescription,
  getScorecardShareTitle,
  getScorecardShareUrl
} from "@/lib/scorecard-share";

export type ProfileDashboardReview = {
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
};

type ProfileDashboardBodyProps = {
  displayName: string;
  handleDisplay: string;
  joinedLabel: string | null;
  homeVenueLabel: string;
  initials: string;
  avatarUrl: string | null | undefined;
  mockUserSignOut: () => Promise<void>;
  scoutRank: ScoutRank;
  activitySummary: string;
  profileBadges: ProfileBadge[];
  statTiles: { label: string; value: number }[];
  reviewHistory: ProfileDashboardReview[];
  reviewDateLabel: (
    gameDayKey: string,
    venueSlug: string,
    verifiedGameDay: boolean,
    updatedAt: Date
  ) => string;
  canEditReviewToday: (gameDayKey: string, venueSlug: string) => boolean;
};

export function ProfileDashboardBody({
  displayName,
  handleDisplay,
  joinedLabel,
  homeVenueLabel,
  initials,
  avatarUrl,
  mockUserSignOut,
  scoutRank,
  activitySummary,
  profileBadges,
  statTiles,
  reviewHistory,
  reviewDateLabel,
  canEditReviewToday
}: ProfileDashboardBodyProps) {
  return (
    <>
      <section className="media-content-card media-content-section">
        <p className="media-section-eyebrow">Dashboard</p>
        <h2 className="media-section-title">Fan scout dashboard</h2>
        <p className="mt-1 max-w-xl text-xs leading-snug text-[var(--media-ink-muted)]">
          Stats, badges, and your recent reviews across venues.
        </p>
      </section>

      <div className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-6">
        <header className="media-content-card media-content-section !mt-0 lg:col-span-4 lg:self-start">
          <p className="media-section-eyebrow">Profile</p>
          <h3 className="media-section-title text-lg sm:text-xl">Scout profile</h3>

          <ProfileIdentityBlock
            avatarUrl={avatarUrl}
            displayName={displayName}
            handleDisplay={handleDisplay}
            joinedLabel={joinedLabel}
            homeVenueLabel={homeVenueLabel}
            initials={initials}
          />
          <p className="mt-3 text-[0.7rem] leading-snug text-[var(--media-ink-muted)]">
            Your profile image above matches what fans see on scorecards. Edit name, handle,
            and photo in Scorecard identity.
          </p>
        </header>

        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="media-account-highlight px-4 py-4 sm:px-5 sm:py-5">
            <p className="media-section-eyebrow">Rank</p>
            <p className="mt-1 text-xl font-black tracking-tight text-[var(--media-ink)] sm:text-2xl">
              {scoutRank.title}
            </p>
            <p className="mt-1.5 text-xs leading-snug text-[var(--media-ink-muted)] sm:text-sm">
              {scoutRank.tagline}
            </p>
            <p className="mt-3 text-[0.7rem] font-semibold text-[var(--media-ink-dim)]">
              {activitySummary}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {statTiles.map((t) => (
              <li key={t.label} className="media-stat-card">
                <p className="media-stat-value">{t.value}</p>
                <p className="media-stat-label">{t.label}</p>
              </li>
            ))}
          </ul>

          <div
            className="media-content-card px-4 py-3.5 sm:px-5 sm:py-4"
            aria-label="Scout badges"
          >
            <p className="media-section-eyebrow">Badges</p>
            <p className="media-section-title text-base sm:text-lg">Earned &amp; locked</p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {profileBadges.map((badge) => (
                <li key={badge.id}>
                  <span
                    title={badge.earned ? badge.label : badge.hint}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-bold sm:text-xs ${
                      badge.earned
                        ? "border-[var(--media-orange)]/35 bg-[rgba(255,107,26,0.1)] text-[var(--media-orange-deep)]"
                        : "border-[var(--media-border)] bg-[var(--media-surface)] text-[var(--media-ink-muted)] opacity-80"
                    }`}
                  >
                    {badge.label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.65rem] leading-snug text-[var(--media-ink-muted)]">
              Locked badges light up as you review, verify at the park, and share photos.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-6 lg:mt-8" aria-labelledby="activity-heading">
        <div className="media-section-heading">
          <div>
            <p className="media-section-eyebrow">History</p>
            <h2 id="activity-heading" className="media-section-title">
              Your activity
            </h2>
          </div>
          <Link href="/venues" className="media-section-link shrink-0">
            Explore venues
          </Link>
        </div>

        {reviewHistory.length === 0 ? (
          <div className="media-content-card mt-3 px-4 py-8 text-center sm:mt-4">
            <p className="text-sm font-black text-[var(--media-ink)]">No reviews yet</p>
            <p className="mt-1 text-[0.75rem] text-[var(--media-ink-muted)]">
              Rate something at any venue — it shows up here.
            </p>
            <Link
              href="/venues"
              className="media-cta mt-4 inline-flex min-h-10 items-center rounded-full px-5 py-2.5 text-xs font-black"
            >
              Explore venues
            </Link>
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 sm:mt-4 lg:gap-4">
            {reviewHistory.map((review) => (
              <li key={review.id} className="min-w-0">
                <ActivityReviewCard
                  reviewId={review.id}
                  foodName={review.foodName}
                  venueName={review.venueName}
                  venueSlug={review.venueSlug}
                  foodSlug={review.foodSlug}
                  slopScore={review.slopScore}
                  napkinRating={review.napkinRating}
                  dateLine={reviewDateLabel(
                    review.gameDayKey,
                    review.venueSlug,
                    review.verifiedGameDay,
                    review.updatedAt
                  )}
                  photoCount={review.photoCount}
                  helpfulLikes={review.helpfulLikes}
                  verifiedGameDay={review.verifiedGameDay}
                  canEditToday={canEditReviewToday(
                    review.gameDayKey,
                    review.venueSlug
                  )}
                  shareUrl={getScorecardShareUrl(review.id)}
                  shareTitle={getScorecardShareTitle(
                    review.foodName,
                    review.venueName
                  )}
                  shareDescription={getScorecardShareDescription(
                    review.foodName,
                    review.venueName,
                    review.slopScore
                  )}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-8 flex flex-col gap-3 border-t border-[var(--media-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.65rem] text-[var(--media-ink-muted)]">
          Signed in with Google — sign out on shared devices after game day.
        </p>
        <form action={mockUserSignOut} className="sm:hidden">
          <button
            type="submit"
            className="media-secondary-button w-full min-h-10 px-5 py-2.5 text-xs"
          >
            Sign out
          </button>
        </form>
      </footer>
    </>
  );
}

function ProfileIdentityBlock({
  avatarUrl,
  displayName,
  handleDisplay,
  joinedLabel,
  homeVenueLabel,
  initials
}: {
  avatarUrl: string | null | undefined;
  displayName: string;
  handleDisplay: string;
  joinedLabel: string | null;
  homeVenueLabel: string;
  initials: string;
}) {
  return (
    <div className="mt-4 flex flex-col items-center text-center sm:mt-5 lg:items-start lg:text-left">
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--media-orange)]/45 bg-[var(--media-surface)] shadow-[var(--media-shadow-card)] sm:h-20 sm:w-20">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${displayName} profile photo`}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl font-black text-[var(--media-ink)] sm:text-2xl">
            {initials}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-xl font-black leading-tight tracking-tight text-[var(--media-ink)] sm:text-2xl">
        {displayName}
      </h3>
      <p className="mt-0.5 text-sm font-semibold text-[var(--media-orange-deep)]">
        {handleDisplay}
      </p>
      {joinedLabel ? (
        <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--media-ink-muted)]">
          Joined {joinedLabel}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-[var(--media-ink-muted)]">
        Home venue ·{" "}
        <span className="font-semibold text-[var(--media-ink)]">{homeVenueLabel}</span>
      </p>
    </div>
  );
}
