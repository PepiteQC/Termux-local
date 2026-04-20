import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const rootDir = process.cwd();
const furnituresDir = path.join(rootDir, "public", "sprites", "furnitures");
const avatarDir = path.join(rootDir, "public", "sprites", "avatar");

const PALETTE = {
  transparent: [0, 0, 0, 0],
  violet: [74, 58, 255, 255],
  cyan: [0, 224, 255, 255],
  magenta: [255, 58, 242, 255],
  white: [242, 242, 242, 255],
  navy: [21, 29, 48, 255],
  wall: [27, 30, 42, 255],
  steel: [83, 95, 128, 255],
  gold: [255, 220, 132, 255],
  shadow: [8, 10, 15, 170]
};

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let round = 0; round < 8; round += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = buildCrcTable();

function crc32(buffer) {
  let value = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    value = CRC_TABLE[(value ^ buffer[index]) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function createCanvas(width, height) {
  return { width, height, pixels: Buffer.alloc(width * height * 4, 0) };
}

function drawPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
    return;
  }
  const offset = (y * canvas.width + x) * 4;
  const rgba = Array.isArray(color) ? color : PALETTE[color];
  canvas.pixels[offset] = rgba[0];
  canvas.pixels[offset + 1] = rgba[1];
  canvas.pixels[offset + 2] = rgba[2];
  canvas.pixels[offset + 3] = rgba[3];
}

function fillRect(canvas, x, y, width, height, color) {
  for (let offsetY = 0; offsetY < height; offsetY += 1) {
    for (let offsetX = 0; offsetX < width; offsetX += 1) {
      drawPixel(canvas, x + offsetX, y + offsetY, color);
    }
  }
}

function fillDiamond(canvas, cx, cy, radiusX, radiusY, color) {
  for (let y = -radiusY; y <= radiusY; y += 1) {
    const span = Math.floor(radiusX * (1 - Math.abs(y) / (radiusY || 1)));
    for (let x = -span; x <= span; x += 1) {
      drawPixel(canvas, cx + x, cy + y, color);
    }
  }
}

function outlineRect(canvas, x, y, width, height, color) {
  for (let offsetX = 0; offsetX < width; offsetX += 1) {
    drawPixel(canvas, x + offsetX, y, color);
    drawPixel(canvas, x + offsetX, y + height - 1, color);
  }
  for (let offsetY = 0; offsetY < height; offsetY += 1) {
    drawPixel(canvas, x, y + offsetY, color);
    drawPixel(canvas, x + width - 1, y + offsetY, color);
  }
}

function line(canvas, x0, y0, x1, y1, color) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    drawPixel(canvas, x0, y0, color);
    if (x0 === x1 && y0 === y1) {
      break;
    }
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function shadeBase(canvas) {
  fillDiamond(canvas, 32, 48, 24, 10, PALETTE.shadow);
}

function drawChair() {
  const canvas = createCanvas(64, 64);
  shadeBase(canvas);
  fillRect(canvas, 18, 25, 26, 10, PALETTE.violet);
  outlineRect(canvas, 18, 25, 26, 10, PALETTE.white);
  fillRect(canvas, 22, 13, 18, 14, PALETTE.cyan);
  outlineRect(canvas, 22, 13, 18, 14, PALETTE.white);
  fillRect(canvas, 20, 35, 4, 12, PALETTE.navy);
  fillRect(canvas, 38, 35, 4, 12, PALETTE.navy);
  fillRect(canvas, 24, 35, 4, 10, PALETTE.steel);
  fillRect(canvas, 34, 35, 4, 10, PALETTE.steel);
  return canvas;
}

function drawTable() {
  const canvas = createCanvas(64, 64);
  shadeBase(canvas);
  fillDiamond(canvas, 32, 28, 22, 10, PALETTE.cyan);
  outlineRect(canvas, 14, 24, 36, 8, PALETTE.white);
  fillRect(canvas, 18, 30, 28, 7, PALETTE.violet);
  fillRect(canvas, 20, 37, 4, 12, PALETTE.steel);
  fillRect(canvas, 40, 37, 4, 12, PALETTE.steel);
  fillRect(canvas, 28, 37, 4, 12, PALETTE.navy);
  fillRect(canvas, 34, 37, 4, 12, PALETTE.navy);
  return canvas;
}

