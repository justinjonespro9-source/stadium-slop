/**
 * The Big E — official Food Finder (businesses) is JS-rendered via Saffire ASMX.
 * Source inspected: https://www.thebige.com/businesses
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult } from "../types";

const VENUE_SLUG = "the-big-e";
const VENUE_NAME = "The Big E";
const SOURCE_URL = "https://www.thebige.com/businesses";

export async function parseTheBigECoreCatalog(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: [],
    importSource: "core-catalog",
    warnings: [
      "Official Food Finder at thebige.com/businesses loads vendor listings via JavaScript (businessesservice.asmx).",
      "Server HTML has an empty #eventScheduleContent shell; ASMX GetBusinessBusinessListingCategoryIndex returned no rows at inspection time.",
      "Do not fabricate items from third-party guides — wait for published listing data or a stable official export.",
      "Recommendation: keep venue shell only until Big E posts parseable item-level data."
    ]
  });
}
