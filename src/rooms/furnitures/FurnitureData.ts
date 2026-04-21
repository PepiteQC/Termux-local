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
	// Weed Shop
	| 'counter'
	| 'cash-register'
	| 'jar'
	| 'vitrine'
	| 'neon'
	| 'enseigne'
	| 'weed-plant'
	| 'dab-station'
	| 'poster'
	| 'chill-sofa'
	// Dépanneur
	| 'fridge'
	| 'cigarette-rack'
	| 'snack-rack'
	| 'coffee-machine'
	| 'magazine-rack'
	| 'checkout'
	| 'donut-case'
	| 'hot-dog'
	// Gang
	| 'weapon-rack'
	| 'drug-stash'
	| 'safe'
	| 'pool-table'
	| 'arcade'
	| 'bar'
	| 'motorbike'
	| 'gang-crate'
	// Fumerie + lab + marché noir
	| 'bong'
	| 'pyrex'
	| 'joint'
	| 'ashtray'
	| 'lab-table'
	| 'hotte'
	| 'chemical'
	| 'scale'
	| 'lab-cabinet'
	| 'market-stand'
	| 'npc-vendor'
	| 'price-board'

export type FurniturePalette =
	| 'ember'
	| 'gold'
	| 'leaf'
	| 'oak'
	| 'plum'
	| 'sand'
	| 'slate'
	// Weed shop
	| 'emerald'
	| 'neon-green'
	| 'hash-brown'
	// Dépanneur
	| 'lemon'
	| 'cream'
	| 'steel'
	// Gangs
	| 'royal-blonds'
	| 'crimson-bmf'
	| 'gold-vagos'
	| 'blue-crips'
	| 'leather-motards'
	| 'ice-quebec'
	// Lab / marché noir
	| 'acid-lab'
	| 'violet-lab'
	| 'shadow'
	| 'blood'

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
	/** Nom de classe Habbo officielle (bundle extrait via scripts/habbo-extract.mjs). */
	habboClassName?: string
	/** Direction Habbo (0/2/4/6). Défaut : 2. */
	habboDirection?: number
}
