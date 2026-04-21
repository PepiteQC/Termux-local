import { Container, Graphics, type FederatedPointerEvent } from 'pixi.js'

import { buildHabboFurniContainer } from '../../habbo/HabboFurniLoader'
import type RoomScene from '../RoomScene'
import TilesContainer from '../containers/tiles/TilesContainer'
import Tile from '../tiles/Tile'
import type FurnitureData from './FurnitureData'
import type { FurniturePalette } from './FurnitureData'

export type FurnitureTapEventDetail = {
	id: string
	label: string
	kind: string
	x: number
	y: number
	width: number
	depth: number
	height: number
	walkable: boolean
	habboClassName: string | null
	habboDirection: number | null
	clientX: number
	clientY: number
}

const HABBO_DIRECTIONS = [0, 2, 4, 6] as const

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
	ember: { left: 0x7d3c47, outline: 0xf6dae0, right: 0x6a2f38, top: 0xb15b69 },
	gold: { left: 0xb08a4f, outline: 0xfff2bf, right: 0x93703c, top: 0xe0bf7b },
	leaf: { left: 0x4a6f4c, outline: 0xccefcf, right: 0x3d5b3f, top: 0x6da16f },
	oak: { left: 0x7c5d3c, outline: 0xf0dac2, right: 0x65492d, top: 0xa98052 },
	plum: { left: 0x7e6894, outline: 0xf0e8ff, right: 0x67547b, top: 0xa894c0 },
	sand: { left: 0xb4aa94, outline: 0xfdf8ef, right: 0x9d927d, top: 0xe1d8c2 },
	slate: { left: 0x5d6778, outline: 0xdce7f6, right: 0x4d5665, top: 0x798394 },

	emerald: { left: 0x1f3f2a, outline: 0xbaf5c9, right: 0x172f20, top: 0x2e5f3d },
	'neon-green': { left: 0x1a3d25, outline: 0x9bff9b, right: 0x122b1a, top: 0x3fe07e },
	'hash-brown': { left: 0x4a3520, outline: 0xeacba1, right: 0x3a2817, top: 0x7c5a36 },

	lemon: { left: 0xc6a54b, outline: 0xfff0b3, right: 0xa8893b, top: 0xeccc6b },
	cream: { left: 0xbcb39a, outline: 0xfff8e4, right: 0xa29878, top: 0xe7dcc0 },
	steel: { left: 0x6a7383, outline: 0xd6deed, right: 0x545c69, top: 0x8c94a2 },

	'royal-blonds': { left: 0x9c7a2a, outline: 0xffe88a, right: 0x7c5d1e, top: 0xcfa44b },
	'crimson-bmf': { left: 0x5e1820, outline: 0xf7b7bf, right: 0x44101a, top: 0x8a2330 },
	'gold-vagos': { left: 0xa47b1a, outline: 0xffd96b, right: 0x7d5c10, top: 0xd9a02d },
	'blue-crips': { left: 0x1e3a6c, outline: 0x9ac4ff, right: 0x152752, top: 0x2f5fa6 },
	'leather-motards': { left: 0x141414, outline: 0x888888, right: 0x0a0a0a, top: 0x2a2a2a },
	'ice-quebec': { left: 0x2c5c77, outline: 0xcef0ff, right: 0x1e4058, top: 0x4f8ba7 },

	'acid-lab': { left: 0x1a3a2e, outline: 0xa9ffbe, right: 0x103022, top: 0x2d5f47 },
	'violet-lab': { left: 0x352464, outline: 0xd7b7ff, right: 0x24174a, top: 0x533a95 },
	shadow: { left: 0x0e1018, outline: 0x7b8296, right: 0x05060a, top: 0x1f2230 },
	blood: { left: 0x3a0c0c, outline: 0xff9c9c, right: 0x1d0505, top: 0x6b1a1a }
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
		this.on('pointertap', this.handlePointerTap, this)

		if (item.habboClassName) {
			this.buildHabbo().catch(() => this.build())
		} else {
			this.build()
		}
	}

	public getItemId(): string {
		return this.item.id
	}

	public turn(): number | null {
		if (!this.item.habboClassName) return null
		const current = this.item.habboDirection ?? 2
		const currentIndex = HABBO_DIRECTIONS.indexOf(
			current as typeof HABBO_DIRECTIONS[number]
		)
		const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % HABBO_DIRECTIONS.length
		const nextDirection = HABBO_DIRECTIONS[nextIndex]
		this.item.habboDirection = nextDirection
		this.rebuildHabbo()
		return nextDirection
	}

	private rebuildHabbo(): void {
		this.removeChildren().forEach((child) => child.destroy({ children: true }))
		this.buildHabbo().catch(() => this.build())
	}

	private handlePointerTap(event: FederatedPointerEvent): void {
		if (typeof window === 'undefined') return
		const detail: FurnitureTapEventDetail = {
			id: this.item.id,
			label: this.item.label,
			kind: this.item.kind,
			x: this.item.x,
			y: this.item.y,
			width: this.item.width,
			depth: this.item.depth,
			height: this.item.height,
			walkable: this.item.walkable ?? false,
			habboClassName: this.item.habboClassName ?? null,
			habboDirection: this.item.habboDirection ?? null,
			clientX: event.client.x,
			clientY: event.client.y
		}
		window.dispatchEvent(
			new CustomEvent<FurnitureTapEventDetail>('ew-furniture-tap', { detail })
		)
	}

	private async buildHabbo(): Promise<void> {
		const item = this.item
		const baseHeight = Math.max(0, this.room.map.getTileHeightAt(item.x, item.y))
		const worldOrigin = {
			x: TilesContainer.getScreenX({ x: item.x, y: item.y, height: baseHeight }),
			y: TilesContainer.getScreenY({ x: item.x, y: item.y, height: baseHeight })
		}

		const container = await buildHabboFurniContainer({
			className: item.habboClassName!,
			size: 64,
			direction: item.habboDirection ?? 2
		})
		if (!container) {
			this.build()
			return
		}

		const shadow = new Graphics()
		const centerX = (
			TilesContainer.getScreenX({ x: item.x + item.width / 2, y: item.y + item.depth / 2, height: baseHeight }) -
			worldOrigin.x
		)
		const centerY = (
			TilesContainer.getScreenY({ x: item.x + item.width / 2, y: item.y + item.depth / 2, height: baseHeight }) -
			worldOrigin.y
		)
		shadow
			.ellipse(centerX, centerY + 4, Math.max(18, item.width * 20), Math.max(8, item.depth * 10))
			.fill({ color: 0x000000, alpha: 0.22 })
		shadow.zIndex = 0
		this.addChild(shadow)

		container.position.set(centerX, centerY)
		container.zIndex = 1
		this.addChild(container)

		this.position.set(worldOrigin.x, worldOrigin.y)
		this.zIndex =
			TilesContainer.getScreenIndex({
				x: item.x + item.width,
				y: item.y + item.depth,
				height: baseHeight
			}) * 10 + 100
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
			.fill({ color: 0x000000, alpha: 0.18 })
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
		const kind = this.item.kind
		const accent = this.item.accent ?? palette.top

		if (kind === 'screen') {
			graphics.rect(center.x - 18, topA.y + 10, 36, 24).fill({ color: 0x16212d }).stroke({ color: 0x09111a, width: 1 })
			graphics.rect(center.x - 13, topA.y + 15, 26, 13).fill({ color: accent })
			return
		}

		if (kind === 'lamp') {
			graphics.rect(center.x - 1, center.y - blockHeight + 14, 2, blockHeight + 6).fill({ color: 0x705f43 })
			graphics.circle(center.x, center.y - blockHeight + 10, 10).fill({ color: accent, alpha: 0.95 })
			graphics.circle(center.x, center.y - blockHeight + 10, 22).fill({ color: accent, alpha: 0.08 })
			return
		}

		if (kind === 'plant') {
			graphics.rect(center.x - 10, center.y - 1, 20, 12).fill({ color: 0x5a3d27 }).stroke({ color: 0x2d1b11, width: 1 })
			graphics.circle(center.x, center.y - blockHeight + 22, 16).fill({ color: accent })
			graphics.circle(center.x - 8, center.y - blockHeight + 17, 8).fill({ color: shade(accent, 18) })
			return
		}

		if (kind === 'weed-plant') {
			graphics.rect(center.x - 10, center.y - 2, 20, 12).fill({ color: 0x3a2514 }).stroke({ color: 0x1a0f07, width: 1 })
			for (let i = 0; i < 5; i++) {
				const ox = (i - 2) * 5
				const oy = -blockHeight + 12 + Math.abs(i - 2) * 4
				graphics.circle(center.x + ox, center.y + oy, 6).fill({ color: shade(0x3fa35a, i * 6 - 8) })
			}
			graphics.circle(center.x, center.y - blockHeight + 8, 7).fill({ color: 0x5fd27a })
			return
		}

		if (kind === 'bed') {
			graphics.rect(center.x - 18, topA.y + 8, 36, 9).fill({ color: accent }).stroke({ color: 0xb4a39a, width: 1 })
			return
		}

		if (kind === 'sofa' || kind === 'chill-sofa') {
			graphics.rect(center.x - 20, topA.y + 12, 40, 10).fill({ color: shade(palette.top, 12) }).stroke({ color: palette.outline, width: 1 })
			graphics.rect(center.x - 18, topA.y + 8, 36, 4).fill({ color: shade(palette.top, 22) })
			if (kind === 'chill-sofa') {
				graphics.rect(center.x - 14, topA.y + 4, 10, 6).fill({ color: accent })
				graphics.rect(center.x + 4, topA.y + 4, 10, 6).fill({ color: accent })
			}
			return
		}

		if (kind === 'rug') {
			graphics.poly([
				center.x, topA.y + 8,
				center.x + 22, topA.y + 18,
				center.x, topA.y + 28,
				center.x - 22, topA.y + 18
			]).fill({ color: shade(accent, -20), alpha: 0.55 }).stroke({ color: accent, width: 2 })
			return
		}

		if (kind === 'counter') {
			graphics.rect(center.x - 22, topA.y + 6, 44, 6).fill({ color: shade(palette.top, 14) }).stroke({ color: palette.outline, width: 1 })
			graphics.rect(center.x - 20, topA.y + 12, 40, 4).fill({ color: shade(palette.top, -12) })
			return
		}

		if (kind === 'cash-register' || kind === 'checkout') {
			graphics.rect(center.x - 12, topA.y + 4, 24, 14).fill({ color: 0x1a1a1f }).stroke({ color: 0x080810, width: 1 })
			graphics.rect(center.x - 10, topA.y + 6, 20, 6).fill({ color: accent })
			graphics.rect(center.x - 3, topA.y + 14, 6, 3).fill({ color: 0xffd84d })
			return
		}

		if (kind === 'jar') {
			graphics.rect(center.x - 8, topA.y + 4, 16, 18).fill({ color: 0x22332a, alpha: 0.85 }).stroke({ color: 0x0c1810, width: 1 })
			graphics.rect(center.x - 7, topA.y + 8, 14, 12).fill({ color: accent, alpha: 0.92 })
			graphics.rect(center.x - 8, topA.y + 2, 16, 4).fill({ color: 0xb7924a })
			graphics.rect(center.x - 5, topA.y + 12, 3, 3).fill({ color: shade(accent as number, 40), alpha: 0.8 })
			return
		}

		if (kind === 'vitrine') {
			graphics.rect(center.x - 18, topA.y + 2, 36, 24).fill({ color: 0x0a0f14, alpha: 0.4 }).stroke({ color: palette.outline, width: 2 })
			graphics.rect(center.x - 16, topA.y + 4, 32, 8).fill({ color: accent, alpha: 0.8 })
			graphics.rect(center.x - 16, topA.y + 14, 32, 8).fill({ color: shade(accent, 24), alpha: 0.75 })
			graphics.rect(center.x - 17, topA.y + 13, 34, 1).fill({ color: palette.outline })
			return
		}

		if (kind === 'neon') {
			graphics.rect(center.x - 20, topA.y + 4, 40, 4).fill({ color: accent, alpha: 0.95 })
			graphics.rect(center.x - 20, topA.y + 4, 40, 4).stroke({ color: shade(accent, 60), width: 1 })
			graphics.rect(center.x - 22, topA.y + 2, 44, 10).fill({ color: accent, alpha: 0.15 })
			return
		}

		if (kind === 'enseigne') {
			graphics.rect(center.x - 24, topA.y + 2, 48, 18).fill({ color: 0x0c1510 }).stroke({ color: accent, width: 2 })
			graphics.rect(center.x - 22, topA.y + 4, 44, 14).fill({ color: accent, alpha: 0.22 })
			graphics.circle(center.x - 14, topA.y + 11, 3).fill({ color: accent })
			graphics.circle(center.x, topA.y + 11, 3).fill({ color: accent })
			graphics.circle(center.x + 14, topA.y + 11, 3).fill({ color: accent })
			return
		}

		if (kind === 'dab-station') {
			graphics.rect(center.x - 10, topA.y + 6, 20, 10).fill({ color: 0x191a22 }).stroke({ color: 0x0a0a10, width: 1 })
			graphics.circle(center.x, topA.y + 4, 5).fill({ color: 0xff7a2a, alpha: 0.9 })
			graphics.rect(center.x - 1, topA.y + 0, 2, 6).fill({ color: 0xff3f00 })
			graphics.rect(center.x - 8, topA.y + 14, 16, 2).fill({ color: accent })
			return
		}

		if (kind === 'poster') {
			graphics.rect(center.x - 12, topA.y + 2, 24, 28).fill({ color: 0xf6ecd9 }).stroke({ color: 0x3c2a1a, width: 1 })
			graphics.rect(center.x - 10, topA.y + 4, 20, 10).fill({ color: accent })
			graphics.rect(center.x - 10, topA.y + 16, 20, 3).fill({ color: 0x2b1a10 })
			graphics.rect(center.x - 10, topA.y + 21, 20, 3).fill({ color: 0x2b1a10 })
			return
		}

		if (kind === 'fridge') {
			graphics.rect(center.x - 14, topA.y + 2, 28, 28).fill({ color: 0xe4eef5 }).stroke({ color: 0x374453, width: 2 })
			graphics.rect(center.x - 12, topA.y + 4, 24, 10).fill({ color: accent, alpha: 0.5 })
			graphics.rect(center.x - 12, topA.y + 16, 24, 12).fill({ color: accent, alpha: 0.55 })
			graphics.rect(center.x - 13, topA.y + 14, 26, 1).fill({ color: 0x374453 })
			graphics.rect(center.x - 13, topA.y + 8, 2, 4).fill({ color: 0x374453 })
			graphics.rect(center.x - 13, topA.y + 22, 2, 4).fill({ color: 0x374453 })
			return
		}

		if (kind === 'cigarette-rack') {
			graphics.rect(center.x - 16, topA.y + 2, 32, 28).fill({ color: 0x2a2a34 }).stroke({ color: 0x05060a, width: 2 })
			for (let row = 0; row < 3; row++) {
				for (let col = 0; col < 5; col++) {
					graphics.rect(center.x - 14 + col * 6, topA.y + 4 + row * 8, 5, 6).fill({ color: col % 2 === 0 ? accent : 0xe9cb7b })
				}
			}
			return
		}

		if (kind === 'snack-rack') {
			graphics.rect(center.x - 18, topA.y + 2, 36, 30).fill({ color: 0xe8e3d0 }).stroke({ color: 0x695d3f, width: 1 })
			const colors = [0xff7b5a, 0xffc95a, 0x5ad16a, 0x5abfff, 0xff5aa8]
			for (let row = 0; row < 3; row++) {
				for (let col = 0; col < 4; col++) {
					const c = colors[(row * 4 + col) % colors.length]
					graphics.rect(center.x - 16 + col * 8, topA.y + 4 + row * 9, 7, 7).fill({ color: c }).stroke({ color: 0x2f2414, width: 1 })
				}
			}
			return
		}

		if (kind === 'coffee-machine') {
			graphics.rect(center.x - 10, topA.y + 4, 20, 22).fill({ color: 0x1c1c22 }).stroke({ color: 0x05060a, width: 2 })
			graphics.rect(center.x - 8, topA.y + 6, 16, 6).fill({ color: 0x7a3d1c })
			graphics.rect(center.x - 4, topA.y + 14, 8, 8).fill({ color: accent })
			graphics.rect(center.x - 1, topA.y + 12, 2, 3).fill({ color: 0xb0b0b8 })
			return
		}

		if (kind === 'magazine-rack') {
			graphics.rect(center.x - 16, topA.y + 4, 32, 22).fill({ color: 0x6b5438 }).stroke({ color: 0x2e2212, width: 1 })
			const colors = [0xe0d6a4, 0xffd2a8, 0xa8cbff, 0xf5a8c9]
			for (let i = 0; i < 4; i++) {
				graphics.rect(center.x - 14 + i * 8, topA.y + 6, 6, 18).fill({ color: colors[i] }).stroke({ color: 0x201410, width: 1 })
			}
			return
		}

		if (kind === 'donut-case') {
			graphics.rect(center.x - 16, topA.y + 4, 32, 20).fill({ color: 0xffeecc, alpha: 0.3 }).stroke({ color: palette.outline, width: 2 })
			const dcols = [0xffd29a, 0xff9ad6, 0xe06050]
			for (let row = 0; row < 2; row++) {
				for (let col = 0; col < 4; col++) {
					graphics.circle(center.x - 12 + col * 7, topA.y + 10 + row * 8, 3.5).fill({ color: dcols[(row + col) % 3] }).stroke({ color: 0x2f1a10, width: 1 })
				}
			}
			return
		}

		if (kind === 'hot-dog') {
			graphics.rect(center.x - 14, topA.y + 6, 28, 16).fill({ color: 0xe8c87a }).stroke({ color: 0x5d3a18, width: 1 })
			graphics.rect(center.x - 12, topA.y + 10, 24, 4).fill({ color: 0xd46640 })
			graphics.rect(center.x - 12, topA.y + 14, 24, 1).fill({ color: 0xffce55 })
			return
		}

		if (kind === 'weapon-rack') {
			graphics.rect(center.x - 18, topA.y + 2, 36, 24).fill({ color: 0x1a1a1a }).stroke({ color: accent, width: 2 })
			graphics.rect(center.x - 16, topA.y + 6, 32, 2).fill({ color: 0xb0b0b8 })
			graphics.rect(center.x - 16, topA.y + 14, 32, 2).fill({ color: 0xb0b0b8 })
			graphics.rect(center.x - 16, topA.y + 22, 32, 2).fill({ color: 0xb0b0b8 })
			return
		}

		if (kind === 'drug-stash') {
			graphics.rect(center.x - 14, topA.y + 6, 28, 20).fill({ color: 0x3a2a1a }).stroke({ color: 0x0e0805, width: 1 })
			graphics.rect(center.x - 12, topA.y + 8, 12, 8).fill({ color: accent })
			graphics.rect(center.x + 2, topA.y + 8, 10, 8).fill({ color: 0xf6f0dc })
			graphics.rect(center.x - 12, topA.y + 18, 24, 6).fill({ color: 0x6b5438 })
			return
		}

		if (kind === 'safe') {
			graphics.rect(center.x - 14, topA.y + 4, 28, 24).fill({ color: 0x242a33 }).stroke({ color: 0x050708, width: 2 })
			graphics.circle(center.x, topA.y + 16, 6).fill({ color: 0x9ea6b3 }).stroke({ color: 0x020404, width: 1 })
			graphics.rect(center.x - 1, topA.y + 10, 2, 12).fill({ color: 0x050708 })
			return
		}

		if (kind === 'pool-table') {
			graphics.rect(center.x - 22, topA.y + 8, 44, 12).fill({ color: 0x1f6f3a }).stroke({ color: 0x0a2e18, width: 1 })
			graphics.circle(center.x - 12, topA.y + 14, 2).fill({ color: 0xfaf3d2 })
			graphics.circle(center.x + 8, topA.y + 12, 2).fill({ color: 0xff4a3a })
			graphics.circle(center.x + 2, topA.y + 16, 2).fill({ color: 0x2a2a2a })
			return
		}

		if (kind === 'arcade') {
			graphics.rect(center.x - 10, topA.y + 2, 20, 28).fill({ color: 0x2a1a3a }).stroke({ color: accent, width: 2 })
			graphics.rect(center.x - 8, topA.y + 6, 16, 10).fill({ color: 0x0a0a10 })
			graphics.rect(center.x - 7, topA.y + 8, 14, 6).fill({ color: accent, alpha: 0.8 })
			graphics.rect(center.x - 6, topA.y + 20, 12, 2).fill({ color: 0xb0b0b8 })
			graphics.circle(center.x - 3, topA.y + 24, 1.5).fill({ color: 0xff4a3a })
			graphics.circle(center.x + 3, topA.y + 24, 1.5).fill({ color: 0x5acbff })
			return
		}

		if (kind === 'bar') {
			graphics.rect(center.x - 24, topA.y + 6, 48, 8).fill({ color: shade(palette.top, 18) }).stroke({ color: palette.outline, width: 1 })
			for (let i = 0; i < 4; i++) {
				const bx = center.x - 18 + i * 12
				graphics.rect(bx - 2, topA.y - 8, 4, 14).fill({ color: [0x8fd9a8, 0xf0c87a, 0xd9768f, 0x8fc1f0][i] })
			}
			return
		}

		if (kind === 'motorbike') {
			graphics.circle(center.x - 12, topA.y + 18, 7).fill({ color: 0x0c0c10 }).stroke({ color: 0x2a2a2a, width: 2 })
			graphics.circle(center.x + 12, topA.y + 18, 7).fill({ color: 0x0c0c10 }).stroke({ color: 0x2a2a2a, width: 2 })
			graphics.poly([
				center.x - 14, topA.y + 16,
				center.x + 14, topA.y + 16,
				center.x + 10, topA.y + 6,
				center.x - 6, topA.y + 6
			]).fill({ color: accent }).stroke({ color: 0x0a0a0a, width: 1 })
			graphics.rect(center.x - 2, topA.y + 2, 4, 6).fill({ color: 0x0a0a0a })
			return
		}

		if (kind === 'gang-crate') {
			graphics.rect(center.x - 14, topA.y + 6, 28, 18).fill({ color: shade(palette.top, -10) }).stroke({ color: palette.outline, width: 1 })
			graphics.rect(center.x - 14, topA.y + 6, 28, 3).fill({ color: accent })
			graphics.rect(center.x - 2, topA.y + 12, 4, 6).fill({ color: 0x1a1a1a })
			return
		}

		if (kind === 'bong') {
			graphics.ellipse(center.x, topA.y + 22, 7, 6).fill({ color: 0x2a4636, alpha: 0.7 }).stroke({ color: 0x0a1810, width: 1 })
			graphics.rect(center.x - 2, topA.y + 2, 4, 22).fill({ color: 0x2a4636, alpha: 0.6 }).stroke({ color: 0x0a1810, width: 1 })
			graphics.rect(center.x - 3, topA.y + 0, 6, 3).fill({ color: palette.outline, alpha: 0.8 })
			graphics.ellipse(center.x, topA.y + 22, 4, 3).fill({ color: accent, alpha: 0.6 })
			graphics.rect(center.x - 8, topA.y + 18, 4, 2).fill({ color: 0x2a4636, alpha: 0.8 })
			return
		}

		if (kind === 'pyrex') {
			graphics.rect(center.x - 3, topA.y + 4, 6, 8).fill({ color: 0xd8e4f2, alpha: 0.35 }).stroke({ color: palette.outline, width: 1 })
			graphics.circle(center.x, topA.y + 18, 8).fill({ color: 0xd8e4f2, alpha: 0.35 }).stroke({ color: palette.outline, width: 1 })
			graphics.circle(center.x, topA.y + 18, 6).fill({ color: accent, alpha: 0.65 })
			graphics.rect(center.x - 4, topA.y + 1, 8, 3).fill({ color: shade(accent, -30) })
			return
		}

		if (kind === 'joint') {
			graphics.rect(center.x - 8, topA.y + 10, 16, 2).fill({ color: 0xf2e6c4 }).stroke({ color: 0x7a6240, width: 1 })
			graphics.rect(center.x + 6, topA.y + 9, 3, 4).fill({ color: 0xff7a2a })
			graphics.circle(center.x + 11, topA.y + 8, 2).fill({ color: 0xe0e6ef, alpha: 0.35 })
			graphics.circle(center.x + 13, topA.y + 6, 3).fill({ color: 0xe0e6ef, alpha: 0.25 })
			return
		}

		if (kind === 'ashtray') {
			graphics.ellipse(center.x, topA.y + 14, 14, 6).fill({ color: 0x1a1a1f }).stroke({ color: 0x05060a, width: 1 })
			graphics.ellipse(center.x, topA.y + 13, 10, 4).fill({ color: 0x3a3a45 })
			graphics.rect(center.x - 4, topA.y + 11, 6, 1).fill({ color: 0xf2e6c4 })
			graphics.circle(center.x + 3, topA.y + 12, 1).fill({ color: 0xff7a2a })
			return
		}

		if (kind === 'lab-table') {
			graphics.rect(center.x - 22, topA.y + 6, 44, 8).fill({ color: shade(palette.top, 10) }).stroke({ color: palette.outline, width: 1 })
			graphics.rect(center.x - 20, topA.y + 6, 40, 2).fill({ color: palette.outline, alpha: 0.2 })
			// beakers on top
			graphics.rect(center.x - 14, topA.y + 0, 6, 8).fill({ color: 0x9affc6, alpha: 0.6 }).stroke({ color: palette.outline, width: 1 })
			graphics.rect(center.x + 2, topA.y + 0, 5, 8).fill({ color: 0xffb25a, alpha: 0.6 }).stroke({ color: palette.outline, width: 1 })
			graphics.circle(center.x + 14, topA.y + 4, 3).fill({ color: 0xff6be0, alpha: 0.6 }).stroke({ color: palette.outline, width: 1 })
			return
		}

		if (kind === 'hotte') {
			graphics.rect(center.x - 20, topA.y + 2, 40, 26).fill({ color: 0x10141c }).stroke({ color: palette.outline, width: 2 })
			graphics.rect(center.x - 18, topA.y + 4, 36, 16).fill({ color: 0x1e2a36, alpha: 0.65 })
			graphics.rect(center.x - 16, topA.y + 20, 32, 2).fill({ color: palette.outline, alpha: 0.55 })
			graphics.rect(center.x - 6, topA.y + 9, 5, 8).fill({ color: accent, alpha: 0.8 })
			graphics.rect(center.x + 2, topA.y + 11, 4, 6).fill({ color: shade(accent, 30), alpha: 0.8 })
			graphics.circle(center.x - 4, topA.y + 6, 2).fill({ color: 0xff5a5a })
			return
		}

		if (kind === 'chemical') {
			graphics.rect(center.x - 8, topA.y + 2, 16, 20).fill({ color: 0x1a1f2b }).stroke({ color: palette.outline, width: 1 })
			graphics.rect(center.x - 6, topA.y + 4, 4, 7).fill({ color: accent, alpha: 0.85 })
			graphics.rect(center.x - 1, topA.y + 4, 4, 7).fill({ color: 0xff8a8a, alpha: 0.8 })
			graphics.rect(center.x + 4, topA.y + 4, 3, 7).fill({ color: 0xf0d25a, alpha: 0.8 })
			graphics.rect(center.x - 6, topA.y + 13, 4, 7).fill({ color: 0x9affc6, alpha: 0.8 })
			graphics.rect(center.x - 1, topA.y + 13, 4, 7).fill({ color: 0xb8a6ff, alpha: 0.8 })
			return
		}

		if (kind === 'scale') {
			graphics.rect(center.x - 10, topA.y + 10, 20, 6).fill({ color: 0x1a1a1f }).stroke({ color: 0x05060a, width: 1 })
			graphics.rect(center.x - 8, topA.y + 12, 12, 2).fill({ color: accent, alpha: 0.9 })
			graphics.rect(center.x + 4, topA.y + 11, 4, 3).fill({ color: 0xb0b0b8 })
			graphics.rect(center.x - 4, topA.y + 4, 8, 6).fill({ color: 0xe6e6ec, alpha: 0.9 }).stroke({ color: 0x2a2a2a, width: 1 })
			return
		}

		if (kind === 'lab-cabinet') {
			graphics.rect(center.x - 16, topA.y + 2, 32, 28).fill({ color: 0x0f1620 }).stroke({ color: palette.outline, width: 2 })
			graphics.rect(center.x - 14, topA.y + 4, 13, 24).fill({ color: palette.top, alpha: 0.25 }).stroke({ color: palette.outline, width: 1 })
			graphics.rect(center.x + 1, topA.y + 4, 13, 24).fill({ color: palette.top, alpha: 0.25 }).stroke({ color: palette.outline, width: 1 })
			for (let i = 0; i < 3; i++) {
				graphics.rect(center.x - 12, topA.y + 6 + i * 7, 9, 5).fill({ color: [accent, 0xff8a8a, 0x9affc6][i], alpha: 0.85 })
				graphics.rect(center.x + 3, topA.y + 6 + i * 7, 9, 5).fill({ color: [0xb8a6ff, 0xf0d25a, 0xffa3ff][i], alpha: 0.85 })
			}
			return
		}

		if (kind === 'market-stand') {
			graphics.rect(center.x - 22, topA.y + 10, 44, 8).fill({ color: shade(palette.top, -10) }).stroke({ color: palette.outline, width: 1 })
			graphics.poly([
				center.x - 24, topA.y + 4,
				center.x + 24, topA.y + 4,
				center.x + 20, topA.y - 6,
				center.x - 20, topA.y - 6
			]).fill({ color: accent, alpha: 0.85 }).stroke({ color: palette.outline, width: 1 })
			for (let i = 0; i < 5; i++) {
				graphics.rect(center.x - 22 + i * 10, topA.y - 4, 4, 8).fill({ color: i % 2 === 0 ? palette.outline : accent, alpha: 0.75 })
			}
			graphics.rect(center.x - 16, topA.y + 12, 6, 4).fill({ color: 0x9affc6 })
			graphics.rect(center.x - 6, topA.y + 12, 6, 4).fill({ color: 0xffa3ff })
			graphics.rect(center.x + 4, topA.y + 12, 6, 4).fill({ color: 0xf0d25a })
			graphics.rect(center.x + 14, topA.y + 12, 4, 4).fill({ color: 0xff8a8a })
			return
		}

		if (kind === 'npc-vendor') {
			graphics.ellipse(center.x, topA.y + 24, 8, 4).fill({ color: 0x000000, alpha: 0.25 })
			graphics.rect(center.x - 4, topA.y + 12, 8, 12).fill({ color: shade(palette.top, -10) }).stroke({ color: palette.outline, width: 1 })
			graphics.circle(center.x, topA.y + 10, 4).fill({ color: 0xe8c49a }).stroke({ color: 0x3a2010, width: 1 })
			graphics.rect(center.x - 4, topA.y + 5, 8, 3).fill({ color: accent })
			graphics.circle(center.x - 1, topA.y + 10, 0.8).fill({ color: 0x0a0a0a })
			graphics.circle(center.x + 2, topA.y + 10, 0.8).fill({ color: 0x0a0a0a })
			return
		}

		if (kind === 'price-board') {
			graphics.rect(center.x - 18, topA.y + 2, 36, 22).fill({ color: 0x0a0a10 }).stroke({ color: accent, width: 2 })
			for (let i = 0; i < 4; i++) {
				graphics.rect(center.x - 16, topA.y + 5 + i * 5, 20, 1).fill({ color: accent, alpha: 0.85 })
				graphics.rect(center.x - 4, topA.y + 5 + i * 5, 12, 1).fill({ color: palette.outline, alpha: 0.65 })
			}
			return
		}

		if (kind === 'desk' || kind === 'table' || kind === 'shelf') {
			graphics.rect(center.x - 9, topA.y + 10, 18, 6).fill({ color: shade(palette.top, 10) }).stroke({ color: palette.outline, width: 1 })
		}
	}
}
