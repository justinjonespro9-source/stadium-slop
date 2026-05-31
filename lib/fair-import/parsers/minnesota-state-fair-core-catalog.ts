/**
 * Minnesota State Fair — core catalog from official kickoff vendor menus.
 * Source: https://www.mnstatefair.org/kickoff-to-summer/vendors/
 * Complements the 2025 new-food preview import; dedupes overlapping item names.
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import {
  filterMinnesotaKickoffQuality,
  formatMinnesotaQualityWarnings
} from "../minnesota-kickoff-quality";
import { fetchKickoffVendorCatalog } from "../parse-kickoff-vendors";
import type { FairMenuParseResult, FairRawMenuItem } from "../types";
import { normalizeMenuItemName } from "@/lib/venue-menu-import/normalize";

import { MINNESOTA_2025_PREVIEW_ITEMS } from "./minnesota-state-fair-preview-data";

const VENUE_SLUG = "minnesota-state-fair";
const VENUE_NAME = "Minnesota State Fair";

const PREVIEW_NAME_KEYS = new Set(
  MINNESOTA_2025_PREVIEW_ITEMS.map((item) => normalizeMenuItemName(item.name))
);

function dedupePreviewOverlaps(
  items: FairRawMenuItem[],
  skipped: { name: string; reason: string }[]
): FairRawMenuItem[] {
  const seen = new Set<string>();
  const kept: FairRawMenuItem[] = [];

  for (const item of items) {
    const norm = normalizeMenuItemName(item.name);
    if (PREVIEW_NAME_KEYS.has(norm)) {
      skipped.push({
        name: item.name,
        reason: "Already in 2025 new-food preview import"
      });
      continue;
    }
    const vendorNorm = normalizeMenuItemName(item.vendor);
    const batchKey = `${vendorNorm}::${norm}`;
    if (seen.has(batchKey)) {
      skipped.push({
        name: item.name,
        reason: "Duplicate within core catalog batch (same vendor)"
      });
      continue;
    }
    seen.add(batchKey);
    kept.push(item);
  }

  return kept;
}

export async function parseMinnesotaStateFairCoreCatalog(): Promise<FairMenuParseResult> {
  const kickoff = await fetchKickoffVendorCatalog();
  const quality = filterMinnesotaKickoffQuality(kickoff.items);

  const skippedItems = [
    ...kickoff.skippedItems,
    ...quality.skippedItems,
    ...kickoff.ambiguousItems.map((a) => ({
      name: a.name,
      reason: `Ambiguous: ${a.reason}`
    })),
    ...quality.ambiguousItems.map((a) => ({
      name: a.name,
      reason: `Ambiguous: ${a.reason}`
    }))
  ];

  const items = dedupePreviewOverlaps(quality.items, skippedItems);

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: kickoff.sourceUrl,
    items,
    importSource: "core-catalog",
    warnings: [
      `Core catalog parsed from official kickoff vendor page (${kickoff.vendorCount} vendors).`,
      "Full Fair Finder menus publish closer to fair season — verify stands on mnstatefair.org/fair-finder/food.",
      `${PREVIEW_NAME_KEYS.size} preview items preserved — overlaps excluded from core catalog.`,
      ...formatMinnesotaQualityWarnings(quality.stats)
    ],
    skippedItems
  });
}
