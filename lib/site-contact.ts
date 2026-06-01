/** Public contact + social — single place to update handles and inbox. */

export const SITE_CONTACT_EMAIL = "hello@stadiumslop.com";

export type SiteSocialLink = {
  id: string;
  label: string;
  href: string;
  /** Shown in footer when handle is still a placeholder */
  isPlaceholder?: boolean;
};

/**
 * Update URLs when official accounts are live.
 */
export const SITE_SOCIAL_LINKS: readonly SiteSocialLink[] = [
  {
    id: "x",
    label: "X",
    href: "https://x.com/StadiumSlop",
    isPlaceholder: false
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/stadiumslop/",
    isPlaceholder: false
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@stadiumslop",
    isPlaceholder: false
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@StadiumSlop",
    isPlaceholder: false
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/sng-labs/?viewAsMember=true",
    isPlaceholder: false
  },
  {
    id: "email",
    label: "Email",
    href: `mailto:${SITE_CONTACT_EMAIL}`,
    isPlaceholder: false
  }
] as const;

export const FOOTER_KICKER = "KNOW THE SCORE BEFORE YOU ORDER";

export const FOOTER_DESCRIPTION =
  "Crowd-powered food rankings for stadiums, fairs, and live-event venues. Find the bites worth the walk, the wait, and the price.";

export const PUBLIC_TRUST_STATEMENT =
  "Stadium Slop is an independent, fan-powered guide. Reviews reflect crowd opinions, not venue, team, league, fair, or event endorsements. Menus, sections, locations, prices, and availability can change by event.";

export const PROMOTED_PLACEMENT_NOTE =
  "Any promoted placements will be clearly labeled.";

export const CLAIM_SUBMISSION_NOTE = `Submissions open a prefilled email to ${SITE_CONTACT_EMAIL}.`;
