"use client";

import { useMemo, useState } from "react";

import {
  utilityContextBoxClass,
  utilityFieldClass,
  utilityLabelClass
} from "@/components/utility/utility-form-styles";
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
    <div className="media-panel-card utility-form-card p-4 sm:p-5">
      {context ? (
        <div className={utilityContextBoxClass}>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--media-orange-deep)]">
            Listing context
          </p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-[var(--media-ink-muted)]">
            {formatClaimContextSummary(context).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-4 text-xs leading-relaxed text-[var(--media-ink-dim)]">
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
        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Inquiry type
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as ClaimInquiryTopic)}
            className={utilityFieldClass}
          >
            {CLAIM_INQUIRY_TOPICS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Your name
          <input
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={utilityFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Organization (optional)
          <input
            name="organization"
            autoComplete="organization"
            placeholder="Team, venue, brand, or concessionaire"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={utilityFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Work email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={utilityFieldClass}
          />
        </label>

        <label className={`grid gap-1.5 ${utilityLabelClass}`}>
          Message
          <textarea
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="What should we update or explore together?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${utilityFieldClass} min-h-[6.5rem] resize-y`}
          />
        </label>

        <button
          type="submit"
          disabled={!mailtoHref}
          className="utility-submit-btn mt-1 w-full disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          Open email to send inquiry
        </button>

        <p className="text-[0.65rem] leading-snug text-[var(--media-ink-dim)]">
          {CLAIM_SUBMISSION_NOTE} No account required — we reply manually while
          partner tools are in development.
        </p>
      </form>
    </div>
  );
}
