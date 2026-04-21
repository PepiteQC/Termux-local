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
}
