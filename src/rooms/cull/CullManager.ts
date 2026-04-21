import { Container, Rectangle } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

import type ICullManager from './ICullManager'

interface CullableObject {
	children?: readonly CullableObject[]
	getBounds(): Rectangle
	renderable: boolean
}

export default class CullManager implements ICullManager {
	private viewport!: Viewport
	private readonly padding = 220
	private timesTriggered = 0

	public setViewport(viewport: Viewport): void {
		this.viewport = viewport
		this.viewport.on('moved', (): void => this.handleMove())
	}

	public handleMove(): void {
		if (!this.viewport) return

		if (this.timesTriggered < 1) {
			this.timesTriggered += 1
			return
		}

		this.timesTriggered = 0

		const visibleBounds = this.viewport.getVisibleBounds()
		visibleBounds.x -= this.padding
		visibleBounds.y -= this.padding
		visibleBounds.width += this.padding * 2
		visibleBounds.height += this.padding * 2

		this.recursiveCheck(
			this.viewport.children as unknown as readonly CullableObject[],
			visibleBounds
		)
	}

	private recursiveCheck(
		children: readonly CullableObject[],
		visibleBounds: Rectangle
	): void {
		for (const child of children) {
			child.renderable = !this.isOffScreen(child, visibleBounds)

			if (child instanceof Container && child.children.length > 0) {
				this.recursiveCheck(
					child.children as unknown as readonly CullableObject[],
					visibleBounds
				)
			}
		}
	}

	private isOffScreen(
		object: Pick<CullableObject, 'getBounds'>,
		visibleBounds: Rectangle
	): boolean {
		const bounds = object.getBounds()

		return (
			bounds.x > visibleBounds.x + visibleBounds.width ||
			bounds.x + bounds.width < visibleBounds.x ||
			bounds.y > visibleBounds.y + visibleBounds.height ||
			bounds.y + bounds.height < visibleBounds.y
		)
	}
}
