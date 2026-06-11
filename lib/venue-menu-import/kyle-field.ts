/**
 * Kyle Field (Texas A&M Aggies — NCAA Football) menu parser.
 * Source: https://12thman.com/sports/2025/8/11/kyle-field-concessions
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  sectionHint,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "kyle-field";
const VENUE_NAME = "Kyle Field";
const SOURCE_URL = "https://12thman.com/sports/2025/8/11/kyle-field-concessions";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Aggie Dog",
    fare: "Meals",
    vendor: "Kyle Field Concessions",
    vendorHint: `${sectionHint("123")}; ${sectionHint("134")}; SWAT tower`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Sausage Wrap",
    fare: "Meals",
    vendor: "Kyle Field Concessions",
    vendorHint: `${sectionHint("123")}; ${sectionHint("127")}; ${sectionHint("133")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Pardon My Cheesesteak",
    fare: "Meals",
    vendor: "Pardon My Cheesesteak",
    vendorHint: sectionHint("323"),
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Johnny Rockets Burger",
    fare: "Meals",
    vendor: "Johnny Rockets",
    vendorHint: `${sectionHint("FB2", "Field Box")}; ${sectionHint("245")}; ${sectionHint("334")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Gig 'Em Grill Brisket Nachos",
    fare: "Meals",
    vendor: "Gig 'Em Grill",
    vendorHint: `${sectionHint("FB12", "Field Box")}; ${sectionHint("231")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Gig 'Em Grill Brisket Pizza",
    fare: "Meals",
    vendor: "Gig 'Em Grill",
    vendorHint: `${sectionHint("FB12", "Field Box")}; ${sectionHint("231")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Raging Bull Tacos Street Tacos",
    fare: "Meals",
    vendor: "Raging Bull Tacos",
    vendorHint: `${sectionHint("FB8", "Field Box")}; ${sectionHint("318")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Walk-On's Double Bacon Cheeseburger",
    fare: "Meals",
    vendor: "Walk-On's",
    vendorHint: `${sectionHint("130")}; All-American Club`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Walk-On's Pulled Pork Waffle Cheese Fries",
    fare: "Meals",
    vendor: "Walk-On's",
    vendorHint: `${sectionHint("130")}; All-American Club`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Anchor Bar Wings",
    fare: "Meals",
    vendor: "Anchor Bar",
    vendorHint: sectionHint("114"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Little Patagonia Empanada",
    description: "Beef, brisket, or chicken empanadas",
    fare: "Meals",
    vendor: "Little Patagonia Empanada",
    vendorHint: sectionHint("122"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Good Bull Cattle Co Smash Burger",
    fare: "Meals",
    vendor: "Good Bull Cattle Co.",
    vendorHint: sectionHint("242"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Papa John's Pizza",
    fare: "Meals",
    vendor: "Papa John's",
    vendorHint: "NE Activation Tower (NEAT)",
    tags: [...NCAA_FB]
  },
  {
    name: "Chicken Salad Chick Chicken Salad",
    fare: "Meals",
    vendor: "Chicken Salad Chick",
    vendorHint: `${sectionHint("243")}; ${sectionHint("310")}; Zone Club`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "The Cookshack Chicken Tenders",
    fare: "Meals",
    vendor: "The Cookshack",
    vendorHint: `${sectionHint("117")}; ${sectionHint("306")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Elotes Bravos Elote en Vaso",
    description: "Corn in a cup — Mexican street corn",
    fare: "Snacks",
    vendor: "Elotes Bravos",
    vendorHint: sectionHint("123"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Aggie Bites Philly Cheesesteak",
    fare: "Meals",
    vendor: "Aggie Bites",
    vendorHint: sectionHint("237"),
    tags: [...NCAA_FB]
  }
];

export async function parseKyleFieldMenu(
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
