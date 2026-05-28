import Image from "next/image";
import Link from "next/link";

import type { ActiveAd } from "@/lib/ads";
import { TEAM_M8TES_FANDOM_FILTER } from "@/lib/media-assets";

type TeamM8tesFeaturedPanelProps = {
  ad: ActiveAd;
  className?: string;
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function TeamM8tesFeaturedPanel({ ad, className }: TeamM8tesFeaturedPanelProps) {
  const ctaHref = ad.ctaHref?.trim() ?? "https://team-m8tes.com";
  const ctaLabel = "Join Team-M8tes";
  const external = isExternalHref(ctaHref);

  const inner = (
    <article
      className={["media-m8tes-featured", className].filter(Boolean).join(" ")}
      role="complementary"
      aria-label="Sponsored: Team-M8tes — Fandom is the filter."
    >
      <div className="media-m8tes-featured__bg" aria-hidden>
        <Image
          src={TEAM_M8TES_FANDOM_FILTER}
          alt=""
          fill
          className="media-m8tes-featured__bg-image"
          sizes="(max-width: 640px) 100vw, 1152px"
          priority={false}
        />
        <div className="media-m8tes-featured__overlay" />
        <div className="media-m8tes-featured__vignette" />
      </div>

      <div className="media-m8tes-featured__body">
        <p className="media-m8tes-featured__eyebrow">
          <span>Sponsored</span>
          <span className="media-m8tes-featured__eyebrow-dot" aria-hidden>
            {" "}
            ·{" "}
          </span>
          <span className="media-m8tes-featured__eyebrow-brand">Team-M8tes</span>
        </p>
        <h2 className="media-m8tes-featured__title">Fandom is the filter.</h2>
        <p className="media-m8tes-featured__copy">
          Meet sports fans who already speak your language.
        </p>
        <span className="media-m8tes-featured__cta">{ctaLabel}</span>
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
