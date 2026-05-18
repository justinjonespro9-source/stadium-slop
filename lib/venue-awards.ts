/**
 * Derived award / trending picks from existing review + fresh stats.
 * Not persisted awards — ephemeral labels for fan-powered polish.
 *
 * TODO: season awards (ballot / verified-fan voting)
 * TODO: all-time awards hall-of-fame
 * TODO: vendor award badges on Vendor rows
 */

import type { FoodItem, Vendor } from "@/lib/sample-data";
import type { ItemSlopStats } from "@/lib/slop-stats";

function isRated(stats: ItemSlopStats) {
  return stats.reviewCount > 0;
}

export type VenueAwardItemBundle = {
  item: FoodItem;
  season: ItemSlopStats;
  fresh: ItemSlopStats;
};

export type VenueAwardPick = {
  item: FoodItem;
  stats: ItemSlopStats;
  /** Short fan-signal line under the item name */
  detail: string;
};

export type VenueAwardBoard = {
  id: "hot-tonight" | "fan-favorites" | "worth-the-walk" | "season-standouts";
  title: string;
  subtitle: string;
  picks: VenueAwardPick[];
  emptyMessage: string;
};

const MAX_PICKS = 5;

function hasWorthTheWalkSignal(stats: ItemSlopStats): boolean {
  if (stats.reviewCount === 0) {
    return false;
  }
  if (stats.reviews.some((r) => r.labels.includes("Worth the Walk"))) {
    return true;
  }
  if (
    stats.topPriceCheck?.label === "Worth the Price of Admission" &&
    stats.topPriceCheck.count > 0
  ) {
    return true;
  }
  return false;
}

function pickDetailForHot(stats: ItemSlopStats): string {
  const n = stats.freshReviewCountToday;
  if (n > 0) {
    return `${n} game-day ${n === 1 ? "take" : "takes"} · ${stats.averageSlopScore.toFixed(1)} Slop`;
  }
  return `Live fresh · ${stats.averageSlopScore.toFixed(1)} Slop`;
}

function pickDetailForSeason(stats: ItemSlopStats): string {
  const parts = [`${stats.averageSlopScore.toFixed(1)} Slop`];
  if (stats.reviewCount > 0) {
    parts.push(`${stats.reviewCount} review${stats.reviewCount === 1 ? "" : "s"}`);
  }
  if (stats.topReplayValue && stats.topReplayValue.count > 0) {
    parts.push(stats.topReplayValue.label);
  }
  return parts.join(" · ");
}

function pickDetailWorthTheWalk(stats: ItemSlopStats): string {
  if (stats.reviews.some((r) => r.labels.includes("Worth the Walk"))) {
    return "Fans tagged Worth the Walk";
  }
  if (stats.topPriceCheck?.label === "Worth the Price of Admission") {
    return "Worth the Price of Admission";
  }
  return pickDetailForSeason(stats);
}

function sortByScoreThenReviews(a: ItemSlopStats, b: ItemSlopStats) {
  if (b.averageSlopScore !== a.averageSlopScore) {
    return b.averageSlopScore - a.averageSlopScore;
  }
  return b.reviewCount - a.reviewCount;
}

