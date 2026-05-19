import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const SUGGEST_CORRECTION_EMAIL = SITE_CONTACT_EMAIL;

export type SuggestCorrectionKind = "venue" | "vendor" | "item";

export type CorrectionType =
  | "wrong_section"
  | "vendor_renamed"
  | "item_removed"
  | "price_outdated"
  | "photo_mismatch"
  | "incorrect_description"
  | "alcohol_flag_incorrect"
  | "other";

export const CORRECTION_TYPES: { value: CorrectionType; label: string }[] = [
  { value: "wrong_section", label: "Wrong section or location" },
  { value: "vendor_renamed", label: "Vendor renamed or moved" },
  { value: "item_removed", label: "Item removed or unavailable" },
  { value: "price_outdated", label: "Price outdated" },
  { value: "photo_mismatch", label: "Photo mismatch" },
  { value: "incorrect_description", label: "Incorrect description" },
  { value: "alcohol_flag_incorrect", label: "Alcohol flag incorrect" },
  { value: "other", label: "Something else" }
];

const CORRECTION_TYPE_SET = new Set<CorrectionType>(
  CORRECTION_TYPES.map((t) => t.value)
);

export type SuggestCorrectionContext = {
  kind: SuggestCorrectionKind;
  venueName: string;
  venueSlug?: string;
  vendorName?: string;
  vendorSlug?: string;
  itemName?: string;
  itemSlug?: string;
  /** Path only, e.g. /venues/sofi-stadium */
  pagePath: string;
  correctionType?: CorrectionType;
};

export function parseCorrectionType(
  raw: string | undefined
): CorrectionType | undefined {
  if (raw && CORRECTION_TYPE_SET.has(raw as CorrectionType)) {
    return raw as CorrectionType;
  }
  return undefined;
}

export function buildSuggestCorrectionHref(
  context: SuggestCorrectionContext
): string {
  const params = new URLSearchParams();
  params.set("kind", context.kind);
  params.set("venue", context.venueName);
  if (context.venueSlug) {
    params.set("venueSlug", context.venueSlug);
  }
  if (context.vendorName) {
    params.set("vendor", context.vendorName);
  }
  if (context.vendorSlug) {
    params.set("vendorSlug", context.vendorSlug);
  }
  if (context.itemName) {
    params.set("item", context.itemName);
  }
  if (context.itemSlug) {
    params.set("itemSlug", context.itemSlug);
  }
  if (context.correctionType) {
    params.set("type", context.correctionType);
  }
  params.set(
    "ref",
    context.pagePath.startsWith("/") ? context.pagePath : `/${context.pagePath}`
  );
  return `/suggest-correction?${params.toString()}`;
}

export function parseSuggestCorrectionSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): SuggestCorrectionContext | null {
  const pick = (key: string) => {
    const v = searchParams[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
    return undefined;
  };

  const kind = pick("kind") as SuggestCorrectionKind | undefined;
  const venueName = pick("venue");
  const pagePath = pick("ref");

  if (!kind || !venueName || !pagePath) {
    return null;
  }
  if (kind !== "venue" && kind !== "vendor" && kind !== "item") {
    return null;
  }

  return {
    kind,
    venueName,
    venueSlug: pick("venueSlug"),
    vendorName: pick("vendor"),
    vendorSlug: pick("vendorSlug"),
    itemName: pick("item"),
    itemSlug: pick("itemSlug"),
    pagePath,
    correctionType: parseCorrectionType(pick("type"))
  };
}

export function formatSuggestCorrectionContextSummary(
  context: SuggestCorrectionContext
): string[] {
  const lines = [`Venue: ${context.venueName}`];
  if (context.vendorName) {
    lines.push(`Vendor: ${context.vendorName}`);
  }
  if (context.itemName) {
    lines.push(`Item: ${context.itemName}`);
  }
  lines.push(`Page: ${getAbsoluteUrl(context.pagePath)}`);
  return lines;
}

export function buildSuggestCorrectionMailto(params: {
  correctionType: CorrectionType;
  notes: string;
  name: string;
  email: string;
  context: SuggestCorrectionContext | null;
}): string {
  const typeLabel =
    CORRECTION_TYPES.find((t) => t.value === params.correctionType)?.label ??
    params.correctionType;

  const subjectParts = ["Stadium Slop correction", typeLabel];
  if (params.context?.venueName) {
    subjectParts.push(params.context.venueName);
  }
  if (params.context?.itemName) {
    subjectParts.push(params.context.itemName);
  }

  const bodyLines = [
    `Correction type: ${typeLabel}`,
    `Name: ${params.name.trim() || "—"}`,
    `Email: ${params.email.trim() || "—"}`,
    ""
  ];

  if (params.context) {
    bodyLines.push(
      "Listing context:",
      ...formatSuggestCorrectionContextSummary(params.context),
      ""
    );
  }

  bodyLines.push(
    "Notes:",
    params.notes.trim() || "—",
    "",
    "—",
    "Sent via stadiumslop.com/suggest-correction"
  );

  const subject = subjectParts.join(" · ").slice(0, 180);
  const body = bodyLines.join("\n");

  return `mailto:${SUGGEST_CORRECTION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
