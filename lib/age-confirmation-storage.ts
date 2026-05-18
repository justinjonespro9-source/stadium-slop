export const AGE_CONFIRMATION_STORAGE_KEY = "stadium-slop-age-21";
export const AGE_CONFIRMATION_COOKIE = "stadium_slop_age_21";

export type AgeConfirmationChoice = "confirmed" | "declined";

const VALID: AgeConfirmationChoice[] = ["confirmed", "declined"];

export function parseAgeConfirmationValue(
  raw: string | null | undefined
): AgeConfirmationChoice | null {
  if (raw === "confirmed" || raw === "declined") {
    return raw;
  }
  return null;
}

export function readAgeConfirmationFromStorage(): AgeConfirmationChoice | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return parseAgeConfirmationValue(
      window.localStorage.getItem(AGE_CONFIRMATION_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export function writeAgeConfirmationToStorage(choice: AgeConfirmationChoice): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(AGE_CONFIRMATION_STORAGE_KEY, choice);
  } catch {
    /* ignore quota / private mode */
  }
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${AGE_CONFIRMATION_COOKIE}=${choice}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function readAgeConfirmationFromCookie(
  cookieHeader: string | undefined
): AgeConfirmationChoice | null {
  if (!cookieHeader) {
    return null;
  }
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${AGE_CONFIRMATION_COOKIE}=(confirmed|declined)(?:;|$)`)
  );
  return parseAgeConfirmationValue(match?.[1]);
}
