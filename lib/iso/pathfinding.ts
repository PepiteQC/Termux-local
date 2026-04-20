import { buildWalkableMap } from "../furniture/FurnitureCollision";
import type { FurniturePlacement } from "../furniture/FurnitureTypes";

type Point = {
  x: number;
  y: number;
};

type Direction = {
  x: number;
  y: number;
  cost: number;
};

const CARDINAL_DIRECTIONS: Direction[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
].map((direction) => ({ ...direction, cost: 1 }));

const ALL_DIRECTIONS: Direction[] = [
  ...CARDINAL_DIRECTIONS,
  { x: 1, y: 1, cost: 1.4 },
  { x: 1, y: -1, cost: 1.4 },
  { x: -1, y: 1, cost: 1.4 },
  { x: -1, y: -1, cost: 1.4 }
];

export function buildPathCollisionMap(furnitures: FurniturePlacement[]) {
  const width = 12;
  const height = 12;
  const walkable = buildWalkableMap(furnitures, width, height);
  const grid = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      grid[toIndex(x, y, width)] = walkable.isWalkable(x, y) ? 0 : 1;
    }
  }

  return {
    ...walkable,
    width,
    height,
    grid
  };
}

export function habboPathfind(
  grid: Uint8Array,
  width: number,
  height: number,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  options?: {
    allowDiagonal?: boolean;
  }
) {
  if (!inBounds(sx, sy, width, height) || !inBounds(tx, ty, width, height)) {
    return [];
  }

  if (grid[toIndex(tx, ty, width)] === 1) {
    return [];
  }

  if (sx === tx && sy === ty) {
    return [];
  }

  const directions = options?.allowDiagonal ? ALL_DIRECTIONS : CARDINAL_DIRECTIONS;
  const open: Point[] = [{ x: sx, y: sy }];
  const openSet = new Set<string>([toKey(sx, sy)]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[toKey(sx, sy), 0]]);
  const fScore = new Map<string, number>([[toKey(sx, sy), heuristic(sx, sy, tx, ty, Boolean(options?.allowDiagonal))]]);

  while (open.length > 0) {
    let currentIndex = 0;
    for (let i = 1; i < open.length; i += 1) {
      if ((fScore.get(toKey(open[i].x, open[i].y)) ?? Number.POSITIVE_INFINITY) <
        (fScore.get(toKey(open[currentIndex].x, open[currentIndex].y)) ?? Number.POSITIVE_INFINITY)) {
        currentIndex = i;
      }
    }

    const current = open.splice(currentIndex, 1)[0]!;
    const currentKey = toKey(current.x, current.y);
    openSet.delete(currentKey);

    if (current.x === tx && current.y === ty) {
      return reconstructPath(cameFrom, currentKey).map(fromKey);
    }

    directions.forEach((direction) => {
      const nx = current.x + direction.x;
      const ny = current.y + direction.y;
      const nextKey = toKey(nx, ny);

      if (!inBounds(nx, ny, width, height)) {
        return;
      }

      if (grid[toIndex(nx, ny, width)] === 1) {
        return;
      }

      if (direction.cost > 1) {
        const sideA = toIndex(current.x + direction.x, current.y, width);
        const sideB = toIndex(current.x, current.y + direction.y, width);
        if (grid[sideA] === 1 || grid[sideB] === 1) {
          return;
        }
      }

      const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + direction.cost;
      if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
        return;
      }

      cameFrom.set(nextKey, currentKey);
      gScore.set(nextKey, tentativeG);
      fScore.set(nextKey, tentativeG + heuristic(nx, ny, tx, ty, Boolean(options?.allowDiagonal)));

      if (!openSet.has(nextKey)) {
        open.push({ x: nx, y: ny });
        openSet.add(nextKey);
      }
    });
  }

  return [];
}

export function findPath(start: Point, target: Point, collisionMap: ReturnType<typeof buildPathCollisionMap>) {
  return habboPathfind(
    collisionMap.grid,
    collisionMap.width,
    collisionMap.height,
    start.x,
    start.y,
    target.x,
    target.y
  );
}

function reconstructPath(cameFrom: Map<string, string>, currentKey: string) {
  const path = [currentKey];
  let cursor = currentKey;

  while (cameFrom.has(cursor)) {
    cursor = cameFrom.get(cursor)!;
    path.unshift(cursor);
  }

  return path.slice(1);
}

function heuristic(x: number, y: number, tx: number, ty: number, allowDiagonal: boolean) {
  const dx = Math.abs(tx - x);
  const dy = Math.abs(ty - y);
  return allowDiagonal ? Math.max(dx, dy) : dx + dy;
}

function toIndex(x: number, y: number, width: number) {
  return y * width + x;
}

function toKey(x: number, y: number) {
  return `${x}:${y}`;
}

function fromKey(key: string): Point {
  const [x, y] = key.split(":").map(Number);
  return { x, y };
}

function inBounds(x: number, y: number, width: number, height: number) {
  return x >= 0 && y >= 0 && x < width && y < height;
}
