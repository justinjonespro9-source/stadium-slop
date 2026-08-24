import "server-only";

import { CampaignVisitKind } from "@prisma/client";

import { isLikelyUnfurlBot } from "@/lib/campaigns/bots";
import { getActiveCampaign } from "@/lib/campaigns/catalog";
import { prisma } from "@/lib/prisma";

export async function recordCampaignVisit(input: {
  slug: string;
  kind: CampaignVisitKind;
  destination: string;
  userAgent?: string | null;
}): Promise<void> {
  if (isLikelyUnfurlBot(input.userAgent)) {
    return;
  }

  const campaign = getActiveCampaign(input.slug);
  if (!campaign) {
    return;
  }

  try {
    await prisma.campaignVisit.create({
      data: {
        campaignSlug: campaign.slug,
        kind: input.kind,
        destination: input.destination
      }
    });
  } catch (error) {
    console.error("[campaign] visit log failed", {
      slug: campaign.slug,
      kind: input.kind,
      error
    });
  }
}
