export type CannabisItem = {
  id: string;
  name: string;
  category: "flower" | "concentrate" | "edible" | "paraphernalia" | "bundle";
  subcategory: string;
  price: number;
  rarity: string;
  spritePath: string;
  tags: string[];
  animation: string;
  effect: string;
  description?: string;
};

const seedItems: CannabisItem[] = [
  {
    id: "og-kush",
    name: "OG Kush",
    category: "flower",
    subcategory: "indica",
    price: 25,
    rarity: "legendary",
    spritePath: "/sprites/furnitures/cannabis/og-kush.png",
    tags: ["indica", "relax", "pain", "neon-green"],
    animation: "glow-pulse",
    effect: "smoke-green",
    description: "Classique californien, THC 24%, saveur citron-pins"
  },
  {
    id: "blue-dream",
    name: "Blue Dream",
    category: "flower",
    subcategory: "hybrid",
    price: 22,
    rarity: "epic",
    spritePath: "/sprites/furnitures/cannabis/blue-dream.png",
    tags: ["hybrid", "creative", "uplift", "neon-blue"],
    animation: "sparkle",
    effect: "bubble-blue",
    description: "Haze x Blueberry, équilibre parfait créa/relax"
  },
  {
    id: "gelato",
    name: "Gelato #33",
    category: "flower",
    subcategory: "hybrid",
    price: 28,
    rarity: "legendary",
    spritePath: "/sprites/furnitures/cannabis/gelato.png",
    tags: ["hybrid", "dessert", "euphoric", "neon-purple"],
    animation: "glow-rotate",
    effect: "smoke-purple",
    description: "Sunset Sherbet x Thin Mint, crémeux sucré"
  },
  {
    id: "wedding-cake",
    name: "Wedding Cake",
    category: "flower",
    subcategory: "indica",
    price: 26,
    rarity: "epic",
    spritePath: "/sprites/furnitures/cannabis/wedding-cake.png",
    tags: ["indica", "sweet", "relax", "neon-pink"],
    animation: "pulse",
    effect: "sparkle-pink",
    description: "Triangle Kush x Animal Mints, gâteau terre-miel"
  },
  {
    id: "gorilla-glue",
    name: "Gorilla Glue #4",
    category: "flower",
    subcategory: "hybrid",
    price: 24,
    rarity: "rare",
    spritePath: "/sprites/furnitures/cannabis/gorilla-glue.png",
    tags: ["hybrid", "potent", "sticky", "neon-yellow"],
    animation: "shake",
    effect: "smoke-yellow",
    description: "Chem Sis x Sour Dubb x Chocolate Diesel, colle béton"
  },
  {
    id: "gsc",
    name: "Girl Scout Cookies",
    category: "flower",
    subcategory: "hybrid",
    price: 27,
    rarity: "legendary",
    spritePath: "/sprites/furnitures/cannabis/gsc.png",
    tags: ["hybrid", "sweet", "euphoric"],
    animation: "glow",
    effect: "smoke-green",
    description: "OG Kush x Durban Poison"
  },
  {
    id: "sour-diesel",
    name: "Sour Diesel",
    category: "flower",
    subcategory: "sativa",
    price: 23,
    rarity: "epic",
    spritePath: "/sprites/furnitures/cannabis/sour-diesel.png",
    tags: ["sativa", "energy", "diesel"],
    animation: "sparkle",
    effect: "bubble-yellow"
  },
  {
    id: "purple-punch",
    name: "Purple Punch",
    category: "flower",
    subcategory: "indica",
    price: 29,
    rarity: "legendary",
    spritePath: "/sprites/furnitures/cannabis/purple-punch.png",
    tags: ["indica", "grape", "sedative"],
    animation: "pulse",
    effect: "smoke-purple"
  },
  {
    id: "live-rosin-og",
    name: "Live Rosin OG Kush",
    category: "concentrate",
    subcategory: "rosin",
    price: 55,
    rarity: "legendary",
    spritePath: "/sprites/furnitures/cannabis/live-rosin.png",
    tags: ["solventless", "terps"],
    animation: "glow",
    effect: "drip-gold"
  },
  {
    id: "shatter-gelato",
    name: "Gelato Shatter",
    category: "concentrate",
    subcategory: "shatter",
    price: 45,
    rarity: "epic",
    spritePath: "/sprites/furnitures/cannabis/shatter.png",
    tags: ["stable", "dabs"],
    animation: "crack",
    effect: "smoke-amber"
  },
  {
    id: "gummy-bears",
    name: "Neon Gummy Bears 100mg",
    category: "edible",
    subcategory: "gummies",
    price: 18,
    rarity: "rare",
    spritePath: "/sprites/furnitures/cannabis/gummy-bears.png",
    tags: ["discreet", "fruit"],
    animation: "bounce",
    effect: "sparkle-rainbow"
  },
  {
    id: "choco-bar",
    name: "EtherCristal Choco Bar 200mg",
    category: "edible",
    subcategory: "chocolate",
    price: 22,
    rarity: "epic",
    spritePath: "/sprites/furnitures/cannabis/choco-bar.png",
    tags: ["milk", "long-lasting"],
    animation: "melt",
    effect: "glow-brown"
  },
  {
    id: "neon-bong",
    name: "EtherBong Neon",
    category: "paraphernalia",
    subcategory: "bong",
    price: 85,
    rarity: "legendary",
    spritePath: "/sprites/furnitures/cannabis/neon-bong.png",
    tags: ["glass", "percolator"],
    animation: "bubble",
    effect: "smoke-cyan"
  },
  {
    id: "dab-rig",
    name: "Cristal Dab Rig",
    category: "paraphernalia",
    subcategory: "rig",
    price: 120,
    rarity: "exotic",
    spritePath: "/sprites/furnitures/cannabis/dab-rig.png",
    tags: ["quartz", "enail"],
    animation: "glow-hot",
    effect: "vapor-white"
  },
  {
    id: "strain-pack",
    name: "Mystery Strain Pack",
    category: "bundle",
    subcategory: "flower",
    price: 65,
    rarity: "epic",
    spritePath: "/sprites/furnitures/cannabis/strain-pack.png",
    tags: ["3x", "random"],
    animation: "shuffle",
    effect: "sparkle-multi"
  }
];

