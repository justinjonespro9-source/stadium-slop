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
  },
  {
    name: "Happy Valley Burger",
    description: "Fresh-ground burger with American cheese and pub sauce",
    fare: "Meals",
    vendor: "Happy Valley Burger & Beer Garden",
    vendorHint: "Gate F",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Touchdown Chicken Sandwich",
    description: "Breaded chicken breast with pickle chips and pub sauce",
    fare: "Meals",
    vendor: "Snack Zone",
    vendorHint: "Near section SD",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Old Main Hot Dog",
    fare: "Meals",
    vendor: "Lion Bites",
    vendorHint: "Gate F patio",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Blitz Brat",
    fare: "Meals",
    vendor: "Lion Bites",
    vendorHint: "Outer ring concessions",
    tags: [...NCAA_FB]
  },
  {
    name: "State Nachos",
    fare: "Meals",
    vendor: "Lion Bites",
    vendorHint: "Gate F",
    tags: [...NCAA_FB]
  },
  {
    name: "Berkey Creamery Ice Cream",
    description: "Penn State creamery pint — grilled stickie and death by chocolate flavors",
    fare: "Desserts",
    vendor: "Berkey Creamery",
    vendorHint: "Near section WC",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Caliente Cheese Pizza Slice",
    fare: "Meals",
    vendor: "Caliente Pizza",
    vendorHint: "Near sections EC & ED",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Street Tacos",
    description: "Pulled chicken or pork carnitas with fire-roasted salsa",
    fare: "Meals",
    vendor: "el Leon Tacos",
    vendorHint: "Gate F kiosk",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Doan's Bones BBQ Sandwich",
    fare: "Meals",
    vendor: "Doan's Bones",
    vendorHint: "Outer ring below stadium",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Scott's Roasting Pulled Pork",
    fare: "Meals",
    vendor: "Scott's Roasting",
    vendorHint: "Outer ring concessions",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Coaly's Chicken Tenders",
    fare: "Meals",
    vendor: "Coaly's Chicken",
    vendorHint: "Gate F grab-and-go",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Stadium Cheesesteak",
    fare: "Meals",
    vendor: "Lion Bites",
    vendorHint: "Outer ring concessions",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Chickie & Pete's Chicken Sandwich",
    fare: "Meals",
    vendor: "Chickie & Pete's",
    vendorHint: "Near sections EJ & NL",
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
