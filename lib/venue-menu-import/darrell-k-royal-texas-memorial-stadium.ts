/**
 * Darrell K Royal-Texas Memorial Stadium (Texas Longhorns — NCAA Football) menu parser.
 * Sources:
 *   https://texaslonghorns.com/sports/2025/8/22/football-gameday-concessions
 *   https://1883provisionco.sodexomyway.com/en-us/concessions/dkr-texas-memorial-stadium
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  sectionHint,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "darrell-k-royal-texas-memorial-stadium";
const VENUE_NAME = "Darrell K Royal-Texas Memorial Stadium";
const SOURCE_URL =
  "https://texaslonghorns.com/sports/2025/8/22/football-gameday-concessions";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Antone's PoBoy Sandwich",
    fare: "Meals",
    vendor: "Antone's PoBoy Sandwiches",
    vendorHint: `${sectionHint("5", "Level 1")}; ${sectionHint("32", "Level 1")}`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Rudy's Texas Bar-B-Q",
    description: "Texas BBQ from Rudy's at multiple concourse levels",
    fare: "Meals",
    vendor: "Rudy's Texas Bar-B-Q",
    vendorHint: `${sectionHint("3", "Level 1")}; ${sectionHint("14", "Level 1")}; ${sectionHint("6", "Level 3")}`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Stubb's Bar-B-Q Sandwich",
    fare: "Meals",
    vendor: "Stubb's Bar-B-Q",
    vendorHint: `${sectionHint("30", "Level 1")}; ${sectionHint("19", "Level 6")}; ${sectionHint("103", "Level 11")}`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Mighty Fine Burger",
    fare: "Meals",
    vendor: "Mighty Fine Burgers",
    vendorHint: sectionHint("13", "Level 1"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Royal Burger",
    fare: "Meals",
    vendor: "Royal Burger",
    vendorHint: `${sectionHint("2", "Level 3")}; ${sectionHint("128", "Level 10")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Pardon My Cheesesteak",
    fare: "Meals",
    vendor: "Pardon My Cheesesteak",
    vendorHint: sectionHint("14", "Level 1"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Fletcher's Original Corny Dog",
    fare: "Meals",
    vendor: "Fletcher's Original Corney Dogs",
    vendorHint: sectionHint("19", "Level 1"),
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Pluckers Wings",
    fare: "Meals",
    vendor: "Pluckers",
    vendorHint: sectionHint("29", "Level 1"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "TONY C Pizza",
    fare: "Meals",
    vendor: "TONY C Pizza",
    vendorHint: `${sectionHint("7", "Level 1")}; ${sectionHint("30", "Level 1")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Gridiron Turkey Leg",
    description: "New 2025 item at Gridiron stadium favorites stands",
    fare: "Meals",
    vendor: "Gridiron - Stadium Favorites",
    vendorHint: `${sectionHint("4", "Level 3")}; ${sectionHint("15", "Level 6")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Gridiron Mac and Cheese Bowl",
    description: "New 2025 mac & cheese bowl",
    fare: "Meals",
    vendor: "Gridiron - Stadium Favorites",
    vendorHint: `${sectionHint("3", "Level 1")}; ${sectionHint("113", "Level 10")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: `${sectionHint("30", "Level 1")}; ${sectionHint("115", "Level 10")}; ${sectionHint("130", "Level 10")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Smokey's Grill Burger",
    fare: "Meals",
    vendor: "Smokey's Grill",
    vendorHint: sectionHint("6", "Level 1"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Amy's Ice Cream",
    fare: "Desserts",
    vendor: "Amy's Ice Cream",
    vendorHint: `${sectionHint("15", "Level 1")}; ${sectionHint("111", "Level 10")}`,
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor"]
  }
];

export async function parseDarrellKRoyalTexasMemorialStadiumMenu(
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
