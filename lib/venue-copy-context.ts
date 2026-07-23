import { isFairVenueSlug } from "@/lib/fair-preview";
import type { PriceCheckLabel, ReplayValueLabel } from "@/lib/sample-data";

export type VenueCopyContext = "stadium" | "fair";

export function getVenueCopyContext(venueSlug: string): VenueCopyContext {
  return isFairVenueSlug(venueSlug) ? "fair" : "stadium";
}

export function isFairCopyContext(venueSlug: string): boolean {
  return getVenueCopyContext(venueSlug) === "fair";
}

/** Re-export fair menu section copy (see fair-venue-copy.ts). */
export {
  FAIR_VENUE_MENU_EYEBROW,
  FAIR_VENUE_MENU_HEADING,
  FAIR_VENUE_MENU_SUBCOPY
} from "@/lib/fair-venue-copy";

const NAPKIN_LABEL_FAIR: Record<string, string> = {
  "Jersey Danger": "Outfit Risk"
};

const REPLAY_VALUE_FAIR: Partial<Record<ReplayValueLabel, string>> = {
  "Game Day Starter": "Must-Have Again",
  "Solid Rotation Pick": "Worth Another Lap",
  "Bench Option": "Maybe Later",
  "Cut From the Roster": "One and Done"
};

const PRICE_CHECK_FAIR: Partial<Record<PriceCheckLabel, string>> = {
  "Worth the Price of Admission": "Worth the Splurge",
  "Stadium Tax": "Not Fair"
};

const REPLAY_FORM_OPTIONS_STADIUM = [
  "Game Day Starter",
  "Solid Rotation Pick",
  "Bench Option",
  "Cut From the Roster"
] as const;

const REPLAY_FORM_OPTIONS_FAIR = [
  "Must-Have Again",
  "Worth Another Lap",
  "Maybe Later",
  "One and Done"
] as const;

const NAPKIN_FORM_STADIUM = [
  { value: 1, label: "Clean Win" },
  { value: 2, label: "Safe at Your Seat" },
  { value: 3, label: "Two-Handed Problem" },
  { value: 4, label: "Jersey Danger" },
  { value: 5, label: "Full Cleanup Crew" }
] as const;

const NAPKIN_FORM_FAIR = [
  { value: 1, label: "Clean Win" },
  { value: 2, label: "Safe at Your Seat" },
  { value: 3, label: "Two-Handed Problem" },
  { value: 4, label: "Outfit Risk" },
  { value: 5, label: "Full Cleanup Crew" }
] as const;

const PRICE_FORM_STADIUM = [
  "Worth the Price of Admission",
  "Fair Deal",
  "Stadium Tax"
] as const;

const PRICE_FORM_FAIR = ["Worth the Splurge", "Fair Deal", "Not Fair"] as const;

export function getStandingsModeOptions(venueSlug: string) {
  if (isFairCopyContext(venueSlug)) {
    return [
      { label: "All-Time", value: "all-time" as const },
      { label: "Fair Season", value: "season" as const },
      { label: "Fresh Takes", value: "fresh" as const }
    ];
  }
  return [
    { label: "All-Time", value: "all-time" as const },
    { label: "Season", value: "season" as const },
    { label: "Fresh", value: "fresh" as const }
  ];
}

export function getAudienceNoun(venueSlug: string): "fans" | "fairgoers" {
  return isFairCopyContext(venueSlug) ? "fairgoers" : "fans";
}

export function displayNapkinLabel(label: string, venueSlug: string): string {
  if (!isFairCopyContext(venueSlug)) return label;
  return NAPKIN_LABEL_FAIR[label] ?? label;
}

export function displayReplayValueLabel(label: string, venueSlug: string): string {
  if (!isFairCopyContext(venueSlug)) return label;
  return REPLAY_VALUE_FAIR[label as ReplayValueLabel] ?? label;
}

export function displayPriceCheckLabel(label: string, venueSlug: string): string {
  if (!isFairCopyContext(venueSlug)) return label;
  return PRICE_CHECK_FAIR[label as PriceCheckLabel] ?? label;
}

export function getReplayStatLabel(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Worth Another Lap" : "Replay";
}

export function getPriceStatLabel(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Worth the Price" : "Price";
}

