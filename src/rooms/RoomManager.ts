import type Habbo from '../Habbo'
import Room from './Room'
import type RoomData from './data/RoomData'
import type IRoomManager from './IRoomManager'
import type RoomScene from './RoomScene'

export default class RoomManager implements IRoomManager {
	private currentRoom: RoomScene | null = null
	private readonly game: Habbo

	public constructor(game: Habbo) {
		this.game = game
	}

	public createRoom(roomData: RoomData): RoomScene {
		return new Room(roomData, this.game)
	}

	public getCurrentRoom(): RoomScene | null {
		return this.currentRoom
	}

	public leaveRoom(): void {
		if (!this.currentRoom) return

		this.game.unloadRoom(this.currentRoom)
		this.currentRoom = null
	}

	public setRoom(room: RoomScene): void {
		this.leaveRoom()
		this.currentRoom = room
		this.game.loadRoom(room)
	}
}
