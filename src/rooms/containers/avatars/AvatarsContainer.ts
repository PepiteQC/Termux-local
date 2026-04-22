import { Container } from 'pixi.js'

import type { HeightMapPosition } from '../../map/HeightMap'
import type RoomScene from '../../RoomScene'
import AvatarSprite from '../../avatars/AvatarSprite'

export default class AvatarsContainer extends Container {
	public readonly avatars: AvatarSprite[]
	private readonly room: RoomScene

	public constructor(room: RoomScene) {
		super()

		this.room = room
		this.sortableChildren = true
		this.avatars = room.data.avatars.map((avatar) => new AvatarSprite(avatar))

		this.addChild(...this.avatars)
		this.sortChildren()
	}

	public movePrimaryAvatarTo(heightMapPosition: HeightMapPosition): void {
		const avatar = this.avatars[0]
		if (!avatar) return
		const current = avatar.getCurrentTile()
		const path = this.room.map.findPath(
			current.x,
			current.y,
			heightMapPosition.x,
			heightMapPosition.y,
			{ isBlocked: (x, y) => this.isTileBlockedByFurniture(x, y) }
		)
		if (path.length > 0) {
			avatar.followPath(path)
			return
		}
		// No reachable path (target off-map or behind solid furniture).
		// Fall back to a direct-step if the destination is adjacent and walkable ;
		// otherwise stay put rather than teleport across walls.
		const dx = Math.abs(heightMapPosition.x - current.x)
		const dy = Math.abs(heightMapPosition.y - current.y)
		if (
			dx <= 1 &&
			dy <= 1 &&
			!this.isTileBlockedByFurniture(heightMapPosition.x, heightMapPosition.y)
		) {
			avatar.moveToTile(heightMapPosition)
		}
	}

	public getPrimaryAvatarPosition(): HeightMapPosition | null {
		const avatar = this.avatars[0]
		if (!avatar) return null
		return avatar.getCurrentTile()
	}

	private isTileBlockedByFurniture(x: number, y: number): boolean {
		for (const item of this.room.data.furnitures) {
			if (item.walkable) continue
			if (
				x >= item.x &&
				x < item.x + item.width &&
				y >= item.y &&
				y < item.y + item.depth
			) {
				return true
			}
		}
		return false
	}
}
