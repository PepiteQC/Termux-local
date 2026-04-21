import { Polygon, Sprite, type Texture } from 'pixi.js'

import type RoomScene from '../RoomScene'
import type { HeightMapPosition } from '../map/HeightMap'
import Directions from '../map/directions/Directions'
import type TileGenerator from './TileGenerator'
import {
	TILE_HEIGHT,
	TILE_STEP_HEIGHT,
	TILE_SURFACE_POINTS,
	TILE_WIDTH,
	getTileScreenIndex,
	getTileScreenX,
	getTileScreenY
} from './TileMath'

export default class Tile extends Sprite {
	public static readonly HEIGHT = TILE_HEIGHT
	public static readonly STEP_HEIGHT = TILE_STEP_HEIGHT
	public static readonly WIDTH = TILE_WIDTH

	public readonly heightMapPosition: HeightMapPosition

	protected readonly room: RoomScene
	protected readonly generator: TileGenerator

	public constructor(
		room: RoomScene,
		heightMapPosition: HeightMapPosition,
		generator: TileGenerator
	) {
		super()

		this.room = room
		this.generator = generator
		this.heightMapPosition = heightMapPosition

		this.position.set(
			getTileScreenX(heightMapPosition),
			getTileScreenY(heightMapPosition)
		)

		this.zIndex = getTileScreenIndex(heightMapPosition) * 10
		this.roundPixels = true
		this.eventMode = 'static'
		this.cursor = 'pointer'
		this.hitArea = new Polygon(TILE_SURFACE_POINTS)

		this.setTexture()
	}

	protected setTexture(): void {
		const { x, y } = this.heightMapPosition
		const tilesAround = this.room.map.getTilePositionsAround(x, y)
		const eastBorder = this.isEastBorderNeeded(tilesAround)
		const southBorder = this.isSouthBorderNeeded(tilesAround)

		this.texture = this.generator.getTexture(eastBorder, southBorder)
		this.texture.source.scaleMode = 'nearest'
	}

	protected isEastBorderNeeded(
		tilesAround: Array<HeightMapPosition | undefined>
	): boolean {
		return (
			!tilesAround[Directions.EAST] ||
			tilesAround[Directions.EAST]?.height !== this.heightMapPosition.height
		)
	}

	protected isSouthBorderNeeded(
		tilesAround: Array<HeightMapPosition | undefined>
	): boolean {
		return (
			!tilesAround[Directions.SOUTH] ||
			tilesAround[Directions.SOUTH]?.height !== this.heightMapPosition.height
		)
	}
}
