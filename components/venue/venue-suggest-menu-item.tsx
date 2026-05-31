import Link from "next/link";

import {
  getSuggestMenuItemIntro,
  getSuggestMenuItemLocationPlaceholder,
  getSuggestMenuItemNotePlaceholder,
  getSuggestMenuItemSummaryEyebrow,
  getSuggestMenuItemTitle,
  getSuggestMenuItemVendorUnknownLabel
} from "@/lib/venue-copy-context";

type VenueVendorOption = {
  slug: string;
  name: string;
};

type VenueSuggestMenuItemProps = {
  venueSlug: string;
  vendors: VenueVendorOption[];
  isSignedIn: boolean;
  loginHref: string;
  suggestAction: (formData: FormData) => Promise<void>;
};

function SuggestMenuForm({
  venueSlug,
  vendors,
  suggestAction
}: {
  venueSlug: string;
  vendors: VenueVendorOption[];
  suggestAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={suggestAction} className="venue-suggest-menu__form">
      <input type="hidden" name="venueSlug" value={venueSlug} />
      <input
        name="itemName"
        required
        placeholder="Missing item name"
        className="venue-suggest-menu__field"
      />
      <select
        name="vendorSlug"
        className="venue-suggest-menu__field venue-suggest-menu__select"
        defaultValue=""
      >
        <option value="">{getSuggestMenuItemVendorUnknownLabel(venueSlug)}</option>
        {vendors.map((vendor) => (
          <option key={vendor.slug} value={vendor.slug}>
            {vendor.name}
          </option>
        ))}
      </select>
      <input
        name="locationHint"
        placeholder={getSuggestMenuItemLocationPlaceholder(venueSlug)}
        className="venue-suggest-menu__field"
      />
      <textarea
        name="suggestedItemNote"
        maxLength={240}
        placeholder={getSuggestMenuItemNotePlaceholder(venueSlug)}
        className="venue-suggest-menu__field venue-suggest-menu__textarea"
      />
      <button type="submit" className="media-primary-button venue-suggest-menu__submit">
        Submit suggestion
      </button>
    </form>
  );
}

function SuggestSignInLink({ loginHref }: { loginHref: string }) {
  return (
    <Link href={loginHref} className="media-cta-outline venue-suggest-menu__sign-in">
      Sign in to suggest
    </Link>
  );
}

export function VenueSuggestMenuItem({
  venueSlug,
  vendors,
  isSignedIn,
  loginHref,
  suggestAction
}: VenueSuggestMenuItemProps) {
  const title = getSuggestMenuItemTitle(venueSlug);
  const eyebrow = getSuggestMenuItemSummaryEyebrow(venueSlug);
  const intro = getSuggestMenuItemIntro(venueSlug);

  return (
    <div className="venue-suggest-menu min-w-0">
      <details className="venue-suggest-menu__details md:hidden">
        <summary className="venue-suggest-menu__summary">
          <span className="venue-suggest-menu__summary-text">
            <span className="venue-suggest-menu__summary-eyebrow">{eyebrow}</span>
            <span className="venue-suggest-menu__summary-title">{title}</span>
          </span>
          <span className="venue-suggest-menu__chevron" aria-hidden />
        </summary>
        <div className="venue-suggest-menu__panel">
          <p className="venue-suggest-menu__intro">{intro}</p>
          {isSignedIn ? (
            <SuggestMenuForm
              venueSlug={venueSlug}
              vendors={vendors}
              suggestAction={suggestAction}
            />
          ) : (
            <SuggestSignInLink loginHref={loginHref} />
          )}
        </div>
      </details>

      <article className="venue-suggest-menu__desktop media-panel-card hidden min-w-0 md:block">
        <h3 className="venue-suggest-menu__heading">{title}</h3>
        <p className="venue-suggest-menu__intro">{intro}</p>
        {isSignedIn ? (
          <SuggestMenuForm
            venueSlug={venueSlug}
            vendors={vendors}
            suggestAction={suggestAction}
          />
        ) : (
          <SuggestSignInLink loginHref={loginHref} />
        )}
      </article>
    </div>
  );
}
