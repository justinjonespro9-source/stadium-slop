import type { VenueMenuSourceItem } from "@/lib/venue-menu-import/types";
import { fairImportTagsForSource, type FairImportSource } from "./sources";
import { shouldSkipFairRawItem } from "./filter";
import type { FairMenuParseResult, FairRawMenuItem } from "./types";
import { FAIR_SOURCE_YEAR } from "./types";

export function fairItemToSource(
  raw: FairRawMenuItem,
  sourceUrl: string,
  importTags: string[]
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
    dietaryTags: raw.dietaryTags ?? [],
    sourceUrl,
    importTags: [...importTags],
    seasonIntroduced: String(FAIR_SOURCE_YEAR)
  };
}

export function buildFairMenuParseResult(args: {
  venueSlug: string;
  venueName: string;
  sourceUrl: string;
  items: FairRawMenuItem[];
  warnings?: string[];
  importSource?: FairImportSource;
  skippedItems?: { name: string; reason: string }[];
}): FairMenuParseResult {
  const importSource = args.importSource ?? "preview";
  const importTags = fairImportTagsForSource(importSource, args.venueSlug);
  const warnings = [...(args.warnings ?? [])];
  const skippedItems: { name: string; reason: string }[] = [...(args.skippedItems ?? [])];
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
    parsed.push(fairItemToSource(raw, args.sourceUrl, importTags));
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
