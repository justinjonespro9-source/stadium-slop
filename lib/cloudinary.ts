import { Readable } from "node:stream";

import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

/**
 * Required server env (see `.env.example`):
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */
export const CLOUDINARY_ENV_KEYS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
] as const;

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
  | "READ_FAILED"
  | "CLOUDINARY_REJECTED"
  | "INVALID_RESPONSE";

export type ImageFileDebugInfo = {
  bytes: number;
  mime: string;
  extension: string;
  nameTruncated: string;
};

export type CloudinaryErrorDetails = {
  message: string;
  httpCode?: number;
  nestedMessage?: string;
  errorName?: string;
};

export type CloudinaryEnvStatus = {
  configured: boolean;
  cloudNameSet: boolean;
  apiKeySet: boolean;
  apiSecretSet: boolean;
  /** First 4 chars of cloud name — dev-only fingerprint, not secret. */
  cloudNameHint?: string;
};

export type ResolvedCloudinaryUpload = {
  folder: string;
  publicId: string;
  format: string;
  bufferBytes: number;
  fileMime: string;
  fileName: string;
};

export class ImageUploadError extends Error {
  readonly code: ImageUploadFailureCode;
  readonly fileDebug: ImageFileDebugInfo;
  readonly cloudinary?: CloudinaryErrorDetails;

