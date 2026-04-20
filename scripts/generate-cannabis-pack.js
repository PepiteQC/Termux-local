const fs = require("fs");
const path = require("path");

const spriteDir = path.join(process.cwd(), "public", "sprites", "furnitures", "cannabis");
const dataDir = path.join(process.cwd(), "data", "catalog");

fs.mkdirSync(spriteDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const flowers = [
  "og-kush", "blue-dream", "gelato", "wedding-cake", "gorilla-glue", "girl-scout-cookies",
  "sour-diesel", "purple-punch", "granddaddy-purple", "white-widow", "northern-lights",
  "ak-47", "jack-herer", "runtz", "zkittlez", "mimosa", "mac", "cereal-milk",
  "lemon-haze", "trainwreck", "purple-haze", "banana-kush", "biscotti", "ice-cream-cake",
  "sunset-sherbet", "slurricane", "dosidos", "london-pound-cake", "pineapple-express",
  "strawberry-cough", "forbidden-fruit", "tropicana-cookies", "animal-mints", "chemdawg",
  "durban-poison", "platinum-cookies", "blackberry-kush", "grape-ape", "apple-fritter",
  "cherry-pie", "critical-mass", "lava-cake", "jealousy", "super-lemon-haze", "amnesia-haze",
  "orange-cookies", "peanut-butter-breath", "platinum-og", "sherb-cream-pie", "wappa",
  "pink-kush", "thin-mint", "sundae-driver", "motorbreath", "cookie-dawg", "mint-chocolate-chip",
  "gelonade", "moonbow", "nectarine-jelly", "melonade", "candy-rain", "bubba-kush",
  "grape-gas", "tahoe-og", "jet-fuel", "garlic-cookies", "blue-zushi", "french-toast",
  "lilac-diesel", "nectar-og", "cosmic-cream", "sunrise-z", "nightshade", "diamond-dust"
];

const concentrates = [
  "live-rosin-og", "shatter-gelato", "wax-blue-dream", "badder-runtz", "diamonds-zkittlez",
  "live-resin-sour-diesel", "hash-rosin-wedding-cake", "sauce-mac", "crumble-mimosa",
  "budder-gorilla-glue", "sugar-jack-herer", "rosin-purple-punch", "distillate-gelato",
  "diamond-sauce-cereal-milk", "terp-slushie-runtz", "cold-cure-og-kush", "fresh-press-london-pound-cake",
  "jam-biscotti", "shatter-trainwreck", "resin-apple-fritter", "rosin-banana-kush",
  "badder-slurricane", "wax-jealousy", "diamonds-forbidden-fruit", "sauce-super-lemon-haze"
];

const edibles = [
  "gummy-bears", "choco-bar", "fruit-chews", "space-brownie", "cookies-cream-bites",
  "nano-soda", "gummy-rings", "caramel-cube", "mint-truffle", "marshmallow-square",
  "berry-jelly", "citrus-lollipop", "sour-strips", "frosted-cookie", "peach-gummies",
  "cola-cubes", "cereal-bar", "tropic-taffy", "moon-muffin", "dark-chocolate-bites"
];

const paraphernalia = [
  "neon-bong", "dab-rig", "rolling-tray", "metal-grinder", "butane-torch",
  "glass-jar", "stash-box", "vaporizer", "rolling-papers", "cone-pack",
  "ash-catcher", "percolator-bong", "mini-rig", "quartz-banger", "carb-cap",
  "recycler-rig", "travel-case", "ashtray-glass", "humidity-pack", "smell-proof-bag",
  "digital-scale", "cleaning-kit", "puffco-dock", "pre-roll-tube", "display-jar"
];

const bundles = [
  "strain-pack", "dab-starter-kit", "flower-sampler", "premium-terps-box", "night-session-pack",
  "wake-bake-box", "edible-party-pack", "glass-collector-set", "starter-daily-kit", "legendary-lounge-pack"
];

const palettes = [
  { a: "#00FF88", b: "#00CC66", c: "#008844", crystal: "#00E0FF", stem: "#4A3AFF", accent: "#66FFAA" },
  { a: "#7BEA4A", b: "#4ECB3D", c: "#23791C", crystal: "#8FE9FF", stem: "#5241FF", accent: "#D9FFB8" },
  { a: "#C77DFF", b: "#9D4EDD", c: "#6A1FB7", crystal: "#7DF9FF", stem: "#3326C6", accent: "#E8CBFF" },
  { a: "#FF90E8", b: "#FF4FC6", c: "#B8147F", crystal: "#A6F7FF", stem: "#4830E8", accent: "#FFD6F6" },
  { a: "#FFD166", b: "#F9A826", c: "#B86B00", crystal: "#A6F7FF", stem: "#5E43FF", accent: "#FFE7B3" }
];

const variantModes = [
  { suffix: "", mode: "base" },
  { suffix: "-glow", mode: "glow" },
  { suffix: "-display", mode: "display" }
];

function labelize(id) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function categoryFor(id, category) {
  if (category === "flower") {
    if (id.includes("haze") || id.includes("diesel") || id.includes("jack") || id.includes("durban")) return "sativa";
    if (id.includes("kush") || id.includes("purple") || id.includes("cake") || id.includes("bubba")) return "indica";
    return "hybrid";
  }
  return category;
}

function rarityFor(index, category) {
  const tiers =
    category === "flower"
      ? ["rare", "epic", "legendary"]
      : category === "concentrate"
        ? ["epic", "legendary", "exotic"]
        : category === "bundle"
          ? ["epic", "legendary", "exotic"]
          : ["rare", "epic", "legendary"];
  return tiers[index % tiers.length];
}

function priceFor(index, category) {
  const base =
    category === "flower" ? 20 :
    category === "concentrate" ? 45 :
    category === "edible" ? 16 :
    category === "paraphernalia" ? 35 :
    60;
  return base + (index % 7) * (category === "paraphernalia" ? 8 : 2);
}

function animationFor(category, index) {
  const map = {
    flower: ["glow-pulse", "sparkle", "pulse", "glow-rotate", "shake"],
    concentrate: ["glow", "crack", "drip", "pulse-hot"],
    edible: ["bounce", "melt", "sparkle-rainbow"],
    paraphernalia: ["bubble", "glow-hot", "shine", "vapor"],
    bundle: ["shuffle", "sparkle-multi", "pulse"]
  };
  const choices = map[category];
  return choices[index % choices.length];
}

function effectFor(category, palette, index) {
  if (category === "flower") return ["smoke-green", "bubble-blue", "smoke-purple", "sparkle-pink", "smoke-yellow"][index % 5];
  if (category === "concentrate") return ["drip-gold", "smoke-amber", "vapor-white"][index % 3];
  if (category === "edible") return ["sparkle-rainbow", "glow-brown", "glow-orange"][index % 3];
  if (category === "paraphernalia") return ["smoke-cyan", "vapor-white", "bubble"][index % 3];
  return ["sparkle-multi", "glow-green", "halo-gold"][index % 3];
}

function buildItem(id, category, index) {
  const label = labelize(id);
  return {
    id,
    name: label,
    category,
    subcategory: categoryFor(id, category),
    price: priceFor(index, category),
    rarity: rarityFor(index, category),
    spritePath: `/sprites/furnitures/cannabis/${id}.png`,
    tags: [category, categoryFor(id, category), `neon-${["green", "blue", "purple", "pink", "gold"][index % 5]}`],
    animation: animationFor(category, index),
    effect: effectFor(category, palettes[index % palettes.length], index),
    description: `${label} EtherWorld edition, pixel art neon collectible`
  };
}

function buildSvg(label, palette, mode) {
  const ringOpacity = mode === "glow" ? 0.82 : mode === "display" ? 0.38 : 0.58;
  const blur = mode === "glow" ? 2.4 : 1.4;
  const scale = mode === "display" ? 1.12 : mode === "glow" ? 1.04 : 1;
  const title = mode === "display" ? label.slice(0, 10).toUpperCase() : "";

  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="neonGreen" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${palette.a}"/>
      <stop offset="50%" stop-color="${palette.b}"/>
      <stop offset="100%" stop-color="${palette.c}"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${blur}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="smokeBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.4"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="rgba(6,12,20,0.16)" stroke="rgba(255,255,255,0.08)"/>
  <g filter="url(#glow)" transform="translate(32 27) scale(${scale}) translate(-32 -27)">
    <ellipse cx="32" cy="25" rx="18" ry="12" fill="url(#neonGreen)" stroke="${palette.a}" stroke-width="2"/>
    <circle cx="28" cy="20" r="6" fill="${palette.accent}" stroke="${palette.a}" stroke-width="1"/>
    <circle cx="36" cy="22" r="4" fill="${palette.accent}" stroke="${palette.a}" stroke-width="1"/>
    <circle cx="30" cy="18" r="2" fill="${palette.crystal}" filter="url(#crystalGlow)"/>
    <circle cx="38" cy="24" r="1.5" fill="${palette.crystal}"/>
    <circle cx="27" cy="29" r="1.4" fill="${palette.crystal}" opacity="0.9"/>
  </g>
  <path d="M32 38 Q30 48 32 55 Q34 48 32 38" fill="none" stroke="${palette.stem}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="15" r="20" fill="none" stroke="${palette.a}" stroke-width="1" opacity="${ringOpacity}" filter="url(#smokeBlur)"/>
  <circle cx="20" cy="13" r="5" fill="none" stroke="${palette.crystal}" stroke-width="0.8" opacity="0.35"/>
  <circle cx="44" cy="15" r="4" fill="none" stroke="${palette.crystal}" stroke-width="0.8" opacity="0.3"/>
  ${title ? `<text x="32" y="60" text-anchor="middle" font-family="Arial" font-size="5" fill="${palette.accent}" letter-spacing="0.4">${title}</text>` : ""}
</svg>`;
}

const allGroups = [
  ...flowers.map((id, index) => ({ id, category: "flower", index })),
  ...concentrates.map((id, index) => ({ id, category: "concentrate", index })),
  ...edibles.map((id, index) => ({ id, category: "edible", index })),
  ...paraphernalia.map((id, index) => ({ id, category: "paraphernalia", index })),
  ...bundles.map((id, index) => ({ id, category: "bundle", index }))
];

const catalog = allGroups.map((entry, globalIndex) => buildItem(entry.id, entry.category, globalIndex));
fs.writeFileSync(path.join(dataDir, "cannabis-items.json"), JSON.stringify(catalog, null, 2));

let generated = 0;
allGroups.forEach((entry, globalIndex) => {
  variantModes.forEach((variant, variantIndex) => {
    const palette = palettes[(globalIndex + variantIndex) % palettes.length];
    const fileName = `${entry.id}${variant.suffix}.svg`;
    const svg = buildSvg(labelize(entry.id), palette, variant.mode);
    fs.writeFileSync(path.join(spriteDir, fileName), svg, "utf8");
    generated += 1;
  });
});

console.log(`Generated ${catalog.length} cannabis catalog items`);
console.log(`Generated ${generated} cannabis SVG files in ${spriteDir}`);
