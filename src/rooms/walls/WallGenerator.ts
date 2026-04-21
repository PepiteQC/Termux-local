import { Graphics, Rectangle, type Texture } from 'pixi.js'

import type RoomScene from '../RoomScene'
import Tile from '../tiles/Tile'
import { getWallPalette } from '../../data/habbo/WallPaletteManager'

export default class WallGenerator {
	private readonly eastTexture: Texture
	private readonly room: RoomScene
	private readonly southTexture: Texture
	private readonly wallHeightPx: number
	private readonly wallThickness: number

	public constructor(room: RoomScene) {
		this.room = room
		this.wallThickness = Math.max(4, room.data.wallThickness)
		this.wallHeightPx = WallGenerator.getWallHeightPx(room)
		this.eastTexture = this.createEastTexture()
		this.southTexture = this.createSouthTexture()
	}

	public static getWallHeightPx(room: RoomScene): number {
		return Math.max(96, room.data.wallHeight * Tile.STEP_HEIGHT + 52)
	}

	public getEastTexture(): Texture {
		return this.eastTexture
	}

	public getSouthTexture(): Texture {
		return this.southTexture
	}

	public getWallHeight(): number {
		return this.wallHeightPx
	}

	private createEastTexture(): Texture {
		const graphics = new Graphics()
		const width = Tile.WIDTH
		const edge = Tile.HEIGHT / 2
		const faceHeight = this.wallHeightPx
		const thickness = Math.min(this.wallThickness, 10)
		const palette = getWallPalette()

		graphics
			.rect(0, 0, width, faceHeight + edge + thickness)
			.fill({ color: 0x000000, alpha: 0 })

		graphics
			.poly([
				width / 2, 0,
				width, edge,
				width, faceHeight + edge,
				width / 2, faceHeight
			])
			.fill({ color: palette.eastMain })
			.stroke({ color: palette.eastStroke, width: 1.5, alpha: 0.95 })

		graphics
			.poly([
				width / 2, 0,
				width, edge,
				width - thickness, edge + thickness,
				width / 2 - thickness, thickness
			])
			.fill({ color: palette.eastEdge })
			.stroke({ color: palette.eastEdgeStroke, width: 1, alpha: 0.8 })

		graphics
			.rect(width / 2 + 3, 16, 6, Math.max(faceHeight - 40, 40))
			.fill({ color: 0xffffff, alpha: 0.08 })

		graphics
			.poly([
				width / 2, 12,
				width / 2, faceHeight - 12
			])
			.stroke({ color: 0xffffff, width: 1, alpha: 0.18 })

		graphics
			.poly([
				width / 2 + 14, 20,
				width / 2 + 14, faceHeight - 18
			])
			.stroke({ color: palette.eastDetail, width: 1, alpha: 0.22 })

		graphics
			.poly([
				width / 2, faceHeight,
				width, faceHeight + edge
			])
			.stroke({ color: palette.shadowLine, width: 1, alpha: 0.65 })

		const texture = this.room.renderer.generateTexture({
			target: graphics,
			frame: new Rectangle(0, 0, width, faceHeight + edge + thickness),
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

	private createSouthTexture(): Texture {
		const graphics = new Graphics()
		const width = Tile.WIDTH
		const edge = Tile.HEIGHT / 2
		const faceHeight = this.wallHeightPx
		const thickness = Math.min(this.wallThickness, 10)
		const palette = getWallPalette()

		graphics
			.rect(0, 0, width, faceHeight + edge + thickness)
			.fill({ color: 0x000000, alpha: 0 })

		graphics
			.poly([
				0, edge,
				width / 2, 0,
				width / 2, faceHeight,
				0, faceHeight + edge
			])
			.fill({ color: palette.southMain })
			.stroke({ color: palette.southStroke, width: 1.5, alpha: 0.95 })

		graphics
			.poly([
				0, edge,
				width / 2, 0,
				width / 2 - thickness, thickness,
				thickness, edge + thickness
			])
			.fill({ color: palette.southEdge })
			.stroke({ color: palette.southEdgeStroke, width: 1, alpha: 0.8 })

		graphics
			.rect(width / 2 - 9, 16, 6, Math.max(faceHeight - 40, 40))
			.fill({ color: 0xffffff, alpha: 0.07 })

		graphics
			.poly([
				width / 2 - 1, 12,
				width / 2 - 1, faceHeight - 12
			])
			.stroke({ color: 0xffffff, width: 1, alpha: 0.15 })

		graphics
			.poly([
				width / 2 - 16, 20,
				width / 2 - 16, faceHeight - 18
			])
			.stroke({ color: palette.southDetail, width: 1, alpha: 0.2 })

		graphics
			.poly([
				width / 2, faceHeight,
				0, faceHeight + edge
			])
			.stroke({ color: palette.shadowLine, width: 1, alpha: 0.7 })

		const texture = this.room.renderer.generateTexture({
			target: graphics,
			frame: new Rectangle(0, 0, width, faceHeight + edge + thickness),
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