const generatedFlowerIds = [
  "granddaddy-purple", "white-widow", "northern-lights", "ak-47", "jack-herer", "runtz",
  "zkittlez", "mimosa", "mac", "cereal-milk", "lemon-haze", "trainwreck", "purple-haze",
  "banana-kush", "biscotti", "ice-cream-cake", "sunset-sherbet", "slurricane", "dosidos",
  "london-pound-cake", "pineapple-express", "strawberry-cough", "forbidden-fruit",
  "tropicana-cookies", "animal-mints", "chemdawg", "durban-poison", "platinum-cookies",
  "blackberry-kush", "grape-ape", "apple-fritter", "cherry-pie", "critical-mass", "lava-cake",
  "jealousy", "super-lemon-haze", "amnesia-haze", "orange-cookies", "peanut-butter-breath",
  "platinum-og", "sherb-cream-pie", "wappa", "pink-kush", "thin-mint", "sundae-driver",
  "motorbreath", "cookie-dawg", "mint-chocolate-chip", "gelonade", "moonbow", "nectarine-jelly",
  "melonade", "candy-rain", "bubba-kush", "grape-gas", "tahoe-og", "jet-fuel", "garlic-cookies",
  "blue-zushi", "french-toast", "lilac-diesel", "nectar-og", "cosmic-cream", "sunrise-z",
  "nightshade", "diamond-dust"
];

