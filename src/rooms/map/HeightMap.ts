export default interface HeightMap {
	tilePositions: HeightMapPosition[]
	maxInXAxis: HeightMapPosition
	maxInYAxis: HeightMapPosition
}

export interface HeightMapPosition {
	x: number
	y: number
	height: number
}
