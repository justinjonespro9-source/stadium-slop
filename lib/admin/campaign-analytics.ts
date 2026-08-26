import {
  type CampaignChannel,
  type CampaignDefinition
} from "@/lib/campaigns/catalog";
import { funnelConversionPercent } from "@/lib/campaigns/funnel";

export type CampaignAnalyticsDateRange = {
  from: Date | null;
  toExclusive: Date | null;
  fromParam: string | null;
  toParam: string | null;
};

export type CampaignAnalyticsRow = {
  slug: string;
  label: string;
  channel: CampaignChannel;
  destinationPath: string;
  redirectVisits: number;
  followVisits: number;
  signups: number;
  reviewers: number;
  reviews: number;
  conversionPercent: number;
};

export type CampaignAnalyticsCounts = {
  redirectVisits: number;
  followVisits: number;
  signups: number;
  reviewers: number;
  reviews: number;
};

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse YYYY-MM-DD as UTC day start. Invalid values become null. */
export function parseCampaignDayStart(raw: string | null | undefined): Date | null {
  if (typeof raw !== "string" || !DAY_RE.test(raw.trim())) {
    return null;
  }
  const day = raw.trim();
  const date = new Date(`${day}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Exclusive end = start of the day after `to` (UTC). */
export function parseCampaignDayEndExclusive(
  raw: string | null | undefined
): Date | null {
  const start = parseCampaignDayStart(raw);
  if (!start) {
    return null;
  }
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function resolveCampaignAnalyticsDateRange(input: {
  from?: string | null;
  to?: string | null;
}): CampaignAnalyticsDateRange {
  const fromParam =
    typeof input.from === "string" && DAY_RE.test(input.from.trim())
      ? input.from.trim()
      : null;
  const toParam =
    typeof input.to === "string" && DAY_RE.test(input.to.trim())
      ? input.to.trim()
      : null;

  let from = parseCampaignDayStart(fromParam);
  let toExclusive = parseCampaignDayEndExclusive(toParam);

  if (from && toExclusive && from.getTime() >= toExclusive.getTime()) {
    from = parseCampaignDayStart(toParam);
    toExclusive = parseCampaignDayEndExclusive(fromParam);
  }

  return { from, toExclusive, fromParam, toParam };
}

export function buildCampaignAnalyticsRows(
  campaigns: readonly CampaignDefinition[],
  countsBySlug: Map<string, CampaignAnalyticsCounts>
): CampaignAnalyticsRow[] {
  return campaigns.map((campaign) => {
    const counts = countsBySlug.get(campaign.slug) ?? {
      redirectVisits: 0,
      followVisits: 0,
      signups: 0,
      reviewers: 0,
      reviews: 0
    };
    return {
      slug: campaign.slug,
      label: campaign.label,
      channel: campaign.channel,
      destinationPath: campaign.destinationPath,
      redirectVisits: counts.redirectVisits,
      followVisits: counts.followVisits,
      signups: counts.signups,
      reviewers: counts.reviewers,
      reviews: counts.reviews,
      conversionPercent: funnelConversionPercent(
        counts.reviewers,
        counts.redirectVisits
      )
    };
  });
}

export function formatCampaignChannel(channel: CampaignChannel): string {
  switch (channel) {
    case "postcard":
      return "Postcard";
    case "founder":
      return "Founder";
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "x":
      return "X";
    case "media":
      return "Media";
    case "tiktok":
      return "TikTok";
    default:
      return "Other";
  }
}
