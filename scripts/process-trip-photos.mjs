// process-trip-photos.mjs
//
// per-trip photo pipeline. reads public/blog/<trip>/originals/, converts
// HEIC -> JPEG, resizes to 1600px, generates 720px thumbs, and maintains the
// manifest at content/trips/<trip>/photos.json.
//
// non-destructive: existing manifest entries are kept and merged, so you can
// drop a new batch into originals/ (or have an empty originals/) without
// clobbering already-processed photos. thumbs are (re)generated from the
// processed img/ files, so they never need the originals.
//
// gps is intentionally NOT stored: exact coords (friends' homes etc) would
// ship to every visitor and live in a public repo. it's still logged here so
// you can eyeball it while processing.
//
// run: npm run process-trip-photos [-- <trip-slug>]   (default: gj-rj)
import { execFile } from "child_process";
import exifr from "exifr";
import fs from "fs/promises";
import os from "os";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TRIP = process.argv[2] ?? "gj-rj";
const ORIGINALS_DIR = path.join(ROOT, `public/blog/${TRIP}/originals`);
const OUTPUT_DIR = path.join(ROOT, `public/blog/${TRIP}/img`);
const THUMB_DIR = path.join(OUTPUT_DIR, "thumb");
const PUBLIC_PREFIX = `/blog/${TRIP}/img`;
const JSON_PATH = path.join(ROOT, `content/trips/${TRIP}/photos.json`);

const TARGET_WIDTH = 1600;
const THUMB_WIDTH = 720;
const JPEG_QUALITY = 82;
const THUMB_QUALITY = 75;
const SUPPORTED = /\.(heic|heif|jpe?g|png)$/i;

// sharp's prebuilt libheif is missing the hevc decoder (license-encumbered),
// so apple heic files can't be decoded directly. on macos, sips handles it.
async function heicToTempJpeg(heicPath) {
  const tempPath = path.join(
    os.tmpdir(),
    `trip-${Date.now()}-${path.basename(heicPath)}.jpg`,
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

async function exists(p) {
  return fs
    .access(p)
    .then(() => true)
    .catch(() => false);
}

async function loadManifest() {
  try {
    const raw = JSON.parse(await fs.readFile(JSON_PATH, "utf-8"));
    // strip legacy gps fields on the way in
    return raw.map(({ lat, lng, ...rest }) => rest);
  } catch {
    return [];
  }
}

async function processOne(filename) {
  const inputPath = path.join(ORIGINALS_DIR, filename);
  const base = path.basename(filename, path.extname(filename));
  const outFilename = `${base}.jpg`;
  const outputPath = path.join(OUTPUT_DIR, outFilename);

  // exifr reads heic containers fine even when sharp can't decode the pixels.
  // `gps: true` so we can log coords for sanity-checking (not persisted).
  const exif = await exifr.parse(inputPath, { gps: true }).catch(() => null);

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
    const gps =
      typeof exif?.latitude === "number" && typeof exif?.longitude === "number"
        ? `(${exif.latitude.toFixed(4)}, ${exif.longitude.toFixed(4)})`
        : "no gps";

    return {
      entry: {
        src: `${PUBLIC_PREFIX}/${outFilename}`,
        width: info.width,
        height: info.height,
        takenAt,
        sizeKB: Math.round(info.size / 1024),
      },
      gps,
    };
  } finally {
    if (tempPath) await fs.unlink(tempPath).catch(() => {});
  }
}

async function processOriginals(manifestBySrc) {
  let all;
  try {
    all = await fs.readdir(ORIGINALS_DIR);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`no originals dir at ${path.relative(ROOT, ORIGINALS_DIR)}`);
      return;
    }
    throw err;
  }

  const files = all.filter((f) => SUPPORTED.test(f) && !f.startsWith("."));
  if (!files.length) {
    console.log("no new originals to process");
    return;
  }

  let processed = 0;
  let skipped = 0;
  for (const f of files) {
    const base = path.basename(f, path.extname(f));
    const src = `${PUBLIC_PREFIX}/${base}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, `${base}.jpg`);
    if (manifestBySrc.has(src) && (await exists(outputPath))) {
      skipped++;
      continue;
    }
    process.stdout.write(`  ${f} ... `);
    try {
      const { entry, gps } = await processOne(f);
      manifestBySrc.set(entry.src, entry);
      processed++;
      console.log(`ok ${entry.width}x${entry.height} ${entry.sizeKB}KB ${gps}`);
    } catch (err) {
      console.log(`fail ${err.message.split("\n")[0]}`);
    }
  }
  console.log(`originals: ${processed} processed, ${skipped} already done`);
}

async function generateThumbs() {
  await fs.mkdir(THUMB_DIR, { recursive: true });
  const imgs = (await fs.readdir(OUTPUT_DIR)).filter((f) =>
    /\.jpe?g$/i.test(f),
  );
  let made = 0;
  for (const f of imgs) {
    const thumbPath = path.join(THUMB_DIR, f);
    if (await exists(thumbPath)) continue;
    await sharp(path.join(OUTPUT_DIR, f))
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
      .toFile(thumbPath);
    made++;
  }
  console.log(`thumbs: ${made} generated, ${imgs.length - made} already done`);
  return imgs;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const existing = await loadManifest();
  const manifestBySrc = new Map(existing.map((p) => [p.src, p]));
  console.log(
    `trip "${TRIP}": ${manifestBySrc.size} photo(s) in existing manifest`,
  );

  await processOriginals(manifestBySrc);
  const imgs = await generateThumbs();

  // reconcile: img files with no manifest entry can't be used by TripPhoto
  // (no dimensions / takenAt); they need their original re-dropped.
  const imgSrcs = new Set(imgs.map((f) => `${PUBLIC_PREFIX}/${f}`));
  const orphanImgs = [...imgSrcs].filter((s) => !manifestBySrc.has(s));
  for (const s of orphanImgs) {
    console.log(`warning: ${s} on disk but not in manifest (re-add original)`);
  }
  const missingFiles = [...manifestBySrc.keys()].filter((s) => !imgSrcs.has(s));
  for (const s of missingFiles) {
    console.log(`warning: manifest entry ${s} has no file on disk`);
  }

  // sort by takenAt ascending so the trip plays in order
  const photos = [...manifestBySrc.values()].sort((a, b) => {
    if (!a.takenAt && !b.takenAt) return 0;
    if (!a.takenAt) return 1;
    if (!b.takenAt) return -1;
    return a.takenAt.localeCompare(b.takenAt);
  });

  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, JSON.stringify(photos, null, 2) + "\n");
  console.log(
    `wrote ${photos.length} photo(s) to ${path.relative(ROOT, JSON_PATH)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
