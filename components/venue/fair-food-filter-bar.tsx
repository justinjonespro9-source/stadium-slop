"use client";

import {
  FAIR_FOOD_FILTER_DEFINITIONS,
  type FairFoodFilterKey
} from "@/lib/fair-food-filters";

type FairFoodFilterBarProps = {
  activeFilter: FairFoodFilterKey | null;
  counts: Record<FairFoodFilterKey, number>;
  onFilterChange: (filter: FairFoodFilterKey | null) => void;
};

export function FairFoodFilterBar({
  activeFilter,
  counts,
  onFilterChange
}: FairFoodFilterBarProps) {
  return (
    <div className="fair-food-filter-bar">
      <div className="fair-food-filter-bar__copy">
        <h3 className="fair-food-filter-bar__title">Fair food filters</h3>
        <p className="fair-food-filter-bar__body">
          Find the sweets, deep-fried drops, spicy bites, and new foods worth the walk.
        </p>
      </div>
      <div
        className="fair-food-filter-bar__chips"
        role="group"
        aria-label="Fair food filters"
      >
        {FAIR_FOOD_FILTER_DEFINITIONS.map((def) => {
          const count = counts[def.key];
          const isActive = activeFilter === def.key;
          const isDisabled = count === 0;
          return (
            <button
              key={def.key}
              type="button"
              disabled={isDisabled}
              aria-pressed={isActive}
              className={`fair-food-filter-chip${isActive ? " fair-food-filter-chip--active" : ""}${isDisabled ? " fair-food-filter-chip--disabled" : ""}`}
              onClick={() => onFilterChange(isActive ? null : def.key)}
            >
              <span>{def.label}</span>
              <span className="fair-food-filter-chip__count" aria-hidden>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
