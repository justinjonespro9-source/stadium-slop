/**
 * Sanford Stadium (Georgia Bulldogs — NCAA Football) menu parser.
 * Sources: UGA A-Z Guide 2025; official 2024 concessions expansion coverage
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  sectionHint,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "sanford-stadium";
const VENUE_NAME = "Sanford Stadium";
const SOURCE_URL = "https://georgiadogs.com/documents/download/2025/8/26/A-Z_Guide_2025.pdf";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Multiple concourse locations",
    tags: [...NCAA_FB]
  },
  {
    name: "Papa John's Pizza",
    fare: "Meals",
    vendor: "Papa John's",
    vendorHint: "Multiple concourse locations",
    tags: [...NCAA_FB]
  },
  {
    name: "Chicken Salad Chick Chicken Salad",
    fare: "Meals",
    vendor: "Chicken Salad Chick",
    vendorHint: `${sectionHint("122")}; ${sectionHint("325")}; Reed Plaza`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Williamson Bros. Bar-B-Q Sandwich",
    fare: "Meals",
    vendor: "Williamson Bros. Bar-B-Q",
    vendorHint: sectionHint("106"),
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Huey Magoo's Chicken Tenders",
    description: "Hand-breaded grilled or sauced tenders at Gate 9",
    fare: "Meals",
    vendor: "Huey Magoo's",
    vendorHint: "Gate 9 · under Sanford Drive bridge",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Grindhouse Burger",
    description: "Local Athens burger joint at Reed Plaza",
    fare: "Meals",
    vendor: "Grindhouse Burgers",
    vendorHint: "Reed Plaza",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Bruster's Ice Cream",
    fare: "Desserts",
    vendor: "Bruster's Ice Cream",
    vendorHint: "Reed Plaza",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor"]
  }
];

export async function parseSanfordStadiumMenu(
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
