/**
 * Contract: `src/lib/imageOptimization.ts`
 *
 * `optimizeImage(file, { maxDimension, quality })` downscales applicant photos
 * before upload. In a headless runtime there is no canvas, so optimization must
 * degrade to a passthrough of the original file: it must never throw and never
 * produce bytes larger than the input.
 *
 * `buildResponsiveAttrs(width, height)` returns the attributes applied to an
 * <img> so photos render lazily at their intrinsic size.
 *
 * These tests are RED until the module exists. They only use the passthrough
 * branch, which needs no canvas/DOM.
 */
import { test, describe, expect } from "bun:test";
import { lazyModule, makeFile } from "./support.ts";

const MODULE = "../src/lib/imageOptimization.ts";

const loadImageOptimization = lazyModule<any>(MODULE);

/** ~2KB input: far below the 300KB optimisation threshold. */
const SMALL_BYTES = 2_000;
const MB = 1024 * 1024;

async function toBlob(value: any): Promise<Blob> {
  if (value instanceof Blob) return value;
  // Tolerate a `{ data, error }` envelope result.
  if (value?.data instanceof Blob) return value.data;
  throw new Error("optimizeImage must resolve to a Blob");
}

describe("imageOptimization / optimizeImage", () => {
  test("is exported as a function", async () => {
    const { optimizeImage } = await loadImageOptimization();

    expect(typeof optimizeImage).toBe("function");
  });

  test("passes a small image through unchanged", async () => {
    const { optimizeImage } = await loadImageOptimization();
    const file = makeFile("headshot.jpg", "image/jpeg", SMALL_BYTES);

    const result = await optimizeImage(file as any, { maxDimension: 1200, quality: 0.8 });

    const blob = await toBlob(result);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(file.size);
  });

  test("never inflates the payload and never throws for large inputs", async () => {
    const { optimizeImage } = await loadImageOptimization();
    const file = makeFile("huge.jpg", "image/jpeg", 4 * MB);

    const result = await optimizeImage(file as any, { maxDimension: 1600, quality: 0.75 });

    const blob = await toBlob(result);
    expect(blob.size).toBeLessThanOrEqual(file.size);
  });

  test("tolerates huge images and missing options without throwing", async () => {
    const { optimizeImage } = await loadImageOptimization();
    const file = makeFile("enormous.jpg", "image/jpeg", 12 * MB);

    await expect(optimizeImage(file as any, undefined as any)).resolves.toBeDefined();
    await expect(optimizeImage(file as any, {})).resolves.toBeDefined();
  });
});

describe("imageOptimization / buildResponsiveAttrs", () => {
  test("is exported as a function", async () => {
    const { buildResponsiveAttrs } = await loadImageOptimization();

    expect(typeof buildResponsiveAttrs).toBe("function");
  });

  test("returns the intrinsic size plus lazy/async decoding hints", async () => {
    const { buildResponsiveAttrs } = await loadImageOptimization();

    const attrs = buildResponsiveAttrs(1200, 1600);

    expect(attrs).toEqual({
      width: 1200,
      height: 1600,
      loading: "lazy",
      decoding: "async",
    });
  });

  test("rounds descriptive or non-numeric dimensions", async () => {
    const { buildResponsiveAttrs } = await loadImageOptimization();

    const attrs = buildResponsiveAttrs(1200.6, "1600" as any);

    expect(attrs.width).toBe(1201);
    expect(attrs.height).toBe(1600);
    expect(attrs.loading).toBe("lazy");
    expect(attrs.decoding).toBe("async");
  });
});