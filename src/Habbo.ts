import { Application } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

import CullManager from './rooms/cull/CullManager'
import defaultRoomData from './rooms/data/defaultRoomData'
import { getRoomById, getRoomSummary, DEFAULT_ROOM_ID } from './rooms/data/rooms'
import RoomManager from './rooms/RoomManager'
import RoomScene from './rooms/RoomScene'
import { initializeHabboTheme } from './data/habbo/initTheme'
import GangState from './gang/GangState'
import SmokePuffLayer from './effects/SmokePuff'
import TilesContainer from './rooms/containers/tiles/TilesContainer'

if (typeof window !== 'undefined') {
	console.log('[Habbo] Module loaded')
}

export default class Habbo {
	public static readonly DEBUG = false

	public application!: Application
	public viewport!: Viewport

	public readonly gangState = new GangState()

	private readonly cullManager = new CullManager()
	private readonly roomManager = new RoomManager(this)
	private currentRoom: RoomScene | null = null
	private currentRoomId: string | null = null
	private host: HTMLElement | null = null
	private smokeLayer: SmokePuffLayer | null = null
	private resizeObserver: ResizeObserver | null = null
	private windowResizeHandler: (() => void) | null = null
	private avatarMovementEnabled = true
	private lastResizeWidth = 0
	private lastResizeHeight = 0
	private resizeRaf = 0

	public async init(parentElement: HTMLElement): Promise<void> {
		initializeHabboTheme()
		this.host = parentElement

		const measure = () => {
			const rect = parentElement.getBoundingClientRect()
			const w = Math.max(1, Math.floor(rect.width || parentElement.clientWidth || window.innerWidth))
			const h = Math.max(1, Math.floor(rect.height || parentElement.clientHeight || window.innerHeight))
			return { w, h }
		}

		const applyPixelArtMode = () => {
			const rendererAny = this.application.renderer as unknown as {
				texture?: { style?: { scaleMode?: string } }
				textureGC?: { maxIdle?: number; checkCountMax?: number }
			}

			// Nearest scaling si l'API existe dans cette build Pixi
			if (rendererAny.texture?.style) {
				rendererAny.texture.style.scaleMode = 'nearest'
			}

			// Texture GC un peu plus tolérant sur mobile / changements de rooms
			if (rendererAny.textureGC) {
				rendererAny.textureGC.maxIdle = 60 * 10
				rendererAny.textureGC.checkCountMax = 600
			}
		}

		const { w: width, h: height } = measure()
		this.lastResizeWidth = width
		this.lastResizeHeight = height

		this.application = new Application()

		await this.application.init({
			width,
			height,
			autoDensity: true,
			antialias: false,
			backgroundAlpha: 0,
			preference: 'webgl',
			powerPreference: 'high-performance',
			preferWebGLVersion: 2,
			resolution: Math.min(window.devicePixelRatio || 1, 2),
			roundPixels: true,
			clearBeforeRender: true,
			hello: false
		})

		applyPixelArtMode()

		this.viewport = new Viewport({
			screenWidth: width,
			screenHeight: height,
			worldWidth: width * 2,
			worldHeight: height * 2,
			events: this.application.renderer.events,
			ticker: this.application.ticker,
			disableOnContextMenu: true
		})

		this.viewport.sortableChildren = true
		this.viewport.eventMode = 'static'
		this.viewport.interactiveChildren = true

		this.viewport
			.drag({
				wheel: false,
				mouseButtons: 'right'
			})
			.pinch()
			.wheel({
				percent: 0.12,
				smooth: 3
			})
			.decelerate()
			.clampZoom({
				minScale: 0.9,
				maxScale: 3.4
			})

		this.application.stage.sortableChildren = true
		this.application.stage.eventMode = 'passive'
		this.application.stage.addChild(this.viewport)

		this.application.canvas.style.width = '100%'
		this.application.canvas.style.height = '100%'
		this.application.canvas.style.display = 'block'
		this.application.canvas.style.imageRendering = 'pixelated'
		;(this.application.canvas.style as CSSStyleDeclaration & { imageRendering?: string }).imageRendering = 'crisp-edges'

		parentElement.replaceChildren(this.application.canvas)
		this.cullManager.setViewport(this.viewport)

		const applyResize = () => {
			if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf)

			this.resizeRaf = requestAnimationFrame(() => {
				const { w, h } = measure()
				if (w <= 0 || h <= 0) return
				if (w === this.lastResizeWidth && h === this.lastResizeHeight) return

				this.lastResizeWidth = w
				this.lastResizeHeight = h
				this.resize(w, h)
			})
		}

		if (typeof ResizeObserver !== 'undefined') {
			this.resizeObserver = new ResizeObserver(() => applyResize())
			this.resizeObserver.observe(parentElement)
		}

		this.windowResizeHandler = () => applyResize()
		window.addEventListener('resize', this.windowResizeHandler, { passive: true })
		window.addEventListener('orientationchange', this.windowResizeHandler, { passive: true })

