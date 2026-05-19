/** Fan scout rank + badge labels derived from profile activity (demo-safe until gamification ships). */

export type ScoutRank = {
  title: string;
  tagline: string;
};

export type ProfileBadge = {
  id: string;
  label: string;
  earned: boolean;
  /** Shown when locked — explains how to earn later */
  hint?: string;
};

export type ScoutProfileInput = {
  totalReviews: number;
  venuesReviewed: number;
  fanPhotoUploads: number;
  helpfulLikesReceived: number;
  verifiedReviewCount: number;
  worthTheWalkReviewCount: number;
};

/** Primary scout title from review volume and park coverage. */
export function deriveScoutRank(input: ScoutProfileInput): ScoutRank {
  const { totalReviews, venuesReviewed, helpfulLikesReceived, fanPhotoUploads } =
    input;

  if (totalReviews === 0) {
    return {
      title: "Rookie Reviewer",
      tagline: "Post your first review to climb the scout board."
    };
  }

  if (totalReviews >= 25 || venuesReviewed >= 8) {
    return {
      title: "Concourse Critic",
      tagline: "Seasoned park coverage — standings know your name."
    };
  }

  if (totalReviews >= 12 || venuesReviewed >= 4) {
    return {
      title: "Curd Scout",
      tagline: "Deep menu intel across multiple stops."
    };
  }

  if (helpfulLikesReceived >= 5 || fanPhotoUploads >= 3) {
    return {
      title: "Snack Scout",
      tagline: "Fans are noticing your photos and helpful marks."
    };
  }

  return {
    title: "Snack Scout",
    tagline: "Building your Slop reputation one bite at a time."
  };
}

/**
 * Static badge row — earned state from real counts.
 * Future: swap for DB awards, loyalty tiers, venue badges, season rankings.
 */
export function deriveProfileBadges(input: ScoutProfileInput): ProfileBadge[] {
  return [
    {
      id: "verified-park",
      label: "Verified at Park",
      earned: input.verifiedReviewCount > 0,
      hint: "Submit a game-day review while at the venue."
    },
    {
      id: "photo-reviewer",
      label: "Photo Reviewer",
      earned: input.fanPhotoUploads > 0,
      hint: "Add a fan photo on any review."
    },
    {
      id: "season-scout",
      label: "Season Scout",
      earned: input.totalReviews >= 5,
      hint: "Post five reviews across the season."
    }
  ];
}

/** One-line scout summary for the dashboard header. */
export function scoutActivitySummary(input: ScoutProfileInput): string {
  if (input.totalReviews === 0) {
    return "No reviews yet — pick a venue and rate your first bite.";
  }

  const parts = [
    `${input.totalReviews} review${input.totalReviews === 1 ? "" : "s"}`,
    input.venuesReviewed > 0
      ? `${input.venuesReviewed} venue${input.venuesReviewed === 1 ? "" : "s"}`
      : null,
    input.helpfulLikesReceived > 0
      ? `${input.helpfulLikesReceived} helpful like${input.helpfulLikesReceived === 1 ? "" : "s"} received`
      : null
  ].filter(Boolean);

  return parts.join(" · ");
}

// Future gamification hooks (wire when models exist):
// - awards: UserAward[]
// - loyaltyPoints: number
// - socialShareStats: { shares: number; clicks: number }
// - venueBadges: VenueBadge[]
// - seasonRankings: { season: string; rank: number; venueSlug: string }[]
