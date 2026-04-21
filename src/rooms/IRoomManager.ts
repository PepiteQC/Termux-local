import type RoomData from './data/RoomData'
import type RoomScene from './RoomScene'

export default interface IRoomManager {
	createRoom(roomData: RoomData): RoomScene
	getCurrentRoom(): RoomScene | null
	leaveRoom(): void
	setRoom(room: RoomScene): void
}
