import { Container } from 'pixi.js'

import type RoomScene from '../../RoomScene'
import Wall from '../../walls/Wall'
import WallGenerator from '../../walls/WallGenerator'

export default class WallsContainer extends Container {
	private readonly room: RoomScene
	private readonly wallGenerator: WallGenerator
	private readonly walls: Wall[]

	public constructor(room: RoomScene) {
		super()

		this.room = room
		this.sortableChildren = true
		this.wallGenerator = new WallGenerator(room)
		this.walls = this.generateWallsFromMap()

		this.addChild(...this.walls)
		this.sortChildren()
	}

	private generateWallsFromMap(): Wall[] {
		return this.room.map
			.getWallPositions()
			.map((position) => new Wall(this.room, position, this.wallGenerator))
	}
}
