export interface AvatarLook {
	accessory?: string
	hair?: string
	jacket?: string
	pants?: string
	shirt?: string
	shoes?: string
	/**
	 * Habbo figurestring describing the full look (e.g.
	 * `hr-100-61.hd-180-1.ch-210-66.lg-270-82.sh-290-80`). When set, the
	 * avatar is rendered using the official Habbo imaging service instead
	 * of the procedural placeholder.
	 */
	figurestring?: string
}

export default interface AvatarFigure {
	id: string
	username: string
	motto?: string
	x: number
	y: number
	look: AvatarLook
}
