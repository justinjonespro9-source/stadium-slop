import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

/** Matches `experimental.serverActions.bodySizeLimit` in next.config.ts (8mb). */
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_BYTES = MAX_IMAGE_UPLOAD_BYTES;

/** Allowed once MIME is normalized or extension matches (iPhone sometimes omits MIME). */
const ALLOWED_MIME = /^image\/(jpeg|pjpeg|png|x-png|webp|gif)$/i;
const ALLOWED_EXT = /\.(jpe?g|png|gif|webp)$/i;

export type ImageUploadFailureCode =
  | "EMPTY_FILE"
  | "TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "HEIC_UNSUPPORTED"
  | "NOT_CONFIGURED"
  | "CLOUDINARY_REJECTED"
  | "INVALID_RESPONSE";

export type ImageFileDebugInfo = {
  bytes: number;
  mime: string;
  extension: string;
  nameTruncated: string;
};

export class ImageUploadError extends Error {
  readonly code: ImageUploadFailureCode;
  readonly fileDebug: ImageFileDebugInfo;

  constructor(
    code: ImageUploadFailureCode,
    message: string,
    fileDebug: ImageFileDebugInfo
  ) {
    super(message);
    this.name = "ImageUploadError";
    this.code = code;
    this.fileDebug = fileDebug;
  }
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function getFileDebug(file: File): ImageFileDebugInfo {
  const name = file.name ?? "";
  const ext =
    name.includes(".") && name.lastIndexOf(".") >= 0
      ? name.slice(name.lastIndexOf(".")).toLowerCase()
      : "(none)";

  return {
    bytes: file.size,
    mime: file.type?.trim() ? file.type : "(empty)",
    extension: ext,
    nameTruncated: name.length > 80 ? `${name.slice(0, 80)}…` : name || "(unnamed)"
  };
}

function isHeicLike(file: File): boolean {
  const mime = (file.type || "").toLowerCase();
  if (mime === "image/heic" || mime === "image/heif") {
    return true;
  }
  const n = (file.name || "").toLowerCase();
  return n.endsWith(".heic") || n.endsWith(".heif");
}

/** Normalize any thrown/rejected value into a real Error (never undefined message). */
export function normalizeUploadReason(reason: unknown): Error {
  if (reason instanceof ImageUploadError) {
    return reason;
  }
  if (reason instanceof Error && reason.message) {
    return reason;
  }
  if (typeof reason === "string" && reason.length > 0) {
    return new Error(reason);
  }
  if (reason && typeof reason === "object") {
    const o = reason as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.length > 0) {
      return new Error(o.message);
    }
    if (typeof o.error === "string" && o.error.length > 0) {
      return new Error(o.error);
    }
    try {
      return new Error(JSON.stringify(reason));
    } catch {
      return new Error("Unknown upload error (object)");
    }
  }
  return new Error("Unknown upload error");
}

export function logUploadFailure(
  scope: string,
  file: File,
  reason: unknown,
  extra?: Record<string, unknown>
) {
  const err = normalizeUploadReason(reason);
  const meta = getFileDebug(file);
  console.warn(`[${scope}] image upload failed`, {
    ...meta,
    errorName: err.name,
    errorMessage: err.message,
    ...extra
  });
}

