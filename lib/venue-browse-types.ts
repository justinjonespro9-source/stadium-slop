import type { FoodItem } from "@/lib/sample-data";

export type VenueBrowseTopItem = {
  name: string;
  slopScore: number;
  itemType: FoodItem["itemType"];
  ageRestricted: boolean;
};

export type VenueBrowseSummary = {
  itemCount: number;
  vendorCount: number;
  tags: string[];
  topItem: VenueBrowseTopItem | null;
};

export type VenueBrowseSummariesBySlug = Record<string, VenueBrowseSummary>;

export const EMPTY_VENUE_BROWSE_SUMMARY: VenueBrowseSummary = {
  itemCount: 0,
  vendorCount: 0,
  tags: [],
  topItem: null
};
