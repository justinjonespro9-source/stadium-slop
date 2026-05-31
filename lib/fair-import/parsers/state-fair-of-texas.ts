/**
 * State Fair of Texas — 2025 new foods (preview listing).
 * Sources:
 *   https://bigtex.com/new-foods-announced-for-2025-state-fair-of-texas/
 *   https://bigtex.com/winners-of-the-2025-big-tex-choice-awards-announced/
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairImportSource } from "../sources";
import type { FairMenuParseResult } from "../types";
import { parseStateFairOfTexasCoreCatalog } from "./state-fair-of-texas-core-catalog";
import { TEXAS_2025_PREVIEW_ITEMS } from "./state-fair-of-texas-preview-data";

const VENUE_SLUG = "state-fair-of-texas";
const VENUE_NAME = "State Fair of Texas";
const SOURCE_URL =
  "https://bigtex.com/new-foods-announced-for-2025-state-fair-of-texas/";

export { TEXAS_2025_PREVIEW_ITEMS } from "./state-fair-of-texas-preview-data";

export async function parseStateFairOfTexasMenu(
  source: FairImportSource = "preview"
): Promise<FairMenuParseResult> {
  if (source === "core-catalog") {
    return parseStateFairOfTexasCoreCatalog();
  }

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: TEXAS_2025_PREVIEW_ITEMS,
    importSource: "preview",
    warnings: [
      "Vendor names and locations from BigTex.com 2025 new foods announcement.",
      "Use BigTex.com/NewFoods map for exact stand pins before visiting."
    ]
  });
}
