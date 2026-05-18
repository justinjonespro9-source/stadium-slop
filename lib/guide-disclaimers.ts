/**
 * Short, fan-facing trust copy — shared across browse, venue, and item pages.
 */

export const GUIDE_BADGE_LABEL = "Fan-powered guide";

export const GUIDE_NOTE_HOME =
  "Independent fan guide — menus and stands can change by game or season.";

export const GUIDE_NOTE_BROWSE =
  "Listings mix fan reviews with imported menu intel; details may shift event to event.";

export const GUIDE_NOTE_VENUE_RANKINGS = [
  "Rankings reflect geofenced fan reviews, not venue or team picks.",
  "Menus, vendors, sections, and prices can change by game or season."
];

export const GUIDE_NOTE_VENUE_BOTTOM =
  "Some stand and menu details start from public guides and get sharper when fans report in.";

export const GUIDE_NOTE_FOOD_SCORES =
  "Scores and Fresh Signal are fan takes — not official quality claims from the venue or team.";

export const GUIDE_NOTE_FOOD_REVIEWS =
  "Availability and price can vary by game; double-check at the stand if it matters.";

export const GUIDE_NOTE_FOOD_MENU =
  "Imported or fan-suggested menu notes may lag a rebranded stand or seasonal swap.";

export function formatItemGuideTimestamp(item: {
  seasonIntroduced?: string | null;
  lastConfirmed?: string | null;
  availabilityStatus?: string | null;
}): string | null {
  const last = item.lastConfirmed?.trim();
  if (last) {
    return `Last fan intel · ${last}`;
  }
  const season = item.seasonIntroduced?.trim();
  if (season) {
    return `Season ${season} listing`;
  }
  const status = item.availabilityStatus?.trim();
  if (status && status !== "Venue verified") {
    return status;
  }
  return null;
}
