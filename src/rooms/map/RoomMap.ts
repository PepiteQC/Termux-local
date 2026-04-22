import HeightMap, { HeightMapPosition } from './HeightMap'
import DIRECTION_OFFSETS from './directions/DIRECTION_OFFSETS'
import Directions from './directions/Directions'

export type RoomTileChar =
	| 'x'
	| 'X'
	| '-'
	| ' '
	| string

export default class RoomMap {
	private rows = 0
	private columns = 0

	private heightMap: HeightMap = {
		tilePositions: [],
		maxInXAxis: { x: 0, y: 0, height: 0 },
		maxInYAxis: { x: 0, y: 0, height: 0 }
	}

	private tileMap = new Map<string, HeightMapPosition>()
	private doorTile?: HeightMapPosition

	public constructor(map: string[]) {
		this.generateMap(map)
	}

	public generateMap(map: string[]): void {
		this.rows = this.getRowLength(map)
		this.columns = this.getColumnLength(map)

		this.heightMap = this.buildHeightMap(map)
		this.tileMap.clear()

		for (const tile of this.heightMap.tilePositions) {
			this.tileMap.set(this.toKey(tile.x, tile.y), tile)
		}

		this.doorTile = this.findDoorTile()
	}

	private getRowLength(map: string[]): number {
		return map.length
	}

	private getColumnLength(map: string[]): number {
		if (!map.length) return 0
		return map.reduce((largest, row) => Math.max(largest, row.length), 0)
	}

	private buildHeightMap(map: string[]): HeightMap {
		const tiles: HeightMapPosition[] = []

		map.forEach((row, y) => {
			;[...row].forEach((char, x) => {
				const height = this.getHeightByChar(char)

				if (height !== -1) {
					tiles.push({ x, y, height })
				}
			})
		})

		const maxInAxis = this.getMaxAxisPositionsFromTiles(tiles)

		return {
			tilePositions: tiles,
			maxInXAxis: maxInAxis.x,
			maxInYAxis: maxInAxis.y
		}
	}

	private getMaxAxisPositionsFromTiles(
		tiles: HeightMapPosition[]
	): { x: HeightMapPosition; y: HeightMapPosition } {
		const fallback: HeightMapPosition = { x: 0, y: 0, height: 0 }

		const maxInXAxis = tiles
			.filter((tile) => tile.y === 0)
			.reduce<HeightMapPosition>(
				(prev, curr) => (curr.x >= prev.x ? curr : prev),
				fallback
			)

		const maxInYAxis = tiles
			.filter((tile) => tile.x === 0)
			.reduce<HeightMapPosition>(
				(prev, curr) => (curr.y >= prev.y ? curr : prev),
				fallback
			)

		return {
			x: maxInXAxis,
			y: maxInYAxis
		}
	}

	private getHeightByChar(char: string): number {
		const normalized = char?.trim?.() ?? char

		if (
			char === 'x' ||
			char === 'X' ||
			char === '-' ||
			char === ' ' ||
			normalized === ''
		) {
			return -1
		}

		return '0123456789abcdefghijklmnopqrst'.indexOf(char.toLowerCase())
	}

	private toKey(x: number, y: number): string {
		return `${x}:${y}`
	}

	public hasTileAt(x: number, y: number): boolean {
		return this.tileMap.has(this.toKey(x, y))
	}

	public getTilePositionAt(x: number, y: number): HeightMapPosition | undefined {
		return this.tileMap.get(this.toKey(x, y))
	}

	public getTileHeightAt(x: number, y: number): number {
		return this.getTilePositionAt(x, y)?.height ?? -1
	}

	public isValidTile(x: number, y: number): boolean {
		return this.hasTileAt(x, y)
	}

	public isInsideBounds(x: number, y: number): boolean {
		return x >= 0 && y >= 0 && x < this.columns && y < this.rows
	}

	public getTilePositionsAround(x: number, y: number): Array<HeightMapPosition | undefined> {
		return DIRECTION_OFFSETS.map((offset) =>
			this.getTilePositionAt(x + offset.x, y + offset.y)
		)
	}

	public getNeighbors(
		x: number,
		y: number,
		allowDiagonals = true
	): HeightMapPosition[] {
		const offsets = allowDiagonals
			? DIRECTION_OFFSETS
			: [
					DIRECTION_OFFSETS[Directions.NORTH],
					DIRECTION_OFFSETS[Directions.EAST],
					DIRECTION_OFFSETS[Directions.SOUTH],
					DIRECTION_OFFSETS[Directions.WEST]
			  ]

		const neighbors: HeightMapPosition[] = []

		for (const offset of offsets) {
			const tile = this.getTilePositionAt(x + offset.x, y + offset.y)
			if (tile) {
				neighbors.push(tile)
			}
		}

		return neighbors
	}

	public getWallPositions(): HeightMapPosition[] {
		return this.tilePositions.filter((tile) => this.isValidWallPosition(tile))
	}

