import { getAbsoluteUrl } from "@/lib/site-metadata";

export const CLAIM_CONTACT_EMAIL = "hello@snglabs.com";

export type ClaimListingKind = "venue" | "vendor" | "item";

export type ClaimListingContext = {
  kind: ClaimListingKind;
  venueName: string;
  venueSlug?: string;
  vendorName?: string;
  vendorSlug?: string;
  itemName?: string;
  itemSlug?: string;
  /** Path only, e.g. /venues/sofi-stadium */
  pagePath: string;
};

export type ClaimInquiryTopic =
  | "menu"
  | "partnership"
  | "sponsorship"
  | "other";

export const CLAIM_INQUIRY_TOPICS: {
  value: ClaimInquiryTopic;
  label: string;
}[] = [
  { value: "menu", label: "Menu or listing update" },
  { value: "partnership", label: "Venue / vendor partnership" },
  { value: "sponsorship", label: "Offer or sponsored placement" },
  { value: "other", label: "Something else" }
];

const PARTNER_FEATURE_TEASERS = [
  "Featured items and stands",
  "Menu, section, and price updates",
  "Offers and game-day specials",
  "Clearly labeled sponsored placements",
  "Fan rewards integrations (coming later)"
] as const;

export function getPartnerFeatureTeasers(): readonly string[] {
  return PARTNER_FEATURE_TEASERS;
}

export function claimCtaHeadline(kind: ClaimListingKind): string {
  if (kind === "item") {
    return "Own or serve this item?";
  }
  if (kind === "vendor") {
    return "Represent this vendor?";
  }
  return "Represent this venue or vendor?";
}

export function claimCtaSubline(kind: ClaimListingKind): string {
  if (kind === "item") {
    return "Claim this listing or update menu details and partnership info.";
  }
  return "Claim this listing, correct stand info, or explore early operator access.";
}

export function buildClaimHref(context: ClaimListingContext): string {
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
  params.set("ref", context.pagePath.startsWith("/") ? context.pagePath : `/${context.pagePath}`);
  return `/claim?${params.toString()}`;
}

export function parseClaimSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ClaimListingContext | null {
  const pick = (key: string) => {
    const v = searchParams[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
    return undefined;
  };

  const kind = pick("kind") as ClaimListingKind | undefined;
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
    pagePath
  };
}

export function formatClaimContextSummary(context: ClaimListingContext): string[] {
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

export function buildClaimMailto(params: {
  topic: ClaimInquiryTopic;
  name: string;
  organization: string;
  email: string;
  message: string;
  context: ClaimListingContext | null;
}): string {
  const topicLabel =
    CLAIM_INQUIRY_TOPICS.find((t) => t.value === params.topic)?.label ?? params.topic;

  const subjectParts = ["Stadium Slop listing inquiry", topicLabel];
  if (params.context?.venueName) {
    subjectParts.push(params.context.venueName);
  }
  if (params.context?.itemName) {
    subjectParts.push(params.context.itemName);
  }

  const bodyLines = [
    `Inquiry type: ${topicLabel}`,
    `Name: ${params.name}`,
    `Organization: ${params.organization || "—"}`,
    `Reply-to: ${params.email}`,
    ""
  ];

  if (params.context) {
    bodyLines.push("Listing context:", ...formatClaimContextSummary(params.context), "");
  }

  bodyLines.push("Message:", params.message.trim() || "—", "", "—", "Sent via stadiumslop.com/claim");

  const subject = subjectParts.join(" · ").slice(0, 180);
  const body = bodyLines.join("\n");

  return `mailto:${CLAIM_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