		const initialRoomData = getRoomById(DEFAULT_ROOM_ID) ?? defaultRoomData
		const room = this.roomManager.createRoom(initialRoomData)
		this.roomManager.setRoom(room)
		this.currentRoomId = initialRoomData.id

		this.smokeLayer = new SmokePuffLayer()
		this.smokeLayer.eventMode = 'none'
		this.viewport.addChild(this.smokeLayer)

		this.gangState.startTicks()

		if (typeof window !== 'undefined') {
			;(window as unknown as { __habbo?: Habbo }).__habbo = this
			window.dispatchEvent(new CustomEvent('ew-room-change', { detail: { id: this.currentRoomId } }))
		}
	}

	public switchRoomById(roomId: string): boolean {
		const data = getRoomById(roomId)
		if (!data) return false
		const room = this.roomManager.createRoom(data)
		this.roomManager.setRoom(room)
		this.currentRoomId = data.id
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('ew-room-change', { detail: { id: data.id } }))
		}
		return true
	}

	public listRooms() {
		return getRoomSummary()
	}

	public getCurrentRoomId(): string | null {
		return this.currentRoomId
	}

	public teleportAvatarTo(x: number, y: number): boolean {
		const room = this.roomManager.getCurrentRoom()
		if (!room) return false
		const container = (room as unknown as { roomContainer?: { avatarsContainer?: { movePrimaryAvatarTo?: (p: { x: number; y: number; height: number }) => void } } }).roomContainer
		container?.avatarsContainer?.movePrimaryAvatarTo?.({ x, y, height: 0 })
		return true
	}

	public setAvatarMovementEnabled(enabled: boolean): void {
		this.avatarMovementEnabled = enabled
	}

	public setPrimaryAvatarFigurestring(figurestring: string): boolean {
		const room = this.roomManager.getCurrentRoom()
		if (!room) return false
		const container = (room as unknown as {
			roomContainer?: {
				avatarsContainer?: {
					setPrimaryAvatarFigurestring?: (s: string) => boolean
				}
			}
		}).roomContainer
		return container?.avatarsContainer?.setPrimaryAvatarFigurestring?.(figurestring) ?? false
	}

	public setPrimaryAvatarUsername(username: string): boolean {
		const room = this.roomManager.getCurrentRoom()
		if (!room) return false
		const container = (room as unknown as {
			roomContainer?: {
				avatarsContainer?: {
					setPrimaryAvatarUsername?: (s: string) => boolean
				}
			}
		}).roomContainer
		return container?.avatarsContainer?.setPrimaryAvatarUsername?.(username) ?? false
	}

	public removeFurnitureById(id: string): boolean {
		const room = this.roomManager.getCurrentRoom()
		if (!room) return false
		const container = (room as unknown as {
			roomContainer?: {
				furnituresContainer?: {
					removeFurniture?: (id: string) => boolean
				}
			}
		}).roomContainer
		return container?.furnituresContainer?.removeFurniture?.(id) ?? false
	}

	public handleTileTap(
		position: { x: number; y: number; height: number },
		moveAvatar: () => void
	): void {
		if (typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent('ew-tile-tap', {
					detail: { x: position.x, y: position.y, height: position.height }
				})
			)
		}
		if (this.avatarMovementEnabled) moveAvatar()
	}

	public emitSmokeAtTile(tileX: number, tileY: number, tint: number = 0xd8d8e2, count: number = 18): boolean {
		if (!this.smokeLayer) return false
		const worldX = TilesContainer.getScreenX({ x: tileX, y: tileY, height: 0 })
		const worldY = TilesContainer.getScreenY({ x: tileX, y: tileY, height: 0 }) - 40
		this.smokeLayer.emitAt(worldX, worldY, count, tint)
		return true
	}

	public rotateFurnitureById(id: string): number | null {
		const sprite = this.findFurnitureSprite(id)
		if (!sprite?.turn) return null
		return sprite.turn() ?? null
	}

	public moveFurnitureById(id: string, x: number, y: number): boolean {
		const sprite = this.findFurnitureSprite(id)
		if (!sprite?.moveTo) return false
		return sprite.moveTo(x, y) ?? false
	}

	private findFurnitureSprite(id: string): {
		getItemId?: () => string
		turn?: () => number | null
		moveTo?: (x: number, y: number) => boolean
	} | null {
		const room = this.roomManager.getCurrentRoom()
		if (!room) return null
		const container = (room as unknown as {
			roomContainer?: {
				furnituresContainer?: {
					furnitures?: Array<{
						getItemId?: () => string
						turn?: () => number | null
						moveTo?: (x: number, y: number) => boolean
					}>
				}
			}
		}).roomContainer
		const sprites = container?.furnituresContainer?.furnitures ?? []
		return sprites.find((sprite) => sprite.getItemId?.() === id) ?? null
	}

	public placeHabboFurni(
		className: string,
		options?: { x?: number; y?: number; width?: number; depth?: number; direction?: number; label?: string }
	): boolean {
		const room = this.roomManager.getCurrentRoom()
		if (!room) return false
		const container = (room as unknown as {
			roomContainer?: {
				furnituresContainer?: {
					addFurniture?: (data: unknown) => unknown
				}
			}
		}).roomContainer
		const furnituresContainer = container?.furnituresContainer
		if (!furnituresContainer?.addFurniture) return false

		const data = {
			id: `habbo-${className}-${Date.now()}`,
			label: options?.label ?? className,
			kind: 'table',
			x: options?.x ?? 4,
			y: options?.y ?? 4,
			width: options?.width ?? 1,
			depth: options?.depth ?? 1,
			height: 1,
			palette: 'oak',
			walkable: false,
			habboClassName: className,
			habboDirection: options?.direction ?? 2
		}
		furnituresContainer.addFurniture(data)
		return true
	}

	public emitSmokeAtPrimaryAvatar(tint: number = 0xd8d8e2, count: number = 18): boolean {
		const room = this.roomManager.getCurrentRoom() as unknown as {
			roomContainer?: {
				avatarsContainer?: {
					getPrimaryAvatarPosition?: () => { x: number; y: number; height: number } | null
				}
			}
		} | null
		const position = room?.roomContainer?.avatarsContainer?.getPrimaryAvatarPosition?.()
		if (position) {
			return this.emitSmokeAtTile(position.x, position.y, tint, count)
		}
		return this.emitSmokeAtTile(5, 5, tint, count)
	}

	public getPrimaryAvatarScreenPosition(): { x: number; y: number } | null {
		if (!this.application?.canvas) return null
		const room = this.roomManager.getCurrentRoom() as unknown as {
			roomContainer?: {
				avatarsContainer?: {
					avatars?: Array<{
						getGlobalPosition?: () => { x: number; y: number }
					}>
				}
			}
		} | null
		const avatar = room?.roomContainer?.avatarsContainer?.avatars?.[0]
		const global = avatar?.getGlobalPosition?.()
		if (!global) return null
		const rect = this.application.canvas.getBoundingClientRect()
		const resolution = this.application.renderer?.resolution ?? 1
		return {
			x: rect.left + global.x / resolution,
			y: rect.top + global.y / resolution - 48
		}
	}

	public destroy(): void {
		this.gangState.stopTicks()
		this.currentRoom = null

		if (this.resizeRaf) {
			cancelAnimationFrame(this.resizeRaf)
			this.resizeRaf = 0
		}

		if (this.smokeLayer) {
			this.smokeLayer.destroy()
			this.smokeLayer = null
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect()
			this.resizeObserver = null
		}
		if (this.windowResizeHandler && typeof window !== 'undefined') {
			window.removeEventListener('resize', this.windowResizeHandler)
			window.removeEventListener('orientationchange', this.windowResizeHandler)
			this.windowResizeHandler = null
		}
		this.viewport?.destroy({ children: true })
		this.application?.destroy({ removeView: true }, { children: true })
		this.host = null
		if (typeof window !== 'undefined') {
			const bag = window as unknown as { __habbo?: Habbo }
			if (bag.__habbo === this) {
				bag.__habbo = undefined
			}
		}
	}

	public loadRoom(room: RoomScene): void {
		if (this.currentRoom && this.currentRoom.parent === this.viewport) {
			this.viewport.removeChild(this.currentRoom)
		}

		this.currentRoom = room
		this.viewport.addChildAt(room, 0)
		this.applyRoomMetrics(room)
		this.viewport.sortChildren()
		this.cullManager.handleMove()
	}

	public resize(width: number, height: number): void {
		if (!this.application || !this.viewport) return

		this.application.renderer.resize(width, height)

		if (this.currentRoom) {
			const metrics = this.currentRoom.getViewportMetrics()
			this.viewport.resize(
				width,
				height,
				Math.max(metrics.width, width * 2),
				Math.max(metrics.height, height * 2)
			)
		} else {
			this.viewport.resize(width, height, width * 2, height * 2)
		}

		this.cullManager.handleMove()
	}

	public unloadRoom(room: RoomScene): void {
		if (room.parent === this.viewport) {
			this.viewport.removeChild(room)
		}
	}

	public get renderer() {
		if (!this.application) {
			throw new Error('Habbo renderer accessed before init().')
		}

		return this.application.renderer
	}

	private applyRoomMetrics(room: RoomScene): void {
		const metrics = room.getViewportMetrics()

		this.viewport.resize(
			this.viewport.screenWidth,
			this.viewport.screenHeight,
			Math.max(metrics.width, this.viewport.screenWidth * 2),
			Math.max(metrics.height, this.viewport.screenHeight * 2)
		)
		this.viewport.moveCenter(metrics.centerX, metrics.centerY)
		this.viewport.setZoom(room.data.initialZoom, true)
	}
}
