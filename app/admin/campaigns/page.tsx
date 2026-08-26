import Link from "next/link";

import { requireAdminAccess } from "@/lib/auth/require-admin";
import {
  formatCampaignChannel,
  loadCampaignAnalytics,
  resolveCampaignAnalyticsDateRange
} from "@/lib/admin/campaigns";
import { CAMPAIGN_CATALOG } from "@/lib/campaigns/catalog";

type AdminCampaignsPageProps = {
  searchParams?: Promise<{
    from?: string;
    to?: string;
  }>;
};

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default async function AdminCampaignsPage({
  searchParams
}: AdminCampaignsPageProps) {
  await requireAdminAccess();

  const params = await searchParams;
  const range = resolveCampaignAnalyticsDateRange({
    from: params?.from,
    to: params?.to
  });
  const rows = await loadCampaignAnalytics(range, CAMPAIGN_CATALOG);

  const totals = rows.reduce(
    (acc, row) => {
      acc.redirectVisits += row.redirectVisits;
      acc.followVisits += row.followVisits;
      acc.signups += row.signups;
      acc.reviewers += row.reviewers;
      acc.reviews += row.reviews;
      return acc;
    },
    {
      redirectVisits: 0,
      followVisits: 0,
      signups: 0,
      reviewers: 0,
      reviews: 0
    }
  );

  const rangeLabel =
    range.fromParam || range.toParam
      ? `${range.fromParam ?? "…"} → ${range.toParam ?? "…"} (UTC)`
      : "All time";

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to admin
        </Link>

        <header className="mt-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Campaign analytics
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Marketing funnel
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Redirect and follow visits from QR / social campaign links, plus
            first-touch signups and reviews stamped with campaign attribution.
            Conversion is unique reviewers ÷ redirect visits.
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
            Range: {rangeLabel} · {rows.length} campaign
            {rows.length === 1 ? "" : "s"}
          </p>
        </header>

        <form
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)] p-4 sm:flex-row sm:flex-wrap sm:items-end"
          method="get"
          action="/admin/campaigns"
        >
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            From (UTC)
            <input
              name="from"
              type="date"
              defaultValue={range.fromParam ?? ""}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            To (UTC)
            <input
              name="to"
              type="date"
              defaultValue={range.toParam ?? ""}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full border border-[var(--slop-orange)] bg-[var(--slop-orange)]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--slop-orange)]"
            >
              Apply
            </button>
            <Link
              href="/admin/campaigns"
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
            >
              Clear
            </Link>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-[0.12em] text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-bold">Campaign</th>
                <th className="px-4 py-3 font-bold">Channel</th>
                <th className="px-4 py-3 font-bold text-right">Redirects</th>
                <th className="px-4 py-3 font-bold text-right">Follows</th>
                <th className="px-4 py-3 font-bold text-right">Signups</th>
                <th className="px-4 py-3 font-bold text-right">Reviewers</th>
                <th className="px-4 py-3 font-bold text-right">Reviews</th>
                <th className="px-4 py-3 font-bold text-right">Conv.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.slug}
                  className="border-b border-zinc-800/80 last:border-b-0"
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-black text-white">{row.label}</p>
                    <p className="mt-0.5 font-mono text-xs text-zinc-500">
                      {row.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-300">
                    {formatCampaignChannel(row.channel)}
                  </td>
                  <td className="px-4 py-3 align-top text-right font-bold tabular-nums text-white">
                    {row.redirectVisits}
                  </td>
                  <td className="px-4 py-3 align-top text-right font-bold tabular-nums text-white">
                    {row.followVisits}
                  </td>
                  <td className="px-4 py-3 align-top text-right font-bold tabular-nums text-white">
                    {row.signups}
                  </td>
                  <td className="px-4 py-3 align-top text-right font-bold tabular-nums text-white">
                    {row.reviewers}
                  </td>
                  <td className="px-4 py-3 align-top text-right font-bold tabular-nums text-white">
                    {row.reviews}
                  </td>
                  <td className="px-4 py-3 align-top text-right font-bold tabular-nums text-[var(--slop-orange)]">
                    {formatPercent(row.conversionPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-700 bg-zinc-950/50 text-xs uppercase tracking-[0.1em] text-zinc-400">
                <td className="px-4 py-3 font-bold" colSpan={2}>
                  Totals
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-white">
                  {totals.redirectVisits}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-white">
                  {totals.followVisits}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-white">
                  {totals.signups}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-white">
                  {totals.reviewers}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-white">
                  {totals.reviews}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-zinc-500">
                  —
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-zinc-500">
          Signups use <code className="text-zinc-400">User.acquisitionCampaignSlug</code>.
          Reviews and reviewers use <code className="text-zinc-400">Review.campaignSlug</code>.
          Visit counts come from <code className="text-zinc-400">CampaignVisit</code>{" "}
          (<code className="text-zinc-400">REDIRECT</code> /{" "}
          <code className="text-zinc-400">FOLLOW</code>). Date filters apply to
          those createdAt fields.
        </p>
      </section>
    </main>
  );
}
