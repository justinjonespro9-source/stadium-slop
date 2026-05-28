import type { ReactNode } from "react";

import { HomeHeroVisual } from "@/components/home/home-hero-visual";

type HomeHeroProps = {
  children: ReactNode;
};

export function HomeHero({ children }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#060a10] text-white shadow-[var(--media-shadow-hero)]">
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#121a28_0%,#0a1018_55%,#060a10_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 100% 80% at 50% -30%, rgba(255,107,26,0.2), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(255,255,255,0.04), transparent 50%)"
        }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a1018] to-transparent opacity-80"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-8 lg:px-10 lg:pb-12 lg:pt-12">
        <div className="min-w-0 lg:py-2">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-[var(--media-orange-bright)] sm:text-[0.65rem]">
            Stadium Slop
          </p>
          <h1 className="mt-2.5 max-w-xl text-[clamp(1.75rem,6.5vw,3.25rem)] font-black leading-[1.08] tracking-tight text-white sm:mt-3">
            Find the best eats at{" "}
            <span className="text-[var(--media-orange-bright)]">every stadium.</span>
          </h1>
          <p className="mt-3 max-w-lg text-[0.9375rem] font-medium leading-relaxed text-white/80 sm:mt-4 sm:text-lg">
            Real fans. Real reviews. Real good (and bad) food.
          </p>

          <div className="mt-5 space-y-0 sm:mt-6 lg:mt-7">{children}</div>

          <div className="mt-6 lg:hidden">
            <HomeHeroVisual />
          </div>
        </div>

        <div className="relative hidden min-w-0 lg:block">
          <HomeHeroVisual />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[var(--media-surface)]"
        aria-hidden
      />
    </section>
  );
}
