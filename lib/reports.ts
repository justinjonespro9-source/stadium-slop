import type { ReportReason, ReportTargetType } from "@prisma/client";

/** Form values → Prisma `ReportReason` */
export const FAN_REPORT_REASON_VALUES = [
  "INAPPROPRIATE_PHOTO",
  "WRONG_ITEM",
  "SPAM_FAKE",
  "OFFENSIVE_CONTENT",
  "OTHER"
] as const satisfies readonly ReportReason[];

export type FanReportReasonForm = (typeof FAN_REPORT_REASON_VALUES)[number];

export const FAN_REPORT_REASON_LABELS: Record<FanReportReasonForm, string> = {
  INAPPROPRIATE_PHOTO: "Inappropriate photo",
  WRONG_ITEM: "Wrong item",
  SPAM_FAKE: "Spam / fake",
  OFFENSIVE_CONTENT: "Offensive content",
  OTHER: "Other"
};

export function parseFanReportReason(raw: string): ReportReason | null {
  return FAN_REPORT_REASON_VALUES.includes(raw as FanReportReasonForm)
    ? (raw as ReportReason)
    : null;
}

export function parseReportTargetType(raw: string): ReportTargetType | null {
  return raw === "REVIEW" || raw === "PHOTO" ? raw : null;
}

export const REPORT_NOTE_MAX = 500;
