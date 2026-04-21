import RoomScene from './RoomScene'
import RoomData from './data/RoomData'
import RoomContainer from './containers/RoomContainer'
import RoomAssetsManager from '../assets/rooms/RoomAssetsManager'
import Habbo from '../Habbo'
import Tile from './tiles/Tile'

export default class Room extends RoomScene {
	public readonly roomContainer: RoomContainer

	public constructor(
		data: RoomData,
		game: Habbo
	) {
		super(data, game)

		this.resources = new RoomAssetsManager().loadAssets(this.renderer)
		this.roomContainer = new RoomContainer(this)
		this.addChild(this.roomContainer)
	}

	public getViewportMetrics() {
		const bounds = this.roomContainer.getLocalBounds()
		const minX = this.roomContainer.x + bounds.x
		const minY = this.roomContainer.y + bounds.y
		const maxX = minX + bounds.width
		const maxY = minY + bounds.height

		return {
			centerX: minX + bounds.width / 2,
			centerY: minY + bounds.height / 2 - Tile.HEIGHT,
			height: Math.ceil(maxY + Tile.WIDTH * 2),
			width: Math.ceil(maxX + Tile.WIDTH * 2)
		}
	}
}
