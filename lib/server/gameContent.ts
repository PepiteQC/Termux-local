import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { FurniturePlacement } from "../furniture/FurnitureTypes";

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

export async function loadGameContent(): Promise<GameContent> {
  const [rooms, avatars, wardrobe, shopItems, furnitureData, catalogItems, discoveredFiles] = await Promise.all([
    readJsonFile<RoomPreset[]>("rooms.json"),
    readJsonFile<AssetCard[]>("avatars.json"),
    readJsonFile<AssetCard[]>("wardrobe.json"),
    readJsonFile<AssetCard[]>("shop-items.json"),
    readJsonFile<FurnitureDataCard[]>("gamedata/furnitures.json"),
    readJsonFile<CatalogItem[]>("catalog/items.json"),
    readJsonFile<string[]>("discovered-files.json")
  ]);

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
