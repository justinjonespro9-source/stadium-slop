/**
 * The Big E — venue shell only.
 * Official site (https://www.thebige.com/p/food2) lists no item-level 2026 menu yet.
 * Do not fabricate food rows from third-party eater guides.
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult } from "../types";

const VENUE_SLUG = "the-big-e";
const VENUE_NAME = "The Big E";
const SOURCE_URL = "https://www.thebige.com/p/food2";

export async function parseTheBigEMenu(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: [],
    warnings: [
      "No official item-level food list published on thebige.com as of import research.",
      "Recommendation: keep venue shell only until Big E posts a fair food/vendor finder or numbered new-foods release.",
      "Do not import vendor names from news roundups without item names tied to an official Big E source."
    ]
  });
}
