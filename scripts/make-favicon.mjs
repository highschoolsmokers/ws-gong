import { readFileSync, writeFileSync } from "fs";
import sharp from "sharp";

// Embed the Geist font from the project
const fontPath =
  "node_modules/.pnpm/next@16.1.7_@babel+core@7.29.0_@opentelemetry+api@1.9.1_@playwright+test@1.59.1_react-d_1de8f0c4af626d36792e61638dad511b/node_modules/next/dist/next-devtools/server/font/geist-latin.woff2";
const fontBase64 = readFileSync(fontPath).toString("base64");

const SIZE = 256; // render large, then downscale

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <style>
      @font-face {
        font-family: 'Geist';
        src: url(data:font/woff2;base64,${fontBase64}) format('woff2');
        font-weight: 900;
        font-style: normal;
      }
    </style>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="#000"/>
  <text
    x="50%" y="54%"
    dominant-baseline="middle" text-anchor="middle"
    font-family="Geist, Arial Black, sans-serif"
    font-weight="900"
    font-size="88"
    fill="#fff"
    letter-spacing="-2"
  >W.S.</text>
</svg>`;

// Generate PNGs at ICO sizes
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(Buffer.from(svg)).resize(s, s).png().toBuffer()),
);

// Build ICO file (ICONDIR + ICONDIRENTRY[] + PNG data)
function buildIco(images, dims) {
  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * count;

  let offset = dataOffset;
  const entries = [];
  for (let i = 0; i < count; i++) {
    const buf = Buffer.alloc(entrySize);
    buf.writeUInt8(dims[i] < 256 ? dims[i] : 0, 0); // width
    buf.writeUInt8(dims[i] < 256 ? dims[i] : 0, 1); // height
    buf.writeUInt8(0, 2); // color palette
    buf.writeUInt8(0, 3); // reserved
    buf.writeUInt16LE(1, 4); // color planes
    buf.writeUInt16LE(32, 6); // bits per pixel
    buf.writeUInt32LE(images[i].length, 8); // size
    buf.writeUInt32LE(offset, 12); // offset
    entries.push(buf);
    offset += images[i].length;
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // image count

  return Buffer.concat([header, ...entries, ...images]);
}

const ico = buildIco(pngs, sizes);
writeFileSync("app/favicon.ico", ico);
console.log("favicon.ico written to app/favicon.ico");

// Also generate a large PNG for apple-touch-icon etc.
await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile("public/apple-touch-icon.png");
console.log("apple-touch-icon.png written to public/");
