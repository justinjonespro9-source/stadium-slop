/**
 * Reusable menu quality heuristics: duplicates, generic rows, canonical scoring.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";

export type MenuQualityAction =
  | "keep-canonical"
  | "hide-duplicate"
  | "rename-canonical"
  | "keep-both"
  | "hide-generic"
  | "manual-review";

export type MenuQualityItem = {
  id: string;
  slug: string;
  name: string;
  reviewCount: number;
  photoCount: number;
  isNewThisSeason: boolean;
  vendor: { id: string; name: string };
};

export type DuplicateGroupKind =
  | "exact-name"
  | "case-only"
  | "punctuation-only"
  | "normalized-name"
  | "vendor-stripped"
  | "token-similar"
  | "curated";

export type MenuDuplicateGroup<T extends MenuQualityItem = MenuQualityItem> = {
  kind: DuplicateGroupKind;
  key: string;
  label?: string;
  notes?: string;
  treatAsDuplicate: boolean;
  preferredCanonical?: string;
  members: T[];
};

const GENERIC_NON_REVIEWABLE_RE =
  /^(cotton candy|cracker jacks?|grab[- ]and[- ]go(?: counter pick)?|popcorn|peanuts|ice cream novelty|soft serve|fountain soda|bottled water|bar drinks?|premium bar drinks?|outdoor bar drinks?|value (?:beer|soda|water)|hard seltzer|dirty soda)$/i;

const VAGUE_VENDOR_AS_ITEM_RE =
  /^(justin'?s candied popcorn bar|herbivorous butcher|section \d+|general concessions|stadium concessions)$/i;

const VAGUE_PLACEHOLDER_RE =
  /\b(counter pick|grab[- ]and[- ]go|assorted snacks?|various|menu varies|unnamed)\b/i;

export function punctuationFoldKey(name: string): string {
  return normalizeMenuItemName(name).replace(/[^a-z0-9]+/g, "");
}

export function vendorStripKey(itemName: string, vendorName: string): string {
  let name = itemName.trim();
  const vendor = vendorName.trim();
  if (!vendor) return normalizeMenuItemName(name);

  const escaped = vendor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`^${escaped}\\s*[-–—:|]\\s*`, "i"),
    new RegExp(`^${escaped}\\s+`, "i")
  ];
  for (const re of patterns) {
    name = name.replace(re, "");
  }
  return normalizeMenuItemName(name);
}

export function isGenericNonReviewableItem(name: string, vendorName: string): boolean {
  const trimmed = name.trim();
  if (GENERIC_NON_REVIEWABLE_RE.test(trimmed)) return true;
  if (VAGUE_VENDOR_AS_ITEM_RE.test(trimmed)) return true;
  if (VAGUE_PLACEHOLDER_RE.test(trimmed)) return true;
  if (normalizeMenuItemName(trimmed) === normalizeMenuItemName(vendorName)) {
    return true;
  }
  return false;
}

export function scoreCanonicalCandidate(item: {
  name: string;
  reviewCount: number;
  photoCount: number;
  isNewThisSeason: boolean;
  preferredCanonical?: string;
}): number {
  let score = 0;
  score += item.reviewCount * 10_000;
  score += item.photoCount * 5_000;
  if (item.isNewThisSeason) score += 40;

  if (
    item.preferredCanonical &&
    normalizeMenuItemName(item.name) === normalizeMenuItemName(item.preferredCanonical)
  ) {
    score += 200;
  }

  const len = item.name.trim().length;
  if (len >= 12 && len <= 56) score += 10;
  if (/^[A-Z]/.test(item.name)) score += 4;
  if (/\(|\)/.test(item.name)) score -= 8;
  if (nameLooksLikeCategoryLabel(item.name)) score -= 30;
  return score;
}

function nameLooksLikeCategoryLabel(name: string): boolean {
  return /^(craft beer|local draft|cocktails?|premium spirits?|themed cocktails?)$/i.test(
    name.trim()
  );
}

export function pickCanonicalMember<T extends MenuQualityItem>(
  members: T[],
  preferredCanonical?: string
): T {
  return [...members].sort(
    (a, b) =>
      scoreCanonicalCandidate({ ...b, preferredCanonical }) -
      scoreCanonicalCandidate({ ...a, preferredCanonical })
  )[0];
}

export function recommendMenuQualityAction(
  member: { name: string; reviewCount: number; photoCount: number },
  keep: { name: string },
  opts: {
    treatAsDuplicate: boolean;
    preferredCanonical?: string;
    isGeneric?: boolean;
  }
): MenuQualityAction {
  if (!opts.treatAsDuplicate) {
    return "keep-both";
  }
  if (member.name === keep.name) {
    if (
      opts.preferredCanonical &&
      normalizeMenuItemName(member.name) !== normalizeMenuItemName(opts.preferredCanonical)
    ) {
      return member.reviewCount > 0 || member.photoCount > 0
        ? "manual-review"
        : "rename-canonical";
    }
    return "keep-canonical";
  }
  if (member.reviewCount > 0 || member.photoCount > 0) {
    return "manual-review";
  }
  if (opts.isGeneric) {
    return "hide-generic";
  }
  return "hide-duplicate";
}

function tokenSet(name: string): Set<string> {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "with",
    "w",
    "on",
    "in",
    "at",
    "by",
    "of"
  ]);
  return new Set(
    normalizeMenuItemName(name)
      .split(" ")
      .filter((t) => t.length > 2 && !stop.has(t))
  );
}

function tokenSimilarity(a: string, b: string): number {
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) {
    if (tb.has(t)) shared += 1;
  }
  return shared / Math.max(ta.size, tb.size);
}

export function buildMenuDuplicateGroups<T extends MenuQualityItem>(
  items: T[],
  options?: {
    curated?: MenuDuplicateGroup<T>[];
    includeTokenSimilar?: boolean;
  }
): MenuDuplicateGroup<T>[] {
  const groups: MenuDuplicateGroup<T>[] = [];
  const curated = options?.curated ?? [];

  const addFromMap = (kind: DuplicateGroupKind, map: Map<string, T[]>) => {
    for (const [key, members] of map) {
      if (members.length < 2) continue;
      groups.push({ kind, key, treatAsDuplicate: true, members });
    }
  };

  const exact = new Map<string, T[]>();
  const caseOnly = new Map<string, T[]>();
  const normalized = new Map<string, T[]>();
  const punctuation = new Map<string, T[]>();
  const vendorStripped = new Map<string, T[]>();

  for (const item of items) {
    const raw = item.name.trim();
    const exactKey = raw.toLowerCase();
    if (!exact.has(exactKey)) exact.set(exactKey, []);
    exact.get(exactKey)!.push(item);

    const caseKey = raw.replace(/\s+/g, " ").toLowerCase();
    if (!caseOnly.has(caseKey)) caseOnly.set(caseKey, []);
    caseOnly.get(caseKey)!.push(item);

    const normKey = normalizeMenuItemName(raw);
    if (!normalized.has(normKey)) normalized.set(normKey, []);
    normalized.get(normKey)!.push(item);

    const punctKey = punctuationFoldKey(raw);
    if (!punctuation.has(punctKey)) punctuation.set(punctKey, []);
    punctuation.get(punctKey)!.push(item);

    const vsKey = `${item.vendor.id}::${vendorStripKey(raw, item.vendor.name)}`;
    if (!vendorStripped.has(vsKey)) vendorStripped.set(vsKey, []);
    vendorStripped.get(vsKey)!.push(item);
  }

  addFromMap("exact-name", exact);

  for (const [key, members] of normalized) {
    if (members.length < 2) continue;
    const rawKeys = new Set(members.map((m) => m.name.trim()));
    if (rawKeys.size > 1) {
      groups.push({ kind: "normalized-name", key, treatAsDuplicate: true, members });
    }
  }

  for (const [key, members] of punctuation) {
    if (members.length < 2) continue;
    const normKeys = new Set(members.map((m) => normalizeMenuItemName(m.name)));
    if (normKeys.size > 1) {
      groups.push({
        kind: "punctuation-only",
        key,
        treatAsDuplicate: true,
        members
      });
    }
  }

  for (const [key, members] of caseOnly) {
    if (members.length < 2) continue;
    const rawKeys = new Set(members.map((m) => m.name.trim()));
    if (rawKeys.size > 1 && new Set(members.map((m) => normalizeMenuItemName(m.name))).size > 1) {
      groups.push({ kind: "case-only", key, treatAsDuplicate: true, members });
    }
  }

  addFromMap("vendor-stripped", vendorStripped);

  if (options?.includeTokenSimilar !== false) {
    const byVendor = new Map<string, T[]>();
    for (const item of items) {
      if (!byVendor.has(item.vendor.id)) byVendor.set(item.vendor.id, []);
      byVendor.get(item.vendor.id)!.push(item);
    }

    for (const [vendorId, vendorItems] of byVendor) {
      for (let i = 0; i < vendorItems.length; i++) {
        for (let j = i + 1; j < vendorItems.length; j++) {
          const a = vendorItems[i];
          const b = vendorItems[j];
          if (normalizeMenuItemName(a.name) === normalizeMenuItemName(b.name)) continue;
          if (punctuationFoldKey(a.name) === punctuationFoldKey(b.name)) continue;

          const sim = tokenSimilarity(a.name, b.name);
          if (sim < 0.72) continue;

          const longer =
            a.name.length >= b.name.length ? a : b;
          const shorter = longer === a ? b : a;
          if (!normalizeMenuItemName(longer.name).includes(normalizeMenuItemName(shorter.name))) {
            const overlap = tokenSimilarity(shorter.name, longer.name);
            if (overlap < 0.85) continue;
          }

          const key = `${vendorId}::${[a.id, b.id].sort().join("|")}`;
          groups.push({
            kind: "token-similar",
            key,
            treatAsDuplicate: true,
            notes: `Token overlap ${(sim * 100).toFixed(0)}%`,
            members: [a, b]
          });
        }
      }
    }
  }

  return dedupeMenuQualityGroups([...curated, ...groups]);
}

export function dedupeMenuQualityGroups<T extends MenuQualityItem>(
  groups: MenuDuplicateGroup<T>[]
): MenuDuplicateGroup<T>[] {
  const byMemberIds = new Map<string, MenuDuplicateGroup<T>>();

  for (const group of groups) {
    const memberKey = [...group.members]
      .map((m) => m.id)
      .sort()
      .join("|");
    const existing = byMemberIds.get(memberKey);
    if (!existing) {
      byMemberIds.set(memberKey, group);
      continue;
    }
    const rank = (g: MenuDuplicateGroup<T>) =>
      g.kind === "curated" ? 5 : g.kind === "exact-name" ? 4 : g.kind === "normalized-name" ? 3 : 1;
    if (rank(group) > rank(existing) || group.members.length > existing.members.length) {
      byMemberIds.set(memberKey, group);
    }
  }

  return [...byMemberIds.values()];
}

export type VenueMenuQualityReport = {
  venueSlug: string;
  venueName: string;
  groups: string[];
  activeCount: number;
  duplicateGroups: MenuDuplicateGroup[];
  genericRows: MenuQualityItem[];
  issueCount: number;
  safeHideCount: number;
  manualReviewCount: number;
  severityScore: number;
};

export type AnalyzeVenueMenuQualityOptions = {
  /** Venue cleanup canonical headline slugs — exclude from generic issue counts. */
  excludeGenericSlugs?: Set<string>;
};