export function getFreshSignalStatLabel(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Fresh takes" : "Fresh signal";
}

export function getFreshDetailWhenLive(venueSlug: string, windowLabel?: string | null): string {
  if (windowLabel) return windowLabel;
  return isFairCopyContext(venueSlug) ? "Fair-day takes" : "Game-day takes";
}

export function getFreshDetailWhenClosed(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Opens on fair day" : "Opens on game day";
}

export function getFanPhotosSectionEyebrow(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Food photos" : "Fan photos";
}

export function getFoodPhotoAlt(venueSlug: string, foodName: string): string {
  return isFairCopyContext(venueSlug)
    ? `Food photo for ${foodName}`
    : `Fan photo for ${foodName}`;
}

export function getNoFanPhotoLabel(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "No food photo" : "No fan photo";
}

export function getSlopSignalsSectionTitle(venueSlug: string): string {
  return "Slop Signals";
}

export function getReplayValueSectionTitle(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Worth Another Lap" : "Replay value";
}

export function getPriceCheckSectionTitle(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Worth the Price" : "Price check";
}

export function getReplayValueFormHint(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Would you circle back for it?" : "Order again?";
}

export function getNapkinRatingHint(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "How many napkins are you grabbing before the next stop?"
    : "Messiness, not quality.";
}

export function getReviewPhotoSectionTitle(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Food photo" : "Fan photo";
}

export function getReviewFormRequirementsHint(
  venueSlug: string,
  napkinEligible: boolean
): string {
  if (isFairCopyContext(venueSlug)) {
    return napkinEligible
      ? "Slop score, napkins, worth another lap, and worth the price are required. Food photo required under 5.0."
      : "Slop score, worth another lap, and worth the price are required — no napkin row for drinks. Food photo required under 5.0.";
  }
  return napkinEligible
    ? "Slop score, napkins, replay, and price are required. Photo required under 5.0."
    : "Slop score, replay, and price are required — no napkin row for drinks. Photo required under 5.0.";
}

export function getReviewDayBadgeLabel(venueSlug: string, itemType: string): string {
  return isFairCopyContext(venueSlug) ? `Fair day · ${itemType}` : `Game day · ${itemType}`;
}

export function getReviewSubmitFootnote(venueSlug: string, isDraft: boolean): string {
  if (isFairCopyContext(venueSlug)) {
    return isDraft
      ? "Updating today replaces your earlier Slop Scorecard for this item — one per fairgoer per fair day."
      : "One Slop Scorecard per fairgoer, item, and fair day. You can edit later today if needed.";
  }
  return isDraft
    ? "Updating today replaces your earlier Slop Scorecard for this item — one per fan per game day."
    : "One Slop Scorecard per fan, item, and game day. You can edit later today if needed.";
}

export function getHotTakePlaceholder(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "One-liner for fairgoers flipping your card"
    : "One-liner for fans flipping your card";
}

export function getReviewSignInPhotoHint(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Sign in to submit a Slop Scorecard — score, signals, and optional food photo."
    : "Sign in to submit a Slop Scorecard — score, signals, and optional fan photo.";
}

export function getMissingReplayError(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Pick Worth Another Lap — would you circle back for it?"
    : "Pick a Replay Value — would you order this again?";
}

export function getCommunitySignalsTitle(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Fairgoer signals" : "Fan signals";
}

export function getEmptyReplayPriceHint(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Worth Another Lap / Worth the Price breakdown unlocks after reviews."
    : "Replay / price breakdown unlocks after reviews.";
}

export function getGameDayFreshPendingCopy(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Fresh: no verified fair-day takes yet."
    : "Fresh: no verified takes today yet.";
}

export function getVenueFreshFeedSubcopy(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Fresh fairgoer scorecards from around the fairgrounds."
    : "Fresh fan scorecards from around the stadium.";
}

export function getVenueFreshFeedTitle(venueSlug: string, venueName: string): string {
  return isFairCopyContext(venueSlug) ? `Fresh at ${venueName}` : `Fresh at ${venueName}`;
}

export function getNoScorecardsTitle(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "No scorecards yet" : "No fan scorecards yet";
}

