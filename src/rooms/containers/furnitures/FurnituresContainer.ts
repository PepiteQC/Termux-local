import { Container } from 'pixi.js'

import type RoomScene from '../../RoomScene'
import FurnitureSprite from '../../furnitures/FurnitureSprite'

export default class FurnituresContainer extends Container {
	public readonly furnitures: FurnitureSprite[]

	public constructor(room: RoomScene) {
		super()

		this.sortableChildren = true
		this.furnitures = room.data.furnitures.map(
			(furniture) => new FurnitureSprite(room, furniture)
		)

		this.addChild(...this.furnitures)
		this.sortChildren()
	}
}
