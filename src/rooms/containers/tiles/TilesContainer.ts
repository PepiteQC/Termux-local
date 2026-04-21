import { Container, Text } from 'pixi.js'

import type RoomScene from '../../RoomScene'
import type { HeightMapPosition } from '../../map/HeightMap'
import Tile from '../../tiles/Tile'
import HoverTile from '../../tiles/HoverTile'
import TileGenerator from '../../tiles/TileGenerator'
import {
	getTileScreenIndex,
	getTileScreenX,
	getTileScreenY
} from '../../tiles/TileMath'

type TileTapHandler = (tile: Tile) => void

export default class TilesContainer extends Container {
	private readonly room: RoomScene
	private readonly tileGenerator: TileGenerator
	private readonly tiles: Tile[]
	private readonly hoverTile: HoverTile
	private readonly onTileTap?: TileTapHandler

	public constructor(room: RoomScene, onTileTap?: TileTapHandler) {
		super()

		this.room = room
		this.onTileTap = onTileTap
		this.sortableChildren = true
		this.tileGenerator = new TileGenerator(room)
		this.tiles = this.getTilesFromMap()
		this.hoverTile = new HoverTile(this.room.resources.hoverTile)
		this.hoverTile.visible = false

		this.addChild(...this.tiles, this.hoverTile)

		this.sortChildren()
	}

	public getTileAt(x: number, y: number): Tile | undefined {
		return this.tiles.find(
			(tile) =>
				tile.heightMapPosition.x === x && tile.heightMapPosition.y === y
		)
	}

	public static getScreenIndex(heightMapPosition: HeightMapPosition): number {
		return getTileScreenIndex(heightMapPosition)
	}

	public static getScreenX(heightMapPosition: HeightMapPosition): number {
		return getTileScreenX(heightMapPosition)
	}

	public static getScreenY(heightMapPosition: HeightMapPosition): number {
		return getTileScreenY(heightMapPosition)
	}

	private getTilesFromMap(): Tile[] {
		return this.room.map.tilePositions.map((mapTile) => {
			const tile = new Tile(this.room, mapTile, this.tileGenerator)
			this.setTileEvents(tile)
			return tile
		})
	}

	private getDebugTextCoords(): Text[] {
		return this.tiles.map((tile) => {
			const text = new Text({
				text: `(${tile.heightMapPosition.x},${tile.heightMapPosition.y})`,
				style: {
					fill: 0xffffff,
					fontFamily: 'monospace',
					fontSize: 10,
					stroke: {
						color: 0x000000,
						width: 2
					}
				},
				textureStyle: {
					scaleMode: 'nearest'
				}
			})

			text.anchor.set(0.5, 1)
			text.position.set(
				TilesContainer.getScreenX(tile.heightMapPosition) + Tile.WIDTH / 2,
				TilesContainer.getScreenY(tile.heightMapPosition) + Tile.HEIGHT - 3
			)
			text.zIndex = tile.zIndex + 1

			return text
		})
	}

	private setTileEvents(tile: Tile): void {
		tile.on('pointerover', (): void => this.onTileHover(tile))
		tile.on('pointerout', (): void => this.onTileOut())
		tile.on('pointertap', (): void => this.onTileTap?.(tile))
	}

	private onTileHover(tile: Tile): void {
		this.hoverTile.visible = true
		this.hoverTile.zIndex = tile.zIndex + 1
		this.hoverTile.setHoverTilePosition(tile.heightMapPosition)
		this.sortChildren()
	}

	private onTileOut(): void {
		this.hoverTile.visible = false
	}
}
