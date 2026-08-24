import { CampaignVisitKind } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { applyFirstTouchCampaignCookie } from "@/lib/campaigns/apply-cookies";
import { getActiveCampaign } from "@/lib/campaigns/catalog";
import { CAMPAIGN_COOKIE_NAME } from "@/lib/campaigns/cookie";
import { recordCampaignVisit } from "@/lib/campaigns/record-visit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GoRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: GoRouteContext) {
  const { slug } = await context.params;
  const campaign = getActiveCampaign(slug);

  if (!campaign) {
    return new NextResponse("Campaign not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" }
    });
  }

  await recordCampaignVisit({
    slug: campaign.slug,
    kind: CampaignVisitKind.REDIRECT,
    destination: campaign.destinationPath,
    userAgent: request.headers.get("user-agent")
  });

  const destination = new URL(campaign.destinationPath, request.url);
  const response = NextResponse.redirect(destination, 307);
  response.headers.set("Cache-Control", "no-store");
  applyFirstTouchCampaignCookie(
    response,
    campaign.slug,
    request.cookies.get(CAMPAIGN_COOKIE_NAME)?.value
  );
  return response;
}
