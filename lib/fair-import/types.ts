import type { VenueMenuParseResult, VenueMenuSourceItem } from "@/lib/venue-menu-import/types";

export const FAIR_SOURCE_YEAR = 2025;

export type FairVenueDefinition = {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  recurringEvents: string[];
};

export type FairRawMenuItem = {
  name: string;
  vendor: string;
  description?: string;
  price?: number;
  location?: string;
  fare?: "Meals" | "Snacks" | "Desserts";
  /** Set true for specialty cocktails / notable fair beverages only */
  allowBeverage?: boolean;
  beverageCategory?: "Alcoholic Drink" | "Non-Alcoholic Drink";
};

export type FairMenuParseResult = VenueMenuParseResult & {
  sourceYear: number;
  warnings: string[];
  skippedItems: { name: string; reason: string }[];
};

export type FairImportTags = {
  importTags: string[];
  seasonIntroduced: string;
};

export type FairTaggedSourceItem = VenueMenuSourceItem & FairImportTags;
