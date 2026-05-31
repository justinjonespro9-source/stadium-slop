"use client";

import Link from "next/link";

import { FanFavoriteBadgeChips } from "@/components/fan-favorite-badge-chips";
import { FairFoodItemBadges } from "@/components/venue/fair-food-item-badges";
import { isUnratedItemStats } from "@/components/food-item-empty-states";
import type { FanFavoriteBadge } from "@/lib/fan-favorite-awards";
import type { FoodItem, Vendor } from "@/lib/sample-data";
import { formatFairVendorDisplayName } from "@/lib/fair-venue-copy";
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

function VendorStandMeta({
  vendor,
  item,
  tone = "brand",
  compactVendorName = false
}: {
  vendor?: Vendor;
  item: FoodItem;
  tone?: "brand" | "media";
  compactVendorName?: boolean;
}) {
  const priceHint = formatItemPriceHint(item);
  const locationLine = formatSections(item);
  const metaClass =
    tone === "media"
      ? "mt-1 line-clamp-2 text-[0.7rem] leading-snug text-[var(--media-ink-muted)] sm:text-xs"
      : "mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs";
  const nameClass =
    tone === "media"
      ? "font-semibold text-[var(--media-ink)]"
      : "font-semibold text-[var(--slop-cream-muted)]";
  const sepClass =
    tone === "media" ? "text-[var(--media-ink-dim)]" : "text-[var(--slop-line)]";

  if (!vendor?.slug) {
    return (
      <p className={metaClass}>
        <span className={nameClass}>Vendor TBD</span>
        <span className={sepClass}> · </span>
        <span>{locationLine}</span>
        {priceHint ? (
          <>
            <span className={sepClass}> · </span>
            <span>{priceHint}</span>
          </>
        ) : null}
      </p>
    );
  }

  const standDetail = [vendor.section, vendor.location].filter(Boolean).join(" · ");
  const vendorLabel = compactVendorName
    ? formatFairVendorDisplayName(vendor.name)
    : vendor.name;
  const vendorTitle =
    compactVendorName && vendorLabel !== vendor.name ? vendor.name : undefined;

  return (
    <p className={metaClass}>
      <span className={nameClass} title={vendorTitle}>
        {vendorLabel}
      </span>
      {standDetail ? (
        <>
          <span className={sepClass}> · </span>
          <span>{standDetail}</span>
        </>
      ) : (
        <>
          <span className={sepClass}> · </span>
          <span>{locationLine}</span>
        </>
      )}
      {priceHint ? (
        <>
          <span className={sepClass}> · </span>
          <span>{priceHint}</span>
        </>
      ) : null}
    </p>
  );
}

function FreshTodayChip({ tone = "brand" }: { tone?: "brand" | "media" }) {
  const className =
    tone === "media"
      ? "inline-flex rounded-full border border-emerald-500/30 bg-emerald-50 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.08em] text-emerald-700 sm:text-[0.58rem]"
      : "inline-flex rounded border border-emerald-400/35 bg-emerald-950/25 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.08em] text-emerald-200/95 sm:text-[0.58rem]";

  return <span className={className}>Fresh today</span>;
}

export function VenueStandingRow({
  item,
  rank,
  stats,
  venueSlug,
  vendor,
  isFreshStandingsTab,
  fanFavoriteBadges,
  tone = "brand",
  showFairImportBadges = false
}: {
  item: FoodItem;
  rank: number;
  stats: ItemSlopStats;
  venueSlug: string;
  vendor?: Vendor;
  isFreshStandingsTab: boolean;
  fanFavoriteBadges: FanFavoriteBadge[];
  tone?: "brand" | "media";
  showFairImportBadges?: boolean;
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

  if (tone === "media") {
    const cardAccent =
      !unrated && rank === 1
        ? "media-venue-item-card--podium-1"
        : !unrated && rank === 2
          ? "media-venue-item-card--podium-2"
          : !unrated && rank === 3
            ? "media-venue-item-card--podium-3"
            : liveFresh
              ? "media-venue-item-card--live"
              : "";

    const rankClass =
      !unrated && rank === 1
        ? "media-venue-rank--podium-1"
        : !unrated && rank === 2
          ? "media-venue-rank--podium-2"
          : !unrated && rank === 3
            ? "media-venue-rank--podium-3"
            : "media-venue-rank";

    return (
      <li>
        <Link
          href={itemHref}
          className={`media-card media-venue-item-card ${cardAccent}`}
          aria-label={`${item.name}${unrated ? "" : ` — ${stats.averageSlopScore.toFixed(1)} Slop Score`}`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className={`media-venue-rank ${rankClass}`}>#{rank}</span>
            <div className="min-w-[3rem] shrink-0 text-right">
              {liveFresh ? (
                <div className="mb-0.5 flex items-center justify-end gap-1">
                  <span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  <span className="text-[0.5rem] font-black uppercase tracking-[0.12em] text-emerald-600">
                    Live
                  </span>
                </div>
              ) : null}
              {unrated ? (
                <>
                  <p className="media-venue-score text-[var(--media-ink-dim)]">—</p>
                  <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
                    {isFreshStandingsTab ? "No fresh" : "Unrated"}
                  </p>
                </>
              ) : (
                <>
                  <p className="media-venue-score">{stats.averageSlopScore.toFixed(1)}</p>
                  <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
                    {isFreshStandingsTab ? "Fresh" : getSlopScoreTier(stats.averageSlopScore)}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p
                className={`media-rank-card-title${showFairImportBadges ? " fair-rank-card-title" : ""}`}
              >
                {item.name}
              </p>
              {item.ageRestricted ? (
                <span className="rounded-full border border-[var(--media-border)] px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
                  21+
                </span>
              ) : null}
              {showFairImportBadges ? <FairFoodItemBadges item={item} tone="media" /> : null}
            </div>
            <VendorStandMeta
              vendor={vendor}
              item={item}
              tone="media"
              compactVendorName={showFairImportBadges}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <FanFavoriteBadgeChips badges={fanFavoriteBadges} variant="row" />
              {stats.hasFreshToday ? <FreshTodayChip tone="media" /> : null}
            </div>
          </div>
        </Link>
      </li>
    );
  }

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
            {showFairImportBadges ? <FairFoodItemBadges item={item} tone="brand" /> : null}
          </div>
          <VendorStandMeta vendor={vendor} item={item} tone="brand" />
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <FanFavoriteBadgeChips badges={fanFavoriteBadges} variant="row" />
            {stats.hasFreshToday ? <FreshTodayChip tone="brand" /> : null}
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
