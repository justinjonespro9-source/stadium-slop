/** Client-safe image upload rules (mirrors lib/cloudinary.ts). */
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = /^image\/(jpeg|pjpeg|png|x-png|webp|gif)$/i;
const ALLOWED_EXT = /\.(jpe?g|png|gif|webp)$/i;

export function isHeicLikeFile(file: File): boolean {
  const mime = (file.type || "").toLowerCase();
  if (mime === "image/heic" || mime === "image/heif") {
    return true;
  }
  const name = (file.name || "").toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

export type ClientImageValidationCode =
  | "EMPTY"
  | "TOO_LARGE"
  | "HEIC"
  | "UNSUPPORTED";

export function validateClientImageFile(file: File): {
  ok: true;
} | {
  ok: false;
  code: ClientImageValidationCode;
  message: string;
} {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, code: "EMPTY", message: "No image file selected." };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      ok: false,
      code: "TOO_LARGE",
      message: "Image must be about 8MB or smaller."
    };
  }

  if (isHeicLikeFile(file)) {
    return {
      ok: false,
      code: "HEIC",
      message:
        "This phone photo appears to be HEIC. Choose Most Compatible/JPEG in iPhone camera settings, export as JPEG from Photos, or take a new photo through the app."
    };
  }

  const mime = (file.type || "").toLowerCase();
  const extOk = ALLOWED_EXT.test(file.name || "");
  if (!mime || mime === "application/octet-stream") {
    if (!extOk) {
      return {
        ok: false,
        code: "UNSUPPORTED",
        message: "Use JPEG, PNG, WebP, or GIF."
      };
    }
    return { ok: true };
  }

  if (!ALLOWED_MIME.test(mime)) {
    return {
      ok: false,
      code: "UNSUPPORTED",
      message: "Use JPEG, PNG, WebP, or GIF."
    };
  }

  return { ok: true };
}

/** 4:3 — fits photo-backed review cards; hero uses object-contain. */
export const CROP_ASPECT = 4 / 3;
export const CROP_OUTPUT_WIDTH = 1600;
export const CROP_OUTPUT_HEIGHT = 1200;

export type CropTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function computeCoverScale(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number
) {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return 1;
  }
  return Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
}

/** Full image fits inside frame; letterboxing when aspect ≠ frame — scale ≤ cover scale. */
export function computeContainScale(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number
) {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return 1;
  }
  return Math.min(frameWidth / imageWidth, frameHeight / imageHeight);
}

export function clampPan(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number
) {
  const drawW = imageWidth * scale;
  const drawH = imageHeight * scale;
  // When image is larger than frame: pan within overflow. When smaller: pan within letterbox.
  const maxX = Math.abs(drawW - frameWidth) / 2;
  const maxY = Math.abs(drawH - frameHeight) / 2;
  return {
    offsetX: Math.min(maxX, Math.max(-maxX, offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, offsetY))
  };
}

/** Resize + JPEG export for HEIC decode or full-photo normalization. */
export function exportImageToJpegBlob(
  image: HTMLImageElement,
  maxDimension = 2400,
  quality = 0.88
): Promise<Blob> {
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  if (iw <= 0 || ih <= 0) {
    return Promise.reject(new Error("Image has no pixel dimensions."));
  }

  const scale = Math.min(1, maxDimension / Math.max(iw, ih));
  const cw = Math.max(1, Math.round(iw * scale));
  const ch = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("Could not create export canvas."));
  }

  ctx.fillStyle = "#0c1828";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(image, 0, 0, cw, ch);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export image as JPEG."));
          return;
        }
        if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
          reject(
            new Error(
              "Photo is still too large after conversion. Try a smaller shot or zoom out before crop."
            )
          );
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * When Safari decodes HEIC for <img>, convert to JPEG before upload.
 * Otherwise return the file unchanged (after validation).
 */
export async function prepareClientUploadFile(file: File): Promise<File> {
  if (!isHeicLikeFile(file)) {
    const check = validateClientImageFile(file);
    if (!check.ok) {
      throw new Error(check.message);
    }
    return file;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(
          new Error(
            "This phone photo appears to be HEIC. Choose Most Compatible/JPEG in iPhone camera settings, export as JPEG from Photos, or take a new photo through the app."
          )
        );
      el.src = url;
    });
    const blob = await exportImageToJpegBlob(img);
    const converted = blobToUploadFile(blob, file.name);
    const check = validateClientImageFile(converted);
    if (!check.ok) {
      throw new Error(check.message);
    }
    return converted;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function cropImageToBlob(
  image: HTMLImageElement,
  transform: CropTransform,
  frameWidth: number,
  frameHeight: number,
  outputWidth = CROP_OUTPUT_WIDTH,
  outputHeight = CROP_OUTPUT_HEIGHT
): Promise<Blob> {
  const scaleFactor = outputWidth / frameWidth;
  const scale = transform.scale * scaleFactor;
  const offsetX = transform.offsetX * scaleFactor;
  const offsetY = transform.offsetY * scaleFactor;

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("Could not create crop canvas."));
  }

  ctx.fillStyle = "#0c1828";
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  const x = (outputWidth - drawW) / 2 + offsetX;
  const y = (outputHeight - drawH) / 2 + offsetY;

  ctx.drawImage(image, x, y, drawW, drawH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export cropped image."));
          return;
        }
        if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
          reject(
            new Error(
              "Cropped image is still too large. Zoom out or use a smaller original."
            )
          );
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });
}

export function blobToUploadFile(blob: Blob, originalName: string): File {
  const base =
    originalName.replace(/\.[^.]+$/, "").slice(0, 80) || "fan-photo";
  const jpegBlob =
    blob.type === "image/jpeg" || blob.type === "image/pjpeg"
      ? blob
      : new Blob([blob], { type: "image/jpeg" });
  return new File([jpegBlob], `${base}-cropped.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now()
  });
}

export function assignFileToInput(input: HTMLInputElement, file: File | null) {
  const dt = new DataTransfer();
  if (file) {
    dt.items.add(file);
  }
  input.files = dt.files;
}
