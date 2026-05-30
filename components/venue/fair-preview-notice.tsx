import { FAIR_PREVIEW_NOTICE } from "@/lib/fair-preview";

export function FairPreviewNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-xl border border-[rgba(255,107,26,0.22)] bg-[rgba(255,107,26,0.06)] px-3.5 py-3 text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.8125rem] ${className}`}
      role="note"
    >
      {FAIR_PREVIEW_NOTICE}
    </p>
  );
}
