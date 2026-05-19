import Link from "next/link";
import type { Metadata } from "next";

import { SuggestCorrectionForm } from "@/components/suggest-correction-form";
import { parseSuggestCorrectionSearchParams } from "@/lib/suggest-correction";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Suggest a correction",
  description:
    "Help keep Stadium Slop accurate — report outdated sections, prices, photos, and menu details.",
  alternates: { canonical: getAbsoluteUrl("/suggest-correction") }
};

type SuggestCorrectionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuggestCorrectionPage({
  searchParams
}: SuggestCorrectionPageProps) {
  const query = (await searchParams) ?? {};
  const context = parseSuggestCorrectionSearchParams(query);

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-2xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <Link
          href={context?.pagePath ?? "/venues"}
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)] sm:text-sm"
        >
          ← Back
        </Link>

        <header className="mt-3 border-b border-[var(--slop-line-strong)] pb-4 sm:mt-4">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Fan accuracy lane
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--slop-cream)] sm:text-3xl">
            Suggest a correction
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
            Help keep Stadium Slop accurate for fans. Spot a wrong section, stale
            price, mismatched photo, or missing item? Send a quick tip — no account
            needed.
          </p>
        </header>

        <div className="mt-4 space-y-4">
          <SuggestCorrectionForm context={context} />

          <aside className="rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.35)] px-3 py-3 sm:px-4">
            <p className="text-xs leading-relaxed text-[var(--slop-cream-muted)]">
              Fan corrections help improve the Slop Scoreboard and venue accuracy. We
              read every
              note while manual review tools are still lightweight.
            </p>
            <p className="mt-2 text-[0.7rem] leading-snug text-[var(--slop-cream-dim)]">
              Frequent contributors may receive future Scout badges.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
