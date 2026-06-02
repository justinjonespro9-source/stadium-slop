import { TEAM_M8TES_FANDOM_FILTER } from "@/lib/media-assets";

/** Canonical Team-M8tes promo copy and assets — homepage is source of truth. */
export const TEAM_M8TES_PROMO = {
  sponsorName: "Team-M8tes",
  eyebrowLabel: "Sponsored",
  headline: "Fandom is the filter.",
  subcopy: "Meet sports fans who already speak your language.",
  ctaLabel: "Join Team-M8tes",
  ctaHref: "https://team-m8tes.com",
  imageSrc: TEAM_M8TES_FANDOM_FILTER,
  ariaLabel: "Sponsored: Team-M8tes — Fandom is the filter."
} as const;

export type TeamM8tesPromoVariant = "banner" | "inline";

type TeamM8tesAdLike = {
  sponsorName?: string | null;
  ctaHref?: string | null;
};

export function isTeamM8tesAd(ad: TeamM8tesAdLike): boolean {
  return (
    /team-m8tes/i.test(ad.sponsorName ?? "") ||
    /team-m8tes\.com/i.test(ad.ctaHref ?? "")
  );
}

export function resolveTeamM8tesCtaHref(ad?: TeamM8tesAdLike | null): string {
  const href = ad?.ctaHref?.trim();
  return href || TEAM_M8TES_PROMO.ctaHref;
}

/** DB seed fields aligned with the featured promo panel. */
export function teamM8tesSeedFields(includeImage = false) {
  return {
    title: TEAM_M8TES_PROMO.headline,
    body: TEAM_M8TES_PROMO.subcopy,
    ctaLabel: TEAM_M8TES_PROMO.ctaLabel,
    ctaHref: TEAM_M8TES_PROMO.ctaHref,
    sponsorName: TEAM_M8TES_PROMO.sponsorName,
    ...(includeImage ? { imageUrl: TEAM_M8TES_PROMO.imageSrc } : {})
  };
}

/** Static fallback fields (includes explicit null imageUrl when omitted). */
export function teamM8tesAdFields(options?: { includeImage?: boolean }) {
  return {
    ...teamM8tesSeedFields(Boolean(options?.includeImage)),
    imageUrl: options?.includeImage ? TEAM_M8TES_PROMO.imageSrc : null
  };
}
