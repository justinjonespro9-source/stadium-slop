import Image from "next/image";

import { normalizePublicImageUrl } from "@/lib/image-url";

type ScorecardIdentityPreviewProps = {
  displayName: string;
  handleDisplay: string;
  initials: string;
  avatarUrl: string | null | undefined;
  venuesReviewed: number;
  itemsReviewed: number;
  helpfulEarned: number;
};

export function ScorecardIdentityPreview({
  displayName,
  handleDisplay,
  initials,
  avatarUrl,
  venuesReviewed,
  itemsReviewed,
  helpfulEarned
}: ScorecardIdentityPreviewProps) {
  const avatar = normalizePublicImageUrl(avatarUrl);

  return (
    <div className="rounded-lg border border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-3 sm:px-4">
      <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[var(--media-ink-muted)]">
        Your Stadium Slop profile image
      </p>
      <p className="mt-1 text-[0.65rem] leading-snug text-[var(--media-ink-muted)]">
        One upload is used on your Slop Scorecards — round on the card front and square on
        the back. Fan food photos on each card still come from that item&apos;s review.
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[var(--slop-card-orange)] bg-[var(--slop-navy-deep)] shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                fill
                className="object-cover object-center"
                sizes="56px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-black text-[var(--slop-cream)]">
                {initials}
              </span>
            )}
          </div>
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 border-[var(--slop-card-orange)] bg-[var(--slop-navy-deep)]">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                fill
                className="object-cover object-center"
                sizes="64px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-black text-[var(--slop-cream)]">
                {initials}
              </span>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 text-[0.65rem] leading-snug text-[var(--media-ink-muted)]">
          <p>
            <span className="font-bold text-[var(--media-ink)]">Round</span> — reviewer strip
            on the card front
          </p>
          <p className="mt-1">
            <span className="font-bold text-[var(--media-ink)]">Square</span> — profile block
            on the card back with career stats
          </p>
          <p className="mt-2 font-black text-[var(--slop-cream)]">{displayName}</p>
          <p className="font-bold text-[var(--slop-cream-dim)]">{handleDisplay}</p>
          <p className="mt-2 text-[0.6rem]">
            Venues {venuesReviewed} · Items {itemsReviewed} · Helpful {helpfulEarned}
          </p>
        </div>
      </div>
    </div>
  );
}
