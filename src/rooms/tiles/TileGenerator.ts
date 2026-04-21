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

		// ---- base top diamond (wood/carpet fill) ----
		graphics
			.poly(TILE_SURFACE_POINTS)
			.fill({ color: palette.topColor })

		// horizontal plank separators, clipped to the diamond span at each y
		const plankYs = [8, 16, 24]
		for (const y of plankYs) {
			const halfSpan = halfH - Math.abs(y - halfH)
			const x1 = halfW - halfSpan * 2
			const x2 = halfW + halfSpan * 2
			graphics
				.moveTo(x1 + 2, y)
				.lineTo(x2 - 2, y)
				.stroke({ color: palette.innerDetail1, width: 1, alpha: 0.55 })
		}

		// subtle grain ticks along each plank (mid-line, every 10 px)
		for (const y of [4, 12, 20, 28]) {
			const halfSpan = halfH - Math.abs(y - halfH)
			const x1 = halfW - halfSpan * 2
			const x2 = halfW + halfSpan * 2
			const step = 10
			for (let x = x1 + 6; x < x2 - 6; x += step) {
				graphics
					.rect(x, y, 2, 1)
					.fill({ color: palette.innerDetail2, alpha: 0.55 })
			}
		}

		// lit edge (top-left) — 1px highlight along the upper diamond edges
		graphics
			.moveTo(halfW, 0)
			.lineTo(0, halfH)
			.stroke({ color: palette.highlight1, width: 1, alpha: 0.9 })
		graphics
			.moveTo(halfW, 0)
			.lineTo(TILE_WIDTH, halfH)
			.stroke({ color: palette.highlight1, width: 1, alpha: 0.35 })

		// shaded edge (bottom-right) — 1px dark along the lower diamond edges
		graphics
			.moveTo(0, halfH)
			.lineTo(halfW, TILE_HEIGHT)
			.stroke({ color: palette.topStroke, width: 1, alpha: 0.55 })
		graphics
			.moveTo(halfW, TILE_HEIGHT)
			.lineTo(TILE_WIDTH, halfH)
			.stroke({ color: palette.shadowAccent, width: 1, alpha: 0.9 })

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
