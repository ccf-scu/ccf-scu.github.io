import { access, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import sharp from "sharp";
import manifest from "../migrations/legacy-content-manifest.json" with { type: "json" };

const root = resolve(".");
let converted = 0;
let missing = 0;

async function convert(sourceRelative, outputPublic, width, height) {
  if (!sourceRelative || !outputPublic || !outputPublic.startsWith("/uploads/legacy/")) return;
  const source = join(root, sourceRelative.replaceAll("/", "\\"));
  try { await access(source); } catch { missing += 1; return; }
  const target = join(root, "public", outputPublic.replace(/^\/uploads\//, "uploads/").replaceAll("/", "\\"));
  await mkdir(dirname(target), { recursive: true });
  await sharp(source).rotate().resize({ width, height, fit: "inside", withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(target);
  converted += 1;
}

for (const entry of manifest.activities) await convert(entry.sourceImage, entry.outputImage, 1600, 1100);
for (const entry of manifest.members) await convert(entry.sourceImage, entry.outputImage, 640, 640);
for (const entry of manifest.honors) await convert(entry.sourceImage, entry.outputImage, 1600, 1200);
console.log(`Optimized ${converted} legacy images; ${missing} referenced source images were missing and remain flagged for review.`);
