import { Container } from 'pixi.js'

import type { HeightMapPosition } from '../../map/HeightMap'
import type RoomScene from '../../RoomScene'
import AvatarSprite from '../../avatars/AvatarSprite'

export default class AvatarsContainer extends Container {
	public readonly avatars: AvatarSprite[]

	public constructor(room: RoomScene) {
		super()

		this.sortableChildren = true
		this.avatars = room.data.avatars.map((avatar) => new AvatarSprite(avatar))

		this.addChild(...this.avatars)
		this.sortChildren()
	}

	public movePrimaryAvatarTo(heightMapPosition: HeightMapPosition): void {
		this.avatars[0]?.moveToTile(heightMapPosition)
	}

	public getPrimaryAvatarPosition(): HeightMapPosition | null {
		const avatar = this.avatars[0]
		if (!avatar) return null
		return avatar.getCurrentTile()
	}
}
