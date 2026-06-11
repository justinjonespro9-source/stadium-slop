/**
 * Neyland Stadium (Tennessee Volunteers — NCAA Football) menu parser.
 * Source: https://utsports.com/sports/2025/6/16/neyland-stadium-concessions
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "neyland-stadium";
const VENUE_NAME = "Neyland Stadium";
const SOURCE_URL =
  "https://utsports.com/sports/2025/6/16/neyland-stadium-concessions";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Calhoun's BBQ",
    description: "Calhoun's BBQ stand — West Sideline, South Endzone, North Endzone, Level 3",
    fare: "Meals",
    vendor: "Calhoun's BBQ",
    vendorHint: "Level 1 West Sideline; South Endzone; North Endzone; Level 3 North Endzone",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Neyland's Mac 'n More",
    description: "Loaded mac & cheese concept at South Endzone",
    fare: "Meals",
    vendor: "Neyland's Mac 'n More",
    vendorHint: "Level 1 South Endzone",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Petro's Chili & Chips",
    description: "Petro's signature chili over chips — multiple concourse locations",
    fare: "Meals",
    vendor: "Petro's",
    vendorHint: "Level 1 West Sideline; South Endzone; North Endzone; Level 2 East Side; Level 3 North Endzone",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Smokey's Dog House Hot Dog",
    fare: "Meals",
    vendor: "Smokey's Dog House",
    vendorHint: "Level 1 South Endzone; North Endzone",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "The General's Grill Burger",
    fare: "Meals",
    vendor: "The General's Grill",
    vendorHint: "Level 1 South Endzone; Level 2 South Endzone",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Fan Favorite Sandwich",
    fare: "Meals",
    vendor: "Fan Favorite Sandwiches",
    vendorHint: "Level 1 North Endzone; Level 2 North Endzone",
    tags: [...NCAA_FB]
  },
  {
    name: "Good Ole' Chicken Shack Chicken",
    fare: "Meals",
    vendor: "Good Ole' Chicken Shack",
    vendorHint: "Level 1 North Endzone",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Moe's Burrito Bowl",
    fare: "Meals",
    vendor: "Moe's",
    vendorHint: "Level 1 North Endzone kiosk; Level 2 South Endzone",
    tags: [...NCAA_FB]
  },
  {
    name: "The Checkerboard Cheese Grilled Cheese",
    fare: "Meals",
    vendor: "The Checkerboard Cheese",
    vendorHint: "Level 1 North Endzone",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Neyland Grill Burger",
    fare: "Meals",
    vendor: "Neyland Grill",
    vendorHint: "Level 1 West Sideline; Level 3 North Endzone",
    tags: [...NCAA_FB]
  }
];

export async function parseNeylandStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const items = dedupeMenuItems(MENU_DATA).map((r) => toSourceItem(r, url));
  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
