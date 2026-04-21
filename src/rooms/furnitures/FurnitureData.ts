export type FurnitureKind =
	| 'bed'
	| 'desk'
	| 'lamp'
	| 'plant'
	| 'rug'
	| 'screen'
	| 'shelf'
	| 'sofa'
	| 'table'

export type FurniturePalette =
	| 'ember'
	| 'gold'
	| 'leaf'
	| 'oak'
	| 'plum'
	| 'sand'
	| 'slate'

export default interface FurnitureData {
	id: string
	label: string
	kind: FurnitureKind
	x: number
	y: number
	width: number
	depth: number
	height: number
	palette: FurniturePalette
	accent?: number
	assetPath?: string
	walkable?: boolean
}