function drawBed() {
  const canvas = createCanvas(64, 64);
  shadeBase(canvas);
  fillRect(canvas, 10, 22, 44, 18, PALETTE.navy);
  outlineRect(canvas, 10, 22, 44, 18, PALETTE.white);
  fillRect(canvas, 14, 26, 36, 10, PALETTE.magenta);
  fillRect(canvas, 12, 18, 18, 10, PALETTE.white);
  fillRect(canvas, 34, 18, 18, 10, PALETTE.cyan);
  fillRect(canvas, 12, 40, 4, 10, PALETTE.steel);
  fillRect(canvas, 48, 40, 4, 10, PALETTE.steel);
  return canvas;
}

function drawLamp() {
  const canvas = createCanvas(64, 64);
  shadeBase(canvas);
  fillRect(canvas, 29, 18, 6, 28, PALETTE.steel);
  fillRect(canvas, 20, 16, 24, 8, PALETTE.gold);
  fillDiamond(canvas, 32, 12, 14, 6, PALETTE.white);
  line(canvas, 22, 16, 42, 16, PALETTE.white);
  fillRect(canvas, 24, 46, 16, 4, PALETTE.violet);
  return canvas;
}

function drawCrystal() {
  const canvas = createCanvas(64, 64);
  shadeBase(canvas);
  fillRect(canvas, 26, 42, 12, 8, PALETTE.navy);
  fillDiamond(canvas, 32, 26, 10, 18, PALETTE.cyan);
  line(canvas, 32, 8, 42, 26, PALETTE.white);
  line(canvas, 22, 26, 32, 44, PALETTE.white);
  line(canvas, 42, 26, 32, 44, PALETTE.violet);
  return canvas;
}

function drawNeon() {
  const canvas = createCanvas(64, 64);
  shadeBase(canvas);
  fillRect(canvas, 12, 22, 40, 18, PALETTE.navy);
  fillRect(canvas, 18, 28, 28, 4, PALETTE.wall);
  fillRect(canvas, 16, 18, 32, 4, PALETTE.magenta);
  fillRect(canvas, 18, 16, 28, 2, PALETTE.white);
  fillRect(canvas, 24, 40, 4, 10, PALETTE.steel);
  fillRect(canvas, 36, 40, 4, 10, PALETTE.steel);
  return canvas;
}

function drawAvatar() {
  const canvas = createCanvas(48, 64);
  fillRect(canvas, 18, 8, 12, 12, PALETTE.white);
  fillRect(canvas, 15, 18, 18, 6, PALETTE.navy);
  fillRect(canvas, 16, 24, 16, 16, PALETTE.cyan);
  fillRect(canvas, 14, 26, 4, 12, PALETTE.violet);
  fillRect(canvas, 30, 26, 4, 12, PALETTE.violet);
  fillRect(canvas, 18, 40, 5, 12, PALETTE.white);
  fillRect(canvas, 25, 40, 5, 12, PALETTE.white);
  fillRect(canvas, 16, 6, 16, 4, PALETTE.magenta);
  return canvas;
}

async function writeSprite(filePath, canvas) {
  await fs.writeFile(filePath, encodePng(canvas.width, canvas.height, canvas.pixels));
}

async function main() {
  await fs.mkdir(furnituresDir, { recursive: true });
  await fs.mkdir(avatarDir, { recursive: true });

  await Promise.all([
    writeSprite(path.join(furnituresDir, "chair-nebula.png"), drawChair()),
    writeSprite(path.join(furnituresDir, "table-prism.png"), drawTable()),
    writeSprite(path.join(furnituresDir, "bed-obsidian.png"), drawBed()),
    writeSprite(path.join(furnituresDir, "lamp-halo.png"), drawLamp()),
    writeSprite(path.join(furnituresDir, "crystal-ether.png"), drawCrystal()),
    writeSprite(path.join(furnituresDir, "neon-crown.png"), drawNeon()),
    writeSprite(path.join(avatarDir, "avatar-ether.png"), drawAvatar())
  ]);

  console.log("Sprites EtherWorld generes.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
