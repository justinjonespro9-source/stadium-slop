import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { CampaignVisitKind } from "@prisma/client";

import { FollowPage } from "@/components/follow/follow-page";
import { getFirstTouchCampaignSlugFromCookies } from "@/lib/campaigns/attribution";
import { getActiveCampaign } from "@/lib/campaigns/catalog";
import { FOLLOW_TOUCH_COOKIE_NAME, resolveActiveCampaignSlug } from "@/lib/campaigns/cookie";
import { getFollowPageSocialLinks } from "@/lib/campaigns/follow-links";
import { recordCampaignVisit } from "@/lib/campaigns/record-visit";
import { getAbsoluteUrl, OG_CARD, SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

const TITLE = "Follow the Slop";
const DESCRIPTION =
  "Live food rankings, leaderboard updates, and what's actually worth ordering.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: getAbsoluteUrl("/follow")
  },
  openGraph: {
    title: `${TITLE} · Stadium Slop`,
    description: DESCRIPTION,
    url: getAbsoluteUrl("/follow"),
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/opengraph-image"),
        width: OG_CARD.width,
        height: OG_CARD.height,
        alt: "Stadium Slop — Follow the Slop"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} · Stadium Slop`,
    description: SITE_TAGLINE_SHORT,
    images: [getAbsoluteUrl("/opengraph-image")]
  }
};

type FollowPageProps = {
  searchParams?: Promise<{ src?: string }>;
};

export default async function FollowRoute({ searchParams }: FollowPageProps) {
  const query = await searchParams;
  const srcCampaign = getActiveCampaign(query?.src);
  const cookieCampaignSlug = await getFirstTouchCampaignSlugFromCookies();
  const campaignSlug = srcCampaign?.slug ?? cookieCampaignSlug;

  if (campaignSlug) {
    const cookieStore = await cookies();
    const alreadyLogged =
      resolveActiveCampaignSlug(cookieStore.get(FOLLOW_TOUCH_COOKIE_NAME)?.value) ===
      campaignSlug;
    if (!alreadyLogged) {
      const headerStore = await headers();
      await recordCampaignVisit({
        slug: campaignSlug,
        kind: CampaignVisitKind.FOLLOW,
        destination: "/follow",
        userAgent: headerStore.get("user-agent")
      });
    }
  }

  return <FollowPage socialLinks={getFollowPageSocialLinks()} />;
}
