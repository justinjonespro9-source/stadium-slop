import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuSourceItem
} from "./types";

export type NcaaFootballRawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

export function sectionHint(section: string, note?: string): string {
  return note ? `Section ${section} · ${note}` : `Section ${section}`;
}

export function mergeVendorHints(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b || a.includes(b)) return a;
  if (b.includes(a)) return b;
  return `${a}; ${b}`;
}

export function dedupeMenuItems(rawItems: NcaaFootballRawItem[]): NcaaFootballRawItem[] {
  const byName = new Map<string, NcaaFootballRawItem>();
  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...item });
      continue;
    }
    byName.set(key, {
      ...existing,
      vendorHint: mergeVendorHints(existing.vendorHint, item.vendorHint),
      vendor: existing.vendor ?? item.vendor,
      description: existing.description ?? item.description,
      tags: [...new Set([...(existing.tags ?? []), ...(item.tags ?? [])])]
    });
  }
  return [...byName.values()];
}

export function toSourceItem(
  raw: NcaaFootballRawItem,
  sourceUrl: string
): VenueMenuSourceItem {
  return {
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food",
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl,
    importTags: raw.tags
  };
}

export const NCAA_FB = ["ncaa", "college-football"] as const;
