import type { FoodItem, Vendor } from "@/lib/sample-data";

/** Haystack for substring search within a venue standings row. */
export function venueItemSearchHaystack(item: FoodItem, vendor?: Vendor): string {
  const sectionBits = item.sections?.length
    ? item.sections.join(" ")
    : "";
  const parts = [
    item.name,
    item.slug.replace(/-/g, " "),
    item.category,
    item.itemType,
    ...item.tags,
    item.location,
    sectionBits,
    vendor?.name ?? "",
    vendor?.slug?.replace(/-/g, " ") ?? "",
    vendor?.section ?? "",
    vendor?.location ?? ""
  ];
  return parts.join(" ").toLowerCase();
}

export function itemMatchesVenueSearch(
  item: FoodItem,
  vendor: Vendor | undefined,
  rawQuery: string
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return venueItemSearchHaystack(item, vendor).includes(q);
}
