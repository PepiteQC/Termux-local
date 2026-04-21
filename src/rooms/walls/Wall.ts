import { Container, Sprite } from 'pixi.js'

import type RoomScene from '../RoomScene'
import type { HeightMapPosition } from '../map/HeightMap'
import TilesContainer from '../containers/tiles/TilesContainer'
import Tile from '../tiles/Tile'
import WallGenerator from './WallGenerator'

export default class Wall extends Container {
	public static readonly WIDTH = Tile.WIDTH
	public static readonly EDGE_HEIGHT = Tile.HEIGHT / 2

	private readonly room: RoomScene
	private readonly wallGenerator: WallGenerator
	private readonly wallHeightPx: number

	public readonly heightMapPosition: HeightMapPosition

	public constructor(
		room: RoomScene,
		position: HeightMapPosition,
		wallGenerator: WallGenerator
	) {
		super()

		this.room = room
		this.wallGenerator = wallGenerator
		this.heightMapPosition = position
		this.wallHeightPx = wallGenerator.getWallHeight()

		this.sortableChildren = true

		this.position.set(
				TilesContainer.getScreenX(position),
				TilesContainer.getScreenY(position) - this.wallHeightPx
			)

		this.zIndex = TilesContainer.getScreenIndex(position) * 10 - 150

		this.build()
	}

	private build(): void {
		const { x, y } = this.heightMapPosition

		const northTile = this.room.map.getTilePositionAt(x, y - 1)
		const westTile = this.room.map.getTilePositionAt(x - 1, y)

		// Pas de tile au nord => mur "east" (mur du fond côté droit)
		if (!northTile) {
			this.addChild(this.createEastWall())
		}

		// Pas de tile à l'ouest => mur "south" (mur du fond côté gauche)
		if (!westTile) {
			this.addChild(this.createSouthWall())
		}
	}

	private createEastWall(): Sprite {
		const sprite = new Sprite(this.wallGenerator.getEastTexture())
		sprite.name = 'wall-east'
		sprite.zIndex = 2
		sprite.position.set(0, 0)
		sprite.roundPixels = true
		sprite.texture.source.scaleMode = 'nearest'

		return sprite
	}

	private createSouthWall(): Sprite {
		const sprite = new Sprite(this.wallGenerator.getSouthTexture())
		sprite.name = 'wall-south'
		sprite.zIndex = 1
		sprite.position.set(0, 0)
		sprite.roundPixels = true
		sprite.texture.source.scaleMode = 'nearest'

		return sprite
	}
}
