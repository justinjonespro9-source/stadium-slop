/**
 * The Big E — venue shell; preview/core catalog per official source availability.
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairImportSource } from "../sources";
import type { FairMenuParseResult } from "../types";
import { parseTheBigECoreCatalog } from "./the-big-e-core-catalog";

const VENUE_SLUG = "the-big-e";
const VENUE_NAME = "The Big E";
const SOURCE_URL = "https://www.thebige.com/p/food2";

export async function parseTheBigEMenu(
  source: FairImportSource = "preview"
): Promise<FairMenuParseResult> {
  if (source === "core-catalog") {
    return parseTheBigECoreCatalog();
  }

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: [],
    warnings: [
      "No official item-level food list published on thebige.com as of import research.",
      "Recommendation: keep venue shell only until Big E Food Finder returns listing data.",
      "Do not import vendor names from news roundups without item names tied to an official Big E source."
    ]
  });
}
