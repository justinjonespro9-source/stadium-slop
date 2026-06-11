/**
 * Beaver Stadium (Penn State Nittany Lions — NCAA Football) menu parser.
 * Source: https://gopsusports.com/beaver-stadium-a-z-guide
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "beaver-stadium";
const VENUE_NAME = "Beaver Stadium";
const SOURCE_URL = "https://gopsusports.com/beaver-stadium-a-z-guide";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Caliente Pizza",
    fare: "Meals",
    vendor: "Caliente Pizza",
    vendorHint: "Near sections EC & ED",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Chickie & Pete's Crab Fries",
    description: "Philly-area signature crab fries at Beaver Stadium",
    fare: "Snacks",
    vendor: "Chickie & Pete's",
    vendorHint: "Near sections EJ & NL",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Panini's Sandwich",
    fare: "Meals",
    vendor: "Panini's",
    vendorHint: "Near section EJ",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Philly Pretzel Factory Pretzel",
    description: "Distinctive hand-twisted pretzel above Gate B",
    fare: "Snacks",
    vendor: "Philly Pretzel Factory",
    vendorHint: "Above Gate B",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Wing Kitchen Wings",
    fare: "Meals",
    vendor: "Wing Kitchen",
    vendorHint: "Near sections WF & WG",
    tags: [...NCAA_FB]
  },
  {
    name: "We Are Inn Sandwich",
    description: "Local Penn State-area concept near section NC",
    fare: "Meals",
    vendor: "We Are Inn",
    vendorHint: "Near section NC",
    tags: [...NCAA_FB, "local-vendor"]
  }
];

export async function parseBeaverStadiumMenu(
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
