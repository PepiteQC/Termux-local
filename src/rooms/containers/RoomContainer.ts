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

                this.sortableChildren = false

                this.wallsContainer = new WallsContainer(room)
                this.tilesContainer = new TilesContainer(room, (tile) => {
                        room.game.handleTileTap(
                                tile.heightMapPosition,
                                () => this.avatarsContainer.movePrimaryAvatarTo(tile.heightMapPosition)
                        )
                })
                this.furnituresContainer = new FurnituresContainer(room)
                this.avatarsContainer = new AvatarsContainer(room)

                // Couche fixe : murs -> tuiles -> meubles -> avatars
                this.wallsContainer.zIndex = 0
                this.tilesContainer.zIndex = 10
                this.furnituresContainer.zIndex = 20
                this.avatarsContainer.zIndex = 30

                this.addChild(
                        this.wallsContainer,
                        this.tilesContainer,
                        this.furnituresContainer,
                        this.avatarsContainer
                )

                const bounds = this.getLocalBounds()

                this.position.set(
                        Tile.WIDTH * 2 - bounds.x,
                        room.data.wallHeight * Tile.STEP_HEIGHT + 72 - bounds.y
                )
        }
}
