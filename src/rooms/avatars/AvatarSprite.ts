import { Container, Graphics, Sprite, Text, Ticker } from 'pixi.js'

import type AvatarFigure from './AvatarFigure'
import type { HeightMapPosition } from '../map/HeightMap'
import TilesContainer from '../containers/tiles/TilesContainer'
import Tile from '../tiles/Tile'

export default class AvatarSprite extends Container {
	private readonly figure: AvatarFigure
	private readonly layers = new Container()
	private readonly shadow = new Graphics()
	private readonly nameText: Text

	private bobPhase = 0
	private currentTile: HeightMapPosition
	private isMounted = false
	private targetPosition: { x: number; y: number } | null = null

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

		this.shadow
			.ellipse(0, 0, 12, 5)
			.fill({ color: 0x000000, alpha: 0.24 })
		this.shadow.position.set(0, 1)
		this.shadow.zIndex = 0

		this.nameText = new Text({
			text: this.figure.username,
			style: {
				fill: 0xffffff,
				fontFamily: 'Arial',
				fontSize: 10,
				stroke: {
					color: 0x111111,
					width: 3
				}
			},
			textureStyle: {
				scaleMode: 'nearest'
			}
		})

		this.nameText.anchor.set(0.5, 1)
		this.nameText.position.set(0, -70)
		this.nameText.zIndex = 4

		this.layers.sortableChildren = true
		this.layers.zIndex = 2

		this.addChild(this.shadow, this.layers, this.nameText)
		this.buildLook()
		this.setPositionFromTile(this.currentTile)
		Ticker.shared.add(this.handleTick, this)
		this.isMounted = true
	}

	public override destroy(): void {
		if (this.isMounted) {
			Ticker.shared.remove(this.handleTick, this)
			this.isMounted = false
		}

		super.destroy()
	}

	public moveToTile(heightMapPosition: HeightMapPosition): void {
		this.currentTile = heightMapPosition
		this.targetPosition = this.getScreenPosition(heightMapPosition)
		this.zIndex = TilesContainer.getScreenIndex(heightMapPosition) * 10 + 200
	}

	public setPositionFromTile(heightMapPosition: HeightMapPosition): void {
		this.currentTile = heightMapPosition
		const screenPosition = this.getScreenPosition(heightMapPosition)

		this.position.set(screenPosition.x, screenPosition.y)
		this.zIndex = TilesContainer.getScreenIndex(heightMapPosition) * 10 + 200
	}

	private buildLook(): void {
		const spritePaths = [
			'/sprites/avatar/avatar-ether.png',
			this.figure.look.pants,
			this.figure.look.shoes,
			this.figure.look.shirt,
			this.figure.look.jacket,
			this.figure.look.hair,
			this.figure.look.accessory
		].filter(Boolean) as string[]

		spritePaths.forEach((path, index) => {
			const sprite = Sprite.from(path)
			sprite.anchor.set(0.5, 1)
			sprite.position.set(0, -3)
			sprite.scale.set(1.16)
			sprite.zIndex = index + 1

			if (sprite.texture.source) {
				sprite.texture.source.scaleMode = 'nearest'
			}

			this.layers.addChild(sprite)
		})
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
		this.nameText.y = -70 + Math.sin(this.bobPhase) * bobAmount
	}
}
