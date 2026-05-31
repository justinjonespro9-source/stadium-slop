"use client";

import { useMemo, useState } from "react";

import { AgeGateProvider } from "@/components/age-gate/age-gate-context";
import {
  VenueStandingsAgeGate,
  type VenueStandingAgeGateRow
} from "@/components/age-gate/venue-standings-age-gate";
import { FairFoodFilterBar } from "@/components/venue/fair-food-filter-bar";
import {
  buildFairFoodFilterCounts,
  itemMatchesFairFoodFilter,
  type FairFoodFilterKey
} from "@/lib/fair-food-filters";

type FairVenueStandingsProps = {
  rows: VenueStandingAgeGateRow[];
  venueSlug: string;
  isFreshStandingsTab: boolean;
  emptyMessage: string | null;
  tone?: "brand" | "media";
};

export function FairVenueStandings({
  rows,
  venueSlug,
  isFreshStandingsTab,
  emptyMessage,
  tone = "media"
}: FairVenueStandingsProps) {
  const [activeFilter, setActiveFilter] = useState<FairFoodFilterKey | null>(null);

  const items = useMemo(() => rows.map((row) => row.item), [rows]);
  const filterCounts = useMemo(() => buildFairFoodFilterCounts(items), [items]);

  const filteredRows = useMemo(() => {
    if (!activeFilter) {
      return rows;
    }
    return rows.filter((row) => itemMatchesFairFoodFilter(row.item, activeFilter));
  }, [rows, activeFilter]);

  const filterEmptyMessage =
    activeFilter && filteredRows.length === 0
      ? "No items match this fair filter. Try another chip or clear the filter."
      : emptyMessage;

  return (
    <div className="fair-venue-standings min-w-0">
      <FairFoodFilterBar
        activeFilter={activeFilter}
        counts={filterCounts}
        onFilterChange={setActiveFilter}
      />

      <div className="fair-venue-standings__list mt-4 min-w-0">
        <AgeGateProvider>
          {filteredRows.length > 0 ? (
            <VenueStandingsAgeGate
              rows={filteredRows}
              venueSlug={venueSlug}
              isFreshStandingsTab={isFreshStandingsTab}
              tone={tone}
            />
          ) : (
            <p className="media-panel-card px-4 py-5 text-sm leading-relaxed text-[var(--media-ink-muted)]">
              {filterEmptyMessage}
            </p>
          )}
        </AgeGateProvider>
      </div>
    </div>
  );
}
