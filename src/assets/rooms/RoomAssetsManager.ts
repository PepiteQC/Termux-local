import { Graphics, Rectangle, type Renderer } from 'pixi.js'

import type IAssetsManager from '../IAssetsManager'
import type { RoomTextureAssets } from '../IAssetsManager'
import Tile from '../../rooms/tiles/Tile'

export default class RoomAssetsManager implements IAssetsManager {
	public loadAssets(renderer: Renderer): RoomTextureAssets {
		const hover = new Graphics()
		const halfW = Tile.WIDTH / 2
		const halfH = Tile.HEIGHT / 2

		hover
			.rect(0, 0, Tile.WIDTH, Tile.HEIGHT)
			.fill({ color: 0x000000, alpha: 0 })

		hover
			.poly([
				halfW, 0,
				Tile.WIDTH, halfH,
				halfW, Tile.HEIGHT,
				0, halfH
			])
			.fill({ color: 0x7ddfff, alpha: 0.16 })
			.stroke({ color: 0xc8f7ff, width: 2 })

		hover
			.poly([
				halfW, 4,
				Tile.WIDTH - 8, halfH,
				halfW, Tile.HEIGHT - 4,
				8, halfH
			])
			.stroke({ color: 0x1d8fb6, width: 1, alpha: 0.95 })

		const hoverTile = renderer.generateTexture({
			target: hover,
			frame: new Rectangle(0, 0, Tile.WIDTH, Tile.HEIGHT),
			resolution: 1,
			antialias: false,
			textureSourceOptions: {
				scaleMode: 'nearest'
			}
		})

		hoverTile.source.scaleMode = 'nearest'
		hover.destroy()

		return {
			hoverTile
		}
	}
}
