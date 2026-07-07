import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, 'src', 'assets');

// Max width for web images (larger images will be scaled down)
const MAX_WIDTH = 1920;
// JPEG quality (75-80 is a good web balance of quality vs size)
const JPEG_QUALITY = 78;

const files = fs.readdirSync(ASSETS_DIR).filter(f => /\.(jpg|jpeg)$/i.test(f));

let totalBefore = 0;
let totalAfter = 0;

console.log(`\nCompressing ${files.length} images in src/assets...\n`);

for (const file of files) {
  const filePath = path.join(ASSETS_DIR, file);
  const stat = fs.statSync(filePath);
  const sizeBefore = stat.size;
  totalBefore += sizeBefore;

  const tmpPath = filePath + '.tmp';

  try {
    const image = sharp(filePath);
    const meta = await image.metadata();

    let pipeline = image;

    // Downscale if wider than MAX_WIDTH
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    await pipeline.toFile(tmpPath);

    const sizeAfter = fs.statSync(tmpPath).size;

    // Only replace if the compressed version is actually smaller
    if (sizeAfter < sizeBefore) {
      fs.renameSync(tmpPath, filePath);
      totalAfter += sizeAfter;
      const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
      const beforeKB = (sizeBefore / 1024).toFixed(0);
      const afterKB = (sizeAfter / 1024).toFixed(0);
      console.log(`  ✓ ${file.padEnd(50)} ${beforeKB.padStart(7)} KB → ${afterKB.padStart(7)} KB  (-${saved}%)`);
    } else {
      fs.unlinkSync(tmpPath);
      totalAfter += sizeBefore;
      console.log(`  ~ ${file.padEnd(50)} already optimal, skipped`);
    }
  } catch (err) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    totalAfter += sizeBefore;
    console.warn(`  ✗ ${file}: ${err.message}`);
  }
}

const totalSavedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
const totalBeforeMB = (totalBefore / 1024 / 1024).toFixed(1);
const totalAfterMB = (totalAfter / 1024 / 1024).toFixed(1);
const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);

console.log(`\n${'─'.repeat(70)}`);
console.log(`  Total before : ${totalBeforeMB} MB`);
console.log(`  Total after  : ${totalAfterMB} MB`);
console.log(`  Saved        : ${totalSavedMB} MB  (${pct}% reduction)`);
console.log(`${'─'.repeat(70)}\n`);
