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

	/** Ajoute dynamiquement un meuble (ex: placement Habbo in-game). */
	public addFurniture(data: FurnitureData): FurnitureSprite {
		const sprite = new FurnitureSprite(this.room, data)
		this.furnitures.push(sprite)
		this.addChild(sprite)
		this.sortChildren()
		return sprite
	}
}
