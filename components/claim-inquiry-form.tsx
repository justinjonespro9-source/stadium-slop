"use client";

import { useMemo, useState } from "react";

import { authFieldClass, authLabelClass } from "@/components/auth-ui";
import {
  buildClaimMailto,
  CLAIM_CONTACT_EMAIL,
  CLAIM_INQUIRY_TOPICS,
  claimFormIntro,
  formatClaimContextSummary,
  type ClaimInquiryTopic,
  type ClaimListingContext
} from "@/lib/claim-listing";
import { CLAIM_SUBMISSION_NOTE } from "@/lib/site-contact";

type ClaimInquiryFormProps = {
  context: ClaimListingContext | null;
};

export function ClaimInquiryForm({ context }: ClaimInquiryFormProps) {
  const [topic, setTopic] = useState<ClaimInquiryTopic>("partnership");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    if (!name.trim() || !email.trim()) {
      return null;
    }
    return buildClaimMailto({
      topic,
      name: name.trim(),
      organization: organization.trim(),
      email: email.trim(),
      message: message.trim(),
      context
    });
  }, [topic, name, organization, email, message, context]);

  return (
    <div className="brand-card rounded-2xl border border-[var(--slop-line-strong)] p-4 sm:p-5">
      {context ? (
        <div className="mb-4 rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] px-3 py-2.5">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-dim)]">
            Listing context
          </p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-[var(--slop-cream-muted)]">
            {formatClaimContextSummary(context).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-4 text-xs leading-relaxed text-[var(--slop-cream-dim)]">
          {claimFormIntro(null)}
        </p>
      )}

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (mailtoHref) {
            window.location.href = mailtoHref;
          }
        }}
      >
        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Inquiry type
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as ClaimInquiryTopic)}
            className={authFieldClass}
          >
            {CLAIM_INQUIRY_TOPICS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Your name
          <input
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Organization (optional)
          <input
            name="organization"
            autoComplete="organization"
            placeholder="Team, venue, brand, or concessionaire"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={authFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Work email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Message
          <textarea
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="What should we update or explore together?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${authFieldClass} min-h-[6.5rem] resize-y`}
          />
        </label>

        <button
          type="submit"
          disabled={!mailtoHref}
          className="brand-cta mt-1 w-full rounded-full px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          Open email to send inquiry
        </button>

        <p className="text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          {CLAIM_SUBMISSION_NOTE} No account required — we reply manually while
          partner tools are in development.
        </p>
      </form>
    </div>
  );
}
