import type { Metadata } from "next";

import { SuggestCorrectionForm } from "@/components/suggest-correction-form";
import { UtilityPageShell } from "@/components/utility/utility-page-shell";
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
    <UtilityPageShell
      backHref={context?.pagePath ?? "/venues"}
      backLabel="Back"
      eyebrow="Fan accuracy lane"
      title="Suggest a correction"
      description={
        <p>
          Help keep Stadium Slop accurate for fans. Spot a wrong section, stale price,
          mismatched photo, or missing item? Send a quick tip — no account needed.
        </p>
      }
    >
      <div className="utility-page__stack space-y-4">
        <SuggestCorrectionForm context={context} />

        <aside className="utility-aside media-panel-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-sm">
            Fan corrections help improve the Slop Scoreboard and venue accuracy. We read every
            note while manual review tools are still lightweight.
          </p>
          <p className="mt-2 text-[0.7rem] leading-snug text-[var(--media-ink-dim)]">
            Frequent contributors may receive future Scout badges.
          </p>
        </aside>
      </div>
    </UtilityPageShell>
  );
}
