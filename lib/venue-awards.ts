/**
 * Derived fan-facing chips from stats + dynamic Fan Favorite awards.
 * Not persisted — recomputed from reviews.
 */

import type { ItemSlopStats } from "@/lib/slop-stats-display";
import {
  type FanFavoriteBadge,
  sortFanFavoriteBadges
} from "@/lib/fan-favorite-awards";

export type {
  FanFavoriteBadge,
  VenueFanFavoriteEntry
} from "@/lib/fan-favorite-awards";
export {
  FAN_FAVORITE_MIN_ELIGIBLE_REVIEWS,
  FAN_FAVORITE_TOP_RANKS,
  computeVenueFanFavoriteBadges,
  countEligibleFanFavoriteReviews,
  fanFavoriteBadgeLabel,
  getFanFavoriteBadgesForItem
} from "@/lib/fan-favorite-awards";

export type FoodItemAwardChip = {
  id: string;
  label: string;
  tone: "gold" | "orange" | "emerald" | "cream";
};

/** @deprecated Fan-powered boards removed from venue page — legacy component only. */
export type VenueAwardBoard = {
  id: string;
  title: string;
  subtitle: string;
  picks: Array<{
    item: { slug: string; name: string };
    stats: ItemSlopStats;
    detail: string;
  }>;
  emptyMessage: string;
};

function isRated(stats: ItemSlopStats) {
  return stats.reviewCount > 0;
}

/** Hero / item-page chips — Fan Favorite ranks + optional fresh momentum. */
export function deriveFoodItemAwardChips(
  fanFavoriteBadges: FanFavoriteBadge[],
  freshStats: ItemSlopStats
): FoodItemAwardChip[] {
  const chips: FoodItemAwardChip[] = [];

  if (freshStats.hasFreshToday && isRated(freshStats)) {
    chips.push({
      id: "trending-tonight",
      label: "Trending Tonight",
      tone: "emerald"
    });
  }

  for (const badge of sortFanFavoriteBadges(fanFavoriteBadges)) {
    chips.push({
      id: `fan-favorite-${badge.scope}-${badge.rank}`,
      label: badge.label,
      tone: "gold"
    });
  }

  return chips;
}
