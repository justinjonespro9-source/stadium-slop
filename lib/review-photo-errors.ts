/** Human copy for `photoError` / `error` query values (review + item pages). */

export const PHOTO_ERROR_QUERY_VALUES = [
  "empty_file",
  "too_large",
  "heic",
  "unsupported",
  "cloudinary",
  "cloudinary_api",
  "cloudinary_response",
  "read_failed",
  "invalid_url",
  "photo_save",
  "upload",
  "no_file"
] as const;

export type PhotoErrorQueryValue = (typeof PHOTO_ERROR_QUERY_VALUES)[number];

const PHOTO_ERROR_MESSAGES: Record<string, string> = {
  empty_file:
    "No image data reached the server. Re-select your photo or tap “Use full photo” before submit.",
  too_large:
    "Your ratings are live, but the photo was over the upload size limit (about 8MB). Try a smaller JPEG or PNG.",
  heic:
    "This phone photo appears to be HEIC. Choose Most Compatible/JPEG in iPhone camera settings, export as JPEG from Photos, or take a new photo through the app.",
  unsupported:
    "Your ratings are live, but that file type is not supported. Use JPEG, PNG, WebP, or GIF.",
  cloudinary:
    "Your ratings are live, but photo uploads are not configured on the server (missing Cloudinary env vars).",
  cloudinary_api:
    "Your ratings are live, but the photo host rejected the upload. Check your connection and try a JPEG under about 8MB.",
  cloudinary_response:
    "Your ratings are live, but the photo host returned an invalid response. Try again in a moment.",
  read_failed:
    "Your ratings are live, but the server could not read the image file. Try “Use full photo” or a smaller JPEG.",
  invalid_url:
    "Your ratings are live, but the saved photo URL was invalid. Try uploading again.",
  photo_save:
    "Your ratings are live and the image reached our host, but saving the photo link failed. Try submitting the photo again from Review this item.",
  no_file:
    "No photo was attached to that submit. Pick a photo again or use “Use full photo”.",
  upload:
    "Your ratings are live, but the fan photo failed to upload. Check your connection and try again with JPEG or PNG under about 8MB."
};

export function photoErrorMessageFromQuery(
  code: string | null | undefined
): string | null {
  if (!code?.trim()) {
    return null;
  }
  return PHOTO_ERROR_MESSAGES[code.trim()] ?? PHOTO_ERROR_MESSAGES.upload;
}

export function reviewPagePhotoErrorMessage(
  code: string | null | undefined
): string | null {
  if (!code?.trim()) {
    return null;
  }
  const key = code.trim();
  if (key === "too_large") {
    return "Image must be about 8MB or smaller. Shrink the file and try again.";
  }
  if (key === "heic") {
    return PHOTO_ERROR_MESSAGES.heic;
  }
  if (key === "unsupported" || key === "empty_file" || key === "no_file") {
    return PHOTO_ERROR_MESSAGES[key] ?? PHOTO_ERROR_MESSAGES.unsupported;
  }
  if (key === "cloudinary") {
    return PHOTO_ERROR_MESSAGES.cloudinary;
  }
  if (
    key === "cloudinary_api" ||
    key === "cloudinary_response" ||
    key === "read_failed" ||
    key === "invalid_url" ||
    key === "upload"
  ) {
    return PHOTO_ERROR_MESSAGES[key] ?? PHOTO_ERROR_MESSAGES.cloudinary_api;
  }
  return photoErrorMessageFromQuery(key);
}
