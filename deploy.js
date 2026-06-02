import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import qrcode from 'qrcode-terminal';

const TARGET_DIR = path.resolve('dist');
const BASE_URL = 'https://here.now';
const CREDENTIALS_FILE = path.join(os.homedir(), '.herenow', 'credentials');
const STATE_DIR = path.resolve('.herenow');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

// Guess MIME Type
function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const mimeTypes = {
    html: "text/html; charset=utf-8",
    htm: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    mjs: "text/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    md: "text/plain; charset=utf-8",
    txt: "text/plain; charset=utf-8",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    mp4: "video/mp4",
    mov: "video/quicktime",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    xml: "application/xml",
    woff2: "font/woff2",
    woff: "font/woff",
    ttf: "font/ttf",
    ico: "image/x-icon"
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// Compute SHA-256 Hash of a File
function computeHash(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Recursive directory walk
function getFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, baseDir));
    } else {
      const relPath = path.relative(baseDir, filePath).replace(/\\/g, '/');
      if (relPath === '.DS_Store' || relPath.endsWith('/.DS_Store')) continue;
      if (relPath.startsWith('.herenow/')) continue;
      
      const size = stat.size;
      const contentType = guessContentType(filePath);
      const hash = computeHash(filePath);
      results.push({
        path: relPath,
        size,
        contentType,
        hash,
        absolutePath: filePath
      });
    }
  }
  return results;
}

async function run() {
  console.log(`Analyzing build output directory: ${TARGET_DIR}`);
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Error: Directory ${TARGET_DIR} does not exist. Run npm run build first.`);
    process.exit(1);
  }

  const files = getFiles(TARGET_DIR);
  console.log(`Found ${files.length} files to publish.`);

  // Load API Key
  let apiKey = process.env.HERENOW_API_KEY || '';
  if (!apiKey && fs.existsSync(CREDENTIALS_FILE)) {
    apiKey = fs.readFileSync(CREDENTIALS_FILE, 'utf8').trim();
  }

  // Construct request body
  const requestBody = {
    files: files.map(f => ({
      path: f.path,
      size: f.size,
      contentType: f.contentType,
      hash: f.hash
    })),
    spaMode: true
  };

  const headers = {
    'content-type': 'application/json',
    'x-herenow-client': 'antigravity/publish-node'
  };

  if (apiKey) {
    headers['authorization'] = `Bearer ${apiKey}`;
  }

  console.log('Registering files with here.now...');
  let publishResponse;
  let attempts = 5;
  while (attempts > 0) {
    try {
      publishResponse = await fetch(`${BASE_URL}/api/v1/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      break;
    } catch (err) {
      attempts--;
      if (attempts === 0) {
        throw err;
      }
      console.log(`Failed to register publish (${err.message}). Retrying in 3 seconds...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const publishData = await publishResponse.json();
  if (publishData.error) {
    console.error(`Publish failed: ${publishData.error} (${publishData.details || ''})`);
    process.exit(1);
  }

  const { slug, siteUrl } = publishData;
  const { versionId, finalizeUrl, uploads, skipped = [] } = publishData.upload;

  console.log(`Publish registered for slug: ${slug}`);
  console.log(`Target Site URL: ${siteUrl}`);
  console.log(`Uploading ${uploads.length} files (${skipped.length} skipped/unchanged)...`);

  // Sequential file upload to prevent network saturation and socket timeouts on large images
  let completed = 0;
  for (const upload of uploads) {
    const fileInfo = files.find(f => f.path === upload.path);
    if (!fileInfo) {
      console.warn(`Warning: Missing local file for ${upload.path}`);
      continue;
    }

    console.log(`[${++completed}/${uploads.length}] Uploading ${upload.path} (${(fileInfo.size / 1024).toFixed(1)} KB)...`);
    const fileBuffer = fs.readFileSync(fileInfo.absolutePath);
    const putHeaders = {};
    if (upload.headers && upload.headers['Content-Type']) {
      putHeaders['Content-Type'] = upload.headers['Content-Type'];
    }

    let attempts = 10;
    while (attempts > 0) {
      try {
        const uploadResponse = await fetch(upload.url, {
          method: 'PUT',
          headers: putHeaders,
          body: fileBuffer
        });

        if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
          throw new Error(`Failed to upload ${upload.path} (HTTP ${uploadResponse.status})`);
        }
        break; // success
      } catch (err) {
        attempts--;
        if (attempts === 0) {
          throw err;
        }
        console.log(`Retrying upload of ${upload.path} due to error: ${err.message}. (${attempts} attempts left)...`);
        await new Promise(r => setTimeout(r, 4000));
      }
    }
  }

  console.log('All files uploaded. Finalizing deployment...');

  // Finalize request
  let finalizeResponse;
  let finalizeAttempts = 5;
  while (finalizeAttempts > 0) {
    try {
      finalizeResponse = await fetch(finalizeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ versionId })
      });
      break;
    } catch (err) {
      finalizeAttempts--;
      if (finalizeAttempts === 0) {
        throw err;
      }
      console.log(`Failed to finalize publish (${err.message}). Retrying in 3 seconds...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const finalizeData = await finalizeResponse.json();
  if (finalizeData.error) {
    console.error(`Finalize failed: ${finalizeData.error}`);
    process.exit(1);
  }

  // Save local state
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }

  let state = { publishes: {} };
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {
      // Ignored
    }
  }

  state.publishes[slug] = {
    siteUrl,
    claimToken: publishData.claimToken || '',
    claimUrl: publishData.claimUrl || '',
    expiresAt: publishData.expiresAt || ''
  };

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

  console.log('\nDeployment completed successfully! 🎉');
  console.log(`Site URL: ${siteUrl}`);
  if (publishData.claimUrl) {
    console.log(`Claim URL (keep your site permanent): ${publishData.claimUrl}`);
  }

  console.log('\nScan this QR code with your mobile phone to preview:');
  qrcode.generate(siteUrl, { small: true });
}

run().catch(console.error);