/** Build four venue-level boards from per-item season + game-day-fresh stats. */
export function buildVenueAwardBoards(
  bundles: VenueAwardItemBundle[]
): VenueAwardBoard[] {
  const hotTonight: VenueAwardPick[] = bundles
    .filter(
      ({ fresh }) =>
        fresh.hasFreshToday && isRated(fresh)
    )
    .sort((a, b) => sortByScoreThenReviews(a.fresh, b.fresh))
    .slice(0, MAX_PICKS)
    .map(({ item, fresh }) => ({
      item,
      stats: fresh,
      detail: pickDetailForHot(fresh)
    }));

  const fanFavorites: VenueAwardPick[] = bundles
    .filter(({ season }) => isRated(season))
    .sort((a, b) => sortByScoreThenReviews(a.season, b.season))
    .slice(0, MAX_PICKS)
    .map(({ item, season }) => ({
      item,
      stats: season,
      detail: pickDetailForSeason(season)
    }));

  const worthTheWalk: VenueAwardPick[] = bundles
    .filter(({ season }) => hasWorthTheWalkSignal(season))
    .sort((a, b) => sortByScoreThenReviews(a.season, b.season))
    .slice(0, MAX_PICKS)
    .map(({ item, season }) => ({
      item,
      stats: season,
      detail: pickDetailWorthTheWalk(season)
    }));

  const seasonStandouts: VenueAwardPick[] = bundles
    .filter(({ season }) => isRated(season))
    .sort((a, b) => {
      const scoreA = a.season.averageSlopScore * Math.log10(a.season.reviewCount + 1);
      const scoreB = b.season.averageSlopScore * Math.log10(b.season.reviewCount + 1);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return sortByScoreThenReviews(a.season, b.season);
    })
    .slice(0, MAX_PICKS)
    .map(({ item, season }) => ({
      item,
      stats: season,
      detail: pickDetailForSeason(season)
    }));

  return [
    {
      id: "hot-tonight",
      title: "Hot Tonight",
      subtitle: "Game-day fresh takes from fans at the park right now.",
      picks: hotTonight,
      emptyMessage:
        "No game-day fresh reviews yet. Check back during the next home stand."
    },
    {
      id: "fan-favorites",
      title: "Fan Favorites",
      subtitle: "Highest Slop scores this season — ranked by fan reviews.",
      picks: fanFavorites,
      emptyMessage:
        "No rated items this season yet. Be the first to post a review."
    },
    {
      id: "worth-the-walk",
      title: "Worth the Walk",
      subtitle: "Items fans say are worth leaving your seat for.",
      picks: worthTheWalk,
      emptyMessage:
        "No Worth the Walk signals yet. Tag reviews when a bite earns the trek."
    },
    {
      id: "season-standouts",
      title: "Season Standouts",
      subtitle: "Consistent crowd-pleasers with repeat fan love.",
      picks: seasonStandouts,
      emptyMessage:
        "Season standouts appear once multiple fans weigh in."
    }
  ];
}

export type FoodItemAwardChip = {
  id: string;
  label: string;
  tone: "gold" | "orange" | "emerald" | "cream";
};

/** Small chips for food item hero — derived only, not stored awards. */
export function deriveFoodItemAwardChips(
  foodItem: FoodItem,
  seasonStats: ItemSlopStats,
  freshStats: ItemSlopStats,
  photoBackedReviewCount: number
): FoodItemAwardChip[] {
  const chips: FoodItemAwardChip[] = [];

  if (freshStats.hasFreshToday && isRated(freshStats)) {
    chips.push({
      id: "trending-tonight",
      label: "Trending Tonight",
      tone: "emerald"
    });
  }

  if (
    foodItem.venueBadge === "Fan Favorite" ||
    (isRated(seasonStats) &&
      seasonStats.averageSlopScore >= 8.5 &&
      seasonStats.reviewCount >= 2)
  ) {
    chips.push({
      id: "fan-favorite",
      label: "Fan Favorite",
      tone: "gold"
    });
  }

  if (hasWorthTheWalkSignal(seasonStats)) {
    chips.push({
      id: "worth-the-walk",
      label: "Worth the Walk",
      tone: "orange"
    });
  }

  if (photoBackedReviewCount > 0) {
    chips.push({
      id: "photo-favorite",
      label: "Photo Favorite",
      tone: "cream"
    });
  }

  return chips;
}

/** Optional vendor hint for future vendor award badges (not rendered yet). */
export function vendorAwardHint(_vendor: Vendor, _items: VenueAwardItemBundle[]): null {
  // TODO: vendor award badges when concessionaire-level stats exist
  return null;
}
