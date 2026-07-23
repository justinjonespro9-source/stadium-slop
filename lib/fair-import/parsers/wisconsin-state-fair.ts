/**
 * Wisconsin State Fair — 2026 new foods (official new-foods list + PDF).
 * Sources:
 *   https://wistatefair.com/fair/new-foods/
 *   https://wistatefair.com/fair/wp-content/uploads/2026/07/2026_New_Foods_List_FINAL_V5.pdf
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairImportSource } from "../sources";
import type { FairMenuParseResult } from "../types";
import { parseWisconsinStateFairCoreCatalog } from "./wisconsin-state-fair-core-catalog";
import { WISCONSIN_2026_NEW_FOODS } from "./wisconsin-state-fair-2026-new-foods";

const VENUE_SLUG = "wisconsin-state-fair";
const VENUE_NAME = "Wisconsin State Fair";
const SOURCE_URL = "https://wistatefair.com/fair/new-foods/";

export { WISCONSIN_2026_NEW_FOODS } from "./wisconsin-state-fair-2026-new-foods";

export async function parseWisconsinStateFairMenu(
  source: FairImportSource = "preview"
): Promise<FairMenuParseResult> {
  if (source === "core-catalog") {
    return parseWisconsinStateFairCoreCatalog();
  }

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: WISCONSIN_2026_NEW_FOODS.map((item) => ({
      ...item,
      seasonIntroduced: item.seasonIntroduced ?? "2026"
    })),
    importSource: "preview",
    sourceYear: 2026,
    warnings: [
      "2026 new foods from WiStateFair.com new-foods page and 2026 New Foods PDF.",
      "Booth locations from the official printable new-foods PDF when listed.",
      "Sporkies/Drinkies finalist tags from official finalist announcements mirrored on the Food Finder taxonomy.",
      "Descriptions are original Stadium Slop paraphrases — not official promotional copy.",
      "Stadium Slop is an independent guide and is not affiliated with or endorsed by the Wisconsin State Fair."
    ]
  });
}
