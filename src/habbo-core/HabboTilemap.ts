import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { HABBO_STEP_HEIGHT, HABBO_TILE_HEIGHT, HABBO_TILE_WIDTH, habboDepth, isoToScreen } from './HabboProjection'

type Tileset = Record<string | number, Texture>

export default class HabboTilemap extends Container {
  private readonly tileset: Tileset
  private readonly floorMap: number[][]
  private readonly heightMap: number[][]

  constructor(tileset: Tileset, floorMap: number[][], heightMap?: number[][]) {
    super()
    this.tileset = tileset
    this.floorMap = floorMap
    this.heightMap =
      heightMap ??
      floorMap.map((row) => row.map((tile) => (tile === -1 ? -1 : 0)))

    this.sortableChildren = true
    this.eventMode = 'none'
    this.build()
  }

  private build(): void {
    this.removeChildren()

    for (let y = 0; y < this.floorMap.length; y++) {
      const row = this.floorMap[y]
      for (let x = 0; x < row.length; x++) {
        const tileId = row[x]
        const z = this.getHeight(x, y)

        if (tileId === -1 || z < 0) continue

        const tile = new Container()
        tile.sortableChildren = true
        tile.eventMode = 'none'

        const top = this.buildTop(x, y, z, tileId)
        top.zIndex = 20
        tile.addChild(top)

        const eastDrop = Math.max(0, z - this.getHeight(x + 1, y))
        const southDrop = Math.max(0, z - this.getHeight(x, y + 1))

        if (eastDrop > 0) {
          const eastFace = this.buildEastFace(x, y, z, eastDrop)
          eastFace.zIndex = 10
          tile.addChild(eastFace)
        }

        if (southDrop > 0) {
          const southFace = this.buildSouthFace(x, y, z, southDrop)
          southFace.zIndex = 11
          tile.addChild(southFace)
        }

        tile.zIndex = habboDepth(x, y, z)
        this.addChild(tile)
      }
    }

    this.sortChildren()
  }

  private getHeight(x: number, y: number): number {
    if (y < 0 || y >= this.heightMap.length) return -1
    if (x < 0 || x >= this.heightMap[y].length) return -1
    return this.heightMap[y][x]
  }

  private buildTop(x: number, y: number, z: number, tileId: number): Container {
    const holder = new Container()
    holder.eventMode = 'none'

    const pos = isoToScreen({ x, y, z })
    const texture = this.tileset[tileId]

    if (texture) {
      const sprite = new Sprite(texture)
      sprite.anchor.set(0.5, 0.5)
      sprite.x = pos.x
      sprite.y = pos.y + HABBO_TILE_HEIGHT / 2
      sprite.eventMode = 'none'
      holder.addChild(sprite)
      return holder
    }

    const g = new Graphics()
    g.poly([
      pos.x,
      pos.y,
      pos.x + HABBO_TILE_WIDTH / 2,
      pos.y + HABBO_TILE_HEIGHT / 2,
      pos.x,
      pos.y + HABBO_TILE_HEIGHT,
      pos.x - HABBO_TILE_WIDTH / 2,
      pos.y + HABBO_TILE_HEIGHT / 2,
    ])
    g.fill(0x8a8f98)
    g.stroke({ color: 0xd7dde8, width: 1 })
    holder.addChild(g)
    return holder
  }

  private buildEastFace(x: number, y: number, z: number, drop: number): Graphics {
    const pos = isoToScreen({ x, y, z })
    const g = new Graphics()

    const topRight = { x: pos.x + HABBO_TILE_WIDTH / 2, y: pos.y + HABBO_TILE_HEIGHT / 2 }
    const bottom = { x: pos.x, y: pos.y + HABBO_TILE_HEIGHT }
    const down = drop * HABBO_STEP_HEIGHT

    g.poly([
      topRight.x,
      topRight.y,
      bottom.x,
      bottom.y,
      bottom.x,
      bottom.y + down,
      topRight.x,
      topRight.y + down,
    ])
    g.fill(0x6b7078)
    g.stroke({ color: 0x444850, width: 1 })

    return g
  }

  private buildSouthFace(x: number, y: number, z: number, drop: number): Graphics {
    const pos = isoToScreen({ x, y, z })
    const g = new Graphics()

    const bottom = { x: pos.x, y: pos.y + HABBO_TILE_HEIGHT }
    const topLeft = { x: pos.x - HABBO_TILE_WIDTH / 2, y: pos.y + HABBO_TILE_HEIGHT / 2 }
    const down = drop * HABBO_STEP_HEIGHT

    g.poly([
      topLeft.x,
      topLeft.y,
      bottom.x,
      bottom.y,
      bottom.x,
      bottom.y + down,
      topLeft.x,
      topLeft.y + down,
    ])
    g.fill(0x555b64)
    g.stroke({ color: 0x383d45, width: 1 })

    return g
  }
}
