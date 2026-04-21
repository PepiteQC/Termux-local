import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { FurniturePlacement } from "../furniture/FurnitureTypes";
import type { AvatarSpriteSheetConfig } from "../furniture/FurnitureRenderer";

type RoomPreset = {
  id: string;
  name: string;
  tagline: string;
  theme: string;
  occupancy: string;
};

type AssetCard = {
  id: string;
  name: string;
  category: string;
  path: string;
  meta?: string;
  spriteSheet?: AvatarSpriteSheetConfig;
};

type AvatarAnimationSpec = {
  frames: number[];
  speed: number;
};

type AvatarMapSpec = {
  avatars: Record<
    string,
    {
      name: string;
      sheet: string;
      frameWidth: number;
      frameHeight: number;
      totalFrames?: number;
      defaultAnimation?: string;
      scale?: number;
      offsetX?: number;
      offsetY?: number;
      animations: Record<string, AvatarAnimationSpec>;
    }
  >;
};

type FurnitureDataCard = {
  id: string;
  label: string;
  category: string;
  spritePath: string;
  dimensions: { width: number; depth: number; height: number };
  states: string[];
  defaultState: string;
  particleEffect: string | null;
  price: number;
  rarity: string;
};

type CatalogItem = {
  id: string;
  name: string;
  kind: string;
  refId: string;
  category: string;
  price: number;
  rarity: string;
  spritePath: string;
  tags: string[];
  animation?: string;
  effect?: string;
  description?: string;
};

type RoomLayouts = Record<string, FurniturePlacement[]>;

export type GameContent = {
  rooms: RoomPreset[];
  avatars: AssetCard[];
  wardrobe: AssetCard[];
  shopItems: AssetCard[];
  furnitures: AssetCard[];
  furnitureData: FurnitureDataCard[];
  catalogItems: CatalogItem[];
  discoveredFiles: string[];
};

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = join(process.cwd(), "data", fileName);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function normalizeAvatarCards(input: AssetCard[] | AvatarMapSpec): AssetCard[] {
  if (Array.isArray(input)) {
    return input;
  }

  return Object.entries(input.avatars).map(([id, avatar]) => ({
    id,
    name: avatar.name,
    category: "player",
    path: "/sprites/avatar/avatar-ether.png",
    meta: avatar.defaultAnimation ?? "south_idle",
    spriteSheet: {
      sheetPath: avatar.sheet.replace(/^public\//, "/"),
      frameWidth: avatar.frameWidth,
      frameHeight: avatar.frameHeight,
      totalFrames: avatar.totalFrames,
      columns: avatar.totalFrames ?? 32,
      fps: 8,
      scale: avatar.scale,
      offsetX: avatar.offsetX,
      offsetY: avatar.offsetY,
      defaultAnimation: avatar.defaultAnimation,
      animations: avatar.animations,
      directions: {
        north: {
          idle: [0, 3],
          walk: [4, 7]
        },
        south: {
          idle: [8, 11],
          walk: [12, 15]
        },
        east: {
          idle: [16, 19],
          walk: [20, 23]
        },
        west: {
          idle: [24, 27],
          walk: [28, 31]
        }
      }
    }
  }));
}

export async function loadGameContent(): Promise<GameContent> {
  const [rooms, avatarsRaw, wardrobe, shopItems, furnitureData, catalogItems, discoveredFiles] = await Promise.all([
    readJsonFile<RoomPreset[]>("rooms.json"),
    readJsonFile<AssetCard[] | AvatarMapSpec>("avatars.json"),
    readJsonFile<AssetCard[]>("wardrobe.json"),
    readJsonFile<AssetCard[]>("shop-items.json"),
    readJsonFile<FurnitureDataCard[]>("gamedata/furnitures.json"),
    readJsonFile<CatalogItem[]>("catalog/items.json"),
    readJsonFile<string[]>("discovered-files.json")
  ]);
  const avatars = normalizeAvatarCards(avatarsRaw);

  let cannabisItems: CatalogItem[] = [];
  try {
    cannabisItems = await readJsonFile<CatalogItem[]>("catalog/cannabis-items.json");
  } catch {
    cannabisItems = [];
  }

  const furnitures: AssetCard[] = furnitureData.map((item) => ({
    id: item.id,
    name: item.label,
    category: item.category,
    path: item.spritePath,
    meta: `${item.rarity} · ${item.price}`
  }));

  return {
    rooms,
    avatars,
    wardrobe,
    shopItems,
    furnitures,
    furnitureData,
    catalogItems: [...catalogItems, ...cannabisItems],
    discoveredFiles
  };
}

export async function loadRoomLayout(roomId: string): Promise<FurniturePlacement[]> {
  const layouts = await readJsonFile<RoomLayouts>("room-layouts.json");
  return layouts[roomId] ?? [];
}
