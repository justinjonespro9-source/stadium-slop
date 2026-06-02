/**
 * Conservative World Cup host-venue generic menu cleanup heuristics.
 *
 * Hides only explicit generic / category / value-menu rows. Does not hide
 * named specialty drinks/dishes, duplicate groups, or rows with engagement.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";

export type WorldCupGenericCleanupAction =
  | "hide-generic"
  | "keep"
  | "manual-review"
  | "skip-duplicate";

export type WorldCupGenericMenuItem = {
  id: string;
  slug: string;
  name: string;
  reviewCount: number;
  photoCount: number;
  vendor: { id: string; name: string };
};

type GenericHideRule = {
  test: (normalized: string) => boolean;
  reason: string;
};

const WORLD_CUP_GENERIC_HIDE_RULES: GenericHideRule[] = [
  {
    test: (n) => /^value (soda|water|beer|popcorn)$/.test(n),
    reason: "Value menu row"
  },
  {
    test: (n) => /^(outdoor |premium )?bar drinks?$/.test(n),
    reason: "Generic bar drinks category"
  },
  {
    test: (n) => /^(local )?craft beer$/.test(n),
    reason: "Generic craft beer category"
  },
  {
    test: (n) => /^draft beer$/.test(n),
    reason: "Generic draft beer category"
  },
  {
    test: (n) => /^hard seltzer$/.test(n),
    reason: "Generic hard seltzer category"
  },
  {
    test: (n) =>
      /^grab[- ]and[- ]go(?: counter pick| (?:drinks|snacks))?$/.test(n) ||
      /^grab[- ]and[- ]go$/.test(n),
    reason: "Grab-and-go package row"
  },
  {
    test: (n) => /^cotton candy$/.test(n),
    reason: "Generic concession snack"
  },
  {
    test: (n) => /^cracker jacks?$/.test(n),
    reason: "Generic concession snack"
  },
  {
    test: (n) => /^peanuts$/.test(n),
    reason: "Generic concession snack"
  },
  {
    test: (n) => /^popcorn$/.test(n),
    reason: "Generic popcorn row"
  },
  {
    test: (n) => /^candy$/.test(n),
    reason: "Generic candy row"
  },
  {
    test: (n) => /^(fountain soda|bottled water|bottled soda)$/.test(n),
    reason: "Generic bottled/fountain drink"
  },
  {
    test: (n) => /^(hot chocolate|coffee)$/.test(n),
    reason: "Generic hot beverage category"
  },
  {
    test: (n) => /^local draft$/.test(n),
    reason: "Generic local draft category"
  },
  {
    test: (n) => /^(themed )?cocktails?$/.test(n) || /^premium spirits?$/.test(n),
    reason: "Generic cocktail/spirits category"
  },
  {
    test: (n) =>
      /^(beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich)$/.test(
        n
      ),
    reason: "Vague package / placeholder row"
  },
  {
    test: (n) =>
      /\b(assorted snacks?|various|menu varies|unnamed|counter pick)\b/.test(n) &&
      n.split(" ").length <= 5,
    reason: "Vague package / placeholder row"
  },
  {
    test: (n) =>
      /^(general concessions|stadium concessions|section \d+)$/.test(n),
    reason: "Generic stand / counter label"
  }
];

/** Named review-worthy rows that must never be auto-hidden in this pass. */
const WORLD_CUP_NAMED_SPECIALTY_KEEP_RES: RegExp[] = [
  /^dirty soda$/i,
  /\b(milkshake|malt|float|slushie|slush|smoothie|frappe|shake)\b/i,
  /\b(ipa|lager|stout|pilsner|porter|witbier|hefeweizen|pale ale|amber ale|saison|radler|helles|kolsch|doppelbock|shandy|gose|tripel|dubbel)\b/i,
  /\b(margarita|martini|mule|old fashioned|sangria|moscow|cosmopolitan|daiquiri|paloma|negroni|spritz|rita|michelada|bloody mary|mojito|manhattan)\b/i,
  /\.\d{3}\b/,
  /\bbeer bat\b/i
];

export function isWorldCupNamedSpecialtyKeep(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  return WORLD_CUP_NAMED_SPECIALTY_KEEP_RES.some((re) => re.test(trimmed));
}

export function matchWorldCupGenericHideReason(name: string): string | null {
  const normalized = normalizeMenuItemName(name);
  if (!normalized) return null;

  for (const rule of WORLD_CUP_GENERIC_HIDE_RULES) {
    if (rule.test(normalized)) {
      return rule.reason;
    }
  }
  return null;
}

export function classifyWorldCupGenericRow(
  item: WorldCupGenericMenuItem,
  opts: { inDuplicateGroup: boolean }
): { action: WorldCupGenericCleanupAction; reason: string } {
  if (opts.inDuplicateGroup) {
    return {
      action: "skip-duplicate",
      reason: "Duplicate group member — skipped in generic-only pass"
    };
  }

  if (isWorldCupNamedSpecialtyKeep(item.name)) {
    return { action: "keep", reason: "Named specialty drink — keep" };
  }

  const hideReason = matchWorldCupGenericHideReason(item.name);
  if (!hideReason) {
    return { action: "keep", reason: "Not an explicit generic hide candidate" };
  }

  if (item.reviewCount > 0 || item.photoCount > 0) {
    return {
      action: "manual-review",
      reason: "Generic row with real reviews or photos — excluded from auto-hide"
    };
  }

  return { action: "hide-generic", reason: hideReason };
}
