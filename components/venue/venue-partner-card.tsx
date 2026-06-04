import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { buildClaimHref } from "@/lib/claim-listing";
import {
  formatInstagramProfileUrl,
  formatXProfileUrl,
  hasVenuePartnerConfigured,
  type VenuePartnerConfig
} from "@/lib/venue-partner";

type VenuePartnerCardProps = {
  venueName: string;
  venueSlug: string;
  partner: VenuePartnerConfig;
  className?: string;
};

function PartnerBadge() {
  return (
    <span className="venue-partner-card__badge inline-flex w-fit rounded-full border border-[rgba(255,107,26,0.45)] bg-[rgba(255,107,26,0.12)] px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--media-orange-deep)]">
      Founding Venue Partner
    </span>
  );
}

function PartnerLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    variant === "primary"
      ? "media-primary-button w-full justify-center text-xs sm:text-sm"
      : "media-cta-outline w-full justify-center text-xs sm:text-sm";

  return (
    <Link
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}

export function VenuePartnerCard({
  venueName,
  venueSlug,
  partner,
  className = ""
}: VenuePartnerCardProps) {
  const configured = hasVenuePartnerConfigured(partner);
  const showBadge = Boolean(partner.foundingVenuePartner);

  if (!configured) {
    return (
      <aside
        className={`venue-partner-card media-panel-card border p-4 sm:p-5 ${className}`.trim()}
        aria-label="Founding Venue Partner placement"
      >
        <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--media-ink-dim)]">
          Partnership
        </p>
        <h2 className="mt-2 text-base font-black leading-snug text-[var(--media-ink)] sm:text-lg">
          Available Founding Venue Partner Placement
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--media-ink-muted)]">
          This spot highlights the home team or venue partner on Stadium Slop — tickets, shop,
          and game-day links included.
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--media-ink-dim)]">
          Demo · SNG Labs
        </p>
        <Link
          href={buildClaimHref({
            kind: "venue",
            venueName,
            venueSlug,
            pagePath: `/venues/${venueSlug}`
          })}
          className="media-cta-outline mt-4 inline-flex w-full justify-center text-xs sm:text-sm"
        >
          Claim this placement
        </Link>
      </aside>
    );
  }

  const partnerName = partner.partnerName?.trim() ?? "";
  const logoUrl = partner.partnerLogoUrl?.trim();
  const partnerUrl = partner.partnerUrl?.trim();
  const partnerCta = partner.partnerCtaText?.trim() || "Visit partner";
  const ticketsUrl = partner.ticketsUrl?.trim();
  const teamShopUrl = partner.teamShopUrl?.trim();
  const xUrl = formatXProfileUrl(partner.xHandle);
  const instagramUrl = formatInstagramProfileUrl(partner.instagramHandle);

  return (
    <aside
      className={`venue-partner-card media-panel-card border p-4 sm:p-5 ${className}`.trim()}
      aria-label={`${partnerName} partner card`}
    >
      {showBadge ? <PartnerBadge /> : null}

      <div className={`flex items-center gap-3 ${showBadge ? "mt-3" : ""}`}>
        {logoUrl ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--media-border)] bg-white">
            <Image
              src={logoUrl}
              alt=""
              fill
              className="object-contain p-1.5"
              sizes="48px"
              unoptimized
            />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--media-ink-dim)]">
            Team partner
          </p>
          <h2 className="mt-1 text-base font-black leading-snug text-[var(--media-ink)] sm:text-lg">
            {partnerName}
          </h2>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {partnerUrl ? (
          <PartnerLink href={partnerUrl}>{partnerCta}</PartnerLink>
        ) : null}
        {ticketsUrl ? (
          <PartnerLink href={ticketsUrl} variant="secondary">
            Get tickets
          </PartnerLink>
        ) : null}
        {teamShopUrl ? (
          <PartnerLink href={teamShopUrl} variant="secondary">
            Team shop
          </PartnerLink>
        ) : null}
      </div>

      {xUrl || instagramUrl ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-bold text-[var(--media-ink-muted)]">
          {xUrl ? (
            <Link
              href={xUrl}
              className="hover:text-[var(--media-orange-deep)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {partner.xHandle?.trim().startsWith("@")
                ? partner.xHandle.trim()
                : `@${partner.xHandle?.trim().replace(/^@+/, "")}`}
            </Link>
          ) : null}
          {instagramUrl ? (
            <Link
              href={instagramUrl}
              className="hover:text-[var(--media-orange-deep)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </Link>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

export function VenuePartnerHeroBadge({ partner }: { partner: VenuePartnerConfig }) {
  if (!partner.foundingVenuePartner) {
    return null;
  }

  return (
    <span className="mt-3 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--media-orange-bright)] backdrop-blur-sm sm:text-[0.62rem]">
      Founding Venue Partner
    </span>
  );
}
