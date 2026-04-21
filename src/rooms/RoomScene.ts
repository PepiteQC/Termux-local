import { Container, Texture, type Renderer } from 'pixi.js'

import type Habbo from '../Habbo'
import type { RoomTextureAssets } from '../assets/IAssetsManager'
import RoomData from './data/RoomData'
import RoomMap from './map/RoomMap'

export interface RoomViewportMetrics {
	centerX: number
	centerY: number
	height: number
	width: number
}

export default abstract class RoomScene extends Container {
	public readonly data: RoomData
	public readonly game: Habbo
	public readonly map: RoomMap
	public resources: RoomTextureAssets = {
		hoverTile: Texture.WHITE
	}

	public constructor(data: RoomData, game: Habbo) {
		super()

		this.data = data
		this.game = game
		this.map = new RoomMap(data.map.room)
		this.sortableChildren = true
		this.eventMode = 'static'
	}

	public get renderer(): Renderer {
		return this.game.renderer
	}

	public abstract getViewportMetrics(): RoomViewportMetrics
}
