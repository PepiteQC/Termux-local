import { Assets, Texture } from 'pixi.js'

type TextureLike = Texture & {
	source?: {
		scaleMode?: string
		autoGenerateMipmaps?: boolean
	}
	baseTexture?: {
		scaleMode?: number
		mipmap?: number
	}
}

export async function loadPixelTexture(src: string, alias?: string): Promise<Texture> {
	const texture = (await Assets.load(
		alias
			? {
					alias,
					src,
					data: {
						scaleMode: 'nearest'
					}
			  }
			: {
					src,
					data: {
						scaleMode: 'nearest'
					}
			  }
	)) as TextureLike

	if (texture.source) {
		texture.source.scaleMode = 'nearest'
		texture.source.autoGenerateMipmaps = false
	}

	if (texture.baseTexture) {
		texture.baseTexture.scaleMode = 0
		texture.baseTexture.mipmap = 0
	}

	return texture as Texture
}
