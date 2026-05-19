import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const REPORT_CONTENT_EMAIL = SITE_CONTACT_EMAIL;

export type ReportContentReason =
  | "inappropriate_photo"
  | "wrong_item"
  | "spam_fake"
  | "offensive"
  | "alcohol"
  | "other";

export const REPORT_CONTENT_REASONS: {
  value: ReportContentReason;
  label: string;
}[] = [
  { value: "inappropriate_photo", label: "Inappropriate photo" },
  { value: "wrong_item", label: "Wrong item or venue" },
  { value: "spam_fake", label: "Spam or fake review" },
  { value: "offensive", label: "Offensive content" },
  { value: "alcohol", label: "Alcohol-related concern" },
  { value: "other", label: "Other" }
];

const REPORT_REASON_SET = new Set<ReportContentReason>(
  REPORT_CONTENT_REASONS.map((r) => r.value)
);

export type ReportContentContext = {
  venueName: string;
  venueSlug?: string;
  vendorName?: string;
  vendorSlug?: string;
  itemName?: string;
  itemSlug?: string;
  reviewId?: string;
  photoUrl?: string;
  /** Path only, e.g. /venues/sofi-stadium/burger */
  pagePath: string;
  reason?: ReportContentReason;
};

export function parseReportContentReason(
  raw: string | undefined
): ReportContentReason | undefined {
  if (raw && REPORT_REASON_SET.has(raw as ReportContentReason)) {
    return raw as ReportContentReason;
  }
  return undefined;
}

export function buildReportContentHref(context: ReportContentContext): string {
  const params = new URLSearchParams();
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
  if (context.reviewId) {
    params.set("reviewId", context.reviewId);
  }
  if (context.photoUrl) {
    params.set("photoUrl", context.photoUrl);
  }
  if (context.reason) {
    params.set("reason", context.reason);
  }
  params.set(
    "ref",
    context.pagePath.startsWith("/") ? context.pagePath : `/${context.pagePath}`
  );
  return `/report-content?${params.toString()}`;
}

export function parseReportContentSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ReportContentContext | null {
  const pick = (key: string) => {
    const v = searchParams[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
    return undefined;
  };

  const venueName = pick("venue");
  const pagePath = pick("ref");

  if (!venueName || !pagePath) {
    return null;
  }

  return {
    venueName,
    venueSlug: pick("venueSlug"),
    vendorName: pick("vendor"),
    vendorSlug: pick("vendorSlug"),
    itemName: pick("item"),
    itemSlug: pick("itemSlug"),
    reviewId: pick("reviewId"),
    photoUrl: pick("photoUrl"),
    pagePath,
    reason: parseReportContentReason(pick("reason"))
  };
}

export function formatReportContentContextSummary(
  context: ReportContentContext
): string[] {
  const lines = [`Venue: ${context.venueName}`];
  if (context.vendorName) {
    lines.push(`Vendor: ${context.vendorName}`);
  }
  if (context.itemName) {
    lines.push(`Item: ${context.itemName}`);
  }
  if (context.reviewId) {
    lines.push(`Review ID: ${context.reviewId}`);
  }
  if (context.photoUrl) {
    lines.push(`Photo URL: ${context.photoUrl}`);
  }
  lines.push(`Page: ${getAbsoluteUrl(context.pagePath)}`);
  return lines;
}

export function buildReportContentMailto(params: {
  reason: ReportContentReason;
  notes: string;
  name: string;
  email: string;
  context: ReportContentContext | null;
}): string {
  const reasonLabel =
    REPORT_CONTENT_REASONS.find((r) => r.value === params.reason)?.label ??
    params.reason;

  const subjectParts = ["Stadium Slop content report", reasonLabel];
  if (params.context?.venueName) {
    subjectParts.push(params.context.venueName);
  }
  if (params.context?.itemName) {
    subjectParts.push(params.context.itemName);
  }

  const bodyLines = [
    `Report reason: ${reasonLabel}`,
    `Name: ${params.name.trim() || "—"}`,
    `Email: ${params.email.trim() || "—"}`,
    ""
  ];

  if (params.context) {
    bodyLines.push(
      "Content context:",
      ...formatReportContentContextSummary(params.context),
      ""
    );
  }

  bodyLines.push(
    "Additional details:",
    params.notes.trim() || "—",
    "",
    "—",
    "Sent via stadiumslop.com/report-content"
  );

  const subject = subjectParts.join(" · ").slice(0, 180);
  const body = bodyLines.join("\n");

  return `mailto:${REPORT_CONTENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
