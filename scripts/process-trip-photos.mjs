// process-trip-photos.mjs
//
// reads public/blog/gj-rj/originals/, converts HEIC -> JPEG, resizes to 1600px,
// extracts EXIF gps + datetime via exifr, writes a sorted JSON manifest
// to src/components/mdx/gj-rj/photos.json.
//
// run: npm run process-trip-photos

import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

import exifr from "exifr";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ORIGINALS_DIR = path.join(ROOT, "public/blog/gj-rj/originals");
const OUTPUT_DIR = path.join(ROOT, "public/blog/gj-rj/img");
const PUBLIC_PREFIX = "/blog/gj-rj/img";
const JSON_PATH = path.join(ROOT, "src/components/mdx/gj-rj/photos.json");

const TARGET_WIDTH = 1600;
const JPEG_QUALITY = 82;
const SUPPORTED = /\.(heic|heif|jpe?g|png)$/i;

// sharp's prebuilt libheif is missing the hevc decoder (license-encumbered),
// so apple heic files can't be decoded directly. on macos, sips handles it.
async function heicToTempJpeg(heicPath) {
  const tempPath = path.join(
    os.tmpdir(),
    `gj-rj-${Date.now()}-${path.basename(heicPath)}.jpg`,
  );
  await execFileAsync("sips", [
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    "100",
    heicPath,
    "--out",
    tempPath,
  ]);
  return tempPath;
}

async function processOne(filename) {
  const inputPath = path.join(ORIGINALS_DIR, filename);
  const base = path.basename(filename, path.extname(filename));
  const outFilename = `${base}.jpg`;
  const outputPath = path.join(OUTPUT_DIR, outFilename);

  // exifr reads heic containers fine even when sharp can't decode the pixels
  // `gps: true` runs exifr's gps reader (computes latitude/longitude from the
  // GPS ifd block). using `pick` here would skip that derivation.
  const exif = await exifr
    .parse(inputPath, { gps: true })
    .catch(() => null);

  const isHeic = /\.hei[cf]$/i.test(filename);
  let sharpInput = inputPath;
  let tempPath = null;
  if (isHeic) {
    tempPath = await heicToTempJpeg(inputPath);
    sharpInput = tempPath;
  }

  try {
    const info = await sharp(sharpInput)
      .rotate()
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(outputPath);

    const taken = exif?.DateTimeOriginal ?? exif?.CreateDate ?? null;
    const takenAt = taken instanceof Date ? taken.toISOString() : null;

    return {
      src: `${PUBLIC_PREFIX}/${outFilename}`,
      width: info.width,
      height: info.height,
      lat: typeof exif?.latitude === "number" ? exif.latitude : null,
      lng: typeof exif?.longitude === "number" ? exif.longitude : null,
      takenAt,
      sizeKB: Math.round(info.size / 1024),
    };
  } finally {
    if (tempPath) await fs.unlink(tempPath).catch(() => {});
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let all;
  try {
    all = await fs.readdir(ORIGINALS_DIR);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`no originals dir at ${ORIGINALS_DIR}`);
      return;
    }
    throw err;
  }

  const files = all.filter((f) => SUPPORTED.test(f) && !f.startsWith("."));
  if (!files.length) {
    console.log(`no photos found in ${path.relative(ROOT, ORIGINALS_DIR)}`);
    return;
  }

  console.log(`found ${files.length} photo(s)`);
  const photos = [];
  for (const f of files) {
    process.stdout.write(`  ${f} ... `);
    try {
      const p = await processOne(f);
      photos.push(p);
      const gps =
        p.lat != null && p.lng != null
          ? `(${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`
          : "no gps";
      console.log(`ok ${p.width}x${p.height} ${p.sizeKB}KB ${gps}`);
    } catch (err) {
      console.log(`fail ${err.message.split("\n")[0]}`);
    }
  }

  // sort by takenAt ascending so the trip plays in order
  photos.sort((a, b) => {
    if (!a.takenAt && !b.takenAt) return 0;
    if (!a.takenAt) return 1;
    if (!b.takenAt) return -1;
    return a.takenAt.localeCompare(b.takenAt);
  });

  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, JSON.stringify(photos, null, 2) + "\n");
  console.log(
    `\nwrote ${photos.length} photo(s) to ${path.relative(ROOT, JSON_PATH)}`,
  );

  const noGps = photos.filter((p) => p.lat == null).length;
  if (noGps) console.log(`warning: ${noGps} photo(s) had no gps data`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
