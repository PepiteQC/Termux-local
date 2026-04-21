enum Directions {
	NORTH,
	NORTH_EAST,
	EAST,
	SOUTH_EAST,
	SOUTH,
	SOUTH_WEST,
	WEST,
	NORTH_WEST
}

namespace Directions {
	export function parse(direction: string): Directions {
		return Directions[direction as keyof typeof Directions] as unknown as Directions
	}

	export function forEach(callback: (direction: Directions, index: number) => void): void {
		const keys = Object.keys(Directions).filter((key) => Number.isNaN(Number(key)))

		keys.forEach((key, index) => {
			callback(parse(key), index)
		})
	}
}

export default Directions
