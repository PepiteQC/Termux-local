import { getFurnitureFootprint } from "@/lib/iso/collision";

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export function roomToScreen(x: number, y: number, z = 0) {
  return {
    left: (x - y) * (TILE_WIDTH / 2) + 420,
    top: (x + y) * (TILE_HEIGHT / 2) - z * TILE_HEIGHT + 120
  };
}

export function getIsoZIndex(x: number, y: number, z = 0, offset = 0) {
  return Math.round((x + y + z) * 10 + offset);
}

export function getTileTint(x: number, y: number) {
  return x % 2 === y % 2
    ? "linear-gradient(135deg, rgba(54,66,102,0.86), rgba(16,21,30,0.96))"
    : "linear-gradient(135deg, rgba(40,48,76,0.92), rgba(11,15,22,0.98))";
}

export { getFurnitureFootprint };
