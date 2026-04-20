import fs from "fs";
import path from "path";

const AVATAR_ROOT = path.join(process.cwd(), "public", "sprites", "avatar");

const CATEGORIES = [
  "hair",
  "head",
  "shirt",
  "jacket",
  "pants",
  "shoes",
  "glasses",
  "jewelry",
] as const;

export type AvatarCategory = (typeof CATEGORIES)[number];

export type AvatarSpriteMap = Record<AvatarCategory, string[]>;

export function loadAvatarSprites(): AvatarSpriteMap {
  const result = {} as AvatarSpriteMap;

  for (const category of CATEGORIES) {
    const dir = path.join(AVATAR_ROOT, category);
    if (!fs.existsSync(dir)) {
      result[category] = [];
      continue;
    }

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".png"))
      .map((f) => `/sprites/avatar/${category}/${f}`);

    result[category] = files;
  }

  return result;
}
