import { Graphics, type Texture } from 'pixi.js'

import type RoomScene from '../RoomScene'
import { TILE_HEIGHT, TILE_SURFACE_POINTS, TILE_WIDTH } from './TileMath'
import { getThemePalette } from '../../data/habbo/ThemeManager'

export default class TileGenerator {
	public static readonly SURFACE_POINTS = TILE_SURFACE_POINTS

	private readonly room: RoomScene
	private readonly floorThickness: number
	private readonly textures: Record<'tile' | 'tile_e' | 'tile_es' | 'tile_s', Texture>

	public constructor(room: RoomScene) {
		this.room = room
		this.floorThickness = room.data.floorThickness
		this.textures = {
			tile: this.createTexture(false, false),
			tile_e: this.createTexture(true, false),
			tile_es: this.createTexture(true, true),
			tile_s: this.createTexture(false, true)
		}
	}

	public getTexture(eastBorder: boolean, southBorder: boolean): Texture {
		if (eastBorder && southBorder) return this.textures.tile_es
		if (eastBorder) return this.textures.tile_e
		if (southBorder) return this.textures.tile_s
		return this.textures.tile
	}

	private createTexture(eastBorder: boolean, southBorder: boolean): Texture {
		const graphics = new Graphics()
		const halfW = TILE_WIDTH / 2
		const halfH = TILE_HEIGHT / 2
		const palette = getThemePalette()

		graphics
			.rect(0, 0, TILE_WIDTH, TILE_HEIGHT + this.floorThickness + 2)
			.fill({ color: 0x000000, alpha: 0 })

		if (southBorder) {
			graphics
				.poly([
					0, halfH,
					0, halfH + this.floorThickness,
					halfW, TILE_HEIGHT + this.floorThickness,
					halfW, TILE_HEIGHT
				])
				.fill({ color: palette.southColor })
				.stroke({ color: palette.southStroke, width: 1, alpha: 0.9 })
		}

		if (eastBorder) {
			graphics
				.poly([
					halfW, TILE_HEIGHT,
					halfW, TILE_HEIGHT + this.floorThickness,
					TILE_WIDTH, halfH + this.floorThickness,
					TILE_WIDTH, halfH
				])
				.fill({ color: palette.eastColor })
				.stroke({ color: palette.eastStroke, width: 1, alpha: 0.9 })
		}

		graphics
			.poly(TILE_SURFACE_POINTS)
			.fill({ color: palette.topColor })
			.stroke({ color: palette.topStroke, width: 1.5 })

		graphics
			.poly([
				halfW, 2,
				TILE_WIDTH - 5, halfH,
				halfW, TILE_HEIGHT - 2,
				5, halfH
			])
			.stroke({ color: palette.highlight1, width: 1, alpha: 0.42 })

		graphics
			.poly([
				halfW, 6,
				TILE_WIDTH - 12, halfH,
				halfW, TILE_HEIGHT - 6,
				12, halfH
			])
			.stroke({ color: palette.innerDetail1, width: 1, alpha: 0.65 })

		graphics
			.poly([
				halfW, 10,
				TILE_WIDTH - 18, halfH,
				halfW, TILE_HEIGHT - 10,
				18, halfH
			])
			.stroke({ color: palette.innerDetail2, width: 1, alpha: 0.45 })

		graphics
			.poly([
				halfW + 1, halfH - 1,
				TILE_WIDTH - 3, halfH + 8,
				halfW - 1, TILE_HEIGHT - 8
			])
			.stroke({ color: palette.shadowAccent, width: 1, alpha: 0.28 })

		const texture = this.room.renderer.generateTexture({
			target: graphics,
			resolution: 1,
			antialias: false,
			textureSourceOptions: {
				scaleMode: 'nearest'
			}
		})

		texture.source.scaleMode = 'nearest'
		graphics.destroy()

		return texture
	}
}
