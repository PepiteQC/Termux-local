export interface AvatarLook {
	accessory?: string
	hair?: string
	jacket?: string
	pants?: string
	shirt?: string
	shoes?: string
}

export default interface AvatarFigure {
	id: string
	username: string
	motto?: string
	x: number
	y: number
	look: AvatarLook
}
