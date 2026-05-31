/**
 * Iowa State Fair — core catalog from official Product & Food Finder.
 * Source: https://www.iowastatefair.org/visit/product-food-finder
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import {
  filterIowaFoodFinderQuality,
  formatIowaQualityWarnings
} from "../iowa-food-finder-quality";
import { fetchIowaFoodFinderCatalog } from "../parse-iowa-food-finder";
import type { FairMenuParseResult, FairRawMenuItem } from "../types";
import {
  iowaVendorItemDedupeKey,
  normalizeIowaFoodDedupeKey,
  resolveIowaFoodCanonicalName
} from "../iowa-food-name-normalize";
import { normalizeMenuItemName } from "@/lib/venue-menu-import/normalize";

import { IOWA_2025_PREVIEW_ITEMS as PREVIEW_ITEMS } from "./iowa-state-fair-preview-data";

const VENUE_SLUG = "iowa-state-fair";
const VENUE_NAME = "Iowa State Fair";

const PREVIEW_NAME_KEYS = new Set(
  PREVIEW_ITEMS.flatMap((item) => [
    normalizeMenuItemName(item.name),
    normalizeIowaFoodDedupeKey(item.name)
  ])
);

function dedupeNormalizedCatalogItems(
  items: FairRawMenuItem[],
  skipped: { name: string; reason: string }[]
): FairRawMenuItem[] {
  const seen = new Set<string>();
  const kept: FairRawMenuItem[] = [];
  for (const raw of items) {
    const name = resolveIowaFoodCanonicalName(raw.name);
    const vendor = raw.vendor ?? "";
    const key = iowaVendorItemDedupeKey(vendor, name);
    if (seen.has(key)) {
      skipped.push({
        name,
        reason: "Duplicate after Iowa name normalization"
      });
      continue;
    }
    seen.add(key);
    kept.push({ ...raw, name });
  }
  return kept;
}

function dedupePreviewOverlaps(
  items: FairRawMenuItem[],
  skipped: { name: string; reason: string }[]
): FairRawMenuItem[] {
  const kept: FairRawMenuItem[] = [];
  for (const item of items) {
    const normName = normalizeMenuItemName(item.name);
    const iowaNorm = normalizeIowaFoodDedupeKey(item.name);
    if (PREVIEW_NAME_KEYS.has(normName) || PREVIEW_NAME_KEYS.has(iowaNorm)) {
      skipped.push({
        name: item.name,
        reason: "Already in 2025 new-food preview import"
      });
      continue;
    }
    kept.push(item);
  }
  return kept;
}

export async function parseIowaStateFairCoreCatalog(): Promise<FairMenuParseResult> {
  const catalog = await fetchIowaFoodFinderCatalog();
  const skippedItems = [...catalog.skippedItems];

  const afterPreview = dedupePreviewOverlaps(catalog.items, skippedItems);
  const quality = filterIowaFoodFinderQuality(afterPreview);

  skippedItems.push(
    ...quality.skippedItems,
    ...quality.ambiguousItems.map((a) => ({
      name: a.name,
      reason: `Ambiguous: ${a.reason}`
    }))
  );

  const afterNormalize = dedupeNormalizedCatalogItems(quality.items, skippedItems);
  const items = afterNormalize;

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: catalog.sourceUrl,
    items,
    importSource: "core-catalog",
    skippedItems,
    warnings: [
      `Core catalog parsed from official Product & Food Finder (${catalog.vendorCount} vendor blocks, broad catalog query).`,
      "Empty finder homepage requires a search query — import uses server-rendered full-catalog results.",
      `${PREVIEW_NAME_KEYS.size} preview items preserved — overlaps excluded from core catalog.`,
      `${catalog.items.length} items after fetch filter; ${afterPreview.length} after preview dedupe; ${quality.items.length} after quality pass; ${items.length} after name normalization dedupe.`,
      ...formatIowaQualityWarnings(quality.stats)
    ]
  });
}
