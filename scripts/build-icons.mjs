// Builds the raster icons browsers, phones and crawlers ask for, from public/icon.svg.
// Run after changing the logo:  node scripts/build-icons.mjs   (outputs are committed)
//
//   public/favicon.ico            16/32/48 px, PNG-in-ICO (what /favicon.ico requests get)
//   public/apple-touch-icon.png   180 px, opaque (iOS home screen ignores transparency)
//   public/icon-192.png, -512.png manifest icons
//   public/icon-maskable-512.png  logo inside the 80% safe zone on the brand colour
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const svg = fs.readFileSync(path.join(root, 'public/icon.svg'));
const out = (name) => path.join(root, 'public', name);

const png = (size) => sharp(svg, { density: 512 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// ICO container holding PNG images (supported by every browser since IE Vista era).
async function ico(sizes) {
  const images = await Promise.all(sizes.map(png));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  images.forEach((image, index) => {
    const size = sizes[index];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.length;
    entries.push(entry);
  });
  return Buffer.concat([header, ...entries, ...images]);
}

fs.writeFileSync(out('favicon.ico'), await ico([16, 32, 48]));
fs.writeFileSync(out('icon-192.png'), await png(192));
fs.writeFileSync(out('icon-512.png'), await png(512));

// Opaque 180 px for iOS: the rounded square on a white plate.
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#ffffff' } })
  .composite([{ input: await png(180) }])
  .png()
  .toFile(out('apple-touch-icon.png'));

// Maskable: launchers crop to a circle or squircle, so keep the mark in the middle 80%.
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#4F46E5' } })
  .composite([{ input: await png(410), gravity: 'center' }])
  .png()
  .toFile(out('icon-maskable-512.png'));

for (const name of ['favicon.ico', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'icon-maskable-512.png']) {
  console.log(name, fs.statSync(out(name)).size, 'bytes');
}
