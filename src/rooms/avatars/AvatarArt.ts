import { Container, Graphics } from 'pixi.js'

export interface AvatarArtPalette {
	skin: number
	skinShadow: number
	shirt: number
	shirtShadow: number
	shirtLight: number
	pants: number
	pantsShadow: number
	shoes: number
	hair: number
	hairLight: number
	outline: number
	eye: number
	mouth: number
}

export const DEFAULT_AVATAR_PALETTE: AvatarArtPalette = {
	skin: 0xffcea7,
	skinShadow: 0xd89a72,
	shirt: 0xe94b3c,
	shirtShadow: 0xa5251a,
	shirtLight: 0xff7e6a,
	pants: 0x2e3c5e,
	pantsShadow: 0x151e38,
	shoes: 0x2a1a10,
	hair: 0x3a2416,
	hairLight: 0x6a4226,
	outline: 0x140903,
	eye: 0x140903,
	mouth: 0x6b2a1a
}

export default class AvatarArt {
	public static readonly WIDTH = 48
	public static readonly HEIGHT = 68

	public static buildStanding(
		palette: AvatarArtPalette = DEFAULT_AVATAR_PALETTE
	): Container {
		const container = new Container()
		const g = new Graphics()
		const cx = 24
		const O = palette.outline

		// transparent background frame so the texture frame is stable
		g.rect(0, 0, AvatarArt.WIDTH, AvatarArt.HEIGHT)
			.fill({ color: 0, alpha: 0 })

		// ---- legs (pants) ----
		// outline
		g.rect(cx - 10, 41, 9, 21).fill(O)
		g.rect(cx + 1, 41, 9, 21).fill(O)
		// main
		g.rect(cx - 9, 42, 7, 18).fill(palette.pants)
		g.rect(cx + 2, 42, 7, 18).fill(palette.pants)
		// shadow inside leg
		g.rect(cx - 4, 44, 2, 16).fill(palette.pantsShadow)
		g.rect(cx + 5, 44, 2, 16).fill(palette.pantsShadow)

		// ---- shoes ----
		g.rect(cx - 11, 60, 10, 5).fill(O)
		g.rect(cx + 1, 60, 10, 5).fill(O)
		g.rect(cx - 10, 61, 8, 3).fill(palette.shoes)
		g.rect(cx + 2, 61, 8, 3).fill(palette.shoes)

		// ---- torso (shirt) ----
		// outline
		g.rect(cx - 12, 23, 24, 21).fill(O)
		// main fill
		g.rect(cx - 11, 24, 22, 19).fill(palette.shirt)
		// top highlight (light top-left)
		g.rect(cx - 10, 25, 20, 2).fill(palette.shirtLight)
		g.rect(cx - 10, 25, 2, 10).fill(palette.shirtLight)
		// right shadow band
		g.rect(cx + 7, 27, 3, 15).fill(palette.shirtShadow)

		// ---- arms ----
		g.rect(cx - 16, 24, 5, 19).fill(O)
		g.rect(cx + 11, 24, 5, 19).fill(O)
		g.rect(cx - 15, 25, 3, 14).fill(palette.shirt)
		g.rect(cx + 12, 25, 3, 14).fill(palette.shirt)
		g.rect(cx - 15, 25, 1, 8).fill(palette.shirtLight)
		g.rect(cx + 14, 28, 1, 11).fill(palette.shirtShadow)

		// ---- hands ----
		g.rect(cx - 16, 39, 5, 5).fill(O)
		g.rect(cx + 11, 39, 5, 5).fill(O)
		g.rect(cx - 15, 40, 3, 3).fill(palette.skin)
		g.rect(cx + 12, 40, 3, 3).fill(palette.skin)

		// ---- neck ----
		g.rect(cx - 3, 19, 6, 5).fill(O)
		g.rect(cx - 2, 20, 4, 3).fill(palette.skinShadow)

		// ---- head ----
		g.rect(cx - 9, 3, 18, 18).fill(O)
		g.rect(cx - 8, 4, 16, 16).fill(palette.skin)
		// face shadow right / bottom
		g.rect(cx + 4, 6, 4, 12).fill(palette.skinShadow)
		g.rect(cx - 8, 18, 16, 2).fill(palette.skinShadow)

		// eyes (2×2)
		g.rect(cx - 4, 11, 2, 2).fill(palette.eye)
		g.rect(cx + 2, 11, 2, 2).fill(palette.eye)
		// eye sparkle
		g.rect(cx - 3, 11, 1, 1).fill(0xffffff)
		g.rect(cx + 3, 11, 1, 1).fill(0xffffff)

		// mouth
		g.rect(cx - 2, 15, 4, 1).fill(palette.mouth)
		// cheek blush
		g.rect(cx - 7, 14, 1, 1).fill(palette.shirt)
		g.rect(cx + 6, 14, 1, 1).fill(palette.shirt)

		// ---- hair ----
		// hair outline/silhouette
		g.rect(cx - 10, 1, 20, 9).fill(O)
		// hair main volume
		g.rect(cx - 9, 2, 18, 7).fill(palette.hair)
		// hair highlight (top-left light)
		g.rect(cx - 8, 3, 10, 2).fill(palette.hairLight)
		// side strands
		g.rect(cx - 10, 8, 2, 7).fill(O)
		g.rect(cx + 8, 8, 2, 7).fill(O)
		g.rect(cx - 9, 9, 1, 5).fill(palette.hair)
		g.rect(cx + 8, 9, 1, 5).fill(palette.hair)
		// bangs over forehead
		g.rect(cx - 7, 8, 5, 2).fill(palette.hair)

		container.addChild(g)
		container.pivot.set(AvatarArt.WIDTH / 2, AvatarArt.HEIGHT - 4)

		return container
	}
}
