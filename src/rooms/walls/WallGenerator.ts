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

		// main wall face (east-facing, darker due to light coming from top-left)
		graphics
			.poly([
				width / 2, 0,
				width, edge,
				width, faceHeight + edge,
				width / 2, faceHeight
			])
			.fill({ color: palette.eastMain })

		// top edge (thickness slab at the top of the wall, lit)
		graphics
			.poly([
				width / 2, 0,
				width, edge,
				width - thickness, edge + thickness,
				width / 2 - thickness, thickness
			])
			.fill({ color: palette.eastEdge })

		// vertical plank separators — 3 inner lines at wall-space 1/4, 2/4, 3/4
		for (let i = 1; i < 4; i++) {
			const t = i / 4
			const topX = width / 2 + t * (width / 2)
			const topY = t * edge
			graphics
				.moveTo(topX, topY)
				.lineTo(topX, topY + faceHeight)
				.stroke({ color: palette.eastStroke, width: 1, alpha: 0.55 })
		}

		// crown molding — 4px darker strip along the face just below the lit edge
		graphics
			.poly([
				width / 2, 4,
				width, edge + 4,
				width, edge + 7,
				width / 2, 7
			])
			.fill({ color: palette.eastStroke })

		// baseboard — 6px darker strip at the bottom of the face
		graphics
			.poly([
				width / 2, faceHeight - 6,
				width, faceHeight + edge - 6,
				width, faceHeight + edge,
				width / 2, faceHeight
			])
			.fill({ color: palette.eastStroke })

		// 1px bevel highlight just under the top edge
		graphics
			.moveTo(width / 2, 1)
			.lineTo(width, edge + 1)
			.stroke({ color: palette.eastEdgeStroke, width: 1, alpha: 0.75 })

		// bottom shadow cap where wall meets floor
		graphics
			.moveTo(width / 2, faceHeight)
			.lineTo(width, faceHeight + edge)
			.stroke({ color: palette.shadowLine, width: 1, alpha: 0.8 })

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

		// main wall face (south-facing, slightly brighter than east due to top-left light)
		graphics
			.poly([
				0, edge,
				width / 2, 0,
				width / 2, faceHeight,
				0, faceHeight + edge
			])
			.fill({ color: palette.southMain })

		// top edge slab
		graphics
			.poly([
				0, edge,
				width / 2, 0,
				width / 2 - thickness, thickness,
				thickness, edge + thickness
			])
			.fill({ color: palette.southEdge })

		// vertical plank separators — 3 inner lines at wall-space 1/4, 2/4, 3/4
		for (let i = 1; i < 4; i++) {
			const t = i / 4
			const topX = t * (width / 2)
			const topY = edge - t * edge
			graphics
				.moveTo(topX, topY)
				.lineTo(topX, topY + faceHeight)
				.stroke({ color: palette.southStroke, width: 1, alpha: 0.55 })
		}

		// crown molding — 4px darker strip just below the top edge
		graphics
			.poly([
				0, edge + 4,
				width / 2, 4,
				width / 2, 7,
				0, edge + 7
			])
			.fill({ color: palette.southStroke })

		// baseboard — 6px darker strip at the bottom of the face
		graphics
			.poly([
				0, faceHeight + edge - 6,
				width / 2, faceHeight - 6,
				width / 2, faceHeight,
				0, faceHeight + edge
			])
			.fill({ color: palette.southStroke })

		// 1px bevel highlight just under the top edge
		graphics
			.moveTo(0, edge + 1)
			.lineTo(width / 2, 1)
			.stroke({ color: palette.southEdgeStroke, width: 1, alpha: 0.85 })

		// bottom shadow cap where wall meets floor
		graphics
			.moveTo(0, faceHeight + edge)
			.lineTo(width / 2, faceHeight)
			.stroke({ color: palette.shadowLine, width: 1, alpha: 0.85 })

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
