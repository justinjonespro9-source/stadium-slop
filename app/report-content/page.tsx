import type { Metadata } from "next";

import { ReportContentForm } from "@/components/report-content-form";
import { UtilityPageShell } from "@/components/utility/utility-page-shell";
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
    <UtilityPageShell
      backHref={context?.pagePath ?? "/venues"}
      backLabel="Back"
      eyebrow="Fan safety lane"
      title="Report content"
      description={
        <>
          <p>Help keep Stadium Slop useful for fans.</p>
          <p className="mt-2">
            Reports help us review content and protect the fan-powered guide. No account needed
            — send a quick email and we&apos;ll take a look.
          </p>
        </>
      }
    >
      <div className="utility-page__stack space-y-4">
        <ReportContentForm context={context} />

        <aside className="utility-aside media-panel-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-sm">
            Use this for inappropriate photos, spam or fake reviews, wrong-item posts,
            offensive language, or alcohol-related concerns. We read every report while
            moderation tools stay lightweight.
          </p>
        </aside>
      </div>
    </UtilityPageShell>
  );
}
