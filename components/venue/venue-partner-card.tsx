import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { buildClaimHref } from "@/lib/claim-listing";
import {
  formatInstagramProfileUrl,
  formatXProfileUrl,
  hasVenuePartnerConfigured,
  hasVenueShareSocialConfigured,
  type VenuePartnerConfig
} from "@/lib/venue-partner";

const PARTNER_VALUE_COPY =
  "Drive fans to tickets, merch, offers, and official social channels.";

const SHARE_NOTE_COPY = "Scorecard shares include team handle and hashtag.";

type VenuePartnerCardProps = {
  venueName: string;
  venueSlug: string;
  partner: VenuePartnerConfig;
  className?: string;
  /** Pin the card while scrolling the standings column (desktop sidebar). */
  sticky?: boolean;
};

function PartnerBadge({ tone = "card" }: { tone?: "card" | "hero" }) {
  if (tone === "hero") {
    return (
      <span className="venue-partner-card__badge venue-partner-card__badge--hero mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--media-orange-bright)] backdrop-blur-sm sm:text-[0.62rem]">
        <span aria-hidden className="size-1.5 rounded-full bg-[var(--media-orange-bright)]" />
        Founding venue partner
      </span>
    );
  }

  return (
    <span className="venue-partner-card__badge inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(255,107,26,0.45)] bg-[rgba(255,107,26,0.12)] px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--media-orange-deep)]">
      <span aria-hidden className="size-1.5 rounded-full bg-[var(--media-orange-deep)]" />
      Founding venue partner
    </span>
  );
}

function PartnerValueProp({ className = "" }: { className?: string }) {
  return (
    <p
      className={`venue-partner-card__value text-sm leading-relaxed text-[var(--media-ink-muted)] ${className}`.trim()}
    >
      {PARTNER_VALUE_COPY}
    </p>
  );
}

function PartnerShareNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`venue-partner-card__share-note text-[0.65rem] leading-snug text-[var(--media-ink-dim)] ${className}`.trim()}
    >
      {SHARE_NOTE_COPY}
    </p>
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
      ? "venue-partner-card__cta venue-partner-card__cta--primary media-primary-button w-full justify-center text-xs sm:text-sm"
      : "venue-partner-card__cta venue-partner-card__cta--secondary media-cta-outline w-full justify-center text-xs sm:text-sm";

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

function partnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function formatSocialHandle(raw?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.startsWith("@") ? trimmed : `@${trimmed.replace(/^@+/, "")}`;
}

