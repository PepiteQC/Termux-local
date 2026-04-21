import { Container } from 'pixi.js'

import type RoomScene from '../RoomScene'
import Tile from '../tiles/Tile'
import AvatarsContainer from './avatars/AvatarsContainer'
import FurnituresContainer from './furnitures/FurnituresContainer'
import TilesContainer from './tiles/TilesContainer'
import WallsContainer from './walls/WallsContainer'

export default class RoomContainer extends Container {
	public readonly avatarsContainer: AvatarsContainer
	public readonly furnituresContainer: FurnituresContainer
	public readonly tilesContainer: TilesContainer
	public readonly wallsContainer: WallsContainer

	public constructor(room: RoomScene) {
		super()

		this.sortableChildren = true
		this.wallsContainer = new WallsContainer(room)
		this.tilesContainer = new TilesContainer(room, (tile) => {
			this.avatarsContainer.movePrimaryAvatarTo(tile.heightMapPosition)
		})
		this.furnituresContainer = new FurnituresContainer(room)
		this.avatarsContainer = new AvatarsContainer(room)

		this.attachChildren(this.wallsContainer)
		this.attachChildren(this.tilesContainer)
		this.attachChildren(this.furnituresContainer)
		this.attachChildren(this.avatarsContainer)

		const bounds = this.getLocalBounds()

		this.position.set(
			Tile.WIDTH * 2 - bounds.x,
			room.data.wallHeight * Tile.STEP_HEIGHT + 72 - bounds.y
		)
		this.sortChildren()
	}

	private attachChildren(container: Container): void {
		const children = [...container.children]

		for (const child of children) {
			this.addChild(child)
		}
	}
}
