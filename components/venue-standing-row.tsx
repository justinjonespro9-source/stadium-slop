"use client";

import Link from "next/link";

import { FanFavoriteBadgeChips } from "@/components/fan-favorite-badge-chips";
import { isUnratedItemStats } from "@/components/food-item-empty-states";
import type { FanFavoriteBadge } from "@/lib/fan-favorite-awards";
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

/**
 * Vendor / stand context on scoreboard rows (not linked — item page has stand detail).
 * TODO: /venues/[venueSlug]/vendors/[vendorSlug] — More from this vendor, vendor claim flow.
 */
function VendorStandMeta({
  vendor,
  item
}: {
  vendor?: Vendor;
  item: FoodItem;
}) {
  const priceHint = formatItemPriceHint(item);
  const locationLine = formatSections(item);

  if (!vendor?.slug) {
    return (
      <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
        <span className="font-semibold text-[var(--slop-cream-muted)]">Vendor TBD</span>
        <span className="text-[var(--slop-line)]"> · </span>
        <span>{locationLine}</span>
        {priceHint ? (
          <>
            <span className="text-[var(--slop-line)]"> · </span>
            <span className="text-[var(--slop-cream-muted)]">{priceHint}</span>
          </>
        ) : null}
      </p>
    );
  }

  const standDetail = [vendor.section, vendor.location].filter(Boolean).join(" · ");

  return (
    <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
      <span className="font-semibold text-[var(--slop-cream-muted)]">{vendor.name}</span>
      {standDetail ? (
        <>
          <span className="text-[var(--slop-line)]"> · </span>
          <span>{standDetail}</span>
        </>
      ) : (
        <>
          <span className="text-[var(--slop-line)]"> · </span>
          <span>{locationLine}</span>
        </>
      )}
      {priceHint ? (
        <>
          <span className="text-[var(--slop-line)]"> · </span>
          <span className="text-[var(--slop-cream-muted)]">{priceHint}</span>
        </>
      ) : null}
    </p>
  );
}

function FreshTodayChip() {
  return (
    <span className="inline-flex rounded border border-emerald-400/35 bg-emerald-950/25 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.08em] text-emerald-200/95 sm:text-[0.58rem]">
      Fresh today
    </span>
  );
}

export function VenueStandingRow({
  item,
  rank,
  stats,
  venueSlug,
  vendor,
  isFreshStandingsTab,
  fanFavoriteBadges
}: {
  item: FoodItem;
  rank: number;
  stats: ItemSlopStats;
  venueSlug: string;
  vendor?: Vendor;
  isFreshStandingsTab: boolean;
  fanFavoriteBadges: FanFavoriteBadge[];
}) {
  const unrated = isUnratedItemStats(stats.reviewCount);
  const liveFresh = stats.hasFreshToday && isFreshStandingsTab && !unrated;
  const itemHref = `/venues/${venueSlug}/${item.slug}`;
  const podiumClass =
    !unrated && rank === 1
      ? "standings-podium-1"
      : !unrated && rank === 2
        ? "standings-podium-2"
        : !unrated && rank === 3
          ? "standings-podium-3"
          : "";

  return (
    <article
      className={`group relative border-b border-[color:rgba(245,233,208,0.07)] transition last:border-b-0 hover:bg-[color:rgba(6,15,24,0.5)] ${
        podiumClass || "bg-[var(--slop-surface)]"
      } ${liveFresh ? "standings-row-live" : ""} `}
    >
      <Link
        href={itemHref}
        className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-2 px-2.5 py-2 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-2.5 sm:px-3 sm:py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--slop-gold-bright)]/70"
        aria-label={`${item.name}${unrated ? "" : ` — ${stats.averageSlopScore.toFixed(1)} Slop Score`}`}
      >
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
          aria-hidden
        >
          {rank}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[0.8125rem] font-black leading-tight text-[var(--slop-cream)] group-hover:text-[var(--slop-gold-bright)] sm:text-sm">
              {item.name}
            </p>
            {item.ageRestricted ? (
              <span className="rounded border border-[var(--slop-line-strong)] px-1 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                21+
              </span>
            ) : null}
          </div>
          <VendorStandMeta vendor={vendor} item={item} />
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <FanFavoriteBadgeChips badges={fanFavoriteBadges} variant="row" />
            {stats.hasFreshToday ? <FreshTodayChip /> : null}
          </div>
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
      </Link>
    </article>
  );
}
