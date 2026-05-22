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

function PreviewFrontStrip({
  displayName,
  handleDisplay,
  initials,
  avatarUrl
}: Pick<
  ScorecardIdentityPreviewProps,
  "displayName" | "handleDisplay" | "initials" | "avatarUrl"
>) {
  const avatar = normalizePublicImageUrl(avatarUrl);

  return (
    <div className="rounded-lg border border-[var(--slop-line)] bg-[rgba(6,14,24,0.55)] px-2 py-2">
      <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
        Front · reviewer strip
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[var(--slop-gold)] bg-[var(--slop-navy-deep)] shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
          {avatar ? (
            <Image
              src={avatar}
              alt=""
              fill
              className="object-cover object-center"
              sizes="44px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[0.7rem] font-black text-[var(--slop-cream)]">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[0.65rem] font-black text-[var(--slop-cream)]">
            {displayName}
          </p>
          <p className="truncate text-[0.52rem] font-bold text-[var(--slop-cream-dim)]">
            {handleDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewBackProfile({
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
    <div className="rounded-lg border border-[var(--slop-line)] bg-[rgba(6,14,24,0.55)] px-2 py-2">
      <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
        Back · profile block
      </p>
      <div className="slop-scorecard-back-profile mt-1.5 flex items-start gap-2">
        {avatar ? (
          <div className="slop-scorecard-back-profile-photo relative">
            <Image
              src={avatar}
              alt=""
              fill
              className="object-cover object-center"
              sizes="96px"
            />
          </div>
        ) : (
          <div className="slop-scorecard-back-profile-initials" aria-hidden>
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-[0.74rem] font-black leading-tight text-[var(--slop-cream)]">
            {displayName}
          </p>
          <p className="truncate text-[0.54rem] font-bold text-[var(--slop-cream-dim)]">
            {handleDisplay}
          </p>
          <p className="slop-scorecard-back-career-label mt-1.5">Career Stats</p>
          <div className="slop-scorecard-back-career-stats">
            <div className="slop-scorecard-back-meta-row">
              <span className="slop-scorecard-back-meta-label">Venues Reviewed</span>
              <span className="slop-scorecard-back-meta-value">{venuesReviewed}</span>
            </div>
            <div className="slop-scorecard-back-meta-row">
              <span className="slop-scorecard-back-meta-label">Items Reviewed</span>
              <span className="slop-scorecard-back-meta-value">{itemsReviewed}</span>
            </div>
            <div className="slop-scorecard-back-meta-row">
              <span className="slop-scorecard-back-meta-label">Helpful Earned</span>
              <span className="slop-scorecard-back-meta-value">{helpfulEarned}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScorecardIdentityPreview(props: ScorecardIdentityPreviewProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <PreviewFrontStrip {...props} />
      <PreviewBackProfile {...props} />
    </div>
  );
}