export function getReviewAvailabilityHint(
  venueSlug: string,
  isSignedIn: boolean,
  activeGame: boolean
): string {
  if (isFairCopyContext(venueSlug)) {
    return isSignedIn
      ? activeGame
        ? "Certified reviews during this fair window — location required."
        : "Browse anytime — certified reviews open during the fair."
      : activeGame
        ? "Sign in to submit a location-certified fair review."
        : "Sign in to review foods at this fair.";
  }
  return isSignedIn
    ? activeGame
      ? "Certified reviews during this home game."
      : "Reviews open during verified home-game windows."
    : activeGame
      ? "Sign in to review during this home game."
      : "Browse anytime — reviews open on game day.";
}

export function getVenuePageDescription(
  venueSlug: string,
  venueName: string,
  city: string,
  state: string
): string {
  if (isFairCopyContext(venueSlug)) {
    return `${venueName} — fair food guide and Slop Scoreboard for ${city}, ${state}. Browse foods, filters, and fairgoer rankings on Stadium Slop.`;
  }
  return `${venueName} — Game day Slop Scoreboard for concessions in ${city}, ${state}.`;
}

export function getReplayFormOptionLabels(venueSlug: string): readonly string[] {
  return isFairCopyContext(venueSlug) ? REPLAY_FORM_OPTIONS_FAIR : REPLAY_FORM_OPTIONS_STADIUM;
}

export function getNapkinFormOptions(venueSlug: string) {
  return isFairCopyContext(venueSlug) ? [...NAPKIN_FORM_FAIR] : [...NAPKIN_FORM_STADIUM];
}

export function getPriceFormOptionLabels(venueSlug: string): readonly string[] {
  return isFairCopyContext(venueSlug) ? PRICE_FORM_FAIR : PRICE_FORM_STADIUM;
}

export function fanFavoriteBadgeLabelForVenue(
  scope: "allTime" | "season",
  rank: number,
  venueSlug: string
): string {
  if (isFairCopyContext(venueSlug)) {
    const tier = scope === "allTime" ? "All-Time" : "Fair Season";
    return `#${rank} ${tier} Fair Favorite`;
  }
  const tier = scope === "allTime" ? "All-Time" : "Season";
  return `#${rank} ${tier} Fan Favorite`;
}

export function isFanFavoriteBadgeLabelForVenue(label: string, venueSlug: string): boolean {
  if (isFairCopyContext(venueSlug)) {
    return /#\d+\s+(All-Time|Fair Season)\s+Fair Favorite/i.test(label);
  }
  return /#\d+\s+(All-Time|Season)\s+Fan Favorite/i.test(label);
}

/** Scorecard back-face row labels. */
export function getScorecardBackLabels(venueSlug: string) {
  return {
    slopSignals: getSlopSignalsSectionTitle(venueSlug),
    replayValue: isFairCopyContext(venueSlug) ? "Worth Another Lap" : "Replay Value",
    priceCheck: isFairCopyContext(venueSlug) ? "Worth the Price" : "Price Check",
    napkinRating: "Napkin Rating"
  };
}

export function mapConsensusStatsForVenue<
  T extends { label: string; percentage: number }
>(stats: T[], venueSlug: string, kind: "replay" | "price"): T[] {
  const mapLabel =
    kind === "replay" ? displayReplayValueLabel : displayPriceCheckLabel;
  return stats.map((row) => ({
    ...row,
    label: mapLabel(row.label, venueSlug)
  }));
}

export function getSuggestMenuItemTitle(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Suggest a fair food" : "Suggest a menu item";
}

export function getSuggestMenuItemSummaryEyebrow(venueSlug: string): string {
  return "Missing something?";
}

export function getSuggestMenuItemIntro(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Add a fair food listing — pick a stand if you know it."
    : "Missing a bite? Add it here — pick a stand from the vendor filter if you know it.";
}

export function getSuggestMenuItemVendorUnknownLabel(venueSlug: string): string {
  return isFairCopyContext(venueSlug) ? "Stand unknown" : "Vendor unknown";
}

export function getSuggestMenuItemLocationPlaceholder(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Optional stand location"
    : "Optional section or location";
}

export function getSuggestMenuItemNotePlaceholder(venueSlug: string): string {
  return isFairCopyContext(venueSlug)
    ? "Optional: price, stand, or menu context"
    : "Optional: price, section, or menu context";
}
