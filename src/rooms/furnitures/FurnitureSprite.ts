import { Container, Graphics } from 'pixi.js'

import type RoomScene from '../RoomScene'
import TilesContainer from '../containers/tiles/TilesContainer'
import Tile from '../tiles/Tile'
import type FurnitureData from './FurnitureData'
import type { FurniturePalette } from './FurnitureData'

type Point2D = {
	x: number
	y: number
}

type FurniturePaletteSet = {
	left: number
	outline: number
	right: number
	top: number
}

const PALETTES: Record<FurniturePalette, FurniturePaletteSet> = {
	ember: {
		left: 0x7d3c47,
		outline: 0xf6dae0,
		right: 0x6a2f38,
		top: 0xb15b69
	},
	gold: {
		left: 0xb08a4f,
		outline: 0xfff2bf,
		right: 0x93703c,
		top: 0xe0bf7b
	},
	leaf: {
		left: 0x4a6f4c,
		outline: 0xccefcf,
		right: 0x3d5b3f,
		top: 0x6da16f
	},
	oak: {
		left: 0x7c5d3c,
		outline: 0xf0dac2,
		right: 0x65492d,
		top: 0xa98052
	},
	plum: {
		left: 0x7e6894,
		outline: 0xf0e8ff,
		right: 0x67547b,
		top: 0xa894c0
	},
	sand: {
		left: 0xb4aa94,
		outline: 0xfdf8ef,
		right: 0x9d927d,
		top: 0xe1d8c2
	},
	slate: {
		left: 0x5d6778,
		outline: 0xdce7f6,
		right: 0x4d5665,
		top: 0x798394
	}
}

function shade(color: number, amount: number): number {
	const r = Math.max(0, Math.min(255, (color >> 16) + amount))
	const g = Math.max(0, Math.min(255, ((color >> 8) & 0xff) + amount))
	const b = Math.max(0, Math.min(255, (color & 0xff) + amount))

	return (r << 16) | (g << 8) | b
}

function flatten(points: Point2D[]): number[] {
	return points.flatMap((point) => [point.x, point.y])
}

export default class FurnitureSprite extends Container {
	private readonly room: RoomScene
	private readonly item: FurnitureData

	public constructor(room: RoomScene, item: FurnitureData) {
		super()

		this.room = room
		this.item = item
		this.sortableChildren = true
		this.eventMode = 'static'
		this.cursor = 'pointer'

		this.build()
	}

	private build(): void {
		const palette = PALETTES[this.item.palette]
		const baseHeight = Math.max(0, this.room.map.getTileHeightAt(this.item.x, this.item.y))
		const blockHeight =
			this.item.height <= 0
				? 2
				: Math.max(18, this.item.height * 18 + (this.item.kind === 'screen' ? 12 : 0))

		const worldOrigin = {
			x: TilesContainer.getScreenX({
				x: this.item.x,
				y: this.item.y,
				height: baseHeight
			}),
			y: TilesContainer.getScreenY({
				x: this.item.x,
				y: this.item.y,
				height: baseHeight
			})
		}

		const project = (x: number, y: number): Point2D => ({
			x:
				TilesContainer.getScreenX({
					x,
					y,
					height: baseHeight
				}) - worldOrigin.x,
			y:
				TilesContainer.getScreenY({
					x,
					y,
					height: baseHeight
				}) - worldOrigin.y
		})

		const baseA = project(this.item.x, this.item.y)
		const baseB = project(this.item.x + this.item.width, this.item.y)
		const baseC = project(
			this.item.x + this.item.width,
			this.item.y + this.item.depth
		)
		const baseD = project(this.item.x, this.item.y + this.item.depth)

		const topA = { x: baseA.x, y: baseA.y - blockHeight }
		const topB = { x: baseB.x, y: baseB.y - blockHeight }
		const topC = { x: baseC.x, y: baseC.y - blockHeight }
		const topD = { x: baseD.x, y: baseD.y - blockHeight }

		const center = project(
			this.item.x + this.item.width / 2,
			this.item.y + this.item.depth / 2
		)

		const shadow = new Graphics()
		shadow
			.ellipse(
				center.x,
				center.y + 8,
				Math.max(16, this.item.width * 18),
				Math.max(8, this.item.depth * 8)
			)
			.fill({ color: 0x000000, alpha: 0.15 })
		shadow.zIndex = 0
		this.addChild(shadow)

		const volume = new Graphics()

		if (this.item.height <= 0 || this.item.walkable) {
			volume
				.poly(flatten([topA, topB, topC, topD]))
				.fill({ color: palette.top })
				.stroke({ color: palette.outline, width: 1 })
		} else {
			volume
				.poly(flatten([topA, topD, baseD, baseA]))
				.fill({ color: palette.left })
				.stroke({ color: palette.outline, width: 1 })

			volume
				.poly(flatten([topB, topC, baseC, baseB]))
				.fill({ color: palette.right })
				.stroke({ color: palette.outline, width: 1 })

			volume
				.poly(flatten([topA, topB, topC, topD]))
				.fill({ color: palette.top })
				.stroke({ color: palette.outline, width: 1 })
		}

		this.drawDecor(volume, center, topA, blockHeight, palette)
		volume.zIndex = 1
		this.addChild(volume)

		this.position.set(worldOrigin.x, worldOrigin.y)
		this.zIndex =
			TilesContainer.getScreenIndex({
				x: this.item.x + this.item.width,
				y: this.item.y + this.item.depth,
				height: baseHeight
			}) *
				10 +
			100
	}

