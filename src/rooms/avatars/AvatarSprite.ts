import { Assets, Container, Graphics, Sprite, Texture, Ticker } from 'pixi.js'

import type AvatarFigure from './AvatarFigure'
import type { HeightMapPosition } from '../map/HeightMap'
import TilesContainer from '../containers/tiles/TilesContainer'
import Tile from '../tiles/Tile'
import AvatarArt from './AvatarArt'
import {
	DEFAULT_HABBO_FIGURE,
	buildHabboAvatarUrl,
	clampDirection,
	type HabboAction,
	type HabboDirection
} from '../../../lib/habbo/figure'

const HABBO_AVATAR_HEIGHT = 110
const HABBO_AVATAR_FOOT_OFFSET = 6

export default class AvatarSprite extends Container {
	private readonly figure: AvatarFigure
	private readonly layers = new Container()
	private readonly shadow = new Graphics()
	private readonly procedural: Container
	private habboSprite: Sprite | null = null

	private bobPhase = 0
	private currentTile: HeightMapPosition
	private isMounted = false
	private targetPosition: { x: number; y: number } | null = null

	private direction: HabboDirection = 4
	private headDirection: HabboDirection = 4
	private currentAction: HabboAction = 'std'
	private currentLookKey: string | null = null
	private pendingLookKey: string | null = null

	public constructor(figure: AvatarFigure) {
		super()

		this.figure = figure
		this.currentTile = {
			x: figure.x,
			y: figure.y,
			height: 0
		}
		this.sortableChildren = true
		this.eventMode = 'static'
		this.cursor = 'pointer'

		// Double-layer iso drop shadow : soft halo + darker core.
		this.shadow
			.ellipse(0, 0, 18, 8)
			.fill({ color: 0x000000, alpha: 0.16 })
			.ellipse(0, 0, 12, 5)
			.fill({ color: 0x000000, alpha: 0.34 })
		this.shadow.position.set(0, 2)
		this.shadow.zIndex = 0

		this.layers.sortableChildren = true
		this.layers.zIndex = 2

		this.procedural = AvatarArt.buildStanding()
		this.procedural.zIndex = 1
		// Anchor procedural so its feet align with the tile center, just
		// like the Habbo sprite below.
		this.procedural.position.set(-AvatarArt.WIDTH / 2, -AvatarArt.HEIGHT)
		this.layers.addChild(this.procedural)

		this.addChild(this.shadow, this.layers)
		this.setPositionFromTile(this.currentTile)
		Ticker.shared.add(this.handleTick, this)
		this.isMounted = true

		void this.refreshHabboLook()
	}

	public override destroy(): void {
		if (this.isMounted) {
			Ticker.shared.remove(this.handleTick, this)
			this.isMounted = false
		}

		super.destroy()
	}

	public moveToTile(heightMapPosition: HeightMapPosition): void {
		const previousTile = this.currentTile
		this.currentTile = heightMapPosition
		this.targetPosition = this.getScreenPosition(heightMapPosition)
		this.zIndex = TilesContainer.getScreenIndex(heightMapPosition) * 10 + 200

		const dx = heightMapPosition.x - previousTile.x
		const dy = heightMapPosition.y - previousTile.y
		if (dx !== 0 || dy !== 0) {
			this.direction = projectDirectionToHabbo(dx, dy)
			this.headDirection = this.direction
		}
		if (this.currentAction !== 'wlk') {
			this.setAction('wlk')
		} else {
			// setAction early-returns when the action is unchanged, so when the
			// player redirects the avatar mid-walk we force a texture refresh
			// to pick up the new direction.
			void this.refreshHabboLook()
		}
	}

	public getCurrentTile(): HeightMapPosition {
		return this.currentTile
	}

	public setPositionFromTile(heightMapPosition: HeightMapPosition): void {
		this.currentTile = heightMapPosition
		const screenPosition = this.getScreenPosition(heightMapPosition)

		this.position.set(screenPosition.x, screenPosition.y)
		this.zIndex = TilesContainer.getScreenIndex(heightMapPosition) * 10 + 200
	}

