import Image from "next/image";
import Link from "next/link";

import { TeamM8tesPromo } from "@/components/promos/team-m8tes-promo";
import { getActiveAdForPlacement, type ActiveAd } from "@/lib/ads";
import { isTeamM8tesAd } from "@/lib/team-m8tes-promo";

export type AdSlotVariant = "banner" | "card" | "inline";

type AdSlotProps = {
  placementKey: string;
  className?: string;
  variant?: AdSlotVariant;
  /** Defaults to "Partner Spotlight" */
  label?: string;
  /** Light homepage sponsor styling */
  tone?: "default" | "media";
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function isLocalAssetPath(src: string): boolean {
  return src.startsWith("/");
}

function AdLabel({
  label,
  sponsorName
}: {
  label: string;
  sponsorName?: string | null;
}) {
  return (
    <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--slop-cream-dim)]">
      {label}
      {sponsorName ? (
        <span className="text-[var(--slop-gold-dim)]"> · {sponsorName}</span>
      ) : null}
    </p>
  );
}

function MediaBannerAd({
  ad,
  className,
  label
}: {
  ad: ActiveAd;
  className?: string;
  label: string;
}) {
  if (isTeamM8tesAd(ad)) {
    return <TeamM8tesPromo ad={ad} variant="banner" className={className} />;
  }
  const ctaHref = ad.ctaHref?.trim();
  const showCta = Boolean(ctaHref && ad.ctaLabel?.trim());
  const imageSrc = ad.imageUrl?.trim() ?? "";

  const inner = (
    <article
      className={["media-sponsor-banner relative", className].filter(Boolean).join(" ")}
      role="complementary"
      aria-label={`${label}: ${ad.sponsorName ?? ad.title}`}
    >
      {imageSrc ? (
        <div className="media-sponsor-banner__image">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, 1152px"
            unoptimized={!isLocalAssetPath(imageSrc)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,13,20,0.95)] via-[rgba(8,13,20,0.5)] to-transparent sm:bg-gradient-to-r sm:from-[rgba(8,13,20,0.92)] sm:via-[rgba(8,13,20,0.65)] sm:to-transparent" />
        </div>
      ) : null}
      <div className="media-sponsor-banner__body">
        <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-white/70">
          {label}
          {ad.sponsorName ? (
            <span className="text-[var(--media-orange-bright)]"> · {ad.sponsorName}</span>
          ) : null}
        </p>
        <div>
          <p className="media-sponsor-banner__title">{ad.title}</p>
          {ad.body ? (
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-white/85 sm:text-[0.9375rem]">
              {ad.body}
            </p>
          ) : null}
        </div>
        {showCta ? (
          <span className="media-primary-button inline-flex w-fit px-4 py-2.5 text-xs sm:text-sm">
            {ad.ctaLabel}
          </span>
        ) : null}
      </div>
    </article>
  );

  if (showCta && ctaHref) {
    const external = isExternalHref(ctaHref);
    return (
      <Link
        href={ctaHref}
        className="group block transition hover:opacity-[0.98]"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

function BannerAd({
  ad,
  className,
  label
}: {
  ad: ActiveAd;
  className?: string;
  label: string;
}) {
  if (isTeamM8tesAd(ad)) {
    return <TeamM8tesPromo ad={ad} variant="banner" className={className} />;
  }
  const ctaHref = ad.ctaHref?.trim();
  const showCta = Boolean(ctaHref && ad.ctaLabel?.trim());
  const hasImage = Boolean(ad.imageUrl?.trim());
  const imageSrc = ad.imageUrl?.trim() ?? "";

  const inner = (
    <article
      className={[
        "relative overflow-hidden rounded-2xl border border-[var(--slop-line-strong)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      role="complementary"
      aria-label={`${label}: ${ad.sponsorName ?? ad.title}`}
    >
      {hasImage ? (
        <>
          <div
            className="relative h-36 w-full bg-[var(--slop-navy-deep)] sm:absolute sm:inset-0 sm:h-full sm:min-h-[9.5rem]"
            aria-hidden
          >
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, 1152px"
              priority={false}
              unoptimized={!isLocalAssetPath(imageSrc)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,15,24,0.92)] via-[rgba(6,15,24,0.55)] to-[rgba(6,15,24,0.35)] sm:bg-gradient-to-r sm:from-[rgba(6,15,24,0.94)] sm:via-[rgba(6,15,24,0.72)] sm:to-[rgba(6,15,24,0.25)]" />
          </div>
          <div className="relative flex flex-col gap-3 p-4 sm:min-h-[9.5rem] sm:max-w-[62%] sm:justify-center sm:p-6 sm:pl-8">
            <AdLabel label={label} sponsorName={ad.sponsorName} />
            <div>
              <p className="text-lg font-black leading-tight text-[var(--slop-cream)] sm:text-2xl">
                {ad.title}
              </p>
              {ad.body ? (
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-[var(--slop-cream-muted)] sm:text-[0.95rem]">
                  {ad.body}
                </p>
              ) : null}
            </div>
            {showCta ? (
              <span className="brand-cta inline-flex w-fit rounded-full px-5 py-2.5 text-xs font-black sm:text-sm">
                {ad.ctaLabel}
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <div className="brand-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="min-w-0 flex-1">
            <AdLabel label={label} sponsorName={ad.sponsorName} />
            <p className="mt-1.5 text-lg font-black text-[var(--slop-cream)] sm:text-xl">
              {ad.title}
            </p>
            {ad.body ? (
              <p className="mt-1 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
                {ad.body}
              </p>
            ) : null}
          </div>
          {showCta ? (
            <span className="brand-cta-secondary inline-flex shrink-0 rounded-full px-4 py-2 text-xs font-black sm:text-sm">
              {ad.ctaLabel}
            </span>
          ) : null}
        </div>
      )}
    </article>
  );

  if (showCta && ctaHref) {
    const external = isExternalHref(ctaHref);
    return (
      <Link
        href={ctaHref}
        className="group block transition hover:opacity-[0.98]"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

function CardAd({
  ad,
  className,
  label,
  tone = "default"
}: {
  ad: ActiveAd;
  className?: string;
  label: string;
  tone?: "default" | "media";
}) {
  if (isTeamM8tesAd(ad)) {
    return <TeamM8tesPromo ad={ad} variant="banner" className={className} />;
  }
  const ctaHref = ad.ctaHref?.trim();
  const showCta = Boolean(ctaHref && ad.ctaLabel?.trim());
  const hasImage = Boolean(ad.imageUrl?.trim());
  const isMedia = tone === "media";

  const shell = (
    <article
      className={[
        "relative overflow-hidden rounded-2xl",
        isMedia
          ? "media-panel-card border"
          : "border border-[var(--slop-line-strong)]",
        hasImage ? "min-h-[7.5rem]" : isMedia ? "p-4 sm:p-5" : "brand-card p-4 sm:p-5",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      role="complementary"
      aria-label={`${label}: ${ad.sponsorName ?? ad.title}`}
    >
      {hasImage && ad.imageUrl ? (
        <>
          <Image
            src={ad.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="400px"
            unoptimized={!isLocalAssetPath(ad.imageUrl)}
          />
          <div
            className={
              isMedia
                ? "absolute inset-0 bg-gradient-to-t from-[rgba(8,13,20,0.92)] via-[rgba(8,13,20,0.55)] to-transparent"
                : "absolute inset-0 bg-gradient-to-t from-[rgba(6,15,24,0.95)] via-[rgba(6,15,24,0.7)] to-[rgba(6,15,24,0.4)]"
            }
          />
        </>
      ) : null}
      <div className={hasImage ? "relative flex h-full min-h-[7.5rem] flex-col justify-end p-4" : ""}>
        {isMedia ? (
          <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--media-orange-deep)]">
            {label}
            {ad.sponsorName ? <span> · {ad.sponsorName}</span> : null}
          </p>
        ) : (
          <AdLabel label={label} sponsorName={ad.sponsorName} />
        )}
        <p
          className={`mt-1 text-base font-black leading-snug ${
            isMedia ? "text-white" : "text-[var(--slop-cream)]"
          }`}
        >
          {ad.title}
        </p>
        {ad.body ? (
          <p
            className={`mt-1 line-clamp-2 text-sm ${
              isMedia ? "text-white/85" : "text-[var(--slop-cream-muted)]"
            }`}
          >
            {ad.body}
          </p>
        ) : null}
        {showCta ? (
          <span
            className={
              isMedia
                ? "media-primary-button mt-3 inline-flex w-fit px-4 py-2 text-xs"
                : "brand-cta-secondary mt-3 inline-flex w-fit rounded-full px-4 py-2 text-xs font-black"
            }
          >
            {ad.ctaLabel}
          </span>
        ) : null}
      </div>
    </article>
  );

  if (showCta && ctaHref) {
    const external = isExternalHref(ctaHref);
    return (
      <Link
        href={ctaHref}
        className="group block"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {shell}
      </Link>
    );
  }

  return shell;
}

function InlineAd({
  ad,
  className,
  label
}: {
  ad: ActiveAd;
  className?: string;
  label: string;
}) {
  if (isTeamM8tesAd(ad)) {
    return <TeamM8tesPromo ad={ad} variant="inline" className={className} />;
  }
  const ctaHref = ad.ctaHref?.trim();
  const showCta = Boolean(ctaHref && ad.ctaLabel?.trim());

  const content = (
    <div
      className={[
        "rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.5)] px-3 py-2.5 sm:px-4",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      role="complementary"
      aria-label={`${label}: ${ad.sponsorName ?? ad.title}`}
    >
      <AdLabel label={label} sponsorName={ad.sponsorName} />
      <p className="mt-1 text-sm font-black text-[var(--slop-cream)]">{ad.title}</p>
      {ad.body ? (
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--slop-cream-muted)]">{ad.body}</p>
      ) : null}
      {showCta ? (
        <p className="mt-1.5 text-xs font-bold text-[var(--slop-gold-dim)] group-hover:text-[var(--slop-gold-bright)]">
          {ad.ctaLabel} →
        </p>
      ) : null}
    </div>
  );

  if (showCta && ctaHref) {
    const external = isExternalHref(ctaHref);
    return (
      <Link
        href={ctaHref}
        className="group block"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
  label = "Partner Spotlight",
  tone = "default"
}: AdSlotProps) {
  const ad = await getActiveAdForPlacement(placementKey);
  if (!ad) {
    return null;
  }

  if (variant === "banner") {
    if (tone === "media") {
      return (
        <MediaBannerAd ad={ad} className={className} label={label} />
      );
    }
    return <BannerAd ad={ad} className={className} label={label} />;
  }
  if (variant === "inline") {
    return <InlineAd ad={ad} className={className} label={label} />;
  }
  return <CardAd ad={ad} className={className} label={label} tone={tone} />;
}
