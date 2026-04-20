import {
  buildWalkableMap,
  canPlaceFurniture as canPlaceFurnitureBase,
  getFootprintCells,
  getFurnitureHitPolygon,
  getFurnitureShadowBounds,
  getFurnitureSpriteAnchor,
  isWithinRoomBounds,
  pointInPolygon,
  type Furniture
} from "@/lib/furniture/FurnitureCollision";
import type { FurniturePlacement } from "../furniture/FurnitureTypes";

export { pointInPolygon, getFurnitureHitPolygon, getFurnitureShadowBounds, getFurnitureSpriteAnchor };
export type { Furniture };

export function canPlaceFurniture(candidate: FurniturePlacement, furnitures: FurniturePlacement[]) {
  return canPlaceFurnitureBase(candidate, furnitures, 12, 12).valid;
}

export function isFurnitureInBounds(candidate: FurniturePlacement) {
  return isWithinRoomBounds(candidate.type, candidate, candidate.rotation, 12, 12);
}

export function buildPathCollisionMap(furnitures: FurniturePlacement[]) {
  return buildWalkableMap(furnitures, 12, 12);
}

export function getFurnitureFootprint(furniture: FurniturePlacement) {
  const cells = getFootprintCells(furniture.type, furniture, furniture.rotation);
  const xs = cells.map((cell) => cell.x);
  const zs = cells.map((cell) => cell.z);

  return {
    width: Math.max(...xs) - Math.min(...xs) + 1,
    depth: Math.max(...zs) - Math.min(...zs) + 1
  };
}
