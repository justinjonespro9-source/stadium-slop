/**
 * Skip alcohol, generic beverages, and low-value snack rows during NCAA import.
 */

import { ItemType } from "@prisma/client";
import { inferItemTypeFromImport } from "./item-type-classification";
import type { NcaaItemImportRow } from "./ncaa-import-shape";

const GENERIC_SNACK_PATTERN =
  /\b(peanuts?|cotton candy|chips?|soda|popcorn|bottled water|water bottle|gatorade|powerade|coffee|latte|espresso)\b/i;

const ALCOHOL_CATEGORY_PATTERN =
  /\b(beer|wine|cocktail|liquor|spirit|seltzer|drinks\/social|alcohol)\b/i;

export type NcaaSkipReason =
  | "missing-item-name"
  | "alcohol"
  | "generic-beverage"
  | "generic-snack"
  | "vendor-stub-only";

export function ncaaSkipReasonForItem(row: NcaaItemImportRow): NcaaSkipReason | null {
  const name = row.item_name?.trim() ?? "";
  if (!name) {
    return "missing-item-name";
  }

  const category = row.category?.trim() ?? "";
  if (ALCOHOL_CATEGORY_PATTERN.test(category)) {
    return "alcohol";
  }

  const itemType = inferItemTypeFromImport(category, name);
  if (itemType === ItemType.ALCOHOLIC_DRINK || itemType === ItemType.NON_ALCOHOLIC_DRINK) {
    if (/\b(beer|wine|cocktail|liquor|seltzer|ipa|lager|stout|whiskey|bourbon|margarita)\b/i.test(name)) {
      return "alcohol";
    }
    return "generic-beverage";
  }

  if (GENERIC_SNACK_PATTERN.test(name) && !/\b(helmet|loaded|bbq|signature|stuffed)\b/i.test(name)) {
    return "generic-snack";
  }

  const vendor = row.vendor?.trim().toLowerCase() ?? "";
  if (vendor && name.toLowerCase() === vendor && !row.description?.trim()) {
    return "vendor-stub-only";
  }

  return null;
}

export function shouldSkipNcaaItem(row: NcaaItemImportRow): boolean {
  return ncaaSkipReasonForItem(row) !== null;
}
