import { Container } from 'pixi.js'

import type FurnitureData from '../../furnitures/FurnitureData'
import FurnitureSprite from '../../furnitures/FurnitureSprite'
import type RoomScene from '../../RoomScene'

export default class FurnituresContainer extends Container {
        public readonly furnitures: FurnitureSprite[]
        private readonly room: RoomScene

        public constructor(room: RoomScene) {
                super()

                this.room = room
                this.sortableChildren = true
                this.furnitures = room.data.furnitures.map(
                        (furniture) => new FurnitureSprite(room, furniture)
                )

                this.addChild(...this.furnitures)
                this.sortChildren()
        }

        public addFurniture(data: FurnitureData): FurnitureSprite {
                const sprite = new FurnitureSprite(this.room, data)
                this.furnitures.push(sprite)
                this.addChild(sprite)
                this.sortChildren()
                return sprite
        }

        public removeFurniture(id: string): boolean {
                const index = this.furnitures.findIndex((sprite) => sprite.getItemId() === id)
                if (index === -1) return false

                const sprite = this.furnitures[index]
                this.furnitures.splice(index, 1)

                if (sprite.parent === this) {
                        this.removeChild(sprite)
                } else if (sprite.parent) {
                        sprite.parent.removeChild(sprite)
                }

                sprite.destroy({ children: true })

                const roomData = this.room.data as { furnitures: Array<{ id: string }> }
                const dataIndex = roomData.furnitures.findIndex((item) => item.id === id)
                if (dataIndex !== -1) {
                        roomData.furnitures.splice(dataIndex, 1)
                }

                this.sortChildren()
                return true
        }
}
