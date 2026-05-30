import type { VenueMenuSourceItem } from "@/lib/venue-menu-import/types";
import { shouldSkipFairRawItem } from "./filter";
import type { FairMenuParseResult, FairRawMenuItem } from "./types";
import { FAIR_SOURCE_YEAR } from "./types";

const PREVIEW_TAGS = ["state-fair", "2025-preview", "prior-year-listing"] as const;

export function fairItemToSource(
  raw: FairRawMenuItem,
  sourceUrl: string
): VenueMenuSourceItem & { importTags: string[]; seasonIntroduced: string } {
  const category =
    raw.beverageCategory ??
    (raw.allowBeverage ? ("Non-Alcoholic Drink" as const) : ("Food" as const));

  return {
    name: raw.name,
    description: raw.description,
    price: raw.price,
    fare: raw.fare,
    category,
    vendorName: raw.vendor,
    vendorLocationHint: raw.location,
    dietaryTags: [],
    sourceUrl,
    importTags: [...PREVIEW_TAGS],
    seasonIntroduced: String(FAIR_SOURCE_YEAR)
  };
}

export function buildFairMenuParseResult(args: {
  venueSlug: string;
  venueName: string;
  sourceUrl: string;
  items: FairRawMenuItem[];
  warnings?: string[];
}): FairMenuParseResult {
  const warnings = [...(args.warnings ?? [])];
  const skippedItems: { name: string; reason: string }[] = [];
  const parsed: VenueMenuSourceItem[] = [];
  let skippedDrinks = 0;

  for (const raw of args.items) {
    const skip = shouldSkipFairRawItem(raw);
    if (skip) {
      skippedItems.push({ name: raw.name, reason: skip });
      if (skip.toLowerCase().includes("beverage")) {
        skippedDrinks++;
      }
      continue;
    }
    parsed.push(fairItemToSource(raw, args.sourceUrl));
  }

  return {
    venueSlug: args.venueSlug,
    venueName: args.venueName,
    sourceUrl: args.sourceUrl,
    parsedAt: new Date().toISOString(),
    items: parsed,
    skippedDrinks,
    sourceYear: FAIR_SOURCE_YEAR,
    warnings,
    skippedItems
  };
}
