import Image from "next/image";
import type { ReactNode } from "react";

import {
  HOME_HERO_BACKGROUND,
  resolveHomeHeroMobileBackground
} from "@/lib/media-assets";

type HomeHeroProps = {
  children: ReactNode;
};

export function HomeHero({ children }: HomeHeroProps) {
  const mobileBackground = resolveHomeHeroMobileBackground();

  return (
    <section className="media-home-hero relative overflow-hidden text-white">
      <div className="media-home-hero__bg" aria-hidden>
        <div className="media-home-hero__bg-canvas">
          <Image
            src={mobileBackground}
            alt=""
            fill
            priority
            sizes="100%"
            className="media-home-hero__bg-image media-home-hero__bg-image--mobile"
          />
          <Image
            src={HOME_HERO_BACKGROUND}
            alt=""
            fill
            sizes="100%"
            className="media-home-hero__bg-image media-home-hero__bg-image--desktop"
          />
        </div>
      </div>
      <div className="media-home-hero__overlay" aria-hidden />
      <div className="media-home-hero__vignette" aria-hidden />
      <div className="media-home-hero__top-fade" aria-hidden />
      <div
        className="media-home-hero__bottom-fade pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
        aria-hidden
      />

      <div className="media-home-hero__content relative z-10 mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-7 lg:px-10 lg:pt-8">
        <div className="max-w-xl lg:max-w-[32rem]">
          <h1 className="text-[clamp(1.65rem,5.8vw,3.15rem)] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
            What&apos;s the{" "}
            <span className="text-[var(--media-orange-bright)] drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
              score?
            </span>
          </h1>
          <p className="mt-2.5 max-w-xl text-[0.9rem] font-medium leading-relaxed text-white/88 drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] sm:mt-3 sm:text-[1.05rem]">
            Find the bites worth the walk, the wait, and the price. Crowd-powered food rankings
            for stadiums, fairs, and live-event venues.
          </p>

          <div className="mt-4 sm:mt-5 lg:mt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
