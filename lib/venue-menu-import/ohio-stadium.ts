/**
 * Ohio Stadium (Ohio State Buckeyes — NCAA Football) menu parser.
 * Source: https://ohiostatebuckeyes.com/sports/2022/8/17/food
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  sectionHint,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "ohio-stadium";
const VENUE_NAME = "Ohio Stadium";
const SOURCE_URL = "https://ohiostatebuckeyes.com/sports/2022/8/17/food";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Brutus' Best Hot Dog",
    fare: "Meals",
    vendor: "Brutus' Best",
    vendorHint: "Sections A3, A13, B8, C9, SS33 & more",
    tags: [...NCAA_FB]
  },
  {
    name: "Buckeye BBQ Pulled Pork",
    fare: "Meals",
    vendor: "Buckeye BBQ",
    vendorHint: `${sectionHint("A6")}; ${sectionHint("A15")}; ${sectionHint("B22")}; ${sectionHint("C17")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Buckeye BBQ Pulled Chicken",
    fare: "Meals",
    vendor: "Buckeye BBQ",
    vendorHint: `${sectionHint("A6")}; ${sectionHint("A15")}; ${sectionHint("B22")}; ${sectionHint("C17")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Overloaded Spicy Sausage",
    fare: "Meals",
    vendor: "Overloaded",
    vendorHint: `${sectionHint("A9")}; ${sectionHint("C10")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Overloaded Loaded Specialty Nachos",
    fare: "Meals",
    vendor: "Overloaded",
    vendorHint: `${sectionHint("A9")}; ${sectionHint("C10")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Donatos Pizza",
    fare: "Meals",
    vendor: "Donatos",
    vendorHint: `${sectionHint("A21")}; ${sectionHint("A22")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Donatos Sub",
    fare: "Meals",
    vendor: "Donatos",
    vendorHint: `${sectionHint("A21")}; ${sectionHint("A22")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Panera Sandwich",
    fare: "Meals",
    vendor: "Panera",
    vendorHint: `${sectionHint("A20")}; ${sectionHint("C22")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Ben's Soft Pretzel",
    description: "Hand-rolled soft pretzel",
    fare: "Snacks",
    vendor: "Ben's Soft Pretzel",
    vendorHint: `${sectionHint("A38")}; ${sectionHint("C15")}`,
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Baked & Loaded Brisket Sandwich",
    fare: "Meals",
    vendor: "Baked & Loaded",
    vendorHint: sectionHint("SS35"),
    tags: [...NCAA_FB]
  },
  {
    name: "Baked & Loaded Tots",
    description: "Loaded tots with toppings",
    fare: "Meals",
    vendor: "Baked & Loaded",
    vendorHint: sectionHint("SS35"),
    tags: [...NCAA_FB]
  },
  {
    name: "Marlow's Cheesesteak",
    description: "Classic Philly or chicken cheesesteak",
    fare: "Meals",
    vendor: "Marlow's Cheesesteak",
    vendorHint: sectionHint("A19"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Dirty Franks Loaded Hot Dog",
    fare: "Meals",
    vendor: "Dirty Franks",
    vendorHint: sectionHint("A19"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Loaded Mac & Cheese",
    fare: "Meals",
    vendor: "Loaded Mac & Cheese",
    vendorHint: sectionHint("C21"),
    tags: [...NCAA_FB]
  },
  {
    name: "Skyward Grille Gyro",
    fare: "Meals",
    vendor: "Skyward Grille",
    vendorHint: `${sectionHint("A25")}; ${sectionHint("C24")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Dos Hermanos Tacos",
    fare: "Meals",
    vendor: "Dos Hermanos",
    vendorHint: `${sectionHint("SS36")}; ${sectionHint("C17")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Taste of the Competition Specialty Burger",
    description: "Rotating burger featuring visiting team's region",
    fare: "Meals",
    vendor: "Taste of the Competition",
    vendorHint: `${sectionHint("A8")}; ${sectionHint("C10")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Smashed Buns Cinnamon Roll",
    fare: "Desserts",
    vendor: "Smashed Buns",
    vendorHint: sectionHint("C10"),
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  }
];

export async function parseOhioStadiumMenu(
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
