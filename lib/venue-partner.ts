import type { Venue } from "@/lib/sample-data";

/** Venue partner fields stored on `Venue` (Phase 1). */
export type VenuePartnerConfig = {
  partnerName?: string | null;
  partnerLogoUrl?: string | null;
  partnerUrl?: string | null;
  partnerCtaText?: string | null;
  ticketsUrl?: string | null;
  teamShopUrl?: string | null;
  xHandle?: string | null;
  instagramHandle?: string | null;
  primaryHashtag?: string | null;
  foundingVenuePartner?: boolean;
};

export type VenueShareContext = Pick<VenuePartnerConfig, "xHandle" | "primaryHashtag">;

export function hasVenuePartnerConfigured(config: VenuePartnerConfig): boolean {
  return Boolean(config.partnerName?.trim());
}

export function venuePartnerFromVenue(venue: Venue): VenuePartnerConfig {
  return {
    partnerName: venue.partnerName,
    partnerLogoUrl: venue.partnerLogoUrl,
    partnerUrl: venue.partnerUrl,
    partnerCtaText: venue.partnerCtaText,
    ticketsUrl: venue.ticketsUrl,
    teamShopUrl: venue.teamShopUrl,
    xHandle: venue.xHandle,
    instagramHandle: venue.instagramHandle,
    primaryHashtag: venue.primaryHashtag,
    foundingVenuePartner: venue.foundingVenuePartner
  };
}

export function venueShareContextFromPartner(
  config?: VenuePartnerConfig | null
): VenueShareContext | undefined {
  if (!config) {
    return undefined;
  }
  const xHandle = config.xHandle?.trim();
  const primaryHashtag = config.primaryHashtag?.trim();
  if (!xHandle && !primaryHashtag) {
    return undefined;
  }
  return { xHandle, primaryHashtag };
}

function normalizeXHandle(raw?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }
  const handle = trimmed.replace(/^@+/, "");
  return handle ? `@${handle}` : null;
}

function normalizeHashtag(raw?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }
  const tag = trimmed.replace(/^#+/, "");
  return tag ? `#${tag}` : null;
}

/** Share suffix for scorecards — venue @handle + #tag when both set, else #StadiumSlop. */
export function formatVenueShareSocialSuffix(
  config?: VenuePartnerConfig | VenueShareContext | null
): string {
  const handle = normalizeXHandle(config?.xHandle);
  const tag = normalizeHashtag(config?.primaryHashtag);
  if (handle && tag) {
    return `${handle} ${tag}`;
  }
  return "#StadiumSlop";
}

export function formatInstagramProfileUrl(handle?: string | null): string | null {
  const trimmed = handle?.trim().replace(/^@+/, "");
  if (!trimmed) {
    return null;
  }
  return `https://instagram.com/${encodeURIComponent(trimmed)}`;
}

export function formatXProfileUrl(handle?: string | null): string | null {
  const trimmed = handle?.trim().replace(/^@+/, "");
  if (!trimmed) {
    return null;
  }
  return `https://x.com/${encodeURIComponent(trimmed)}`;
}
