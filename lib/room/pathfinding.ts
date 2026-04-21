import type { Direction, RoomDefinition, Tile } from "./types"

export function getDirection(dx: number, dy: number): Direction {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "SE" : "NW"
  }

  return dy >= 0 ? "SW" : "NE"
}

function isWalkable(room: RoomDefinition, tile: Tile, blocked: Set<string>) {
  if (tile.x < 0 || tile.y < 0 || tile.x >= room.width || tile.y >= room.height) {
    return false
  }

  return !blocked.has(`${tile.x}:${tile.y}`)
}

export function findPath(
  room: RoomDefinition,
  start: Tile,
  goal: Tile,
  blocked: Set<string>,
) {
  if (!isWalkable(room, goal, blocked)) return []

  const queue: Array<{ tile: Tile; path: Tile[] }> = [{ tile: start, path: [] }]
  const visited = new Set<string>([`${start.x}:${start.y}`])

  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break

    if (current.tile.x === goal.x && current.tile.y === goal.y) {
      return current.path
    }

    for (const dir of dirs) {
      const next = {
        x: current.tile.x + dir.x,
        y: current.tile.y + dir.y,
      }

      const key = `${next.x}:${next.y}`

      if (visited.has(key) || !isWalkable(room, next, blocked)) continue

      visited.add(key)
      queue.push({
        tile: next,
        path: [...current.path, next],
      })
    }
  }

  return []
}
