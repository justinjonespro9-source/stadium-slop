/** Shared types for the venue menu import pipeline. */

export type VenueMenuItemCategory = "Food" | "Alcoholic Drink" | "Non-Alcoholic Drink";

export type VenueMenuFare = "Meals" | "Snacks" | "Desserts";

export type VenueMenuDietaryTag =
  | "Gluten Free"
  | "Lactose Free"
  | "Vegan"
  | "Vegetarian";

export type VenueMenuSourceItem = {
  name: string;
  price?: number;
  description?: string;
  fare?: VenueMenuFare;
  category: VenueMenuItemCategory;
  vendorName?: string;
  vendorLocationHint?: string;
  imageUrl?: string;
  dietaryTags: VenueMenuDietaryTag[];
  sourceUrl?: string;
  /** Extra FoodItem.tags (e.g. state-fair preview metadata). */
  importTags?: string[];
  /** Overrides default seasonIntroduced on import (e.g. "2025"). */
  seasonIntroduced?: string;
};

export type VenueMenuParseResult = {
  venueSlug: string;
  venueName: string;
  sourceUrl: string;
  parsedAt: string;
  items: VenueMenuSourceItem[];
  skippedDrinks: number;
};

export type VenueMenuImportAction =
  | "added"
  | "matched"
  | "skipped"
  | "duplicate";

export type VenueMenuImportRow = {
  action: VenueMenuImportAction;
  name: string;
  normalizedName: string;
  reason?: string;
  existingSlug?: string;
  vendorName?: string;
};

export type VenueMenuImportSummary = {
  venueSlug: string;
  venueName: string;
  dryRun: boolean;
  rows: VenueMenuImportRow[];
  added: number;
  matched: number;
  skipped: number;
  duplicates: number;
  sourceUrl: string;
};

export type VenueMenuParser = (sourceUrl?: string) => Promise<VenueMenuParseResult>;