  constructor(
    code: ImageUploadFailureCode,
    message: string,
    fileDebug: ImageFileDebugInfo,
    cloudinaryDetails?: CloudinaryErrorDetails
  ) {
    super(message);
    this.name = "ImageUploadError";
    this.code = code;
    this.fileDebug = fileDebug;
    this.cloudinary = cloudinaryDetails;
  }
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

/** Safe env fingerprint for logs — never includes secrets. */
export function getCloudinaryEnvStatus(): CloudinaryEnvStatus {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  return {
    configured: isCloudinaryConfigured(),
    cloudNameSet: cloudName.length > 0,
    apiKeySet: Boolean(process.env.CLOUDINARY_API_KEY?.trim()),
    apiSecretSet: Boolean(process.env.CLOUDINARY_API_SECRET?.trim()),
    cloudNameHint: cloudName.length >= 4 ? cloudName.slice(0, 4) : undefined
  };
}

/** Strip secrets / long base64 from log strings. */
export function redactSecretsForLog(text: string): string {
  return text
    .replace(/api_secret=[^&\s'"]+/gi, "api_secret=[REDACTED]")
    .replace(/api_key=[^&\s'"]+/gi, "api_key=[REDACTED]")
    .replace(/CLOUDINARY_API_SECRET[=:\s][^\s'"]+/gi, "CLOUDINARY_API_SECRET=[REDACTED]")
    .replace(/data:image\/[a-z+]+;base64,[a-z0-9+/=]+/gi, "data:image/…;base64,[REDACTED]")
    .replace(/[A-Za-z0-9+/]{80,}={0,2}/g, "[REDACTED_BLOB]");
}

export function extractCloudinaryErrorDetails(reason: unknown): CloudinaryErrorDetails {
  const fallback: CloudinaryErrorDetails = {
    message: "Unknown Cloudinary error",
    errorName: reason instanceof Error ? reason.name : undefined
  };

  const visit = (value: unknown, depth: number): CloudinaryErrorDetails => {
    if (depth > 4 || value == null) {
      return fallback;
    }

    if (value instanceof ImageUploadError && value.cloudinary) {
      return value.cloudinary;
    }

    if (typeof value === "string") {
      return {
        message: redactSecretsForLog(value),
        errorName: "string"
      };
    }

    if (value instanceof Error) {
      const httpCode =
        typeof (value as Error & { http_code?: number }).http_code === "number"
          ? (value as Error & { http_code: number }).http_code
          : undefined;
      const nested =
        value && typeof value === "object" && "error" in value
          ? (value as Error & { error?: { message?: string } }).error?.message
          : undefined;

      const fromCause = value.cause ? visit(value.cause, depth + 1) : null;

      return {
        message: redactSecretsForLog(value.message || fallback.message),
        httpCode: httpCode ?? fromCause?.httpCode,
        nestedMessage: nested
          ? redactSecretsForLog(nested)
          : fromCause?.nestedMessage,
        errorName: value.name
      };
    }

    if (typeof value === "object") {
      const o = value as Record<string, unknown>;
      const httpCode = typeof o.http_code === "number" ? o.http_code : undefined;
      const msg =
        typeof o.message === "string"
          ? o.message
          : typeof o.error === "object" &&
              o.error &&
              typeof (o.error as Record<string, unknown>).message === "string"
            ? String((o.error as Record<string, unknown>).message)
            : undefined;

      return {
        message: redactSecretsForLog(msg ?? fallback.message),
        httpCode,
        nestedMessage:
          typeof o.error === "object" &&
          o.error &&
          typeof (o.error as Record<string, unknown>).message === "string"
            ? redactSecretsForLog(
                String((o.error as Record<string, unknown>).message)
              )
            : undefined,
        errorName: typeof o.name === "string" ? o.name : undefined
      };
    }

    return fallback;
  };

  return visit(reason, 0);
}

/** Cloudinary folder: alphanumeric segments separated by `/`. */
export function sanitizeCloudinaryFolder(raw: string): string {
  const segments = raw
    .split("/")
    .map((seg) => seg.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);
  return segments.join("/") || "stadium-slop/uploads";
}

/** Cloudinary public_id (no slashes — folder is separate). */
export function sanitizeCloudinaryPublicId(raw: string): string {
  const cleaned = raw
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
  return cleaned || `upload-${Date.now()}`;
}

export function inferUploadFormat(file: File): string {
  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  if (mime.includes("png") || name.endsWith(".png")) {
    return "png";
  }
  if (mime.includes("webp") || name.endsWith(".webp")) {
    return "webp";
  }
  if (mime.includes("gif") || name.endsWith(".gif")) {
    return "gif";
  }
  return "jpg";
}

function buildResolvedUpload(
  file: File,
  buffer: Buffer,
  options: { folder: string; publicId?: string }
): ResolvedCloudinaryUpload {
  const folder = sanitizeCloudinaryFolder(options.folder);
  const publicId = sanitizeCloudinaryPublicId(
    options.publicId ?? `fan-${Date.now()}`
  );
  return {
    folder,
    publicId,
    format: inferUploadFormat(file),
    bufferBytes: buffer.length,
    fileMime: file.type?.trim() || "image/jpeg",
    fileName: getFileDebug(file).nameTruncated
  };
}

export function getFileDebug(file: File): ImageFileDebugInfo {
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
  const cloudinary = extractCloudinaryErrorDetails(reason);
  const safeExtra = extra
    ? Object.fromEntries(
        Object.entries(extra).map(([k, v]) => [
          k,
          typeof v === "string" ? redactSecretsForLog(v) : v
        ])
      )
    : undefined;

  console.warn(`[${scope}] image upload failed`, {
    ...meta,
    errorName: err.name,
    errorMessage: redactSecretsForLog(err.message),
    cloudinaryHttpCode: cloudinary.httpCode,
    cloudinaryMessage: cloudinary.message,
    cloudinaryNested: cloudinary.nestedMessage,
    ...safeExtra
  });

  if (process.env.NODE_ENV === "development") {
    console.warn(`[${scope}] image upload failed (dev detail)`, {
      ...meta,
      ...safeExtra,
      cloudinary,
      env: getCloudinaryEnvStatus()
    });
  }
}

function logUploadStart(scope: string, resolved: ResolvedCloudinaryUpload) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  console.info(`[${scope}] cloudinary upload start`, {
    folder: resolved.folder,
    publicId: resolved.publicId,
    format: resolved.format,
    bufferBytes: resolved.bufferBytes,
    fileMime: resolved.fileMime,
    fileName: resolved.fileName,
    env: getCloudinaryEnvStatus()
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
  const looksLikeJpeg =
    extOk && /\.jpe?g$/i.test(file.name || "") && file.size > 0;

  if (!mime || mime === "application/octet-stream") {
    if (looksLikeJpeg || extOk) {
      return;
    }
    throw new ImageUploadError(
      "UNSUPPORTED_TYPE",
      "Could not confirm an allowed image type. Use JPEG, PNG, WebP, or GIF.",
      fileDebug
    );
  }

  if (!ALLOWED_MIME.test(mime)) {
    throw new ImageUploadError(
      "UNSUPPORTED_TYPE",
      `Unsupported image type (${file.type || "unknown"}). Use JPEG, PNG, WebP, or GIF.`,
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
      case "EMPTY_FILE":
        return "empty_file";
      case "UNSUPPORTED_TYPE":
        return "unsupported";
      case "NOT_CONFIGURED":
        return "cloudinary";
      case "READ_FAILED":
        return "read_failed";
      case "INVALID_RESPONSE":
        return "cloudinary_response";
      case "CLOUDINARY_REJECTED":
        return "cloudinary_api";
      default:
        return "upload";
    }
  }
  return "upload";
}

function wrapCloudinaryFailure(
  file: File,
  reason: unknown,
  resolved?: ResolvedCloudinaryUpload
): ImageUploadError {
  const fileDebug = getFileDebug(file);
  const cloudinary = extractCloudinaryErrorDetails(reason);
  const baseMessage =
    cloudinary.nestedMessage ||
    cloudinary.message ||
    normalizeUploadReason(reason).message ||
    "Cloudinary upload failed.";

  const err = new ImageUploadError(
    "CLOUDINARY_REJECTED",
    redactSecretsForLog(baseMessage),
    fileDebug,
    cloudinary
  );

  logUploadFailure("cloudinary", file, err, {
    phase: "cloudinary_api",
    uploadFolder: resolved?.folder,
    uploadPublicId: resolved?.publicId,
    uploadFormat: resolved?.format,
    bufferBytes: resolved?.bufferBytes
  });

  return err;
}

function uploadBufferToCloudinary(
  buffer: Buffer,
  resolved: ResolvedCloudinaryUpload,
  file: File
): Promise<UploadApiResponse> {
  const fileDebug = getFileDebug(file);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: resolved.folder,
        public_id: resolved.publicId,
        format: resolved.format,
        resource_type: "image",
        overwrite: true,
        invalidate: true
      },
      (err, result) => {
        if (err) {
          reject(wrapCloudinaryFailure(file, err, resolved));
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
        if (process.env.NODE_ENV === "development") {
          console.info("[cloudinary] upload ok", {
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
            httpCode: 200
          });
        }
        resolve(result);
      }
    );

    uploadStream.on("error", (streamErr) => {
      reject(wrapCloudinaryFailure(file, streamErr, resolved));
    });

    Readable.from(buffer).pipe(uploadStream);
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
  let buffer: Buffer;

  try {
    buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      throw new ImageUploadError(
        "EMPTY_FILE",
        "Image file was empty after upload.",
        fileDebug
      );
    }
  } catch (e) {
    if (e instanceof ImageUploadError) {
      throw e;
    }
    const err = normalizeUploadReason(e);
    logUploadFailure("cloudinary", file, err, { phase: "read_buffer" });
    throw new ImageUploadError(
      "READ_FAILED",
      `Could not read image data: ${err.message}`,
      fileDebug
    );
  }

  if (buffer.length > MAX_BYTES) {
    throw new ImageUploadError(
      "TOO_LARGE",
      `Image must be ${MAX_BYTES / 1024 / 1024}MB or smaller.`,
      fileDebug
    );
  }

  const resolved = buildResolvedUpload(file, buffer, options);
  logUploadStart("cloudinary", resolved);

  try {
    const result = await uploadBufferToCloudinary(buffer, resolved, file);
    return {
      secureUrl: result.secure_url,
      publicId: result.public_id
    };
  } catch (e) {
    if (e instanceof ImageUploadError) {
      throw e;
    }
    throw wrapCloudinaryFailure(file, e, resolved);
  }
}
