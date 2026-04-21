import { Sprite, type Texture } from 'pixi.js'

import type { HeightMapPosition } from '../map/HeightMap'
import { getTileScreenX, getTileScreenY } from './TileMath'

export default class HoverTile extends Sprite {
	public constructor(texture: Texture) {
		super(texture)

		this.roundPixels = true
		this.alpha = 0.95
	}

	public setHoverTilePosition(heightMapPosition: HeightMapPosition): void {
		this.position.set(
			getTileScreenX(heightMapPosition),
			getTileScreenY(heightMapPosition) - 2
		)
	}
}
