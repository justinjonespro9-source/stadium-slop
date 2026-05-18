"use client";

import Link from "next/link";

import { isUnratedItemStats } from "@/components/food-item-empty-states";
import type { FoodItem, Vendor } from "@/lib/sample-data";
import { getSlopScoreTier, type ItemSlopStats } from "@/lib/slop-stats-display";

function formatItemPriceHint(item: FoodItem): string | null {
  if (item.reportedPrice != null && item.reportedPrice > 0) {
    return `$${item.reportedPrice.toFixed(2)}`;
  }
  if (
    item.price > 0 &&
    item.priceLastConfirmedLabel &&
    item.priceLastConfirmedLabel !== "Unreported"
  ) {
    return `$${item.price.toFixed(2)}`;
  }
  return null;
}

function formatSections(item: FoodItem) {
  if (!item.sections || item.sections.length === 0) {
    return item.location;
  }

  if (item.sections.length > 2) {
    return "Multiple sections";
  }

  return `Sections ${item.sections.join(", ")}`;
}

function StandingStatusChips({
  rank,
  stats,
  maxReviewsInList
}: {
  rank: number;
  stats: ItemSlopStats;
  maxReviewsInList: number;
}) {
  const unrated = isUnratedItemStats(stats.reviewCount);
  if (unrated) {
    return null;
  }

  type Chip = { key: string; label: string; className: string };
  const chips: Chip[] = [];

  if (rank === 1) {
    chips.push({
      key: "fav",
      label: "Fan favorite",
      className:
        "border border-[color:rgba(244,179,33,0.45)] bg-[color:rgba(244,179,33,0.1)] text-[var(--slop-gold-bright)]"
    });
  }

  if (maxReviewsInList > 0 && stats.reviewCount === maxReviewsInList) {
    chips.push({
      key: "most",
      label: "Most reviewed",
      className:
        "border border-[var(--slop-line-strong)] bg-[color:rgba(245,233,208,0.05)] text-[var(--slop-cream-muted)]"
    });
  }

  if (stats.topPriceCheck?.label === "Worth the Price of Admission") {
    chips.push({
      key: "value",
      label: "Best value",
      className:
        "border border-emerald-500/35 bg-emerald-950/30 text-emerald-200/95"
    });
  }

  if (
    rank > 3 &&
    stats.reviewCount >= 1 &&
    stats.reviewCount <= 3 &&
    stats.averageSlopScore >= 7.5
  ) {
    chips.push({
      key: "sleeper",
      label: "Sleeper pick",
      className:
        "border border-[color:rgba(198,61,47,0.35)] bg-[color:rgba(198,61,47,0.12)] text-[var(--slop-cream-muted)]"
    });
  }

  if (stats.hasFreshToday) {
    chips.push({
      key: "fresh",
      label: "Fresh today",
      className:
        "border border-emerald-400/35 bg-emerald-950/25 text-emerald-200/95"
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {chips.map((c) => (
        <span
          key={c.key}
          className={`inline-flex rounded px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.08em] sm:text-[0.58rem] ${c.className}`}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

export function VenueStandingRow({
  item,
  rank,
  stats,
  venueSlug,
  vendor,
  isFreshStandingsTab,
  maxReviewsInList
}: {
  item: FoodItem;
  rank: number;
  stats: ItemSlopStats;
  venueSlug: string;
  vendor?: Vendor;
  isFreshStandingsTab: boolean;
  maxReviewsInList: number;
}) {
  const priceHint = formatItemPriceHint(item);
  const unrated = isUnratedItemStats(stats.reviewCount);
  const liveFresh = stats.hasFreshToday && isFreshStandingsTab && !unrated;
  const podiumClass =
    !unrated && rank === 1
      ? "standings-podium-1"
      : !unrated && rank === 2
        ? "standings-podium-2"
        : !unrated && rank === 3
          ? "standings-podium-3"
          : "";

  return (
    <Link
      href={`/venues/${venueSlug}/${item.slug}`}
      className={`group relative block border-b border-[color:rgba(245,233,208,0.07)] transition last:border-b-0 hover:bg-[color:rgba(6,15,24,0.5)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slop-gold-bright)]/80 ${
        podiumClass || "bg-[var(--slop-surface)]"
      } ${liveFresh ? "standings-row-live" : ""} `}
    >
      <article className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-2 px-2.5 py-2 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-2.5 sm:px-3 sm:py-2">
        <div
          className={`select-none pt-0.5 text-center font-mono text-base font-black tabular-nums leading-none sm:text-lg ${
            !unrated && rank === 1
              ? "text-[var(--slop-gold-bright)]"
              : !unrated && rank === 2
                ? "text-[#d8dee6]"
                : !unrated && rank === 3
                  ? "text-[#d9b48a]"
                  : "text-[var(--slop-cream-dim)]"
          }`}
          aria-label={`Rank ${rank}`}
        >
          {rank}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-[0.8125rem] font-black leading-tight text-[var(--slop-cream)] sm:text-sm">
              {item.name}
            </h3>
            {item.ageRestricted ? (
              <span className="rounded border border-[var(--slop-line-strong)] px-1 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                21+
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
            <span className="font-semibold text-[var(--slop-cream-muted)]">
              {vendor ? vendor.name : "Vendor TBD"}
            </span>
            <span className="text-[var(--slop-line)]"> · </span>
            <span>{formatSections(item)}</span>
            {priceHint ? (
              <>
                <span className="text-[var(--slop-line)]"> · </span>
                <span className="text-[var(--slop-cream-muted)]">{priceHint}</span>
              </>
            ) : null}
          </p>
          <StandingStatusChips
            rank={rank}
            stats={stats}
            maxReviewsInList={maxReviewsInList}
          />
        </div>
        <div className="min-w-[3.25rem] shrink-0 text-right sm:min-w-[3.5rem]">
          {liveFresh ? (
            <div className="mb-0.5 flex items-center justify-end gap-1">
              <span
                className="slop-live-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                aria-hidden
              />
              <span className="text-[0.5rem] font-black uppercase tracking-[0.14em] text-emerald-300/95">
                Live
              </span>
            </div>
          ) : null}
          {unrated ? (
            <>
              <p className="text-sm font-black text-[var(--slop-cream-dim)] sm:text-base">
                —
              </p>
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)] sm:text-[0.6rem]">
                {isFreshStandingsTab ? "No fresh" : "Unrated"}
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-black tabular-nums text-[var(--slop-orange)] sm:text-lg">
                {stats.averageSlopScore.toFixed(1)}
              </p>
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)] sm:text-[0.6rem]">
                {isFreshStandingsTab ? "Fresh" : getSlopScoreTier(stats.averageSlopScore)}
              </p>
            </>
          )}
        </div>
      </article>
    </Link>
  );
}
