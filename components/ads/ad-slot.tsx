import Image from "next/image";
import Link from "next/link";

import { getActiveAdForPlacement, type ActiveAd } from "@/lib/ads";

export type AdSlotVariant = "banner" | "card" | "inline";

type AdSlotProps = {
  placementKey: string;
  className?: string;
  variant?: AdSlotVariant;
  /** Defaults to "Partner Spotlight" */
  label?: string;
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function AdSlotInner({
  ad,
  variant,
  className,
  label
}: {
  ad: ActiveAd;
  variant: AdSlotVariant;
  className?: string;
  label: string;
}) {
  const ctaHref = ad.ctaHref?.trim();
  const showCta = Boolean(ctaHref && ad.ctaLabel?.trim());

  const shellClass =
    variant === "banner"
      ? "brand-panel rounded-2xl border border-[var(--slop-line-strong)] p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5"
      : variant === "inline"
        ? "rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.45)] px-3 py-2.5 sm:px-4"
        : "brand-card rounded-2xl border border-[var(--slop-line-strong)] p-4 sm:p-5";

  const content = (
    <div
      className={[shellClass, className].filter(Boolean).join(" ")}
      role="complementary"
      aria-label={`${label}: ${ad.sponsorName ?? ad.title}`}
    >
      <div className={variant === "banner" ? "min-w-0 flex-1" : "min-w-0"}>
        <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--slop-cream-dim)]">
          {label}
          {ad.sponsorName ? (
            <span className="text-[var(--slop-gold-dim)]"> · {ad.sponsorName}</span>
          ) : null}
        </p>
        <div
          className={
            ad.imageUrl && variant !== "inline"
              ? "mt-2 flex gap-3 sm:gap-4"
              : "mt-1.5"
          }
        >
          {ad.imageUrl ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] sm:h-16 sm:w-16">
              <Image
                src={ad.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={isExternalHref(ad.imageUrl)}
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p
              className={
                variant === "inline"
                  ? "text-sm font-black leading-snug text-[var(--slop-cream)]"
                  : "text-base font-black leading-snug text-[var(--slop-cream)] sm:text-lg"
              }
            >
              {ad.title}
            </p>
            {ad.body ? (
              <p
                className={
                  variant === "inline"
                    ? "mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--slop-cream-muted)]"
                    : "mt-1 text-sm leading-relaxed text-[var(--slop-cream-muted)]"
                }
              >
                {ad.body}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {showCta && ctaHref ? (
        <div
          className={
            variant === "banner"
              ? "mt-3 shrink-0 sm:mt-0"
              : variant === "inline"
                ? "mt-2"
                : "mt-4"
          }
        >
          <span
            className={
              variant === "inline"
                ? "text-xs font-bold text-[var(--slop-gold-dim)] transition group-hover:text-[var(--slop-gold-bright)]"
                : "brand-cta-secondary inline-flex rounded-full px-4 py-2 text-xs font-black sm:text-sm"
            }
          >
            {ad.ctaLabel}
          </span>
        </div>
      ) : null}
    </div>
  );

  if (showCta && ctaHref) {
    const external = isExternalHref(ctaHref);
    return (
      <Link
        href={ctaHref}
        className="group block transition hover:opacity-[0.98]"
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {content}
      </Link>
    );
  }

  return content;
}

export async function AdSlot({
  placementKey,
  className,
  variant = "card",
  label = "Partner Spotlight"
}: AdSlotProps) {
  const ad = await getActiveAdForPlacement(placementKey);
  if (!ad) {
    return null;
  }

  return (
    <AdSlotInner ad={ad} variant={variant} className={className} label={label} />
  );
}
