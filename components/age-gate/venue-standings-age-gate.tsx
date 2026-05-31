"use client";

import { useEffect, useState } from "react";

import { AlcoholHiddenStandingRow } from "@/components/age-gate/alcohol-hidden-standing-row";
import { AgeConfirmationPrompt } from "@/components/age-gate/age-confirmation-prompt";
import { useAgeGate } from "@/components/age-gate/age-gate-context";
import { VenueStandingRow } from "@/components/venue-standing-row";
import type { FanFavoriteBadge } from "@/lib/fan-favorite-awards";
import type { FoodItem, Vendor } from "@/lib/sample-data";
import type { ItemSlopStats } from "@/lib/slop-stats-display";

export type VenueStandingAgeGateRow = {
  item: FoodItem;
  stats: ItemSlopStats;
  alcoholRelated: boolean;
  vendor?: Vendor;
  fanFavoriteBadges: FanFavoriteBadge[];
};

type VenueStandingsAgeGateProps = {
  rows: VenueStandingAgeGateRow[];
  venueSlug: string;
  isFreshStandingsTab: boolean;
  tone?: "brand" | "media";
  showFairImportBadges?: boolean;
};

export function VenueStandingsAgeGate({
  rows,
  venueSlug,
  isFreshStandingsTab,
  tone = "brand",
  showFairImportBadges = false
}: VenueStandingsAgeGateProps) {
  const { status, isConfirmed } = useAgeGate();
  const hasAlcohol = rows.some((row) => row.alcoholRelated);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (hasAlcohol && status === "unknown") {
      setShowPrompt(true);
    }
  }, [hasAlcohol, status]);

  const hideAlcohol = hasAlcohol && !isConfirmed;

  return (
    <>
      {hasAlcohol && (status === "declined" || (status === "unknown" && showPrompt)) ? (
        <AgeConfirmationPrompt
          className={
            tone === "media"
              ? "media-age-prompt mb-3 rounded-xl border p-3 sm:p-4"
              : "border-b border-[color:rgba(245,233,208,0.07)]"
          }
          tone={tone}
        />
      ) : null}
      {tone === "media" ? (
        <ul className="media-venue-standings-grid">
          {rows.map((row, index) => {
            const rank = index + 1;
            if (row.alcoholRelated && hideAlcohol) {
              return (
                <AlcoholHiddenStandingRow key={row.item.slug} rank={rank} tone={tone} />
              );
            }
            return (
              <VenueStandingRow
                key={row.item.slug}
                item={row.item}
                rank={rank}
                stats={row.stats}
                vendor={row.vendor}
                venueSlug={venueSlug}
                isFreshStandingsTab={isFreshStandingsTab}
                fanFavoriteBadges={row.fanFavoriteBadges}
                tone={tone}
                showFairImportBadges={showFairImportBadges}
              />
            );
          })}
        </ul>
      ) : (
        <>
          {rows.map((row, index) => {
            const rank = index + 1;
            if (row.alcoholRelated && hideAlcohol) {
              return (
                <AlcoholHiddenStandingRow key={row.item.slug} rank={rank} tone={tone} />
              );
            }
            return (
              <VenueStandingRow
                key={row.item.slug}
                item={row.item}
                rank={rank}
                stats={row.stats}
                vendor={row.vendor}
                venueSlug={venueSlug}
                isFreshStandingsTab={isFreshStandingsTab}
                fanFavoriteBadges={row.fanFavoriteBadges}
                tone={tone}
                showFairImportBadges={showFairImportBadges}
              />
            );
          })}
        </>
      )}
    </>
  );
}
