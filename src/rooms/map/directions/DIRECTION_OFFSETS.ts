interface TileOffset {
	x: number
	y: number
}

const DIRECTION_OFFSETS: TileOffset[] = [
	{ x: 0, y: -1 },  // NORTH
	{ x: 1, y: -1 },  // NORTH_EAST
	{ x: 1, y: 0 },   // EAST
	{ x: 1, y: 1 },   // SOUTH_EAST
	{ x: 0, y: 1 },   // SOUTH
	{ x: -1, y: 1 },  // SOUTH_WEST
	{ x: -1, y: 0 },  // WEST
	{ x: -1, y: -1 }  // NORTH_WEST
]

export default DIRECTION_OFFSETS
