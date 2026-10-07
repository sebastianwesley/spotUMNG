/**
 * Convert src/assets raster images to WebP + responsive 800px variants.
 *
 * - Outputs `<name>.webp` (max width 1600) and `<name>-800.webp` (source wider
 *   than 800 only). Originals are kept so existing JPG imports keep building.
 * - Idempotent: skips files whose WebP outputs already exist and are newer.
 * - Prints a before/after size table plus total savings.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "..", "src", "assets");

const MAX_WIDTH = 1600;
const SMALL_WIDTH = 800;
const QUALITY = 78;

const files = fs
  .readdirSync(ASSETS_DIR)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

let totalBefore = 0;
let totalAfter = 0;
let processed = 0;
const skipped = [];

console.log(`\nOptimizing ${files.length} images in src/assets (WebP q${QUALITY})...\n`);
console.log(`${"file".padEnd(40)} ${"before".padStart(12)} ${"webp".padStart(12)} ${"-800".padStart(12)}  saved`);

for (const file of files) {
  const srcPath = path.join(ASSETS_DIR, file);
  const outName = file.replace(/\.(jpg|jpeg|png)$/i, "");
  const bigOut = path.join(ASSETS_DIR, `${outName}.webp`);
  const smallOut = path.join(ASSETS_DIR, `${outName}-800.webp`);

  const beforeBytes = fs.statSync(srcPath).size;

  // Idempotent: the big variant must exist and be at least as new as the source.
  if (fs.existsSync(bigOut) && fs.statSync(bigOut).mtimeMs >= fs.statSync(srcPath).mtimeMs) {
    skipped.push(file);
    const webpBytes = fs.statSync(bigOut).size;
    const smallBytes = fs.existsSync(smallOut) ? fs.statSync(smallOut).size : 0;
    totalBefore += beforeBytes;
    totalAfter += webpBytes + smallBytes;
    continue;
  }

  try {
    const meta = await sharp(srcPath).metadata();
    if (!meta.width) throw new Error("unknown width");

    let pipeline = sharp(srcPath);
    if (meta.width > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH });

    const bigBuffer = await pipeline
      .clone()
      .webp({ quality: QUALITY })
      .toBuffer();

    let smallBuffer = null;
    if (meta.width > SMALL_WIDTH) {
      smallBuffer = await sharp(srcPath)
        .resize({ width: SMALL_WIDTH })
        .webp({ quality: QUALITY })
        .toBuffer();
    }

    fs.writeFileSync(bigOut, bigBuffer);
    if (smallBuffer) fs.writeFileSync(smallOut, smallBuffer);

    totalBefore += beforeBytes;
    totalAfter += bigBuffer.length + (smallBuffer?.length ?? 0);
    processed += 1;

    const saved = beforeBytes - (bigBuffer.length + (smallBuffer?.length ?? 0));
    console.log(
      `${file.padEnd(40)} ${(beforeBytes / 1024 / 1024).toFixed(2).padStart(10)}MB ${(
        bigBuffer.length / 1024 / 1024
      )
        .toFixed(2)
        .padStart(10)}MB ${((smallBuffer?.length ?? 0) / 1024).toFixed(0).padStart(11)}KB ${(
        -saved / 1024
      ).toFixed(0).padStart(8)}KB`
    );
  } catch (err) {
    console.warn(`  ✗ ${file}: ${err.message}`);
    totalBefore += beforeBytes;
    totalAfter += beforeBytes;
  }
}

console.log(`\n${"─".repeat(80)}`);
console.log(`  Files        : ${files.length} (${processed} converted, ${skipped.length} already done)`);
console.log(`  Total before : ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Total after  : ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
console.log(
  `  Saved        : ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB (${(
    (1 - totalAfter / totalBefore) * 100
  ).toFixed(1)}% reduction)`
);
if (skipped.length) console.log(`  Skipped (idempotent): ${skipped.join(", ")}`);
console.log(`${"─".repeat(80)}\n`);
