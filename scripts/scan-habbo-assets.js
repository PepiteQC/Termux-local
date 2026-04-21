const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.env.HOME || '/root', 'etherworld/public/habbo-assets');

const CATEGORIES = {
  walls: [
    'wall',
    'wallpaper',
    'icewall',
    'bg',
  ],
  floors: [
    'floor',
    'tile',
    'carpet',
    'rug',
    'woodenfloor',
    'largertile',
    'plushcarpet',
    'grass',
  ],
  windows: [
    'window',
  ],
  posters: [
    'poster',
    'pstr',
    'painting',
    'decal',
  ],
  lights: [
    'light',
    'led',
    'neon',
    'lamp',
  ],
};

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }

  return out;
}

function normalizeName(filePath) {
  const base = path.basename(filePath);
  return base
    .replace(/\.manifest$/i, '')
    .replace(/\.(png|json|txt|xml|swf|atlas|assetbundle)$/i, '')
    .trim();
}

function categorize(name) {
  const lower = name.toLowerCase();

  for (const [category, needles] of Object.entries(CATEGORIES)) {
    if (needles.some((needle) => lower.includes(needle))) {
      return category;
    }
  }

  return 'other';
}

const files = walk(ROOT);
const byName = new Map();

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const name = normalizeName(file);
  if (!name) continue;

  const current = byName.get(name) || {
    name,
    category: categorize(name),
    files: [],
  };

  current.files.push(rel);
  byName.set(name, current);
}

const all = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));

const grouped = {
  walls: [],
  floors: [],
  windows: [],
  posters: [],
  lights: [],
  other: [],
};

for (const item of all) {
  grouped[item.category].push(item);
}

const outPath = path.resolve(process.env.HOME || '/root', 'etherworld/src/data/habbo/habbo-assets-scan.json');
fs.writeFileSync(outPath, JSON.stringify(grouped, null, 2));

console.log(`Scan complete: ${outPath}`);
for (const [key, arr] of Object.entries(grouped)) {
  console.log(`${key}: ${arr.length}`);
}
