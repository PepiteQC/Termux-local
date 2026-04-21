import type { HeightMapPosition } from '../map/HeightMap'

export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
export const TILE_STEP_HEIGHT = 18

export function getTileScreenIndex(heightMapPosition: HeightMapPosition): number {
	return (
		heightMapPosition.x + heightMapPosition.y + heightMapPosition.height
	)
}

export function getTileScreenX(heightMapPosition: HeightMapPosition): number {
	return (
		heightMapPosition.x * TILE_HEIGHT - heightMapPosition.y * TILE_HEIGHT
	)
}

export function getTileScreenY(heightMapPosition: HeightMapPosition): number {
	return (
		(heightMapPosition.x * TILE_HEIGHT +
			heightMapPosition.y * TILE_HEIGHT) /
			2 -
		TILE_STEP_HEIGHT * heightMapPosition.height
	)
}
