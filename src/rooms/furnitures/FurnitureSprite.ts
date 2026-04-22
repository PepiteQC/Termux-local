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
const FLOOR_FURNI_BASE_Z = 100
const WALL_FURNI_BASE_Z = 60

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

function average(points: Point2D[]): Point2D {
        const total = points.reduce(
                (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
                { x: 0, y: 0 }
        )
        return { x: total.x / points.length, y: total.y / points.length }
}

export default class FurnitureSprite extends Container {
        private readonly room: RoomScene
        private readonly item: FurnitureData
        private buildGeneration = 0

        public constructor(room: RoomScene, item: FurnitureData) {
                super()

                this.room = room
                this.item = item
                this.sortableChildren = true
                this.eventMode = 'static'
                this.cursor = 'pointer'
                this.on('pointertap', this.handlePointerTap, this)

                if (item.habboClassName) {
                        const gen = ++this.buildGeneration
                        void this.buildHabbo(gen).catch(() => {
                                if (gen !== this.buildGeneration) return
                                this.buildFallback()
                        })
                } else {
                        this.buildFallback()
                }
        }

        public getItemId(): string {
                return this.item.id
        }

        public getItemData(): FurnitureData {
                return this.item
        }

        public turn(): number | null {
                if (!this.item.habboClassName) return null

                const current = this.item.habboDirection ?? 2
                const currentIndex = HABBO_DIRECTIONS.indexOf(current as (typeof HABBO_DIRECTIONS)[number])
                const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % HABBO_DIRECTIONS.length
                const nextDirection = HABBO_DIRECTIONS[nextIndex]

                this.item.habboDirection = nextDirection
                this.rebuild()
                return nextDirection
        }

        public moveTo(x: number, y: number): boolean {
                if (!this.room.map.hasTileAt(x, y)) return false
                this.item.x = x
                this.item.y = y
                this.rebuild()
                return true
        }

        private rebuild(): void {
                const gen = ++this.buildGeneration
                this.removeChildren().forEach((child) => child.destroy({ children: true }))

                if (this.item.habboClassName) {
                        void this.buildHabbo(gen).catch(() => {
                                if (gen !== this.buildGeneration) return
                                this.buildFallback()
                        })
                        return
                }

                this.buildFallback()
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

                window.dispatchEvent(new CustomEvent<FurnitureTapEventDetail>('ew-furniture-tap', { detail }))
        }

        private getBaseHeight(): number {
                        return Math.max(0, this.room.map.getTileHeightAt(this.item.x, this.item.y))
        }

        private getWorldOrigin(baseHeight: number): Point2D {
                return {
                        x: TilesContainer.getScreenX({ x: this.item.x, y: this.item.y, height: baseHeight }),
                        y: TilesContainer.getScreenY({ x: this.item.x, y: this.item.y, height: baseHeight })
                }
        }

        private projectLocalPoint(worldOrigin: Point2D, x: number, y: number, height: number): Point2D {
                return {
                        x: TilesContainer.getScreenX({ x, y, height }) - worldOrigin.x,
                        y: TilesContainer.getScreenY({ x, y, height }) - worldOrigin.y
                }
        }

        private getFootprintPoints(worldOrigin: Point2D, baseHeight: number): [Point2D, Point2D, Point2D, Point2D] {
                const { x, y, width, depth } = this.item
                return [
                        this.projectLocalPoint(worldOrigin, x, y, baseHeight),
                        this.projectLocalPoint(worldOrigin, x + width, y, baseHeight),
                        this.projectLocalPoint(worldOrigin, x + width, y + depth, baseHeight),
                        this.projectLocalPoint(worldOrigin, x, y + depth, baseHeight)
                ]
        }

        private computeSceneZ(baseHeight: number): number {
                const { x, y, width, depth, height, kind } = this.item
                const tileIndex = TilesContainer.getScreenIndex({
                        x: x + width,
                        y: y + depth,
                        height: baseHeight
                })

                const verticalBoost = Math.max(0, Math.round(height * 4))
                const wallish = kind.includes('wall') || kind.includes('door') || kind.includes('window')

                return tileIndex * 10 + (wallish ? WALL_FURNI_BASE_Z : FLOOR_FURNI_BASE_Z) + verticalBoost
        }

        private buildFootprintShadow(base: [Point2D, Point2D, Point2D, Point2D]): Graphics {
                const [a, b, c, d] = base
                const cx = (a.x + c.x) / 2
                const cy = (a.y + c.y) / 2
                const rx = Math.abs(b.x - a.x) / 2
                const ry = Math.abs(d.y - a.y) / 2
                const halo = Math.max(4, Math.min(rx, ry) * 0.45)

                const shadow = new Graphics()
                shadow
                        .ellipse(cx, cy + 3, rx + halo, ry + halo * 0.6)
                        .fill({ color: 0x000000, alpha: 0.14 })
                        .poly(flatten([a, b, c, d]))
                        .fill({ color: 0x000000, alpha: 0.28 })

                shadow.zIndex = 0
                shadow.eventMode = 'none'
                return shadow
        }

        private async buildHabbo(generation: number): Promise<void> {
                const item = this.item
                const baseHeight = this.getBaseHeight()
                const worldOrigin = this.getWorldOrigin(baseHeight)
                const footprint = this.getFootprintPoints(worldOrigin, baseHeight)

                const container = await buildHabboFurniContainer({
                        className: item.habboClassName!,
                        size: 64,
                        direction: item.habboDirection ?? 2
                })

                if (generation !== this.buildGeneration) {
                        container?.destroy({ children: true })
                        return
                }

                if (!container) {
                        this.buildFallback()
                        return
                }

                const [a, b, c, d] = footprint
                const footprintCenter = average([a, b, c, d])
                const frontCenter = average([c, d])

                const shadow = this.buildFootprintShadow(footprint)
                this.addChild(shadow)

                container.zIndex = 1
                container.position.set(frontCenter.x, footprintCenter.y)

                this.addChild(container)
                this.position.set(worldOrigin.x, worldOrigin.y)
                this.zIndex = this.computeSceneZ(baseHeight)
        }

        private buildFallback(): void {
                const palette = PALETTES[this.item.palette]
                const baseHeight = this.getBaseHeight()
                const worldOrigin = this.getWorldOrigin(baseHeight)
                const [a, b, c, d] = this.getFootprintPoints(worldOrigin, baseHeight)

                const topLift = Math.max(
                        2,
                        this.item.height <= 0
                                ? 2
                                : Math.max(18, this.item.height * 18 + (this.item.kind === 'screen' ? 12 : 0))
                )

                const aTop = { x: a.x, y: a.y - topLift }
                const bTop = { x: b.x, y: b.y - topLift }
                const cTop = { x: c.x, y: c.y - topLift }
                const dTop = { x: d.x, y: d.y - topLift }

                const shadow = this.buildFootprintShadow([a, b, c, d])

                const leftFace = new Graphics()
                leftFace
                        .poly(flatten([d, a, aTop, dTop]))
                        .fill({ color: palette.left, alpha: 1 })
                        .poly(flatten([d, a, aTop, dTop, d]))
                        .stroke({ color: shade(palette.outline, -18), width: 1, alpha: 0.9 })

                const rightFace = new Graphics()
                rightFace
                        .poly(flatten([b, c, cTop, bTop]))
                        .fill({ color: palette.right, alpha: 1 })
                        .poly(flatten([b, c, cTop, bTop, b]))
                        .stroke({ color: shade(palette.outline, -28), width: 1, alpha: 0.92 })

                const topFace = new Graphics()
                topFace
                        .poly(flatten([aTop, bTop, cTop, dTop]))
                        .fill({ color: palette.top, alpha: 1 })
                        .poly(flatten([aTop, bTop, cTop, dTop, aTop]))
                        .stroke({ color: palette.outline, width: 1, alpha: 1 })

                shadow.zIndex = 0
                leftFace.zIndex = 1
                rightFace.zIndex = 2
                topFace.zIndex = 3

                this.addChild(shadow, leftFace, rightFace, topFace)
                this.position.set(worldOrigin.x, worldOrigin.y)
                this.zIndex = this.computeSceneZ(baseHeight)

                if (this.item.label) {
                        const accent = new Graphics()
                        const topCenter = average([aTop, bTop, cTop, dTop])
                        accent
                                .roundRect(topCenter.x - 12, topCenter.y + 4, 24, 3, 2)
                                .fill({ color: shade(palette.outline, -12), alpha: 0.95 })
                        accent.zIndex = 4
                        accent.eventMode = 'none'
                        this.addChild(accent)
                }
        }
}
