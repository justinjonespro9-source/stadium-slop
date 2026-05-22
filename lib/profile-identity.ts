const DISPLAY_NAME_MIN = 2;
const DISPLAY_NAME_MAX = 40;
const HANDLE_BODY_MIN = 3;
export const HANDLE_BODY_MAX = 24;

export type ProfileIdentityFieldErrors = {
  displayName?: string;
  handle?: string;
};

/** Normalize fan handle to `@slug` (lowercase alphanumeric + underscore). */
export function normalizeContributorHandle(raw: string): string | null {
  const body = raw.trim().replace(/^@+/, "").toLowerCase();
  if (!body) {
    return null;
  }
  if (!/^[a-z0-9_]+$/.test(body)) {
    return null;
  }
  if (body.length < HANDLE_BODY_MIN || body.length > HANDLE_BODY_MAX) {
    return null;
  }
  return `@${body}`;
}

export function validateProfileIdentityInput(input: {
  displayName: string;
  handle: string;
}): { ok: true; displayName: string; handle: string } | { ok: false; errors: ProfileIdentityFieldErrors } {
  const displayName =
    typeof input.displayName === "string"
      ? input.displayName.trim().replace(/\s+/g, " ")
      : "";
  const rawHandle = typeof input.handle === "string" ? input.handle.trim() : "";
  const normalizedHandle = normalizeContributorHandle(rawHandle);

  const errors: ProfileIdentityFieldErrors = {};
  const handleErrorMessage = `Use ${HANDLE_BODY_MIN}–${HANDLE_BODY_MAX} letters, numbers, or underscores.`;

  if (displayName.length < DISPLAY_NAME_MIN || displayName.length > DISPLAY_NAME_MAX) {
    errors.displayName = `Use ${DISPLAY_NAME_MIN}–${DISPLAY_NAME_MAX} characters.`;
  }

  if (!normalizedHandle) {
    errors.handle = handleErrorMessage;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (normalizedHandle === null) {
    return { ok: false, errors: { handle: handleErrorMessage } };
  }

  return { ok: true, displayName, handle: normalizedHandle };
}