export function analyzeVenueMenuQuality<T extends MenuQualityItem>(
  venueSlug: string,
  venueName: string,
  groups: string[],
  activeItems: T[],
  curatedGroups: MenuDuplicateGroup<T>[] = [],
  options: AnalyzeVenueMenuQualityOptions = {}
): VenueMenuQualityReport {
  const duplicateGroups = buildMenuDuplicateGroups(activeItems, { curated: curatedGroups });
  const genericRows = activeItems.filter(
    (item) =>
      isGenericNonReviewableItem(item.name, item.vendor.name) &&
      !options.excludeGenericSlugs?.has(item.slug)
  );

  let safeHideCount = 0;
  let manualReviewCount = 0;
  const countedHideIds = new Set<string>();

  for (const group of duplicateGroups) {
    if (!group.treatAsDuplicate || group.members.length < 2) continue;
    const keep = pickCanonicalMember(group.members, group.preferredCanonical);
    for (const member of group.members) {
      const action = recommendMenuQualityAction(member, keep, {
        treatAsDuplicate: group.treatAsDuplicate,
        preferredCanonical: group.preferredCanonical,
        isGeneric: isGenericNonReviewableItem(member.name, member.vendor.name)
      });
      if (action === "manual-review") {
        manualReviewCount += 1;
      } else if (
        (action === "hide-duplicate" || action === "hide-generic") &&
        !countedHideIds.has(member.id)
      ) {
        safeHideCount += 1;
        countedHideIds.add(member.id);
      }
    }
  }

  for (const item of genericRows) {
    if (countedHideIds.has(item.id)) continue;
    if (item.reviewCount > 0 || item.photoCount > 0) {
      manualReviewCount += 1;
      continue;
    }
    safeHideCount += 1;
    countedHideIds.add(item.id);
  }

  const issueCount = safeHideCount + manualReviewCount;
  const severityScore = safeHideCount + manualReviewCount * 3;

  return {
    venueSlug,
    venueName,
    groups,
    activeCount: activeItems.length,
    duplicateGroups,
    genericRows,
    issueCount,
    safeHideCount,
    manualReviewCount,
    severityScore
  };
}
