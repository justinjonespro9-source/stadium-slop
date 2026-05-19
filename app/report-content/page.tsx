import Link from "next/link";
import type { Metadata } from "next";

import { ReportContentForm } from "@/components/report-content-form";
import { parseReportContentSearchParams } from "@/lib/report-content";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Report content",
  description:
    "Flag inappropriate, spammy, or mismatched fan reviews and photos on Stadium Slop.",
  alternates: { canonical: getAbsoluteUrl("/report-content") }
};

type ReportContentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportContentPage({
  searchParams
}: ReportContentPageProps) {
  const query = (await searchParams) ?? {};
  const context = parseReportContentSearchParams(query);

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
            Fan safety lane
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--slop-cream)] sm:text-3xl">
            Report content
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
            Help keep Stadium Slop useful for fans.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--slop-cream-dim)]">
            Reports help us review content and protect the fan-powered guide. No
            account needed — send a quick email and we&apos;ll take a look.
          </p>
        </header>

        <div className="mt-4 space-y-4">
          <ReportContentForm context={context} />

          <aside className="rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.35)] px-3 py-3 sm:px-4">
            <p className="text-xs leading-relaxed text-[var(--slop-cream-muted)]">
              Use this for inappropriate photos, spam or fake reviews, wrong-item
              posts, offensive language, or alcohol-related concerns. We read every
              report while moderation tools stay lightweight.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
