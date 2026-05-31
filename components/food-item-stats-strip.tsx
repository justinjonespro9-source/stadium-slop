import {
  getFreshSignalStatLabel,
  getPriceStatLabel,
  getReplayStatLabel
} from "@/lib/venue-copy-context";

type StatCellProps = {
  label: string;
  value: string;
  detail?: string;
  accent?: "gold" | "fresh" | "default" | "orange";
  tone?: "brand" | "media";
};

function StatCell({ label, value, detail, accent = "default", tone = "brand" }: StatCellProps) {
  const isMedia = tone === "media";
  const valueClass = isMedia
    ? accent === "orange" || accent === "gold"
      ? "text-[var(--media-orange-bright)]"
      : accent === "fresh"
        ? "text-emerald-300"
        : "text-white"
    : accent === "gold"
      ? "text-[var(--slop-gold-bright)]"
      : accent === "fresh"
        ? "text-emerald-200"
        : "text-[var(--slop-cream)]";

  const labelClass = isMedia
    ? "text-white/55"
    : "text-[var(--slop-cream-dim)]";
  const detailClass = isMedia ? "text-white/50" : "text-[var(--slop-cream-dim)]";
  const cellClass = isMedia ? "media-item-stats-cell" : "item-stats-cell";

  return (
    <div className={`${cellClass} min-w-0 px-2 py-1.5 sm:px-2.5 sm:py-2`}>
      <p
        className={`truncate text-[0.48rem] font-black uppercase tracking-[0.12em] sm:text-[0.5rem] ${labelClass}`}
      >
        {label}
      </p>
      <p
        className={`mt-0.5 truncate text-base font-black tabular-nums leading-none sm:text-lg ${valueClass}`}
      >
        {value}
      </p>
      {detail ? (
        <p className={`mt-0.5 truncate text-[0.5rem] font-semibold ${detailClass}`}>{detail}</p>
      ) : null}
    </div>
  );
}

export type FoodItemStatsStripProps = {
  slopScore: string;
  slopDetail?: string;
  slopUnrated?: boolean;
  freshScore: string;
  freshLive: boolean;
  freshDetail: string;
  reviewCount: number;
  reviewDetail?: string;
  priceDisplay: string;
  priceDetail: string;
  replayLabel?: string;
  replayDetail?: string;
  tone?: "brand" | "media";
  venueSlug?: string;
};

/** Compact scoreboard strip for item page header. */
export function FoodItemStatsStrip({
  slopScore,
  slopDetail,
  slopUnrated,
  freshScore,
  freshLive,
  freshDetail,
  reviewCount,
  reviewDetail,
  priceDisplay,
  priceDetail,
  replayLabel,
  replayDetail,
  tone = "brand",
  venueSlug
}: FoodItemStatsStripProps) {
  const stripClass = tone === "media" ? "media-item-stats-strip" : "item-stats-strip";
  const freshLabel = venueSlug ? getFreshSignalStatLabel(venueSlug) : "Fresh signal";
  const priceLabel = venueSlug ? getPriceStatLabel(venueSlug) : "Price";
  const replayStatLabel = venueSlug ? getReplayStatLabel(venueSlug) : "Replay";

  return (
    <div className={stripClass} role="group" aria-label="Item stats">
      <StatCell
        label="Slop score"
        value={slopScore}
        detail={slopUnrated ? "Awaiting votes" : slopDetail}
        accent={tone === "media" ? "orange" : "gold"}
        tone={tone}
      />
      <StatCell
        label={freshLabel}
        value={freshScore}
        detail={freshDetail}
        accent={freshLive ? "fresh" : "default"}
        tone={tone}
      />
      <StatCell
        label="Reviews"
        value={String(reviewCount)}
        detail={reviewDetail}
        tone={tone}
      />
      <StatCell label={priceLabel} value={priceDisplay} detail={priceDetail} tone={tone} />
      <StatCell
        label={replayStatLabel}
        value={replayLabel ?? "—"}
        detail={replayDetail}
        tone={tone}
      />
    </div>
  );
}