export function VenuePartnerCard({
  venueName,
  venueSlug,
  partner,
  className = "",
  sticky = false
}: VenuePartnerCardProps) {
  const configured = hasVenuePartnerConfigured(partner);
  const showBadge = Boolean(partner.foundingVenuePartner);
  const showShareNote = hasVenueShareSocialConfigured(partner);
  const cardClassName = [
    "venue-partner-card",
    "media-panel-card",
    configured && showBadge ? "media-panel-card--accent venue-partner-card--configured" : "",
    !configured ? "media-panel-card--accent venue-partner-card--demo" : "",
    configured ? "venue-partner-card--live" : "",
    "border p-4 sm:p-5",
    sticky ? "venue-partner-card--sidebar lg:sticky lg:top-24" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (!configured) {
    return (
      <aside className={cardClassName} aria-label="Founding venue partner placement preview">
        <p className="venue-partner-card__eyebrow text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--media-orange-deep)]">
          Founding venue partner
        </p>
        <div className="mt-3 flex items-start gap-3">
          <div
            className="venue-partner-card__logo venue-partner-card__logo--demo flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[rgba(255,107,26,0.35)] bg-[rgba(255,107,26,0.06)] text-xs font-black uppercase tracking-[0.08em] text-[var(--media-orange-deep)] lg:h-16 lg:w-16 lg:text-sm"
            aria-hidden
          >
            SNG
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="venue-partner-card__headline text-base font-black leading-snug text-[var(--media-ink)] sm:text-[1.05rem]">
              Your team belongs here
            </h2>
            <PartnerValueProp className="mt-1.5" />
            <p className="mt-2 text-xs leading-relaxed text-[var(--media-ink-muted)] lg:text-sm">
              Premium sidebar placement on {venueName} — logo, links, and social handles fans see
              while browsing menus and scorecards.
            </p>
          </div>
        </div>
        <ul className="venue-partner-card__demo-features mt-3 grid gap-1.5 text-[0.6875rem] font-bold text-[var(--media-ink-muted)] lg:mt-4 lg:grid-cols-2 lg:gap-x-3 lg:gap-y-1.5 lg:text-xs">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-1 rounded-full bg-[var(--media-orange-deep)]" />
            Ticket CTAs
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-1 rounded-full bg-[var(--media-orange-deep)]" />
            Team shop links
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-1 rounded-full bg-[var(--media-orange-deep)]" />
            Partner offers
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-1 rounded-full bg-[var(--media-orange-deep)]" />
            Share handle + hashtag
          </li>
        </ul>
        <p className="venue-partner-card__demo-label mt-3 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--media-ink-dim)] lg:mt-4">
          Preview · SNG Labs
        </p>
        <Link
          href={buildClaimHref({
            kind: "venue",
            venueName,
            venueSlug,
            pagePath: `/venues/${venueSlug}`
          })}
          className="venue-partner-card__cta venue-partner-card__cta--secondary media-cta-outline mt-4 inline-flex w-full justify-center text-xs sm:text-sm"
        >
          Claim this placement
          <span aria-hidden className="ml-1">
            →
          </span>
        </Link>
      </aside>
    );
  }

  const partnerName = partner.partnerName?.trim() ?? "";
  const logoUrl = partner.partnerLogoUrl?.trim();
  const partnerUrl = partner.partnerUrl?.trim();
  const partnerCta = partner.partnerCtaText?.trim() || "Official site";
  const ticketsUrl = partner.ticketsUrl?.trim();
  const teamShopUrl = partner.teamShopUrl?.trim();
  const xUrl = formatXProfileUrl(partner.xHandle);
  const instagramUrl = formatInstagramProfileUrl(partner.instagramHandle);
  const xLabel = formatSocialHandle(partner.xHandle);
  const instagramLabel = formatSocialHandle(partner.instagramHandle);

  const primaryLink = ticketsUrl
    ? { href: ticketsUrl, label: "Get tickets", variant: "primary" as const }
    : partnerUrl
      ? { href: partnerUrl, label: partnerCta, variant: "primary" as const }
      : null;

  const secondaryLinks: { href: string; label: string }[] = [];
  if (ticketsUrl && partnerUrl) {
    secondaryLinks.push({ href: partnerUrl, label: partnerCta });
  }
  if (teamShopUrl) {
    secondaryLinks.push({ href: teamShopUrl, label: "Team shop" });
  }

  const eyebrow = showBadge ? "Founding venue partner" : "Venue partner";

  return (
    <aside className={cardClassName} aria-label={`${partnerName} partner card`}>
      {showBadge ? <PartnerBadge /> : null}

      <div className={`flex items-center gap-3 ${showBadge ? "mt-3" : ""}`}>
        {logoUrl ? (
          <div className="venue-partner-card__logo relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--media-border)] bg-white shadow-sm lg:h-16 lg:w-16">
            <Image
              src={logoUrl}
              alt=""
              fill
              className="object-contain p-2"
              sizes="(max-width: 1023px) 56px, 64px"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="venue-partner-card__logo venue-partner-card__logo--initials flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--media-border)] bg-white text-sm font-black text-[var(--media-orange-deep)] shadow-sm lg:h-16 lg:w-16 lg:text-base"
            aria-hidden
          >
            {partnerInitials(partnerName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="venue-partner-card__eyebrow text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--media-ink-dim)]">
            {eyebrow}
          </p>
          <h2 className="venue-partner-card__headline mt-1 text-base font-black leading-snug text-[var(--media-ink)] sm:text-[1.05rem]">
            {partnerName}
          </h2>
        </div>
      </div>

      <PartnerValueProp className="mt-3 lg:mt-4" />
      {showShareNote ? <PartnerShareNote className="mt-2" /> : null}

      {primaryLink || secondaryLinks.length > 0 ? (
        <div className="mt-4 space-y-2.5 lg:mt-5">
          {primaryLink ? (
            <PartnerLink href={primaryLink.href} variant={primaryLink.variant}>
              {primaryLink.label}
            </PartnerLink>
          ) : null}
          {secondaryLinks.length > 0 ? (
            <div>
              <p className="venue-partner-card__links-label mb-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--media-ink-dim)]">
                Game day
              </p>
              <div
                className={
                  secondaryLinks.length > 1
                    ? "grid grid-cols-2 gap-2"
                    : "grid gap-2"
                }
              >
                {secondaryLinks.map((link) => (
                  <PartnerLink key={link.href} href={link.href} variant="secondary">
                    {link.label}
                  </PartnerLink>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {xUrl || instagramUrl ? (
        <div className="venue-partner-card__social mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--media-border)] pt-3 text-[0.7rem] font-bold text-[var(--media-ink-muted)] lg:mt-4 lg:pt-4">
          {xUrl && xLabel ? (
            <Link
              href={xUrl}
              className="hover:text-[var(--media-orange-deep)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {xLabel}
            </Link>
          ) : null}
          {xUrl && instagramUrl ? (
            <span aria-hidden className="text-[var(--media-ink-dim)]">
              ·
            </span>
          ) : null}
          {instagramUrl && instagramLabel ? (
            <Link
              href={instagramUrl}
              className="hover:text-[var(--media-orange-deep)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {instagramLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

export function VenuePartnerHeroBadge({ partner }: { partner: VenuePartnerConfig }) {
  if (!partner.foundingVenuePartner || !hasVenuePartnerConfigured(partner)) {
    return null;
  }

  return <PartnerBadge tone="hero" />;
}
