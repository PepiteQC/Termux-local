import type { Point, RoomDefinition, RoomFurniture, Tile } from "./types"

export function isoToScreen(
  room: RoomDefinition,
  x: number,
  y: number,
  elevation: number,
  origin: Point,
): Point {
  return {
    x: origin.x + (x - y) * 32,
    y: origin.y + (x + y) * 16 - elevation,
  }
}

export function tilePolygon(
  room: RoomDefinition,
  x: number,
  y: number,
  origin: Point,
): Point[] {
  const top = isoToScreen(room, x, y, 0, origin)
  const right = isoToScreen(room, x + 1, y, 0, origin)
  const bottom = isoToScreen(room, x + 1, y + 1, 0, origin)
  const left = isoToScreen(room, x, y + 1, 0, origin)
  return [top, right, bottom, left]
}

function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + Number.EPSILON) + xi

    if (intersect) inside = !inside
  }

  return inside
}

export function getTileAtPoint(
  room: RoomDefinition,
  point: Point,
  origin: Point,
): Tile | null {
  for (let depth = room.width + room.height; depth >= 0; depth -= 1) {
    for (let x = 0; x < room.width; x += 1) {
      const y = depth - x
      if (y < 0 || y >= room.height) continue

      if (pointInPolygon(point, tilePolygon(room, x, y, origin))) {
        return { x, y }
      }
    }
  }

  return null
}

export function buildBlockedSet(furnitures: RoomFurniture[]) {
  const blocked = new Set<string>()

  for (const item of furnitures) {
    if (item.walkable) continue

    for (let dx = 0; dx < item.w; dx += 1) {
      for (let dy = 0; dy < item.d; dy += 1) {
        blocked.add(`${item.x + dx}:${item.y + dy}`)
      }
    }
  }

  return blocked
}