function ensureConfigured(file: File): void {
  const fileDebug = getFileDebug(file);
  if (!isCloudinaryConfigured()) {
    throw new ImageUploadError(
      "NOT_CONFIGURED",
      "Cloudinary is not configured (missing CLOUDINARY_* env vars on the server).",
      fileDebug
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Validate image-only uploads (8MB max). HEIC/HEIF is rejected with a clear message
 * (no silent failure or opaque Cloudinary errors).
 */
export function validateImageFile(file: File): void {
  const fileDebug = getFileDebug(file);

  if (!(file instanceof File) || file.size === 0) {
    throw new ImageUploadError(
      "EMPTY_FILE",
      "No image file was uploaded.",
      fileDebug
    );
  }

  if (file.size > MAX_BYTES) {
    throw new ImageUploadError(
      "TOO_LARGE",
      `Image must be ${MAX_BYTES / 1024 / 1024}MB or smaller (this file is about ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      fileDebug
    );
  }

  if (isHeicLike(file)) {
    throw new ImageUploadError(
      "HEIC_UNSUPPORTED",
      "HEIC/HEIF photos are not supported yet. On iPhone: Settings → Camera → Formats → “Most Compatible”, or export/share the photo as JPEG before uploading.",
      fileDebug
    );
  }

  const mime = (file.type || "").trim().toLowerCase();
  const extOk = ALLOWED_EXT.test(file.name || "");

  if (!mime || mime === "application/octet-stream") {
    if (!extOk) {
      throw new ImageUploadError(
        "UNSUPPORTED_TYPE",
        "Could not confirm an allowed image type. Use JPEG, PNG, WebP, or GIF.",
        fileDebug
      );
    }
    return;
  }

  if (!ALLOWED_MIME.test(mime)) {
    throw new ImageUploadError(
      "UNSUPPORTED_TYPE",
      `Unsupported image type (${file.type}). Use JPEG, PNG, WebP, or GIF.`,
      fileDebug
    );
  }
}

/** Map structured errors to a short `photoError` / `error` query value. */
export function photoErrorQueryFromUploadFailure(reason: unknown): string {
  if (reason instanceof ImageUploadError) {
    switch (reason.code) {
      case "TOO_LARGE":
        return "too_large";
      case "HEIC_UNSUPPORTED":
        return "heic";
      case "UNSUPPORTED_TYPE":
      case "EMPTY_FILE":
        return "unsupported";
      case "NOT_CONFIGURED":
        return "cloudinary";
      case "INVALID_RESPONSE":
      case "CLOUDINARY_REJECTED":
      default:
        return "upload";
    }
  }
  return "upload";
}

function uploadBufferToCloudinary(
  dataUri: string,
  options: { folder: string; publicId?: string },
  file: File
): Promise<UploadApiResponse> {
  const fileDebug = getFileDebug(file);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true
      },
      (err, result) => {
        if (err) {
          const wrapped = new ImageUploadError(
            "CLOUDINARY_REJECTED",
            normalizeUploadReason(err).message,
            fileDebug
          );
          reject(wrapped);
          return;
        }
        if (!result?.secure_url || !result.public_id) {
          reject(
            new ImageUploadError(
              "INVALID_RESPONSE",
              "Cloudinary response missing secure_url or public_id.",
              fileDebug
            )
          );
          return;
        }
        resolve(result);
      }
    );
  });
}

/**
 * Upload a fan or profile image. Server-only — never expose API secret to the client.
 */
export async function uploadImageFile(
  file: File,
  options: { folder: string; publicId?: string }
): Promise<{ secureUrl: string; publicId: string }> {
  validateImageFile(file);

  ensureConfigured(file);

  const fileDebug = getFileDebug(file);
  let dataUri: string;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    dataUri = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
  } catch (e) {
    const err = normalizeUploadReason(e);
    logUploadFailure("cloudinary", file, err, { phase: "read_buffer" });
    throw new ImageUploadError(
      "CLOUDINARY_REJECTED",
      `Could not read image data: ${err.message}`,
      fileDebug
    );
  }

  try {
    const result = await uploadBufferToCloudinary(dataUri, options, file);
    return {
      secureUrl: result.secure_url,
      publicId: result.public_id
    };
  } catch (e) {
    if (e instanceof ImageUploadError) {
      logUploadFailure("cloudinary", file, e, { phase: "cloudinary_api" });
      throw e;
    }
    const err = normalizeUploadReason(e);
    logUploadFailure("cloudinary", file, err, { phase: "cloudinary_api" });
    throw new ImageUploadError(
      "CLOUDINARY_REJECTED",
      err.message || "Cloudinary upload failed.",
      fileDebug
    );
  }
}
