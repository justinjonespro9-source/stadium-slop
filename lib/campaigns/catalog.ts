/**
 * Lightweight campaign registry for QR / social redirects.
 * Catalog lives in code so destinations stay reviewable in git.
 * Visit rows go to Postgres (`CampaignVisit`) and can later move
 * campaign metadata into the database without changing `/go/[slug]`.
 */

export type CampaignProduct = "stadium-slop" | "state-fair-slop";

export type CampaignChannel =
  | "postcard"
  | "founder"
  | "facebook"
  | "instagram"
  | "x"
  | "media"
  | "tiktok"
  | "other";

export type CampaignDefinition = {
  slug: string;
  label: string;
  product: CampaignProduct;
  venueSlug: string | null;
  eventKey: string | null;
  channel: CampaignChannel;
  destinationPath: string;
  active: boolean;
  createdAt: string;
};

const MINNESOTA_STATE_FAIR_PATH = "/venues/minnesota-state-fair";
const MINNESOTA_STATE_FAIR_2026 = "minnesota-state-fair-2026";

function minnesotaFairCampaign(
  slug: string,
  channel: CampaignChannel,
  label: string
): CampaignDefinition {
  return {
    slug,
    label,
    product: "state-fair-slop",
    venueSlug: "minnesota-state-fair",
    eventKey: MINNESOTA_STATE_FAIR_2026,
    channel,
    destinationPath: MINNESOTA_STATE_FAIR_PATH,
    active: true,
    createdAt: "2026-08-23"
  };
}

/** Registered campaigns. Add Target Field, Dodger Stadium, etc. here later. */
export const CAMPAIGN_CATALOG: readonly CampaignDefinition[] = [
  minnesotaFairCampaign("mn-fair-card", "postcard", "MN Fair Postcard"),
  minnesotaFairCampaign("mn-fair-founder", "founder", "MN Fair Founder"),
  minnesotaFairCampaign("mn-fair-facebook", "facebook", "MN Fair Facebook"),
  minnesotaFairCampaign("mn-fair-instagram", "instagram", "MN Fair Instagram"),
  minnesotaFairCampaign("mn-fair-x", "x", "MN Fair X"),
  minnesotaFairCampaign("mn-fair-media", "media", "MN Fair Media")
];

const CAMPAIGN_BY_SLUG = new Map(
  CAMPAIGN_CATALOG.map((campaign) => [campaign.slug, campaign])
);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCampaignSlug(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const slug = raw.trim().toLowerCase();
  if (!slug || slug.length > 64 || !SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

export function getCampaign(slug: string | null | undefined): CampaignDefinition | null {
  const normalized = normalizeCampaignSlug(slug);
  if (!normalized) {
    return null;
  }
  return CAMPAIGN_BY_SLUG.get(normalized) ?? null;
}

export function getActiveCampaign(
  slug: string | null | undefined
): CampaignDefinition | null {
  const campaign = getCampaign(slug);
  return campaign?.active ? campaign : null;
}

export function isActiveCampaignSlug(slug: string | null | undefined): boolean {
  return getActiveCampaign(slug) != null;
}
