/**
 * Tiger Stadium (LSU Tigers — NCAA Football) menu parser.
 * Source: https://lsusports.net/tiger-stadium-concessions-locations/
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  sectionHint,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "tiger-stadium";
const VENUE_NAME = "Tiger Stadium";
const SOURCE_URL = "https://lsusports.net/tiger-stadium-concessions-locations/";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Tiger Dog",
    fare: "Meals",
    vendor: "Tiger Classics",
    vendorHint: "Multiple sections — North, East, South, West",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Tiger Burger",
    fare: "Meals",
    vendor: "Tiger Classics",
    vendorHint: "Multiple sections",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Cajun Burger",
    fare: "Meals",
    vendor: "1924 Grill",
    vendorHint: `${sectionHint("636")}; ${sectionHint("404", "South")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Bayou Burger",
    fare: "Meals",
    vendor: "Bayou Burger",
    vendorHint: `${sectionHint("103")}; ${sectionHint("104")}`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Manda Smoked Sausage PoBoy",
    fare: "Meals",
    vendor: "Manda",
    vendorHint: `${sectionHint("231")}; ${sectionHint("403", "Manda Cart")}; ${sectionHint("409")}`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Manda Sausage Mac & Cheese",
    fare: "Meals",
    vendor: "Manda",
    vendorHint: `${sectionHint("231")}; Manda Cart locations`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Manda Jambalaya",
    fare: "Meals",
    vendor: "Manda",
    vendorHint: `${sectionHint("231")}; Manda Cart locations`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Cajun Classics Crawfish Nachos",
    fare: "Meals",
    vendor: "Cajun Classics",
    vendorHint: `${sectionHint("304", "East Top")}; NE Corner`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Cajun Classics Jambalaya",
    fare: "Meals",
    vendor: "Cajun Classics",
    vendorHint: "Sections 202/219, 304, 640 & more",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Cajun Classics Alligator Po'boy",
    fare: "Meals",
    vendor: "Cajun Classics",
    vendorHint: `${sectionHint("202")}; Cajun Corner`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "KOK Boneless Wings & Fries",
    fare: "Meals",
    vendor: "KOK Wings n Things",
    vendorHint: `${sectionHint("409")}; ${sectionHint("100", "West")}`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Eat Drink Taco Buffalo Chicken Nachos",
    fare: "Meals",
    vendor: "Eat Drink Taco",
    vendorHint: `${sectionHint("303")}; ${sectionHint("103")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Eat Drink Taco Beef Tacos",
    fare: "Meals",
    vendor: "Eat Drink Taco",
    vendorHint: `${sectionHint("303")}; ${sectionHint("103")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Tre's Jerk Chicken Philly",
    fare: "Meals",
    vendor: "Tre's Street Kitchen",
    vendorHint: `${sectionHint("209")}; ${sectionHint("212")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Queens Eats Loaded Nachos",
    fare: "Meals",
    vendor: "Queens Eats",
    vendorHint: `${sectionHint("233")}; ${sectionHint("416")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 204, 304, 403, 405, 409, 413, 419",
    tags: [...NCAA_FB]
  },
  {
    name: "Papa John's Personal Pizza",
    fare: "Meals",
    vendor: "Papa John's",
    vendorHint: "Sections 204, 403, 409, 413, 421",
    tags: [...NCAA_FB]
  },
  {
    name: "Peach Cobbler Factory Cobbler",
    fare: "Desserts",
    vendor: "Peach Cobbler Factory",
    vendorHint: sectionHint("304"),
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Stadium Nachos Ultimate Beef Nachos",
    fare: "Meals",
    vendor: "Stadium Nachos",
    vendorHint: `${sectionHint("234")}; ${sectionHint("638")}; ${sectionHint("403")}`,
    tags: [...NCAA_FB]
  }
];

export async function parseTigerStadiumMenu(
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