const generatedConcentrates = [
  "wax-blue-dream", "badder-runtz", "diamonds-zkittlez", "live-resin-sour-diesel",
  "hash-rosin-wedding-cake", "sauce-mac", "crumble-mimosa", "budder-gorilla-glue",
  "sugar-jack-herer", "rosin-purple-punch", "distillate-gelato", "diamond-sauce-cereal-milk",
  "terp-slushie-runtz", "cold-cure-og-kush", "fresh-press-london-pound-cake", "jam-biscotti",
  "shatter-trainwreck", "resin-apple-fritter", "rosin-banana-kush", "badder-slurricane",
  "wax-jealousy", "diamonds-forbidden-fruit", "sauce-super-lemon-haze"
];

const generatedEdibles = [
  "fruit-chews", "space-brownie", "cookies-cream-bites", "nano-soda", "gummy-rings",
  "caramel-cube", "mint-truffle", "marshmallow-square", "berry-jelly", "citrus-lollipop",
  "sour-strips", "frosted-cookie", "peach-gummies", "cola-cubes", "cereal-bar",
  "tropic-taffy", "moon-muffin", "dark-chocolate-bites"
];

const generatedParaphernalia = [
  "rolling-tray", "metal-grinder", "butane-torch", "glass-jar", "stash-box", "vaporizer",
  "rolling-papers", "cone-pack", "ash-catcher", "percolator-bong", "mini-rig", "quartz-banger",
  "carb-cap", "recycler-rig", "travel-case", "ashtray-glass", "humidity-pack", "smell-proof-bag",
  "digital-scale", "cleaning-kit", "puffco-dock", "pre-roll-tube", "display-jar"
];

const generatedBundles = [
  "dab-starter-kit", "flower-sampler", "premium-terps-box", "night-session-pack", "wake-bake-box",
  "edible-party-pack", "glass-collector-set", "starter-daily-kit", "legendary-lounge-pack"
];

function labelize(id: string) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function makeItem(id: string, category: CannabisItem["category"], index: number): CannabisItem {
  const rarityMap =
    category === "flower"
      ? ["rare", "epic", "legendary"]
      : category === "concentrate"
        ? ["epic", "legendary", "exotic"]
        : ["rare", "epic", "legendary"];
  const animations = {
    flower: ["glow-pulse", "sparkle", "pulse", "glow-rotate", "shake"],
    concentrate: ["glow", "crack", "drip", "pulse-hot"],
    edible: ["bounce", "melt", "sparkle-rainbow"],
    paraphernalia: ["bubble", "glow-hot", "shine", "vapor"],
    bundle: ["shuffle", "sparkle-multi", "pulse"]
  };
  const effects = {
    flower: ["smoke-green", "bubble-blue", "smoke-purple", "sparkle-pink", "smoke-yellow"],
    concentrate: ["drip-gold", "smoke-amber", "vapor-white"],
    edible: ["sparkle-rainbow", "glow-brown", "glow-orange"],
    paraphernalia: ["smoke-cyan", "vapor-white", "bubble"],
    bundle: ["sparkle-multi", "glow-green", "halo-gold"]
  };

  return {
    id,
    name: labelize(id),
    category,
    subcategory: category,
    price:
      (category === "flower" ? 20 : category === "concentrate" ? 45 : category === "edible" ? 16 : category === "paraphernalia" ? 35 : 60) +
      (index % 7) * 2,
    rarity: rarityMap[index % rarityMap.length],
    spritePath: `/sprites/furnitures/cannabis/${id}.png`,
    tags: [category, `neon-${["green", "blue", "purple", "pink", "gold"][index % 5]}`],
    animation: animations[category][index % animations[category].length],
    effect: effects[category][index % effects[category].length],
    description: `${labelize(id)} EtherWorld edition`
  };
}

export const CANNABIS_ITEMS: CannabisItem[] = [
  ...seedItems,
  ...generatedFlowerIds.map((id, index) => makeItem(id, "flower", index)),
  ...generatedConcentrates.map((id, index) => makeItem(id, "concentrate", index)),
  ...generatedEdibles.map((id, index) => makeItem(id, "edible", index)),
  ...generatedParaphernalia.map((id, index) => makeItem(id, "paraphernalia", index)),
  ...generatedBundles.map((id, index) => makeItem(id, "bundle", index))
];
