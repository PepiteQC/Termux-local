import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);

const assets = [
  { file: "public/assets/avatars/player/myskin.png", label: "MY", bg: "#4cc9f0", fg: "#08111d", size: 96 },
  { file: "public/assets/avatars/basic/nova-m.png", label: "NM", bg: "#90be6d", fg: "#132013", size: 96 },
  { file: "public/assets/avatars/basic/iris-f.png", label: "IF", bg: "#f28482", fg: "#2a1010", size: 96 },
  { file: "public/assets/avatars/basic/onyx-m.png", label: "OM", bg: "#adb5bd", fg: "#111", size: 96 },
  { file: "public/assets/avatars/basic/luma-f.png", label: "LF", bg: "#ffd166", fg: "#2b2000", size: 96 },
  { file: "public/assets/avatars/weed-shop/sage-m.png", label: "SG", bg: "#52b788", fg: "#0d1b12", size: 96 },
  { file: "public/assets/avatars/weed-shop/fern-f.png", label: "FR", bg: "#74c69d", fg: "#0f1b12", size: 96 },
  { file: "public/assets/avatars/weed-shop/moss-u.png", label: "MS", bg: "#84a98c", fg: "#101610", size: 96 },
  { file: "public/assets/rooms/spawn.png", label: "SPAWN", bg: "#7aa2f7", fg: "#0b1020", size: 960, wide: true },
  { file: "public/assets/rooms/botanica-boutique.png", label: "BOUTIQUE", bg: "#7adf9b", fg: "#08150f", size: 960, wide: true },
  { file: "public/assets/ui/weedshop.png", label: "BOTANICA", bg: "#1d3557", fg: "#f1faee", size: 1200, banner: true },
  { file: "public/assets/tiles/spawn-floor.png", label: "TL", bg: "#d9c2a3", fg: "#3f2f1a", size: 128 },
  { file: "public/assets/tiles/boutique-floor.png", label: "BT", bg: "#c7e9b4", fg: "#14351a", size: 128 },
  { file: "public/assets/icons/furni-bed-starter.png", label: "BED", bg: "#b56576", fg: "#fff", size: 96 },
  { file: "public/assets/icons/furni-desk-starter.png", label: "DSK", bg: "#6d597a", fg: "#fff", size: 96 },
  { file: "public/assets/icons/furni-chair-starter.png", label: "CHR", bg: "#355070", fg: "#fff", size: 96 },
  { file: "public/assets/icons/furni-computer-starter.png", label: "PC", bg: "#43aa8b", fg: "#082019", size: 96 },
  { file: "public/assets/icons/furni-window-starter.png", label: "WND", bg: "#577590", fg: "#fff", size: 96 },
  { file: "public/assets/icons/furni-lamp-starter.png", label: "LMP", bg: "#f9c74f", fg: "#3a2800", size: 96 },
  { file: "public/assets/icons/furni-poster-city.png", label: "ART", bg: "#277da1", fg: "#fff", size: 96 }
];

[
  "top-tshirt-white",
  "top-hoodie-charcoal",
  "top-shirt-sky",
  "bottom-jeans-indigo",
  "bottom-shorts-sand",
  "shoes-sneakers-red",
  "shoes-boots-onyx",
  "hair-wave-ember",
  "acc-glasses-aviator"
].forEach((name, index) => {
  assets.push({
    file: `public/assets/items/cosmetics/${name}.png`,
    label: name.split("-").slice(1, 3).join(" ").toUpperCase(),
    bg: ["#ef476f", "#118ab2", "#ffd166", "#8d99ae", "#f4a261"][index % 5],
    fg: "#ffffff",
    size: 96
  });
});

[
  "bot-jacket-leafline",
  "bot-pants-vinewave",
  "bot-hat-mosscap",
  "bot-glasses-sporeview",
  "bot-fx-halo-verdant",
  "bot-fx-aura-mist",
  "bot-bundle-night-garden"
].forEach((name, index) => {
  assets.push({
    file: `public/assets/items/botanical/${name}.png`,
    label: name.split("-").slice(1, 3).join(" ").toUpperCase(),
    bg: ["#2d6a4f", "#40916c", "#1b4332", "#52b788"][index % 4],
    fg: "#ecfdf5",
    size: 96
  });
});

function svg({ label, bg, fg, size, wide, banner }) {
  const width = banner ? size : wide ? size : size;
  const height = banner ? 260 : wide ? 620 : size;
  const fontSize = banner ? 68 : wide ? 82 : 28;
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="${banner ? 0 : 22}" fill="${bg}"/>
      <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="${banner ? 0 : 18}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4"/>
      <circle cx="${Math.round(width * 0.18)}" cy="${Math.round(height * 0.22)}" r="${Math.max(22, Math.round(width * 0.08))}" fill="rgba(255,255,255,0.15)"/>
      <circle cx="${Math.round(width * 0.74)}" cy="${Math.round(height * 0.34)}" r="${Math.max(18, Math.round(width * 0.05))}" fill="rgba(255,255,255,0.09)"/>
      <text x="50%" y="53%" font-family="Arial" font-size="${fontSize}" font-weight="700" fill="${fg}" text-anchor="middle">${label}</text>
    </svg>
  `;
}

for (const asset of assets) {
  const output = resolve(root, asset.file);
  mkdirSync(dirname(output), { recursive: true });
  await sharp(Buffer.from(svg(asset))).png().toFile(output);
  console.log(`generated ${asset.file}`);
}
