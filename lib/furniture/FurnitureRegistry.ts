import type { FurnitureDefinition, FurnitureType } from "./FurnitureTypes";

export const FURNITURE_REGISTRY: Record<FurnitureType, FurnitureDefinition> = {
  "chair-nebula": {
    id: "chair-nebula",
    name: "chair-nebula",
    label: "Chaise Nebula",
    sprite: "chair-nebula",
    storagePath: "sprites/furnitures/chair-nebula.png",
    width: 1,
    depth: 1,
    height: 1,
    offsetX: 0,
    offsetY: 6,
    walkable: false,
    drawWidth: 64,
    drawHeight: 64,
    glow: "rgba(0, 224, 255, 0.34)"
  },
  "table-prism": {
    id: "table-prism",
    name: "table-prism",
    label: "Table Prism",
    sprite: "table-prism",
    storagePath: "sprites/furnitures/table-prism.png",
    width: 2,
    depth: 2,
    height: 1,
    offsetX: 0,
    offsetY: 4,
    walkable: false,
    drawWidth: 96,
    drawHeight: 80
  },
  "bed-obsidian": {
    id: "bed-obsidian",
    name: "bed-obsidian",
    label: "Lit Obsidian",
    sprite: "bed-obsidian",
    storagePath: "sprites/furnitures/bed-obsidian.png",
    width: 2,
    depth: 3,
    height: 1,
    offsetX: 2,
    offsetY: 10,
    walkable: false,
    drawWidth: 112,
    drawHeight: 96
  },
  "lamp-halo": {
    id: "lamp-halo",
    name: "lamp-halo",
    label: "Lampe Halo",
    sprite: "lamp-halo",
    storagePath: "sprites/furnitures/lamp-halo.png",
    width: 1,
    depth: 1,
    height: 2,
    offsetX: 0,
    offsetY: -10,
    walkable: false,
    drawWidth: 64,
    drawHeight: 96,
    glow: "rgba(255, 232, 163, 0.34)"
  },
  "crystal-ether": {
    id: "crystal-ether",
    name: "crystal-ether",
    label: "Cristal Ether",
    sprite: "crystal-ether",
    storagePath: "sprites/furnitures/crystal-ether.png",
    width: 1,
    depth: 1,
    height: 2,
    offsetX: 0,
    offsetY: -4,
    walkable: false,
    drawWidth: 64,
    drawHeight: 84,
    glow: "rgba(0, 224, 255, 0.42)"
  },
  "neon-crown": {
    id: "neon-crown",
    name: "neon-crown",
    label: "Neon Crown",
    sprite: "neon-crown",
    storagePath: "sprites/furnitures/neon-crown.png",
    width: 1,
    depth: 1,
    height: 1,
    offsetX: 0,
    offsetY: -2,
    walkable: false,
    drawWidth: 64,
    drawHeight: 72,
    glow: "rgba(255, 87, 120, 0.28)"
  }
};

export const FURNITURE_ORDER = Object.keys(FURNITURE_REGISTRY) as FurnitureType[];

export function getFurnitureDefinition(type: FurnitureType) {
  return FURNITURE_REGISTRY[type];
}

export function getFurnitureSpritePath(type: FurnitureType) {
  return `/sprites/furnitures/${FURNITURE_REGISTRY[type].sprite}.png`;
}