	private setAction(action: HabboAction): void {
		if (this.currentAction === action) return
		this.currentAction = action
		void this.refreshHabboLook()
	}

	private async refreshHabboLook(): Promise<void> {
		const figurestring =
			this.figure.look.figurestring?.trim() || DEFAULT_HABBO_FIGURE
		const url = buildHabboAvatarUrl({
			figure: figurestring,
			direction: this.direction,
			headDirection: this.headDirection,
			action: this.currentAction,
			gesture: 'nrm',
			size: 'l'
		})
		const lookKey = url
		if (this.currentLookKey === lookKey || this.pendingLookKey === lookKey) {
			return
		}
		this.pendingLookKey = lookKey
		try {
			const texture = (await Assets.load(url)) as Texture
			if (this.destroyed) return
			// Latest pending request wins ; ignore stale resolutions.
			if (this.pendingLookKey !== lookKey) return

			if (!this.habboSprite) {
				this.habboSprite = new Sprite(texture)
				this.habboSprite.anchor.set(0.5, 1)
				this.habboSprite.zIndex = 3
				this.habboSprite.position.set(0, HABBO_AVATAR_FOOT_OFFSET)
				this.layers.addChild(this.habboSprite)
			} else {
				this.habboSprite.texture = texture
			}

			// Slightly shrink the bottom of the sprite so it sits comfortably
			// on top of the tile shadow.
			this.habboSprite.height = Math.min(
				HABBO_AVATAR_HEIGHT,
				texture.height || HABBO_AVATAR_HEIGHT
			)

			this.procedural.alpha = 0
			this.currentLookKey = lookKey
		} catch {
			// Network or upstream error : keep the procedural placeholder.
			this.procedural.alpha = 1
		} finally {
			if (this.pendingLookKey === lookKey) {
				this.pendingLookKey = null
			}
		}
	}

	private getScreenPosition(
		heightMapPosition: HeightMapPosition
	): { x: number; y: number } {
		return {
			x: TilesContainer.getScreenX(heightMapPosition) + Tile.WIDTH / 2,
			y: TilesContainer.getScreenY(heightMapPosition) + Tile.HEIGHT / 2 + 2
		}
	}

	private handleTick(ticker: Ticker): void {
		if (this.targetPosition) {
			const deltaFactor = ticker.deltaMS / 16.6667
			const dx = this.targetPosition.x - this.position.x
			const dy = this.targetPosition.y - this.position.y
			const distance = Math.hypot(dx, dy)
			const speed = 4.4 * deltaFactor

			if (distance <= speed) {
				this.position.set(this.targetPosition.x, this.targetPosition.y)
				this.targetPosition = null
				this.setAction('std')
			} else {
				this.position.set(
					this.position.x + (dx / distance) * speed,
					this.position.y + (dy / distance) * speed
				)
			}
		}

		this.bobPhase += ticker.deltaMS * 0.012

		const moving = this.targetPosition !== null
		const bobAmount = moving ? 1.8 : 0.55

		this.layers.y = Math.sin(this.bobPhase) * bobAmount
	}
}

/**
 * Convert a tile-space delta (dx, dy) into a Habbo-conventioned direction.
 * Habbo direction reference :
 *   0 = south, 1 = SW, 2 = W, 3 = NW, 4 = N, 5 = NE, 6 = E, 7 = SE.
 */
function projectDirectionToHabbo(dx: number, dy: number): HabboDirection {
	const sx = Math.sign(dx)
	const sy = Math.sign(dy)

	if (sx === 0 && sy > 0) return clampDirection(0)
	if (sx < 0 && sy > 0) return clampDirection(1)
	if (sx < 0 && sy === 0) return clampDirection(2)
	if (sx < 0 && sy < 0) return clampDirection(3)
	if (sx === 0 && sy < 0) return clampDirection(4)
	if (sx > 0 && sy < 0) return clampDirection(5)
	if (sx > 0 && sy === 0) return clampDirection(6)
	if (sx > 0 && sy > 0) return clampDirection(7)
	return clampDirection(4)
}
