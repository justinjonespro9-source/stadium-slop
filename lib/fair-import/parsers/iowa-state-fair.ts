/**
 * Iowa State Fair — 2025 new foods (preview listing).
 * Source: https://www.iowastatefair.org/food/whats-new
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairImportSource } from "../sources";
import type { FairMenuParseResult } from "../types";
import { parseIowaStateFairCoreCatalog } from "./iowa-state-fair-core-catalog";
import { IOWA_2025_PREVIEW_ITEMS } from "./iowa-state-fair-preview-data";

const VENUE_SLUG = "iowa-state-fair";
const VENUE_NAME = "Iowa State Fair";
const SOURCE_URL = "https://www.iowastatefair.org/food/whats-new";

export { IOWA_2025_PREVIEW_ITEMS } from "./iowa-state-fair-preview-data";

export async function parseIowaStateFairMenu(
  source: FairImportSource = "preview"
): Promise<FairMenuParseResult> {
  if (source === "core-catalog") {
    return parseIowaStateFairCoreCatalog();
  }

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: IOWA_2025_PREVIEW_ITEMS,
    importSource: "preview",
    warnings: [
      "Skipped generic drink menu rows from the official list; specialty 2025 drink winners included.",
      "High Roller Roll retained as a priced specialty item — verify availability."
    ]
  });
}
