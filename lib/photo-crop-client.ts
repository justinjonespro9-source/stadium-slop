/** Client-safe image upload rules (mirrors lib/cloudinary.ts). */
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = /^image\/(jpeg|pjpeg|png|x-png|webp|gif)$/i;
const ALLOWED_EXT = /\.(jpe?g|png|gif|webp)$/i;

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

  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  if (
    mime === "image/heic" ||
    mime === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  ) {
    return {
      ok: false,
      code: "HEIC",
      message:
        "HEIC/HEIF is not supported. Export as JPEG or use Most Compatible camera format."
    };
  }

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
  const maxX = Math.max(0, (drawW - frameWidth) / 2);
  const maxY = Math.max(0, (drawH - frameHeight) / 2);
  return {
    offsetX: Math.min(maxX, Math.max(-maxX, offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, offsetY))
  };
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

  ctx.fillStyle = "#000";
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
  return new File([blob], `${base}-cropped.jpg`, {
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
