/**
 * Public feature toggles — opt in via env (default off in production).
 */

/** Venue page Founding Venue Partner / sponsor placement card. */
export function isVenuePartnerPlacementEnabled(): boolean {
  return process.env.ENABLE_VENUE_PARTNER_PLACEMENT === "true";
}
