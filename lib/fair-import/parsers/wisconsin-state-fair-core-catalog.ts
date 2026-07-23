/**
 * Wisconsin State Fair — verified returning / classic Food Finder items (2026).
 * Source: https://wistatefair.com/fair/food-finder/
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult } from "../types";
import { WISCONSIN_2026_CORE_CATALOG } from "./wisconsin-state-fair-core-catalog-data";

const VENUE_SLUG = "wisconsin-state-fair";
const VENUE_NAME = "Wisconsin State Fair";
const SOURCE_URL = "https://wistatefair.com/fair/food-finder/";

export async function parseWisconsinStateFairCoreCatalog(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: WISCONSIN_2026_CORE_CATALOG.map((item) => ({
      ...item,
      seasonIntroduced: item.seasonIntroduced ?? "2026"
    })),
    importSource: "core-catalog",
    sourceYear: 2026,
    warnings: [
      "Core catalog curated from the official 2026 Food Finder (WordPress food listings).",
      "Includes State Fair favorites, Wisconsin staples, and returning past Sporkies/Drinkies items with verified vendors.",
      "Multi-vendor staples list a primary vendor; availability may vary by stand.",
      "Items marked NOT RETURNING 2026 on the Food Finder were excluded.",
      "Pork 'N' Pine Brat Burger is seeded via the 2026 new-foods import (official PDF + Food Finder), not this core catalog."
    ]
  });
}
