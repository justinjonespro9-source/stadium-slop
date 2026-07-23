import { FAIR_PREVIEW_NOTICE } from "@/lib/fair-preview";

const WISCONSIN_STATE_FAIR_NOTICE =
  "Stadium Slop is an independent, fan-powered concessions guide and is not affiliated with or endorsed by the Wisconsin State Fair. Menu items and availability may change.";

export function FairPreviewNotice({
  className = "",
  venueSlug
}: {
  className?: string;
  venueSlug?: string;
}) {
  const notice =
    venueSlug === "wisconsin-state-fair"
      ? WISCONSIN_STATE_FAIR_NOTICE
      : FAIR_PREVIEW_NOTICE;

  return (
    <p
      className={`rounded-xl border border-[rgba(255,107,26,0.22)] bg-[rgba(255,107,26,0.06)] px-3.5 py-3 text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.8125rem] ${className}`}
      role="note"
    >
      {notice}
    </p>
  );
}
