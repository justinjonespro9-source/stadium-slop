/**
 * Minnesota State Fair — 2025 new foods (preview listing).
 * Primary source: https://www.mnstatefair.org/about/media/new/food/
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairImportSource } from "../sources";
import type { FairMenuParseResult } from "../types";
import { MINNESOTA_2025_PREVIEW_ITEMS } from "./minnesota-state-fair-preview-data";
import { parseMinnesotaStateFairCoreCatalog } from "./minnesota-state-fair-core-catalog";

const VENUE_SLUG = "minnesota-state-fair";
const VENUE_NAME = "Minnesota State Fair";
const SOURCE_URL = "https://www.mnstatefair.org/about/media/new/food/";

export { MINNESOTA_2025_PREVIEW_ITEMS } from "./minnesota-state-fair-preview-data";

export async function parseMinnesotaStateFairMenu(
  source: FairImportSource = "preview"
): Promise<FairMenuParseResult> {
  if (source === "core-catalog") {
    return parseMinnesotaStateFairCoreCatalog();
  }

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: MINNESOTA_2025_PREVIEW_ITEMS,
    importSource: "preview",
    warnings: [
      "2025 preview listing — verify current vendors, prices, and locations on official fair sources before game day."
    ]
  });
}
