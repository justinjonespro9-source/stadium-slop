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

const PARTNER_VALUE_COPY =
  "Drive fans to tickets, merch, offers, and official social channels.";

type VenuePartnerCardProps = {
  venueName: string;
  venueSlug: string;
  partner: VenuePartnerConfig;
  className?: string;
  /** Pin the card while scrolling the standings column (desktop sidebar). */
  sticky?: boolean;
};

function PartnerBadge({ tone = "card" }: { tone?: "card" | "hero" | "activation" }) {
  if (tone === "hero") {
    return (
      <span className="venue-partner-card__badge venue-partner-card__badge--hero mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--media-orange-bright)] backdrop-blur-sm sm:text-[0.62rem]">
        <span aria-hidden className="size-1.5 rounded-full bg-[var(--media-orange-bright)]" />
        Founding venue partner
      </span>
    );
  }

  if (tone === "activation") {
    return (
      <span className="venue-partner-card__badge venue-partner-card__badge--activation inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.56rem] font-black uppercase tracking-[0.14em] text-[var(--media-orange-bright)] backdrop-blur-sm">
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

function ConfiguredPartnerHero({
  partnerName,
  logoUrl,
  eyebrow,
  showBadge,
  xUrl,
  instagramUrl,
  xLabel,
  instagramLabel
}: {
  partnerName: string;
  logoUrl?: string;
  eyebrow: string;
  showBadge: boolean;
  xUrl: string | null;
  instagramUrl: string | null;
  xLabel: string | null;
  instagramLabel: string | null;
}) {
  const hasSocial = Boolean(xUrl || instagramUrl);

  return (
    <div className="venue-partner-card__hero relative overflow-hidden">
      <div
        className="venue-partner-card__hero-bg absolute inset-0 bg-[linear-gradient(165deg,#121a28_0%,#0a1018_55%,#060a10_100%)]"
        aria-hidden
      />
      <div
        className="venue-partner-card__hero-glow absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(255,107,26,0.28), transparent 58%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(255,255,255,0.05), transparent 50%)"
        }}
        aria-hidden
      />

      <div className="venue-partner-card__hero-body relative flex min-h-[9.5rem] flex-col items-center justify-center px-4 pb-4 pt-5 text-center sm:min-h-[10.5rem] lg:min-h-[11.5rem] lg:px-5 lg:pb-5 lg:pt-6">
        {logoUrl ? (
          <div className="venue-partner-card__hero-logo relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:h-20 sm:w-20 lg:h-[5.5rem] lg:w-[5.5rem]">
            <Image
              src={logoUrl}
              alt=""
              fill
              className="object-contain p-2.5 sm:p-3"
              sizes="(max-width: 1023px) 72px, 88px"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="venue-partner-card__hero-monogram flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl border border-white/15 bg-[linear-gradient(145deg,rgba(255,107,26,0.95)_0%,rgba(220,82,12,0.98)_100%)] text-xl font-black tracking-[0.06em] text-white shadow-[0_12px_32px_rgba(255,107,26,0.28)] sm:h-20 sm:w-20 sm:text-2xl lg:h-[5.75rem] lg:w-[5.75rem] lg:text-[1.65rem]"
            aria-hidden
          >
            {partnerInitials(partnerName)}
          </div>
        )}

        <div className="mt-4 w-full min-w-0">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-white/55 sm:text-[0.6rem]">
            {eyebrow}
          </p>
          <h2 className="venue-partner-card__headline mt-1.5 text-lg font-black leading-tight tracking-tight text-white sm:text-xl lg:text-[1.35rem]">
            {partnerName}
          </h2>
          {showBadge ? (
            <div className="mt-2.5 flex justify-center">
              <PartnerBadge tone="activation" />
            </div>
          ) : null}
          {hasSocial ? (
            <div className="venue-partner-card__social venue-partner-card__social--hero mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.65rem] font-bold text-white/55">
              {xUrl && xLabel ? (
                <Link
                  href={xUrl}
                  className="transition hover:text-[var(--media-orange-bright)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {xLabel}
                </Link>
              ) : null}
              {xUrl && instagramUrl ? (
                <span aria-hidden className="text-white/30">
                  ·
                </span>
              ) : null}
              {instagramUrl && instagramLabel ? (
                <Link
                  href={instagramUrl}
                  className="transition hover:text-[var(--media-orange-bright)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {instagramLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
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

  if (!configured) {
    const cardClassName = [
      "venue-partner-card",
      "media-panel-card",
      "media-panel-card--accent",
      "venue-partner-card--demo",
      "border p-4 sm:p-5",
      sticky ? "venue-partner-card--sidebar lg:sticky lg:top-24" : "",
      className
    ]
      .filter(Boolean)
      .join(" ");

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
  const partnerCta = partner.partnerCtaText?.trim() || "Visit site";
  const ticketsUrl = partner.ticketsUrl?.trim();
  const teamShopUrl = partner.teamShopUrl?.trim();
  const xUrl = formatXProfileUrl(partner.xHandle);
  const instagramUrl = formatInstagramProfileUrl(partner.instagramHandle);
  const xLabel = formatSocialHandle(partner.xHandle);
  const instagramLabel = formatSocialHandle(partner.instagramHandle);

  const primaryLink = ticketsUrl
    ? { href: ticketsUrl, label: "Get tickets" }
    : partnerUrl
      ? { href: partnerUrl, label: partnerCta }
      : null;

  const secondaryLinks: { href: string; label: string }[] = [];
  if (ticketsUrl && partnerUrl) {
    secondaryLinks.push({ href: partnerUrl, label: partnerCta });
  }
  if (teamShopUrl) {
    secondaryLinks.push({ href: teamShopUrl, label: "Team shop" });
  }

  const eyebrow = showBadge ? "Founding venue partner" : "Venue partner";

  const cardClassName = [
    "venue-partner-card",
    "venue-partner-card--live",
    "venue-partner-card--activation",
    "overflow-hidden border",
    sticky ? "venue-partner-card--sidebar lg:sticky lg:top-24" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={cardClassName} aria-label={`${partnerName} partner card`}>
      <ConfiguredPartnerHero
        partnerName={partnerName}
        logoUrl={logoUrl}
        eyebrow={eyebrow}
        showBadge={showBadge}
        xUrl={xUrl}
        instagramUrl={instagramUrl}
        xLabel={xLabel}
        instagramLabel={instagramLabel}
      />

      {primaryLink || secondaryLinks.length > 0 ? (
        <div className="venue-partner-card__actions space-y-2.5 bg-[var(--media-white)] p-4 sm:p-5">
          {primaryLink ? (
            <PartnerLink href={primaryLink.href} variant="primary">
              {primaryLink.label}
            </PartnerLink>
          ) : null}
          {secondaryLinks.length > 0 ? (
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
