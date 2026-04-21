import type { Viewport } from 'pixi-viewport'

export default interface ICullManager {
	handleMove(): void
	setViewport(viewport: Viewport): void
}
