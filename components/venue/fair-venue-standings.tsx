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
  FAIR_FOOD_FILTER_DEFINITIONS,
  itemMatchesFairFoodFilter,
  type FairFoodFilterKey
} from "@/lib/fair-food-filters";

const FAIR_STANDINGS_PAGE_SIZE = 60;

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
  const [visibleCount, setVisibleCount] = useState(FAIR_STANDINGS_PAGE_SIZE);

  const handleFilterChange = (filter: FairFoodFilterKey | null) => {
    setActiveFilter(filter);
    setVisibleCount(FAIR_STANDINGS_PAGE_SIZE);
  };

  const items = useMemo(() => rows.map((row) => row.item), [rows]);
  const filterCounts = useMemo(() => buildFairFoodFilterCounts(items), [items]);

  const filteredRows = useMemo(() => {
    if (!activeFilter) {
      return rows;
    }
    return rows.filter((row) => itemMatchesFairFoodFilter(row.item, activeFilter));
  }, [rows, activeFilter]);

  const paginateList = filteredRows.length > FAIR_STANDINGS_PAGE_SIZE;
  const visibleRows = paginateList
    ? filteredRows.slice(0, Math.min(visibleCount, filteredRows.length))
    : filteredRows;
  const showCountLine = paginateList;
  const showMoreButton =
    paginateList && visibleRows.length < filteredRows.length;

  const activeFilterLabel = activeFilter
    ? FAIR_FOOD_FILTER_DEFINITIONS.find((def) => def.key === activeFilter)?.label
    : null;

  const filterEmptyMessage =
    activeFilter && filteredRows.length === 0
      ? `No ${activeFilterLabel?.toLowerCase() ?? "fair"} foods match this filter. Clear the filter or try another chip.`
      : emptyMessage;

  return (
    <div className="fair-venue-standings min-w-0">
      <FairFoodFilterBar
        activeFilter={activeFilter}
        counts={filterCounts}
        onFilterChange={handleFilterChange}
      />

      <div className="fair-venue-standings__list mt-4 min-w-0">
        {showCountLine ? (
          <p className="fair-venue-standings__count" aria-live="polite">
            Showing {visibleRows.length} of {filteredRows.length} foods
          </p>
        ) : null}
        <AgeGateProvider>
          {filteredRows.length > 0 ? (
            <>
              <VenueStandingsAgeGate
                rows={visibleRows}
                venueSlug={venueSlug}
                isFreshStandingsTab={isFreshStandingsTab}
                tone={tone}
                showFairImportBadges
              />
              {showMoreButton ? (
                <div className="fair-venue-standings__more">
                  <button
                    type="button"
                    className="fair-venue-standings__more-btn"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + FAIR_STANDINGS_PAGE_SIZE, filteredRows.length)
                      )
                    }
                  >
                    Show more fair foods
                  </button>
                </div>
              ) : null}
            </>
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
