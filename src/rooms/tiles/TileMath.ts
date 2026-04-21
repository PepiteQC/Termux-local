import type { HeightMapPosition } from '../map/HeightMap'

export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
export const TILE_STEP_HEIGHT = 18

/**
 * Points du polygone de la face supérieure d'une tuile iso.
 * Défini ici (et pas dans `TileGenerator`) pour casser la dépendance
 * circulaire `Tile` ↔ `TileGenerator` qui cassait le boot du client.
 */
export const TILE_SURFACE_POINTS = [
	TILE_WIDTH / 2, 0,
	TILE_WIDTH, TILE_HEIGHT / 2,
	TILE_WIDTH / 2, TILE_HEIGHT,
	0, TILE_HEIGHT / 2
]

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
