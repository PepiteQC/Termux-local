import { Container, Sprite, Texture } from 'pixi.js'

export default class HabboTilemap extends Container {
    private tileset: Record<number, Texture>
    private map: number[][]

    constructor(tileset: Record<number, Texture>, map: number[][]) {
        super()
        this.tileset = tileset
        this.map = map

        this.sortableChildren = true
        this.build()
    }

    private build(): void {
        this.removeChildren()

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const tileId = this.map[y][x]
                if (tileId === -1) continue

                const texture = this.tileset[tileId]
                if (!texture) continue

                const sprite = new Sprite(texture)

                // Projection isométrique style Habbo
                const screenX = (x - y) * 32
                const screenY = (x + y) * 16

                sprite.x = screenX
                sprite.y = screenY
                sprite.zIndex = (x + y) * 100
                sprite.eventMode = 'none'

                this.addChild(sprite)
            }
        }

        this.sortChildren()
    }
}
