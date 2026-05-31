/**
 * State Fair of Texas — core catalog from official 2025 new foods announcement.
 * Source: https://bigtex.com/new-foods-announced-for-2025-state-fair-of-texas/
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import { fetchTexasNewFoodsCatalog } from "../parse-texas-new-foods";
import type { FairMenuParseResult, FairRawMenuItem } from "../types";
import { normalizeMenuItemName } from "@/lib/venue-menu-import/normalize";

import { TEXAS_2025_PREVIEW_ITEMS } from "./state-fair-of-texas-preview-data";

const VENUE_SLUG = "state-fair-of-texas";
const VENUE_NAME = "State Fair of Texas";

const PREVIEW_NAME_KEYS = new Set(
  TEXAS_2025_PREVIEW_ITEMS.map((item) => normalizeMenuItemName(item.name))
);

function normalizeTexasName(name: string): string {
  return normalizeMenuItemName(name.replace(/\*+$/, "").trim());
}

function dedupePreviewOverlaps(
  items: FairRawMenuItem[],
  skipped: { name: string; reason: string }[]
): FairRawMenuItem[] {
  const kept: FairRawMenuItem[] = [];
  for (const item of items) {
    if (PREVIEW_NAME_KEYS.has(normalizeTexasName(item.name))) {
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

export async function parseStateFairOfTexasCoreCatalog(): Promise<FairMenuParseResult> {
  const catalog = await fetchTexasNewFoodsCatalog();
  const skippedItems = [...catalog.skippedItems];
  const items = dedupePreviewOverlaps(catalog.items, skippedItems);

  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: catalog.sourceUrl,
    items,
    importSource: "core-catalog",
    skippedItems,
    warnings: [
      `Core catalog parsed from official BigTex.com 2025 new foods article (${catalog.items.length} items in source).`,
      "plan-your-visit/food/ and Big Tex Choice Awards pages blocked automated fetch (Cloudflare) — not merged.",
      `${PREVIEW_NAME_KEYS.size} preview items preserved — overlaps excluded from core catalog.`,
      `${items.length} net-new items after preview dedupe.`,
      "Descriptions shortened to neutral one-line summaries — not copied verbatim from marketing copy."
    ]
  });
}
