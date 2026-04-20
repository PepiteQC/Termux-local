import { getFurnitureDefinition } from "./FurnitureRegistry";
import type {
  FurnitureDefinition,
  FurniturePlacement,
  FurnitureRotation,
  FurnitureType,
  IsoTile,
  ScreenPoint
} from "./FurnitureTypes";
import { isoToScreen, type ProjectionConfig } from "../iso/isoToScreen";

export type FootprintCell = {
  x: number;
  z: number;
};

export type CollisionResult = {
  valid: boolean;
  reason: string | null;
};

export type Furniture = FurniturePlacement & {
  selected?: boolean;
};

export function getRotatedFootprint(definition: FurnitureDefinition, rotation: FurnitureRotation) {
  const flipped = rotation % 2 === 1;

  return {
    width: flipped ? definition.depth : definition.width,
    depth: flipped ? definition.width : definition.depth
  };
}

export function getFootprintCells(
  type: FurnitureType,
  tile: IsoTile,
  rotation: FurnitureRotation
): FootprintCell[] {
  const definition = getFurnitureDefinition(type);
  const footprint = getRotatedFootprint(definition, rotation);
  const cells: FootprintCell[] = [];

  for (let dx = 0; dx < footprint.width; dx += 1) {
    for (let dz = 0; dz < footprint.depth; dz += 1) {
      cells.push({ x: tile.x + dx, z: tile.z + dz });
    }
  }

  return cells;
}

export function isWithinRoomBounds(
  type: FurnitureType,
  tile: IsoTile,
  rotation: FurnitureRotation,
  roomWidth: number,
  roomDepth: number
) {
  return getFootprintCells(type, tile, rotation).every(
    (cell) => cell.x >= 0 && cell.z >= 0 && cell.x < roomWidth && cell.z < roomDepth
  );
}

export function canPlaceFurniture(
  candidate: FurniturePlacement,
  furnitures: FurniturePlacement[],
  roomWidth: number,
  roomDepth: number,
  excludedId?: string
): CollisionResult {
  if (!isWithinRoomBounds(candidate.type, candidate, candidate.rotation, roomWidth, roomDepth)) {
    return { valid: false, reason: "Out of bounds" };
  }

  const candidateCells = getFootprintCells(candidate.type, candidate, candidate.rotation);
  const occupied = new Set<string>();

  furnitures.forEach((item) => {
    if (item.id === excludedId || item.id === candidate.id) {
      return;
    }

    getFootprintCells(item.type, item, item.rotation).forEach((cell) => {
      occupied.add(`${cell.x}:${cell.z}`);
    });
  });

  const collides = candidateCells.some((cell) => occupied.has(`${cell.x}:${cell.z}`));

  return collides ? { valid: false, reason: "Collision" } : { valid: true, reason: null };
}

export function buildWalkableMap(
  furnitures: FurniturePlacement[],
  roomWidth: number,
  roomDepth: number
) {
  const blocked = new Set<string>();

  furnitures.forEach((item) => {
    const definition = getFurnitureDefinition(item.type);
    if (definition.walkable) {
      return;
    }

    getFootprintCells(item.type, item, item.rotation).forEach((cell) => {
      blocked.add(`${cell.x}:${cell.z}`);
    });
  });

  return {
    blocked,
    isWalkable(x: number, z: number) {
      return x >= 0 && z >= 0 && x < roomWidth && z < roomDepth && !blocked.has(`${x}:${z}`);
    }
  };
}

export function getFurnitureSpriteAnchor(
  furniture: FurniturePlacement,
  projection: ProjectionConfig
) {
  const definition = getFurnitureDefinition(furniture.type);
  const footprint = getRotatedFootprint(definition, furniture.rotation);
  const anchorTile = {
    x: furniture.x + footprint.width / 2,
    y: furniture.y,
    z: furniture.z + footprint.depth / 2
  };

  const screen = isoToScreen(anchorTile.x, anchorTile.y, anchorTile.z, projection);

  return {
    x: screen.x + definition.offsetX,
    y: screen.y + definition.offsetY
  };
}

export function getFurnitureShadowBounds(
  furniture: FurniturePlacement,
  projection: ProjectionConfig
) {
  const definition = getFurnitureDefinition(furniture.type);
  const footprint = getRotatedFootprint(definition, furniture.rotation);
  const anchor = getFurnitureSpriteAnchor(furniture, projection);
  const width = Math.max(20, (footprint.width + footprint.depth) * (projection.tileWidth ?? 64) * 0.22);
  const height = Math.max(10, (footprint.width + footprint.depth) * (projection.tileHeight ?? 32) * 0.18);

  return {
    x: anchor.x,
    y: anchor.y + definition.drawHeight * 0.3,
    width,
    height
  };
}

export function getFurnitureHitPolygon(
  furniture: FurniturePlacement,
  projection: ProjectionConfig
): ScreenPoint[] {
  const definition = getFurnitureDefinition(furniture.type);
  const footprint = getRotatedFootprint(definition, furniture.rotation);
  const anchor = getFurnitureSpriteAnchor(furniture, projection);
  const halfW = Math.max((projection.tileWidth ?? 64) * footprint.width * 0.5, definition.drawWidth * 0.35);
  const halfH = Math.max((projection.tileHeight ?? 32) * footprint.depth * 0.5, definition.drawHeight * 0.2);

  return [
    { x: anchor.x, y: anchor.y - definition.drawHeight },
    { x: anchor.x + halfW, y: anchor.y - definition.drawHeight * 0.35 },
    { x: anchor.x + halfW, y: anchor.y + halfH },
    { x: anchor.x, y: anchor.y + halfH + definition.drawHeight * 0.12 },
    { x: anchor.x - halfW, y: anchor.y + halfH },
    { x: anchor.x - halfW, y: anchor.y - definition.drawHeight * 0.35 }
  ];
}

export function pointInPolygon(point: ScreenPoint, polygon: ScreenPoint[]) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-9) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}
