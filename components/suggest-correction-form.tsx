"use client";

import { useMemo, useState } from "react";

import { authFieldClass, authLabelClass } from "@/components/auth-ui";
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
    <div className="brand-card rounded-2xl border border-[var(--slop-line-strong)] p-4 sm:p-5">
      {context ? (
        <div className="mb-4 rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] px-3 py-2.5">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-dim)]">
            Page context
          </p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-[var(--slop-cream-muted)]">
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
        <label className={`grid gap-1.5 ${authLabelClass}`}>
          What needs fixing?
          <select
            value={correctionType}
            onChange={(e) =>
              setCorrectionType(parseCorrectionType(e.target.value) ?? "other")
            }
            className={authFieldClass}
          >
            {CORRECTION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Notes (optional)
          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="What should fans see instead? Section, stand, price, photo link, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${authFieldClass} min-h-[6.5rem] resize-y`}
          />
        </label>

        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Your name (optional)
          <input
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Email (optional)
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Only if you want a reply"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
          />
        </label>

        <button
          type="submit"
          className="brand-cta mt-1 w-full rounded-full px-5 py-3 text-sm font-black sm:w-auto"
        >
          Open email to send correction
        </button>

        <p className="text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          Opens your mail app to{" "}
          <a
            href={`mailto:${SUGGEST_CORRECTION_EMAIL}`}
            className="font-semibold text-[var(--slop-gold)] underline-offset-2 hover:underline"
          >
            {SUGGEST_CORRECTION_EMAIL}
          </a>
          . No login required — we review fan tips by hand for now.
        </p>
      </form>
    </div>
  );
}
