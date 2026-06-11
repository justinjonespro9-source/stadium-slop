/**
 * Michigan Stadium (Michigan Wolverines — NCAA Football) menu parser.
 * Source: https://mgoblue.com/sports/2024/8/16/michigan-stadium-guide-concessions
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  sectionHint,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "michigan-stadium";
const VENUE_NAME = "Michigan Stadium";
const SOURCE_URL =
  "https://mgoblue.com/sports/2024/8/16/michigan-stadium-guide-concessions";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Big House Burger",
    description: "Smash burger with house-made chips from Big House Burgers",
    fare: "Meals",
    vendor: "Big House Burgers",
    vendorHint: `${sectionHint("2U")}; ${sectionHint("4L")}; ${sectionHint("8")}; ${sectionHint("30")}`,
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Big House Patty Melt",
    description: "Gluten-free patty melt at Big House Burgers",
    fare: "Meals",
    vendor: "Big House Burgers",
    vendorHint: `${sectionHint("2U")}; ${sectionHint("8")}; ${sectionHint("29")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Gridiron Cheesesteak",
    fare: "Meals",
    vendor: "Gridiron Cheesesteaks",
    vendorHint: `${sectionHint("14")}; ${sectionHint("37")}; ${sectionHint("44L")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Big C's BBQ Smoked BBQ",
    fare: "Meals",
    vendor: "Big C's BBQ",
    vendorHint: `${sectionHint("43L")}; ${sectionHint("25")}`,
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Flock Chicken Sandwich",
    fare: "Meals",
    vendor: "Flock",
    vendorHint: `${sectionHint("10")}; ${sectionHint("15")}; ${sectionHint("29")}; ${sectionHint("35")}; ${sectionHint("39L")}; ${sectionHint("43U")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Flock Chicken Tenders",
    fare: "Meals",
    vendor: "Flock",
    vendorHint: `${sectionHint("10")}; ${sectionHint("15")}; ${sectionHint("29")}; ${sectionHint("35")}; ${sectionHint("39L")}; ${sectionHint("43U")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "4th & Bowl Burrito Bowl",
    fare: "Meals",
    vendor: "4th & Bowl",
    vendorHint: sectionHint("12"),
    tags: [...NCAA_FB]
  },
  {
    name: "4th & Bowl Chicken Rice Bowl",
    description: "Gluten-free chicken rice bowl",
    fare: "Meals",
    vendor: "4th & Bowl",
    vendorHint: sectionHint("12"),
    tags: [...NCAA_FB]
  },
  {
    name: "Buddy's Detroit Style Pizza",
    fare: "Meals",
    vendor: "Buddy's Pizza",
    vendorHint: `${sectionHint("2L")}; ${sectionHint("8")}; ${sectionHint("11")}; ${sectionHint("17")}; ${sectionHint("19")}; ${sectionHint("30")}; ${sectionHint("34")}; ${sectionHint("36")}`,
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Nacho Cantina Loaded Nachos",
    fare: "Meals",
    vendor: "Nacho Cantina",
    vendorHint: `${sectionHint("20")}; ${sectionHint("35")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Detroit Wing Company Loaded Mac & Cheese",
    fare: "Meals",
    vendor: "Detroit Wing Company",
    vendorHint: sectionHint("27"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Detroit Wing Company Boneless Wings",
    fare: "Meals",
    vendor: "Detroit Wing Company",
    vendorHint: sectionHint("8"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Kerrytown Meatballs",
    description: "Sauced meatballs from Kerrytown Meatballs",
    fare: "Meals",
    vendor: "Kerrytown Meatballs",
    vendorHint: sectionHint("8"),
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Top Dog Gourmet Hot Dog",
    fare: "Meals",
    vendor: "Top Dog",
    vendorHint: `${sectionHint("1L")}; ${sectionHint("37")}`,
    tags: [...NCAA_FB]
  },
  {
    name: "Ben's Hand-Rolled Soft Pretzel",
    fare: "Snacks",
    vendor: "Ben's Pretzels",
    vendorHint: `${sectionHint("12")}; ${sectionHint("28")}`,
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Superbowl Acai Bowl",
    fare: "Meals",
    vendor: "Superbowl",
    vendorHint: sectionHint("26"),
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Founders Sausage & Sandwich",
    description: "Founders-inspired sausage sandwich (food stand, not bar-only)",
    fare: "Meals",
    vendor: "Founders Big House Brew Pub",
    vendorHint: sectionHint("4U"),
    tags: [...NCAA_FB]
  }
];

export async function parseMichiganStadiumMenu(
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
