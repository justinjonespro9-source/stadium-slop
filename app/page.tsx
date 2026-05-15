import Image from "next/image";

import { HomeVenueSearch } from "@/components/home-venue-search";
import { getPublicVenues } from "@/lib/public-data";

export default async function Home() {
  const venues = await getPublicVenues();

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-6 lg:px-10">
        <div className="mb-3 flex w-full justify-center sm:mb-4">
          <div className="flex w-full max-w-[980px] justify-center rounded-2xl border border-[var(--slop-line-strong)] bg-[color:rgba(245,233,208,0.05)] px-2.5 py-2.5 shadow-[var(--slop-shadow-inset),0_8px_32px_rgba(0,0,0,0.4),0_0_80px_rgba(244,179,33,0.07)] sm:rounded-3xl sm:px-4 sm:py-4">
            <Image
              src="/branding/stadium-slop-logo-main.png"
              alt="Stadium Slop"
              width={1960}
              height={720}
              sizes="(max-width: 767px) 340px, (max-width: 1023px) 700px, 980px"
              className="h-auto w-full max-w-[340px] object-contain md:max-w-[700px] lg:max-w-[980px]"
              priority
              quality={100}
            />
          </div>
        </div>

        <p className="mx-auto max-w-2xl px-1 text-center text-sm font-semibold leading-snug text-[var(--slop-cream-muted)] sm:text-base">
          Fan-powered food ratings with game-day signals on what&apos;s fresh.
        </p>

        <div className="mx-auto mt-3 max-w-2xl sm:mt-4">
          <HomeVenueSearch venues={venues} />
        </div>
      </section>
    </main>
  );
}
