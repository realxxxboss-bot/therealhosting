// Generates the favicon set from public/brand/icon.svg.
// Run with: node scripts/generate-icons.mjs
import { readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("public/brand/icon.svg");
const png = (size) => sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();

// Apple touch icon, PWA icons
await writeFile("src/app/apple-icon.png", await png(180));
await writeFile("public/brand/icon-192.png", await png(192));
await writeFile("public/brand/icon-512.png", await png(512));
await copyFile("public/brand/icon.svg", "src/app/icon.svg");

// favicon.ico containing 16, 32 and 48 px PNG images
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...entries, ...images]));
console.log("Icons generated.");
