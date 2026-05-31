/**
 * Wisconsin State Fair — official Food Finder is seasonal / not populated off-season.
 * Source inspected: https://wistatefair.com/fair/food-finder/
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult } from "../types";

const VENUE_SLUG = "wisconsin-state-fair";
const VENUE_NAME = "Wisconsin State Fair";
const SOURCE_URL = "https://wistatefair.com/fair/food-finder/";

export async function parseWisconsinStateFairCoreCatalog(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: [],
    importSource: "core-catalog",
    warnings: [
      "WiStateFair.com Food Finder page states: check back in July for the tool to be running.",
      "No item-level vendor/menu blocks in server HTML (WordPress page shell only).",
      "Use https://wistatefair.com/fair/new-foods/ preview import until the Food Finder publishes structured listings.",
      "food-beverage-vendors page is vendor marketing copy, not an item-level menu export."
    ]
  });
}
