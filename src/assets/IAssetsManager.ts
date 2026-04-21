import type { Renderer, Texture } from 'pixi.js'

export interface RoomTextureAssets {
	hoverTile: Texture
}

export default interface IAssetsManager {
	loadAssets(renderer: Renderer): RoomTextureAssets
}