	public isValidWallPosition(position: HeightMapPosition): boolean {
		const north = this.getTilePositionAt(position.x, position.y - 1)
		const west = this.getTilePositionAt(position.x - 1, position.y)

		const needsNorthWall =
			position.x <= this.maxInXAxis.x && !north

		const needsWestWall =
			position.y <= this.maxInYAxis.y && !west

		return needsNorthWall || needsWestWall
	}

	public isValidStairPosition(position: HeightMapPosition): boolean {
		const east = this.getTilePositionAt(position.x + 1, position.y)
		const south = this.getTilePositionAt(position.x, position.y + 1)
		const southEast = this.getTilePositionAt(position.x + 1, position.y + 1)

		return [east, south, southEast].some(
			(tile) => !!tile && tile.height === position.height + 1
		)
	}

	/**
	 * Breadth-first search through walkable tiles.
	 *
	 * Uses 8-way connectivity, forbids height jumps greater than `maxStep`,
	 * and lets the caller mark tiles as blocked (e.g. non-walkable furniture).
	 *
	 * Returns the ordered list of tiles from the first step up to and including
	 * the destination, or an empty array if no path exists. The starting tile
	 * is intentionally excluded.
	 */
	public findPath(
		fromX: number,
		fromY: number,
		toX: number,
		toY: number,
		options: {
			isBlocked?: (x: number, y: number) => boolean
			maxStep?: number
		} = {}
	): HeightMapPosition[] {
		const isBlocked = options.isBlocked ?? (() => false)
		const maxStep = options.maxStep ?? 1

		const start = this.getTilePositionAt(fromX, fromY)
		const end = this.getTilePositionAt(toX, toY)
		if (!start || !end) return []
		if (fromX === toX && fromY === toY) return []
		if (isBlocked(toX, toY)) return []

		const toKey = this.toKey.bind(this)
		const startKey = toKey(fromX, fromY)
		const endKey = toKey(toX, toY)

		const queue: HeightMapPosition[] = [start]
		const cameFrom = new Map<string, string>()
		const visited = new Set<string>([startKey])

		while (queue.length) {
			const current = queue.shift()!
			if (current.x === toX && current.y === toY) break
			for (const neighbor of this.getNeighbors(current.x, current.y, true)) {
				const key = toKey(neighbor.x, neighbor.y)
				if (visited.has(key)) continue
				if (Math.abs(neighbor.height - current.height) > maxStep) continue
				const isDestination = neighbor.x === toX && neighbor.y === toY
				if (!isDestination && isBlocked(neighbor.x, neighbor.y)) continue
				visited.add(key)
				cameFrom.set(key, toKey(current.x, current.y))
				queue.push(neighbor)
			}
		}

		if (!cameFrom.has(endKey)) return []

		const path: HeightMapPosition[] = []
		let cursor = endKey
		while (cursor !== startKey) {
			const [xs, ys] = cursor.split(':')
			const tile = this.getTilePositionAt(Number(xs), Number(ys))
			if (!tile) return []
			path.unshift(tile)
			const prev = cameFrom.get(cursor)
			if (!prev) return []
			cursor = prev
		}
		return path
	}

	public canWalkTo(fromX: number, fromY: number, toX: number, toY: number, maxStep = 1): boolean {
		const from = this.getTilePositionAt(fromX, fromY)
		const to = this.getTilePositionAt(toX, toY)

		if (!from || !to) return false

		const dx = Math.abs(to.x - from.x)
		const dy = Math.abs(to.y - from.y)

		if (dx > 1 || dy > 1) return false

		const heightDiff = Math.abs(to.height - from.height)
		return heightDiff <= maxStep
	}

	public findDoorTile(): HeightMapPosition | undefined {
		if (this.heightMap.tilePositions.length === 0) return undefined

		const origin = this.getTilePositionAt(0, 0)
		if (origin) return origin

		return [...this.heightMap.tilePositions].sort((a, b) => {
			if (a.y !== b.y) return a.y - b.y
			return a.x - b.x
		})[0]
	}

	public getDoorTile(): HeightMapPosition | undefined {
		return this.doorTile
	}

	public getMinHeight(): number {
		if (!this.heightMap.tilePositions.length) return 0
		return Math.min(...this.heightMap.tilePositions.map((tile) => tile.height))
	}

	public getMaxHeight(): number {
		if (!this.heightMap.tilePositions.length) return 0
		return Math.max(...this.heightMap.tilePositions.map((tile) => tile.height))
	}

	public forEachTile(callback: (tile: HeightMapPosition, index: number) => void): void {
		this.heightMap.tilePositions.forEach(callback)
	}

	public get rowsCount(): number {
		return this.rows
	}

	public get columnsCount(): number {
		return this.columns
	}

	private get maxInXAxis(): HeightMapPosition {
		return this.heightMap.maxInXAxis
	}

	private get maxInYAxis(): HeightMapPosition {
		return this.heightMap.maxInYAxis
	}

	public get tilePositions(): HeightMapPosition[] {
		return this.heightMap.tilePositions
	}
}
