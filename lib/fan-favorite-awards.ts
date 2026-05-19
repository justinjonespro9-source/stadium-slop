/**
 * Dynamic Fan Favorite badges — computed per venue, not stored in DB.
 *
 * TODO: require verifiedGameDay reviews for eligibility once site-wide.
 */

import type { ItemSlopStats } from "@/lib/slop-stats-display";

/** Minimum eligible reviews before an item can earn a Fan Favorite rank. */
export const FAN_FAVORITE_MIN_ELIGIBLE_REVIEWS = 3;

export const FAN_FAVORITE_TOP_RANKS = 3;

export type FanFavoriteScope = "allTime" | "season";

export type FanFavoriteBadge = {
  scope: FanFavoriteScope;
  rank: 1 | 2 | 3;
  label: string;
};

export type VenueFanFavoriteEntry = {
  itemSlug: string;
  allTime: ItemSlopStats;
  season: ItemSlopStats;
};

export function fanFavoriteBadgeLabel(
  scope: FanFavoriteScope,
  rank: number
): string {
  const tier = scope === "allTime" ? "All-Time" : "Season";
  return `#${rank} ${tier} Fan Favorite`;
}

/** Eligible review count for badge ranking (approved/deduped reviews in scope). */
export function countEligibleFanFavoriteReviews(stats: ItemSlopStats): number {
  // TODO: return stats.reviews.filter((r) => r.verifiedGameDay).length when enforced.
  return stats.reviewCount;
}

function latestReviewTimestamp(stats: ItemSlopStats): number {
  let max = 0;
  for (const review of stats.reviews) {
    if (review.reviewPhotoCreatedAt) {
      const photoAt = Date.parse(review.reviewPhotoCreatedAt);
      if (Number.isFinite(photoAt)) {
        max = Math.max(max, photoAt);
      }
    }
    if (review.gameDayKey) {
      const gameDay = Date.parse(review.gameDayKey);
      if (Number.isFinite(gameDay)) {
        max = Math.max(max, gameDay);
      }
    }
    const labeled = Date.parse(review.dateLabel);
    if (Number.isFinite(labeled)) {
      max = Math.max(max, labeled);
    }
  }
  return max;
}

function rawAverageSlopScore(stats: ItemSlopStats): number {
  if (stats.reviews.length === 0) {
    return 0;
  }
  return (
    stats.reviews.reduce((total, review) => total + review.slopScore, 0) /
    stats.reviews.length
  );
}

function compareFanFavoriteCandidates(a: ItemSlopStats, b: ItemSlopStats): number {
  if (b.averageSlopScore !== a.averageSlopScore) {
    return b.averageSlopScore - a.averageSlopScore;
  }

  const reviewDelta =
    countEligibleFanFavoriteReviews(b) - countEligibleFanFavoriteReviews(a);
  if (reviewDelta !== 0) {
    return reviewDelta;
  }

  const latestDelta = latestReviewTimestamp(b) - latestReviewTimestamp(a);
  if (latestDelta !== 0) {
    return latestDelta;
  }

  return rawAverageSlopScore(b) - rawAverageSlopScore(a);
}

function rankTopFanFavoritesForScope(
  entries: VenueFanFavoriteEntry[],
  scope: FanFavoriteScope
): Map<string, FanFavoriteBadge[]> {
  const statsKey = scope === "allTime" ? "allTime" : "season";
  const eligible = entries
    .filter(
      ({ [statsKey]: stats }) =>
        countEligibleFanFavoriteReviews(stats) >= FAN_FAVORITE_MIN_ELIGIBLE_REVIEWS
    )
    .sort((a, b) =>
      compareFanFavoriteCandidates(a[statsKey], b[statsKey])
    )
    .slice(0, FAN_FAVORITE_TOP_RANKS);

  const bySlug = new Map<string, FanFavoriteBadge[]>();

  eligible.forEach((entry, index) => {
    const rank = (index + 1) as 1 | 2 | 3;
    const badge: FanFavoriteBadge = {
      scope,
      rank,
      label: fanFavoriteBadgeLabel(scope, rank)
    };
    bySlug.set(entry.itemSlug, [badge]);
  });

  return bySlug;
}

/** Top 3 All-Time + Top 3 Season Fan Favorites for a venue (by item slug). */
export function computeVenueFanFavoriteBadges(
  entries: VenueFanFavoriteEntry[]
): Map<string, FanFavoriteBadge[]> {
  const allTimeRanks = rankTopFanFavoritesForScope(entries, "allTime");
  const seasonRanks = rankTopFanFavoritesForScope(entries, "season");
  const merged = new Map<string, FanFavoriteBadge[]>();

  for (const { itemSlug } of entries) {
    const badges = [
      ...(allTimeRanks.get(itemSlug) ?? []),
      ...(seasonRanks.get(itemSlug) ?? [])
    ];
    if (badges.length > 0) {
      merged.set(itemSlug, sortFanFavoriteBadges(badges));
    }
  }

  return merged;
}

export function sortFanFavoriteBadges(
  badges: FanFavoriteBadge[]
): FanFavoriteBadge[] {
  return [...badges].sort((a, b) => {
    if (a.scope !== b.scope) {
      return a.scope === "allTime" ? -1 : 1;
    }
    return a.rank - b.rank;
  });
}

export function getFanFavoriteBadgesForItem(
  map: Map<string, FanFavoriteBadge[]>,
  itemSlug: string
): FanFavoriteBadge[] {
  return map.get(itemSlug) ?? [];
}

export function isFanFavoriteHighlightLabel(label: string): boolean {
  return /#\d+\s+(All-Time|Season)\s+Fan Favorite/i.test(label);
}
