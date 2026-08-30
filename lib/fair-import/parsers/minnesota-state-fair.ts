/**
 * Minnesota State Fair — 2026 new foods (default preview) plus 2025 archives.
 * Primary 2026 source: https://www.mnstatefair.org/new/food
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairImportSource } from "../sources";
import type { FairMenuParseResult } from "../types";
import { MINNESOTA_2025_PREVIEW_ITEMS } from "./minnesota-state-fair-preview-data";
import { MINNESOTA_2026_NEW_FOODS } from "./minnesota-state-fair-2026-new-foods";
import { parseMinnesotaStateFairCoreCatalog } from "./minnesota-state-fair-core-catalog";
import { parseMinnesotaStateFairFairFinder2026 } from "./minnesota-state-fair-fair-finder-2026";
import { parseMinnesotaStateFairMspMag2025 } from "./minnesota-state-fair-mspmag-2025";

const VENUE_SLUG = "minnesota-state-fair";
const VENUE_NAME = "Minnesota State Fair";
const SOURCE_URL_2026 = "https://www.mnstatefair.org/new/food";
const SOURCE_URL_2025 = "https://www.mnstatefair.org/about/media/new/food/";

export { MINNESOTA_2025_PREVIEW_ITEMS } from "./minnesota-state-fair-preview-data";
export { MINNESOTA_2026_NEW_FOODS } from "./minnesota-state-fair-2026-new-foods";

export async function parseMinnesotaStateFairMenu(
  source: FairImportSource = "preview"
): Promise<FairMenuParseResult> {
  if (source === "core-catalog") {
    return parseMinnesotaStateFairCoreCatalog();
  }

  if (source === "mspmag-2025") {
    return parseMinnesotaStateFairMspMag2025();
  }

  if (source === "fair-finder-2026") {
    return parseMinnesotaStateFairFairFinder2026();
  }

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL_2026,
    items: MINNESOTA_2026_NEW_FOODS.map((item) => ({
      ...item,
      seasonIntroduced: item.seasonIntroduced ?? "2026"
    })),
    importSource: "preview",
    sourceYear: 2026,
    warnings: [
      "2026 official new foods and new-vendor signatures from mnstatefair.org/new/food and public 2026 announcements.",
      "Returning catalog items from prior imports are left in place — this preview adds 2026 items only.",
      "Fountain sodas and bottled water are omitted. Verify stands and limited-run dates on official fair sources.",
      "Stadium Slop is an independent guide and is not affiliated with or endorsed by the Minnesota State Fair."
    ]
  });
}

/** Archived 2025 new-food preview (not the default import). */
export async function parseMinnesotaStateFair2025Preview(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL_2025,
    items: MINNESOTA_2025_PREVIEW_ITEMS,
    importSource: "preview",
    sourceYear: 2025,
    warnings: [
      "2025 preview listing kept for archive/reference — 2026 new foods are the default preview import."
    ]
  });
}
