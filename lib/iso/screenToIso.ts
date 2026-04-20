import type { ScreenPoint } from "../furniture/FurnitureTypes";
import type { ProjectionConfig } from "./isoToScreen";

type CanvasMetrics = ProjectionConfig & {
  width?: number;
  height?: number;
};

export function screenToIso(point: ScreenPoint, projection: CanvasMetrics) {
  const tileWidth = projection.tileWidth ?? 64;
  const tileHeight = projection.tileHeight ?? 32;
  const adjustedX = point.x - projection.originX;
  const adjustedY = point.y - projection.originY;

  const isoX = adjustedY / tileHeight + adjustedX / tileWidth;
  const isoZ = adjustedY / tileHeight - adjustedX / tileWidth;

  return {
    x: Math.floor(isoX),
    y: 0,
    z: Math.floor(isoZ)
  };
}

export function clampTilePoint(point: { x: number; y: number; z: number }, roomSize = 12) {
  return {
    x: Math.max(0, Math.min(roomSize - 1, point.x)),
    y: 0,
    z: Math.max(0, Math.min(roomSize - 1, point.z))
  };
}
