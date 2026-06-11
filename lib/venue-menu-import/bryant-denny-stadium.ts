/**
 * Bryant-Denny Stadium (Alabama Crimson Tide — NCAA Football) menu parser.
 * Sources: https://rolltide.com/sports/2020/8/18/concessions
 */

import type { VenueMenuParseResult } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

const VENUE_SLUG = "bryant-denny-stadium";
const VENUE_NAME = "Bryant-Denny Stadium";
const SOURCE_URL = "https://rolltide.com/sports/2020/8/18/concessions";

const MENU_DATA: NcaaFootballRawItem[] = [
  {
    name: "Dreamland BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Dreamland BBQ",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Dreamland BBQ Nachos",
    description: "Dreamland BBQ nachos — also listed as gluten-free option",
    fare: "Meals",
    vendor: "Dreamland BBQ",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Denny Dog",
    description: "Signature Alabama stadium hot dog",
    fare: "Meals",
    vendor: "Alabama Concessions",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Crimson Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Crimson Fried",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Crimson Fried Chicken Fingers",
    fare: "Meals",
    vendor: "Crimson Fried",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Ezell's Catfish Po'boy",
    fare: "Meals",
    vendor: "Ezell's Fish Camp",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Ezell's Shrimp Po'boy",
    fare: "Meals",
    vendor: "Ezell's Fish Camp",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Chubbfathers Specialty Cheeseburger",
    fare: "Meals",
    vendor: "Chubbfathers",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Bear's Den Cheeseburger",
    fare: "Meals",
    vendor: "The Bear's Den",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB]
  },
  {
    name: "Bear's Den Cheesy Nachos",
    fare: "Meals",
    vendor: "The Bear's Den",
    vendorHint: "Main concourse",
    tags: [...NCAA_FB]
  },
  {
    name: "Dreamland Smoked Sausage",
    fare: "Meals",
    vendor: "Dreamland BBQ",
    tags: [...NCAA_FB, "local-vendor"]
  }
];

export async function parseBryantDennyStadiumMenu(
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
