export const HABBO_TILE_WIDTH = 64
export const HABBO_TILE_HEIGHT = 32
export const HABBO_STEP_HEIGHT = 32

export type IsoPoint = {
  x: number
  y: number
  z?: number
}

export type ScreenPoint = {
  x: number
  y: number
}

export function isoToScreen(point: IsoPoint): ScreenPoint {
  const z = point.z ?? 0

  return {
    x: (point.x - point.y) * (HABBO_TILE_WIDTH / 2),
    y: (point.x + point.y) * (HABBO_TILE_HEIGHT / 2) - z * HABBO_STEP_HEIGHT,
  }
}

export function habboDepth(x: number, y: number, z = 0, bias = 0): number {
  return (x + y) * 1000 + z * 100 + bias
}
