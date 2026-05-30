/**
 * The Big E — venue shell only until official 2025 item-level sources are curated.
 * TODO: Import from https://www.thebige.com/food/ when a stable public item list is available.
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult } from "../types";

const VENUE_SLUG = "the-big-e";
const VENUE_NAME = "The Big E";
const SOURCE_URL = "https://www.thebige.com/fair-info/food/";

export async function parseTheBigEMenu(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: [],
    warnings: [
      "TODO: No curated 2025 item-level import yet — venue shell only. Add official Big E new food rows when published."
    ]
  });
}
