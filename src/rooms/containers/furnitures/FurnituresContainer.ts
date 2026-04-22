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

	/**
	 * Ajoute dynamiquement un meuble (ex: placement Habbo in-game).
	 *
	 * ⚠️ `RoomContainer` reparente tous les enfants de `FurnituresContainer`
	 * vers `RoomContainer` à la construction (voir `RoomContainer.attachChildren`).
	 * On doit donc injecter le sprite directement dans le graphe de scène
	 * via `room.roomContainer`, sinon il resterait orphelin et jamais rendu.
	 */
	public addFurniture(data: FurnitureData): FurnitureSprite {
		const sprite = new FurnitureSprite(this.room, data)
		this.furnitures.push(sprite)

		const sceneHost = (this.room as unknown as { roomContainer?: Container }).roomContainer
		if (sceneHost) {
			sceneHost.addChild(sprite)
			sceneHost.sortChildren()
		} else {
			// Fallback (au cas où un RoomScene n'exposerait pas de roomContainer) :
			// on ajoute ici même et on espère que le container est dans le graphe.
			this.addChild(sprite)
			this.sortChildren()
		}

		return sprite
	}

	/**
	 * Remove a furniture sprite by id. Returns true if the item was found and
	 * removed from both the scene graph and the room's data model so that
	 * pathfinding / collision immediately ignore it.
	 */
	public removeFurniture(id: string): boolean {
		const index = this.furnitures.findIndex((sprite) => sprite.getItemId() === id)
		if (index === -1) return false
		const sprite = this.furnitures[index]
		this.furnitures.splice(index, 1)

		const sceneHost = (this.room as unknown as { roomContainer?: Container }).roomContainer
		if (sceneHost && sprite.parent === sceneHost) {
			sceneHost.removeChild(sprite)
		} else if (sprite.parent) {
			sprite.parent.removeChild(sprite)
		}
		sprite.destroy({ children: true })

		const roomData = this.room.data as { furnitures: Array<{ id: string }> }
		const dataIndex = roomData.furnitures.findIndex((item) => item.id === id)
		if (dataIndex !== -1) {
			roomData.furnitures.splice(dataIndex, 1)
		}
		return true
	}
}
