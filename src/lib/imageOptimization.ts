export interface OptimizeImageOptions {
  /** Longest edge of the output, in pixels. */
  maxDimension?: number;
  /** JPEG encoder quality (0-1). */
  quality?: number;
  /** Files at or below this size skip optimisation entirely. */
  maxBytes?: number;
}

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_BYTES = 300 * 1024;

/**
 * Downscales and re-encodes an applicant photo as JPEG before upload.
 *
 * Fail-open by design: the original is returned whenever the browser cannot
 * decode/encode (no canvas, headless runtime) or the re-encoded bytes would be
 * larger than the input. Never throws.
 */
export async function optimizeImage(
  file: File | Blob,
  opts: OptimizeImageOptions = {}
): Promise<Blob> {
  const maxDimension = opts.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;

  try {
    if (!file || typeof file.size !== "number") return file;

    // Already small enough — re-encoding would only lose quality.
    if (file.size <= maxBytes) return file;

    const hasOffscreenCanvas = typeof OffscreenCanvas !== "undefined";
    const hasDocumentCanvas =
      typeof document !== "undefined" && typeof document.createElement === "function";
    if ((!hasOffscreenCanvas && !hasDocumentCanvas) || typeof createImageBitmap !== "function") {
      return file;
    }

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    let compressed: Blob | null = null;

    try {
      if (hasOffscreenCanvas) {
        const offscreen = new OffscreenCanvas(width, height);
        const context = offscreen.getContext("2d");
        if (!context) return file;
        context.drawImage(bitmap, 0, 0, width, height);
        compressed = await offscreen.convertToBlob({ type: "image/jpeg", quality });
      } else {
        const element = document.createElement("canvas");
        element.width = width;
        element.height = height;
        const context = element.getContext("2d");
        if (!context) return file;
        context.drawImage(bitmap, 0, 0, width, height);
        compressed = await new Promise<Blob | null>((resolve) => {
          element.toBlob((blob) => resolve(blob), "image/jpeg", quality);
        });
      }
    } finally {
      bitmap.close?.();
    }

    // Never inflate: a bigger or empty result is worse than the original.
    if (compressed && compressed.size > 0 && compressed.size < file.size) {
      return compressed;
    }

    return file;
  } catch (error) {
    console.warn("optimizeImage skipped, using original:", error);
    return file;
  }
}