	private drawDecor(
		graphics: Graphics,
		center: Point2D,
		topA: Point2D,
		blockHeight: number,
		palette: FurniturePaletteSet
	): void {
		if (this.item.kind === 'screen') {
			graphics
				.rect(center.x - 18, topA.y + 10, 36, 24)
				.fill({ color: 0x16212d })
				.stroke({ color: 0x09111a, width: 1 })

			graphics
				.rect(center.x - 13, topA.y + 15, 26, 13)
				.fill({ color: this.item.accent ?? 0x61d4ff })

			return
		}

		if (this.item.kind === 'lamp') {
			graphics
				.rect(center.x - 1, center.y - blockHeight + 14, 2, blockHeight + 6)
				.fill({ color: 0x705f43 })

			graphics
				.circle(center.x, center.y - blockHeight + 10, 10)
				.fill({ color: this.item.accent ?? 0xffefad, alpha: 0.95 })

			graphics
				.circle(center.x, center.y - blockHeight + 10, 22)
				.fill({ color: this.item.accent ?? 0xffefad, alpha: 0.08 })

			return
		}

		if (this.item.kind === 'plant') {
			graphics
				.rect(center.x - 10, center.y - 1, 20, 12)
				.fill({ color: 0x5a3d27 })
				.stroke({ color: 0x2d1b11, width: 1 })

			graphics
				.circle(center.x, center.y - blockHeight + 22, 16)
				.fill({ color: this.item.accent ?? 0x67be7f })

			graphics
				.circle(center.x - 8, center.y - blockHeight + 17, 8)
				.fill({ color: shade(this.item.accent ?? 0x67be7f, 18) })

			return
		}

		if (this.item.kind === 'bed') {
			graphics
				.rect(center.x - 18, topA.y + 8, 36, 9)
				.fill({ color: this.item.accent ?? 0xf4ece5 })
				.stroke({ color: 0xb4a39a, width: 1 })

			return
		}

		if (this.item.kind === 'sofa') {
			graphics
				.rect(center.x - 20, topA.y + 12, 40, 10)
				.fill({ color: shade(palette.top, 12) })
				.stroke({ color: palette.outline, width: 1 })

			return
		}

		if (this.item.kind === 'rug') {
			graphics
				.poly([
					center.x, topA.y + 8,
					center.x + 18, topA.y + 16,
					center.x, topA.y + 24,
					center.x - 18, topA.y + 16
				])
				.stroke({ color: this.item.accent ?? 0xffffff, width: 1 })

			return
		}

		if (this.item.kind === 'desk' || this.item.kind === 'table' || this.item.kind === 'shelf') {
			graphics
				.rect(center.x - 9, topA.y + 10, 18, 6)
				.fill({ color: shade(palette.top, 10) })
				.stroke({ color: palette.outline, width: 1 })
		}
	}
}
