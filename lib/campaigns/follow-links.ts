import { SITE_SOCIAL_LINKS, type SiteSocialLink } from "@/lib/site-contact";

export const FACEBOOK_URL_ENV = "NEXT_PUBLIC_STADIUM_SLOP_FACEBOOK_URL";

const FOLLOW_LINK_IDS = ["instagram", "x", "tiktok", "youtube"] as const;

export type FollowSocialLink = SiteSocialLink & {
  id: (typeof FOLLOW_LINK_IDS)[number] | "facebook";
};

function readConfiguredFacebookUrl(
  env: NodeJS.ProcessEnv = process.env
): string | null {
  const raw = env[FACEBOOK_URL_ENV]?.trim() ?? "";
  if (!raw) {
    return null;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") {
      return null;
    }
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "facebook.com" && host !== "fb.com" && host !== "m.facebook.com") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function isLiveLink(link: SiteSocialLink): boolean {
  return !link.isPlaceholder && (link.href.startsWith("https://") || link.href.startsWith("http://"));
}

/** Consumer follow targets that exist in site-contact, plus optional Facebook env. */
export function getFollowPageSocialLinks(
  env: NodeJS.ProcessEnv = process.env
): FollowSocialLink[] {
  const byId = new Map(SITE_SOCIAL_LINKS.map((link) => [link.id, link]));
  const links: FollowSocialLink[] = [];

  for (const id of FOLLOW_LINK_IDS) {
    const link = byId.get(id);
    if (link && isLiveLink(link)) {
      links.push({ ...link, id });
    }
  }

  const facebookUrl = readConfiguredFacebookUrl(env);
  if (facebookUrl) {
    const facebookIndex = Math.min(2, links.length);
    links.splice(facebookIndex, 0, {
      id: "facebook",
      label: "Facebook",
      href: facebookUrl,
      isPlaceholder: false
    });
  }

  return links;
}
