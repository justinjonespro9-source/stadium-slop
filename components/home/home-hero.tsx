import type { ReactNode } from "react";

import { HomeHeroVisual } from "@/components/home/home-hero-visual";

type HomeHeroProps = {
  children: ReactNode;
};

export function HomeHero({ children }: HomeHeroProps) {
  return (
    <section className="media-home-hero relative overflow-hidden text-white shadow-[var(--media-shadow-hero)]">
      <div className="media-home-hero__bg" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 70% at 15% 20%, rgba(255,107,26,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 30%, rgba(255,255,255,0.05), transparent 50%)"
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-[var(--media-surface)] to-transparent"
        aria-hidden
      />

      <div className="media-home-hero__visual-wrap" aria-hidden>
        <HomeHeroVisual />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-7 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10 lg:pb-14 lg:pt-11">
        <div className="max-w-xl lg:max-w-[32rem]">
          <h1 className="text-[clamp(1.65rem,5.8vw,3.15rem)] font-black leading-[1.08] tracking-tight text-white">
            Find the best eats at{" "}
            <span className="text-[var(--media-orange-bright)]">every stadium.</span>
          </h1>
          <p className="mt-2.5 text-[0.9rem] font-medium leading-relaxed text-white/82 sm:mt-3 sm:text-[1.05rem]">
            Real fans. Real reviews. Real good (and bad) food.
          </p>

          <div className="mt-4 sm:mt-5 lg:mt-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
