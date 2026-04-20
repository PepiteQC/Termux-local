const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(process.cwd(), "public", "sprites", "furnitures");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

(async () => {
  const svgFiles = walk(root).filter((file) => file.endsWith(".svg"));

  for (const svgFile of svgFiles) {
    const outputPath = svgFile.replace(/\.svg$/i, ".png");
    const svg = fs.readFileSync(svgFile, "utf8");

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✅ ${path.relative(process.cwd(), outputPath)} généré`);
  }

  console.log(`🎉 ${svgFiles.length} sprites SVG convertis`);
})();
