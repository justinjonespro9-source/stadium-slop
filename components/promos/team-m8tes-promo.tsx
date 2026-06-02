import Image from "next/image";
import Link from "next/link";

import type { ActiveAd } from "@/lib/ads";
import {
  resolveTeamM8tesCtaHref,
  TEAM_M8TES_PROMO,
  type TeamM8tesPromoVariant
} from "@/lib/team-m8tes-promo";

type TeamM8tesPromoProps = {
  ad?: Pick<ActiveAd, "ctaHref"> | null;
  variant?: TeamM8tesPromoVariant;
  className?: string;
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function TeamM8tesPromo({
  ad,
  variant = "banner",
  className
}: TeamM8tesPromoProps) {
  const ctaHref = resolveTeamM8tesCtaHref(ad);
  const external = isExternalHref(ctaHref);
  const isInline = variant === "inline";

  const inner = (
    <article
      className={[
        "media-m8tes-featured",
        isInline ? "media-m8tes-featured--inline" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      role="complementary"
      aria-label={TEAM_M8TES_PROMO.ariaLabel}
    >
      <div className="media-m8tes-featured__bg" aria-hidden>
        <Image
          src={TEAM_M8TES_PROMO.imageSrc}
          alt=""
          fill
          className="media-m8tes-featured__bg-image"
          sizes={
            isInline
              ? "(max-width: 640px) 100vw, 640px"
              : "(max-width: 640px) 100vw, 1152px"
          }
          priority={false}
        />
        <div className="media-m8tes-featured__overlay" />
        <div className="media-m8tes-featured__vignette" />
      </div>

      <div className="media-m8tes-featured__body">
        <p className="media-m8tes-featured__eyebrow">
          <span>{TEAM_M8TES_PROMO.eyebrowLabel}</span>
          <span className="media-m8tes-featured__eyebrow-dot" aria-hidden>
            {" "}
            ·{" "}
          </span>
          <span className="media-m8tes-featured__eyebrow-brand">
            {TEAM_M8TES_PROMO.sponsorName}
          </span>
        </p>
        <h2 className="media-m8tes-featured__title">{TEAM_M8TES_PROMO.headline}</h2>
        <p className="media-m8tes-featured__copy">{TEAM_M8TES_PROMO.subcopy}</p>
        <span className="media-m8tes-featured__cta">{TEAM_M8TES_PROMO.ctaLabel}</span>
      </div>
    </article>
  );

  return (
    <Link
      href={ctaHref}
      className="group block transition duration-200 hover:opacity-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c084fc]"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </Link>
  );
}
