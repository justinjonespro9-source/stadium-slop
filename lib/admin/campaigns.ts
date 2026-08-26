import "server-only";

import { CampaignVisitKind } from "@prisma/client";

import {
  buildCampaignAnalyticsRows,
  type CampaignAnalyticsCounts,
  type CampaignAnalyticsDateRange,
  type CampaignAnalyticsRow
} from "@/lib/admin/campaign-analytics";
import {
  CAMPAIGN_CATALOG,
  type CampaignDefinition
} from "@/lib/campaigns/catalog";
import { prisma } from "@/lib/prisma";

export type {
  CampaignAnalyticsDateRange,
  CampaignAnalyticsRow
} from "@/lib/admin/campaign-analytics";

export {
  buildCampaignAnalyticsRows,
  formatCampaignChannel,
  resolveCampaignAnalyticsDateRange
} from "@/lib/admin/campaign-analytics";

function createdAtWhere(range: CampaignAnalyticsDateRange) {
  if (!range.from && !range.toExclusive) {
    return undefined;
  }
  return {
    ...(range.from ? { gte: range.from } : {}),
    ...(range.toExclusive ? { lt: range.toExclusive } : {})
  };
}

export async function loadCampaignAnalytics(
  range: CampaignAnalyticsDateRange,
  campaigns: readonly CampaignDefinition[] = CAMPAIGN_CATALOG
): Promise<CampaignAnalyticsRow[]> {
  const slugs = campaigns.map((campaign) => campaign.slug);
  if (slugs.length === 0) {
    return [];
  }

  const createdAt = createdAtWhere(range);

  const [visitGroups, signupGroups, reviewGroups, reviewerGroups] =
    await Promise.all([
      prisma.campaignVisit.groupBy({
        by: ["campaignSlug", "kind"],
        where: {
          campaignSlug: { in: slugs },
          ...(createdAt ? { createdAt } : {})
        },
        _count: { _all: true }
      }),
      prisma.user.groupBy({
        by: ["acquisitionCampaignSlug"],
        where: {
          acquisitionCampaignSlug: { in: slugs },
          ...(createdAt ? { createdAt } : {})
        },
        _count: { _all: true }
      }),
      prisma.review.groupBy({
        by: ["campaignSlug"],
        where: {
          campaignSlug: { in: slugs },
          ...(createdAt ? { createdAt } : {})
        },
        _count: { _all: true }
      }),
      prisma.review.groupBy({
        by: ["campaignSlug", "userId"],
        where: {
          campaignSlug: { in: slugs },
          ...(createdAt ? { createdAt } : {})
        },
        _count: { _all: true }
      })
    ]);

  const countsBySlug = new Map<string, CampaignAnalyticsCounts>();

  for (const slug of slugs) {
    countsBySlug.set(slug, {
      redirectVisits: 0,
      followVisits: 0,
      signups: 0,
      reviewers: 0,
      reviews: 0
    });
  }

  for (const row of visitGroups) {
    const bucket = countsBySlug.get(row.campaignSlug);
    if (!bucket) continue;
    if (row.kind === CampaignVisitKind.REDIRECT) {
      bucket.redirectVisits = row._count._all;
    } else if (row.kind === CampaignVisitKind.FOLLOW) {
      bucket.followVisits = row._count._all;
    }
  }

  for (const row of signupGroups) {
    const slug = row.acquisitionCampaignSlug;
    if (!slug) continue;
    const bucket = countsBySlug.get(slug);
    if (bucket) {
      bucket.signups = row._count._all;
    }
  }

  for (const row of reviewGroups) {
    const slug = row.campaignSlug;
    if (!slug) continue;
    const bucket = countsBySlug.get(slug);
    if (bucket) {
      bucket.reviews = row._count._all;
    }
  }

  const reviewersBySlug = new Map<string, number>();
  for (const row of reviewerGroups) {
    const slug = row.campaignSlug;
    if (!slug) continue;
    reviewersBySlug.set(slug, (reviewersBySlug.get(slug) ?? 0) + 1);
  }
  for (const [slug, reviewers] of reviewersBySlug) {
    const bucket = countsBySlug.get(slug);
    if (bucket) {
      bucket.reviewers = reviewers;
    }
  }

  return buildCampaignAnalyticsRows(campaigns, countsBySlug);
}
