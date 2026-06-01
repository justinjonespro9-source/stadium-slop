"use client";

import { useMemo, useState } from "react";

import {
  utilityContextBoxClass,
  utilityFieldClass,
  utilityLabelClass
} from "@/components/utility/utility-form-styles";
import {
  buildSuggestCorrectionMailto,
  CORRECTION_TYPES,
  SUGGEST_CORRECTION_EMAIL,
  formatSuggestCorrectionContextSummary,
  parseCorrectionType,
  type CorrectionType,
  type SuggestCorrectionContext
} from "@/lib/suggest-correction";

type SuggestCorrectionFormProps = {
  context: SuggestCorrectionContext | null;
};

export function SuggestCorrectionForm({ context }: SuggestCorrectionFormProps) {
  const [correctionType, setCorrectionType] = useState<CorrectionType>(
    context?.correctionType ?? "other"
  );
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const mailtoHref = useMemo(
    () =>
      buildSuggestCorrectionMailto({
        correctionType,
        notes: notes.trim(),
        name,
        email,
        context
      }),
    [correctionType, notes, name, email, context]
  );

  return (
    <div className="media-panel-card utility-form-card p-4 sm:p-5">
      {context ? (
        <div className={utilityContextBoxClass}>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--media-orange-deep)]">
            Page context
          </p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-[var(--media-ink-muted)]">
            {formatSuggestCorrectionContextSummary(context).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailtoHref;
        }}
      >
        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          What needs fixing?
          <select
            value={correctionType}
            onChange={(e) =>
              setCorrectionType(parseCorrectionType(e.target.value) ?? "other")
            }
            className={utilityFieldClass}
          >
            {CORRECTION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Notes (optional)
          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="What should fans see instead? Section, stand, price, photo link, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${utilityFieldClass} min-h-[6.5rem] resize-y`}
          />
        </label>

        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Your name (optional)
          <input
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={utilityFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Email (optional)
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Only if you want a reply"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={utilityFieldClass}
          />
        </label>

        <button
          type="submit"
          className="utility-submit-btn mt-1 w-full sm:w-auto"
        >
          Open email to send correction
        </button>

        <p className="text-[0.65rem] leading-snug text-[var(--media-ink-dim)]">
          Opens your mail app to{" "}
          <a
            href={`mailto:${SUGGEST_CORRECTION_EMAIL}`}
            className="font-semibold text-[var(--media-orange-deep)] underline-offset-2 hover:underline"
          >
            {SUGGEST_CORRECTION_EMAIL}
          </a>
          . No login required — we review fan tips by hand for now.
        </p>
      </form>
    </div>
  );
}
