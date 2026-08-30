/**
 * Minnesota State Fair — Fair Finder + official Specialty Sips expansion (2026).
 * Complements existing catalog items; name-matched duplicates are skipped at apply time.
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult } from "../types";
import { MINNESOTA_FAIR_FINDER_2026_EXPANSION } from "./minnesota-state-fair-fair-finder-2026-data";

const VENUE_SLUG = "minnesota-state-fair";
const VENUE_NAME = "Minnesota State Fair";
const SOURCE_URL = "https://www.mnstatefair.org/fair-finder/food";

export async function parseMinnesotaStateFairFairFinder2026(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: MINNESOTA_FAIR_FINDER_2026_EXPANSION,
    importSource: "fair-finder-2026",
    sourceYear: 2026,
    warnings: [
      "Curated Fair Finder + official Specialty Sips expansion. Existing catalog items are not replaced.",
      "new-2026 is applied only to official new Specialty Sips; returning sips are untagged for the New for 2026 filter.",
      "All You Can Drink Milk is included as an iconic Fair-institution exception to the generic dairy exclusion.",
      "Descriptions are original Stadium Slop paraphrases — not official promotional copy.",
      "Stadium Slop is an independent guide and is not affiliated with or endorsed by the Minnesota State Fair."
    ]
  });
}
