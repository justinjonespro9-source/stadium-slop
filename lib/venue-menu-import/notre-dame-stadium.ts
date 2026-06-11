/**
 * Notre Dame Stadium (Fighting Irish — NCAA Football) menu parser.
 * Sources:
 *   https://fightingirish.com/fbgameday/fb-info/concessions/
 *   Stadium concessions map (Level 1 & 2)
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  sectionHint,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "notre-dame-stadium";
const VENUE_NAME = "Notre Dame Stadium";
const SOURCE_URL = "https://fightingirish.com/fbgameday/fb-info/concessions/";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Rockne Brat",
    description:
      "Guinness mustard sauce and caramelized onions; proceeds support Rockne Athletics Fund",
    fare: "Meals",
    vendor: "Notre Dame Concessions",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Domer Dog",
    fare: "Meals",
    vendor: "Domer Dog",
    vendorHint: "Lower concourse",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Pot o' Gold Nachos",
    fare: "Meals",
    vendor: "Pot o' Gold Nacho",
    vendorHint: "Lower concourse",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Walking Taco",
    fare: "Meals",
    vendor: "Notre Dame Concessions",
    vendorHint: "Lower concourse",
    tags: [...NCAA_FB]
  },
  {
    name: "Nelson's BBQ Sandwich",
    fare: "Meals",
    vendor: "Nelson's BBQ",
    vendorHint: `${sectionHint("122")}; upper concourse portable`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Nelson's Pit-tatoes",
    description: "Loaded potato from Nelson's BBQ",
    fare: "Meals",
    vendor: "Nelson's BBQ",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Ben's Soft Pretzel",
    fare: "Snacks",
    vendor: "Ben's Pretzel",
    vendorHint: `${sectionHint("7")}; ${sectionHint("112", "upper")}`,
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Philly Cheesesteak",
    fare: "Meals",
    vendor: "Philly Cheesesteak",
    vendorHint: "Lower concourse",
    tags: [...NCAA_FB]
  },
  {
    name: "Pot Roast Sandwich",
    fare: "Meals",
    vendor: "Pot Roast/Brat",
    vendorHint: `${sectionHint("130")}; ${sectionHint("131")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Gipper's Grill Pizza",
    fare: "Meals",
    vendor: "Gipper's Grill",
    vendorHint: `${sectionHint("13")}; ${sectionHint("14")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Burger/Brat Grill Burger",
    fare: "Meals",
    vendor: "Burger/Brat Grill",
    vendorHint: "Lower concourse",
    tags: [...NCAA_FB]
  },
  {
    name: "BBQ & Mac",
    description: "BBQ with mac & cheese — stadium classic combo",
    fare: "Meals",
    vendor: "Notre Dame Concessions",
    tags: [...NCAA_FB]
  },
  {
    name: "Boom Boom Chicken",
    description: "Notre Dame stadium fried chicken offering",
    fare: "Meals",
    vendor: "Grill Fryer",
    vendorHint: sectionHint("31"),
    tags: [...NCAA_FB, "signature"]
  }
];

export async function parseNotreDameStadiumMenu(
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
