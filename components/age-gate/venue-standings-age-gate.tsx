"use client";

import { useEffect, useState } from "react";

import { AlcoholHiddenStandingRow } from "@/components/age-gate/alcohol-hidden-standing-row";
import { AgeConfirmationPrompt } from "@/components/age-gate/age-confirmation-prompt";
import { useAgeGate } from "@/components/age-gate/age-gate-context";
import { VenueStandingRow } from "@/components/venue-standing-row";
import type { FoodItem, Vendor } from "@/lib/sample-data";
import type { ItemSlopStats } from "@/lib/slop-stats";

export type VenueStandingAgeGateRow = {
  item: FoodItem;
  stats: ItemSlopStats;
  alcoholRelated: boolean;
  vendor?: Vendor;
};

type VenueStandingsAgeGateProps = {
  rows: VenueStandingAgeGateRow[];
  venueSlug: string;
  isFreshStandingsTab: boolean;
  maxReviewsInList: number;
};

export function VenueStandingsAgeGate({
  rows,
  venueSlug,
  isFreshStandingsTab,
  maxReviewsInList
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
        <AgeConfirmationPrompt className="border-b border-[color:rgba(245,233,208,0.07)]" />
      ) : null}
      {rows.map((row, index) => {
        const rank = index + 1;
        if (row.alcoholRelated && hideAlcohol) {
          return (
            <AlcoholHiddenStandingRow key={row.item.slug} rank={rank} />
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
            maxReviewsInList={maxReviewsInList}
          />
        );
      })}
    </>
  );
}
