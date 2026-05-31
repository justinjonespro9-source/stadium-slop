type FairVenueGuideStatusProps = {
  statusLine: string;
  className?: string;
};

export function FairVenueGuideStatus({
  statusLine,
  className = ""
}: FairVenueGuideStatusProps) {
  return (
    <p
      className={`fair-venue-guide-status text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.8125rem] ${className}`}
    >
      {statusLine}
    </p>
  );
}
