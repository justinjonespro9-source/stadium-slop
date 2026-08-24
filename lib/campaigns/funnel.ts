import type { CampaignDefinition } from "@/lib/campaigns/catalog";

/**
 * Future SNG Command Center row:
 * Campaign | Visits | Signups | Reviewers | Reviews | Conversion
 *
 * Conversion is reviewers / redirect visits (example: 22 / 184 ≈ 12.0%).
 */
export type CampaignFunnelCounts = {
  visits: number;
  followVisits: number;
  signups: number;
  reviewers: number;
  reviews: number;
};

export type CampaignFunnelRow = {
  campaignSlug: string;
  label: string;
  visits: number;
  followVisits: number;
  signups: number;
  reviewers: number;
  reviews: number;
  conversionPercent: number;
};

export function funnelConversionPercent(reviewers: number, visits: number): number {
  if (visits <= 0) {
    return 0;
  }
  return Math.round((reviewers / visits) * 1000) / 10;
}

export function toCampaignFunnelRow(
  campaign: CampaignDefinition,
  counts: CampaignFunnelCounts
): CampaignFunnelRow {
  return {
    campaignSlug: campaign.slug,
    label: campaign.label,
    visits: counts.visits,
    followVisits: counts.followVisits,
    signups: counts.signups,
    reviewers: counts.reviewers,
    reviews: counts.reviews,
    conversionPercent: funnelConversionPercent(counts.reviewers, counts.visits)
  };
}
