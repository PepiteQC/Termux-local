// scripts/mega-avatar-pack.js
// Génère automatiquement les PNG 64x64 pour tous les SVG avatar/*

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const AVATAR_ROOT = path.join(ROOT, "public", "sprites", "avatar");

const CATEGORIES = [
  "hair",
  "head",
  "shirt",
  "jacket",
  "pants",
  "shoes",
  "glasses",
  "jewelry",
];

async function generatePNGForSvg(svgPath, pngPath) {
  const svgBuffer = fs.readFileSync(svgPath);
  await sharp(svgBuffer)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(pngPath);
}

async function run() {
  console.log("🚀 MEGA PACK AVATAR — génération PNG…");

  for (const category of CATEGORIES) {
    const dir = path.join(AVATAR_ROOT, category);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg"));

    for (const file of files) {
      const baseName = file.replace(/\.svg$/i, "");
      const svgPath = path.join(dir, file);
      const pngPath = path.join(dir, `${baseName}.png`);

      console.log(`→ ${category}/${baseName}.png`);

      await generatePNGForSvg(svgPath, pngPath);
    }
  }

  console.log("✅ MEGA PACK 50+ AVATARS PNG GÉNÉRÉ !");
}

run().catch((err) => {
  console.error("❌ Erreur MEGA PACK:", err);
  process.exit(1);
});
