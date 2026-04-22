import { Container, type Texture } from 'pixi.js'
import HabboTilemap from './HabboTilemap'

export type HabboRoomSceneData = {
  floorMap: number[][]
  heightMap?: number[][]
}

export default class HabboRoomScene extends Container {
  private tilemap: HabboTilemap

  constructor(tileset: Record<string | number, Texture>, data: HabboRoomSceneData) {
    super()

    this.sortableChildren = true
    this.eventMode = 'none'

    this.tilemap = new HabboTilemap(tileset, data.floorMap, data.heightMap)
    this.addChild(this.tilemap)
  }

  getViewportMetrics() {
    const bounds = this.getLocalBounds()

    return {
      width: bounds.width,
      height: bounds.height,
      centerX: bounds.x + bounds.width / 2,
      centerY: bounds.y + bounds.height / 2,
    }
  }
}
