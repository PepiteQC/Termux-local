import type AvatarFigure from '../avatars/AvatarFigure'
import type FurnitureData from '../furnitures/FurnitureData'

export default interface RoomData {
	allowPets: boolean
	allowPetsEating: boolean
	avatars: AvatarFigure[]
	category: null | string
	currentUsers: number
	description: null | string
	floorThickness: number
	furnitures: FurnitureData[]
	hideWalls: boolean
	hideWired: boolean
	id: string
	initialZoom: number
	map: {
		room: string[]
	}
	maxUsers: number
	name: string
	type: string
	wallHeight: number
	wallThickness: number
}
