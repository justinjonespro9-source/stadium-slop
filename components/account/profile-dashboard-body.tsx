import Link from "next/link";
import Image from "next/image";

import { ActivityReviewCard } from "@/components/account/activity-review-card";
import { authFieldClass, authLabelClass } from "@/components/auth-ui";
import type { ProfileBadge, ScoutRank } from "@/lib/account-scout-profile";

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
  cloudinaryReady: boolean;
  uploadProfileAvatar: (formData: FormData) => Promise<void>;
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
  cloudinaryReady,
  uploadProfileAvatar,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--slop-gold-dim)]">
            Fan scout dashboard
          </p>
          <p className="mt-1 max-w-xl text-[0.7rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
            Build your Slop reputation through reviews, photos, and helpful votes.
          </p>
        </div>
        <form action={mockUserSignOut} className="hidden sm:block">
          <button
            type="submit"
            className="brand-cta-secondary rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.1em]"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
        <header className="brand-card rounded-2xl border border-[var(--slop-line-strong)] px-4 py-4 sm:px-5 sm:py-5 lg:col-span-4 lg:self-start">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Scout profile
          </p>

          <ProfileIdentityBlock
            avatarUrl={avatarUrl}
            displayName={displayName}
            handleDisplay={handleDisplay}
            joinedLabel={joinedLabel}
            homeVenueLabel={homeVenueLabel}
            initials={initials}
          />

          <div className="mt-4 border-t border-[var(--slop-line)] pt-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
              Avatar
            </p>
            <p className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
              Your avatar appears on your profile. Food photos live on individual
              reviews.
            </p>
            {cloudinaryReady ? (
              <form action={uploadProfileAvatar} className="mt-3 space-y-2">
                <label className={`block ${authLabelClass}`}>
                  <span className="sr-only">Choose profile avatar</span>
                  <input
                    name="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={`${authFieldClass} py-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--slop-orange)] file:px-2.5 file:py-1.5 file:text-[0.65rem] file:font-black file:text-[var(--slop-ink)]`}
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center rounded-lg border border-[var(--slop-gold)]/50 bg-[color:rgba(244,179,33,0.12)] px-4 py-2 text-xs font-black text-[var(--slop-gold-bright)] transition hover:bg-[color:rgba(244,179,33,0.2)]"
                >
                  Save avatar
                </button>
              </form>
            ) : (
              <p className="mt-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
                Add Cloudinary env vars to upload an avatar (~8MB, JPEG/PNG/WebP/GIF).
              </p>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="brand-card rounded-2xl border border-[var(--slop-gold)]/35 bg-[color:rgba(244,179,33,0.06)] px-4 py-4 sm:px-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
              Scout status
            </p>
            <p className="mt-1 text-xl font-black tracking-tight text-[var(--slop-cream)] sm:text-2xl">
              {scoutRank.title}
            </p>
            <p className="mt-1.5 text-xs leading-snug text-[var(--slop-cream-muted)] sm:text-sm">
              {scoutRank.tagline}
            </p>
            <p className="mt-3 text-[0.7rem] font-semibold text-[var(--slop-cream-dim)]">
              {activitySummary}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {statTiles.map((t) => (
              <li
                key={t.label}
                className="brand-card rounded-xl border border-[var(--slop-line-strong)] px-3 py-3 text-center"
              >
                <p className="text-xl font-black tabular-nums text-[var(--slop-gold-bright)]">
                  {t.value}
                </p>
                <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)] sm:text-[0.6rem]">
                  {t.label}
                </p>
              </li>
            ))}
          </ul>

          {/* Future: awards, loyalty points, social share stats, venue badges, season rankings */}
          <div
            className="brand-card rounded-2xl border border-[var(--slop-line-strong)] px-4 py-3.5 sm:px-5"
            aria-label="Scout badges"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
              Badges
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {profileBadges.map((badge) => (
                <li key={badge.id}>
                  <span
                    title={badge.earned ? badge.label : badge.hint}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-bold sm:text-xs ${
                      badge.earned
                        ? "border-[var(--slop-gold)]/45 bg-[color:rgba(244,179,33,0.14)] text-[var(--slop-gold-bright)]"
                        : "border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.4)] text-[var(--slop-cream-dim)] opacity-75"
                    }`}
                  >
                    {badge.label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.6rem] leading-snug text-[var(--slop-cream-dim)]">
              Locked badges light up as you review, verify at the park, and share
              photos.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-6 lg:mt-8" aria-labelledby="activity-heading">
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

        {reviewHistory.length === 0 ? (
          <div className="brand-card mt-3 rounded-2xl border border-[var(--slop-line-strong)] px-4 py-8 text-center">
            <p className="text-sm font-black text-[var(--slop-cream)]">No reviews yet</p>
            <p className="mt-1 text-[0.7rem] text-[var(--slop-cream-dim)]">
              Rate something at any venue — it shows up here.
            </p>
            <Link
              href="/venues"
              className="brand-cta mt-4 inline-flex min-h-10 items-center rounded-xl px-5 py-2.5 text-xs font-black"
            >
              Explore venues
            </Link>
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:gap-4">
            {reviewHistory.map((review) => (
              <li key={review.id} className="min-w-0">
                <ActivityReviewCard
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
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-8 flex flex-col gap-3 border-t border-[var(--slop-line-strong)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.65rem] text-[var(--slop-cream-dim)]">
          Demo cookie session — replace with real auth when you ship.
        </p>
        <form action={mockUserSignOut} className="sm:hidden">
          <button
            type="submit"
            className="brand-cta-secondary w-full min-h-10 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em]"
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
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--slop-gold)]/80 bg-[var(--slop-cream)] shadow-[0_0_0_1px_rgba(244,179,33,0.15)] ring-2 ring-[var(--slop-navy-deep)] sm:h-20 sm:w-20">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${displayName} profile photo`}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl font-black text-[var(--slop-ink)] sm:text-2xl">
            {initials}
          </span>
        )}
      </div>
      <h1 className="mt-3 text-xl font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-2xl">
        {displayName}
      </h1>
      <p className="mt-0.5 text-sm font-semibold text-[var(--slop-gold-dim)]">
        {handleDisplay}
      </p>
      {joinedLabel ? (
        <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
          Joined {joinedLabel}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-[var(--slop-cream-dim)]">
        Home venue ·{" "}
        <span className="font-semibold text-[var(--slop-cream-muted)]">
          {homeVenueLabel}
        </span>
      </p>
    </div>
  );
}
