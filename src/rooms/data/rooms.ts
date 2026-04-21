import type RoomData from './RoomData'
import defaultRoomData from './defaultRoomData'

const EMPTY_MAP_10 = [
	'0000000000',
	'0000000000',
	'0000000000',
	'0000000000',
	'0000000000',
	'0000000000',
	'0000000000',
	'0000000000'
]

const EMPTY_MAP_12 = [
	'000000000000',
	'000000000000',
	'000000000000',
	'000000000000',
	'000000000000',
	'000000000000',
	'000000000000',
	'000000000000',
	'000000000000',
	'000000000000'
]

function baseRoom(partial: Partial<RoomData> & Pick<RoomData, 'id' | 'name' | 'furnitures'>): RoomData {
	return {
		allowPets: false,
		allowPetsEating: false,
		category: partial.category ?? 'premium',
		currentUsers: partial.currentUsers ?? 1,
		description: partial.description ?? '',
		floorThickness: partial.floorThickness ?? 10,
		hideWalls: partial.hideWalls ?? false,
		hideWired: partial.hideWired ?? false,
		initialZoom: partial.initialZoom ?? 2.0,
		map: partial.map ?? { room: EMPTY_MAP_10 },
		maxUsers: partial.maxUsers ?? 25,
		type: partial.type ?? 'Suite',
		wallHeight: partial.wallHeight ?? 5,
		wallThickness: partial.wallThickness ?? 6,
		avatars: partial.avatars ?? [
			{
				id: 'local-avatar',
				username: 'EtherUser',
				motto: 'EtherWorld player',
				x: 2,
				y: 4,
				look: {
					hair: '/sprites/avatar/hair/hair-braids.png',
					shirt: '/sprites/avatar/shirt/shirt-tshirt.png',
					jacket: '/sprites/avatar/jacket/jacket-bomber.png',
					pants: '/sprites/avatar/pants/pants-shorts.png',
					shoes: '/sprites/avatar/shoes/shoes-hi-tops.png'
				}
			}
		],
		id: partial.id,
		name: partial.name,
		furnitures: partial.furnitures
	}
}

// ─────────────── WEED SHOP ───────────────
const weedShopRoom: RoomData = baseRoom({
	id: 'weed-shop',
	name: 'Green Shop · Weed Boutique',
	description: 'Boutique cannabis premium : vitrines, concentrés, zone chill et arrière-boutique.',
	category: 'shop',
	type: 'Shop',
	initialZoom: 1.9,
	map: { room: EMPTY_MAP_12 },
	furnitures: [
		// Tapis d'entrée
		{ id: 'ws-rug-entry', label: 'Tapis entrée', kind: 'rug', x: 5, y: 0, width: 2, depth: 1, height: 0, palette: 'emerald', accent: 0x3fe07e, walkable: true },
		// Comptoir principal
		{ id: 'ws-counter-1', label: 'Comptoir bois', kind: 'counter', x: 1, y: 4, width: 3, depth: 1, height: 1, palette: 'hash-brown', accent: 0x3fe07e },
		{ id: 'ws-counter-2', label: 'Comptoir bois', kind: 'counter', x: 4, y: 4, width: 2, depth: 1, height: 1, palette: 'hash-brown', accent: 0x3fe07e },
		{ id: 'ws-cash', label: 'Caisse', kind: 'cash-register', x: 1, y: 4, width: 1, depth: 1, height: 2, palette: 'slate', accent: 0x3fe07e },
		// Vitrines
		{ id: 'ws-vitrine-1', label: 'Vitrine Diamond', kind: 'vitrine', x: 6, y: 4, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0xccf2ff },
		{ id: 'ws-vitrine-2', label: 'Vitrine Live Resin', kind: 'vitrine', x: 7, y: 4, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0xffc96b },
		{ id: 'ws-vitrine-3', label: 'Vitrine Hash', kind: 'vitrine', x: 8, y: 4, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0xc59b57 },
		{ id: 'ws-vitrine-4', label: 'Vitrine Pot', kind: 'vitrine', x: 9, y: 4, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0x7fe090 },
		// Jars premium en ligne
		{ id: 'ws-jar-diamond', label: 'Jar Diamond Sauce', kind: 'jar', x: 1, y: 2, width: 1, depth: 1, height: 1, palette: 'hash-brown', accent: 0xccf2ff },
		{ id: 'ws-jar-liveresin', label: 'Jar Live Resin', kind: 'jar', x: 2, y: 2, width: 1, depth: 1, height: 1, palette: 'hash-brown', accent: 0xffc96b },
		{ id: 'ws-jar-hash', label: 'Jar Hash', kind: 'jar', x: 3, y: 2, width: 1, depth: 1, height: 1, palette: 'hash-brown', accent: 0xc59b57 },
		{ id: 'ws-jar-pot', label: 'Jar Pot', kind: 'jar', x: 4, y: 2, width: 1, depth: 1, height: 1, palette: 'hash-brown', accent: 0x7fe090 },
		{ id: 'ws-jar-kush', label: 'Jar Kush', kind: 'jar', x: 5, y: 2, width: 1, depth: 1, height: 1, palette: 'hash-brown', accent: 0x5fd27a },
		// Enseigne néon
		{ id: 'ws-enseigne', label: 'GREEN SHOP', kind: 'enseigne', x: 4, y: 0, width: 2, depth: 1, height: 3, palette: 'emerald', accent: 0x3fe07e },
		{ id: 'ws-neon-1', label: 'Néon vert', kind: 'neon', x: 0, y: 0, width: 2, depth: 1, height: 3, palette: 'neon-green', accent: 0x5fff8e },
		{ id: 'ws-neon-2', label: 'Néon vert', kind: 'neon', x: 9, y: 0, width: 2, depth: 1, height: 3, palette: 'neon-green', accent: 0x5fff8e },
		// Dab station
		{ id: 'ws-dab', label: 'Dab station', kind: 'dab-station', x: 10, y: 2, width: 1, depth: 1, height: 2, palette: 'slate', accent: 0xff7a2a },
		// Plantes weed
		{ id: 'ws-plant-1', label: 'Plante cannabis', kind: 'weed-plant', x: 0, y: 5, width: 1, depth: 1, height: 2, palette: 'leaf', accent: 0x3fa35a },
		{ id: 'ws-plant-2', label: 'Plante cannabis', kind: 'weed-plant', x: 11, y: 5, width: 1, depth: 1, height: 2, palette: 'leaf', accent: 0x3fa35a },
		{ id: 'ws-plant-3', label: 'Plante cannabis', kind: 'weed-plant', x: 0, y: 8, width: 1, depth: 1, height: 2, palette: 'leaf', accent: 0x3fa35a },
		{ id: 'ws-plant-4', label: 'Plante cannabis', kind: 'weed-plant', x: 11, y: 8, width: 1, depth: 1, height: 2, palette: 'leaf', accent: 0x3fa35a },
		// Chill zone — canapés
		{ id: 'ws-sofa-1', label: 'Canapé chill', kind: 'chill-sofa', x: 2, y: 7, width: 3, depth: 1, height: 1, palette: 'emerald', accent: 0xffc96b },
		{ id: 'ws-sofa-2', label: 'Canapé chill', kind: 'chill-sofa', x: 7, y: 7, width: 3, depth: 1, height: 1, palette: 'emerald', accent: 0xffc96b },
		{ id: 'ws-table-chill', label: 'Table basse', kind: 'table', x: 5, y: 7, width: 2, depth: 1, height: 1, palette: 'hash-brown' },
		// Poster mur
		{ id: 'ws-poster-1', label: 'Poster strain', kind: 'poster', x: 2, y: 0, width: 1, depth: 1, height: 3, palette: 'hash-brown', accent: 0x3fe07e },
		{ id: 'ws-poster-2', label: 'Poster strain', kind: 'poster', x: 7, y: 0, width: 1, depth: 1, height: 3, palette: 'hash-brown', accent: 0xffc96b },
		// Lampes
		{ id: 'ws-lamp-1', label: 'Lampe néon', kind: 'lamp', x: 3, y: 1, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0x5fff8e },
		{ id: 'ws-lamp-2', label: 'Lampe néon', kind: 'lamp', x: 8, y: 1, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0x5fff8e },
		// Fumerie
		{ id: 'ws-bong-1', label: 'Bong premium', kind: 'bong', x: 5, y: 4, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0x5fff8e },
		{ id: 'ws-bong-2', label: 'Bong Diamond', kind: 'bong', x: 6, y: 7, width: 1, depth: 1, height: 2, palette: 'emerald', accent: 0xccf2ff },
		{ id: 'ws-ashtray-1', label: 'Cendrier', kind: 'ashtray', x: 5, y: 8, width: 1, depth: 1, height: 1, palette: 'slate', accent: 0xff7a2a },
		{ id: 'ws-joint-1', label: 'Joint allumé', kind: 'joint', x: 8, y: 8, width: 1, depth: 1, height: 1, palette: 'hash-brown', accent: 0xff7a2a },
		// Arrière-boutique stash
		{ id: 'ws-shelf-1', label: 'Étagère', kind: 'shelf', x: 1, y: 9, width: 2, depth: 1, height: 2, palette: 'hash-brown' },
		{ id: 'ws-shelf-2', label: 'Étagère', kind: 'shelf', x: 9, y: 9, width: 2, depth: 1, height: 2, palette: 'hash-brown' },
		// Tapis zone chill
		{ id: 'ws-rug-chill', label: 'Tapis chill', kind: 'rug', x: 4, y: 6, width: 4, depth: 3, height: 0, palette: 'emerald', accent: 0x2e5f3d, walkable: true }
	]
})

// ─────────────── DÉPANNEUR ───────────────
const depanneurRoom: RoomData = baseRoom({
	id: 'depanneur',
	name: 'Le Dépanneur · Publique',
	description: 'Dépanneur de quartier : frigos, cigarettes, snacks, café, caisse.',
	category: 'shop',
	type: 'Shop',
	initialZoom: 1.9,
	map: { room: EMPTY_MAP_12 },
	furnitures: [
		{ id: 'dp-rug-entry', label: 'Tapis entrée', kind: 'rug', x: 5, y: 0, width: 2, depth: 1, height: 0, palette: 'lemon', accent: 0xfff0b3, walkable: true },
		{ id: 'dp-enseigne', label: 'DÉPANNEUR', kind: 'enseigne', x: 4, y: 0, width: 3, depth: 1, height: 3, palette: 'lemon', accent: 0xffce55 },
		// Frigos
		{ id: 'dp-fridge-1', label: 'Frigo boissons', kind: 'fridge', x: 0, y: 0, width: 1, depth: 1, height: 3, palette: 'steel', accent: 0x5acbff },
		{ id: 'dp-fridge-2', label: 'Frigo boissons', kind: 'fridge', x: 1, y: 0, width: 1, depth: 1, height: 3, palette: 'steel', accent: 0x5acbff },
		{ id: 'dp-fridge-3', label: 'Frigo bière', kind: 'fridge', x: 2, y: 0, width: 1, depth: 1, height: 3, palette: 'steel', accent: 0xffce55 },
		{ id: 'dp-fridge-4', label: 'Frigo énergisant', kind: 'fridge', x: 9, y: 0, width: 1, depth: 1, height: 3, palette: 'steel', accent: 0xff7b5a },
		{ id: 'dp-fridge-5', label: 'Frigo boissons', kind: 'fridge', x: 10, y: 0, width: 1, depth: 1, height: 3, palette: 'steel', accent: 0x5acbff },
		{ id: 'dp-fridge-6', label: 'Frigo boissons', kind: 'fridge', x: 11, y: 0, width: 1, depth: 1, height: 3, palette: 'steel', accent: 0x5acbff },
		// Rack cigarettes
		{ id: 'dp-cig-1', label: 'Rack cigarettes', kind: 'cigarette-rack', x: 0, y: 4, width: 2, depth: 1, height: 3, palette: 'cream', accent: 0xd46640 },
		// Rack snacks
		{ id: 'dp-snack-1', label: 'Rack snacks', kind: 'snack-rack', x: 3, y: 4, width: 2, depth: 1, height: 3, palette: 'cream' },
		{ id: 'dp-snack-2', label: 'Rack snacks', kind: 'snack-rack', x: 7, y: 4, width: 2, depth: 1, height: 3, palette: 'cream' },
		// Magazine
		{ id: 'dp-mag', label: 'Rack magazines', kind: 'magazine-rack', x: 10, y: 4, width: 2, depth: 1, height: 3, palette: 'cream' },
		// Comptoir caisse
		{ id: 'dp-counter-1', label: 'Comptoir', kind: 'counter', x: 4, y: 7, width: 4, depth: 1, height: 1, palette: 'cream', accent: 0xffce55 },
		{ id: 'dp-checkout', label: 'Caisse', kind: 'checkout', x: 5, y: 7, width: 1, depth: 1, height: 2, palette: 'steel', accent: 0xffce55 },
		// Café
		{ id: 'dp-coffee', label: 'Machine café', kind: 'coffee-machine', x: 6, y: 7, width: 1, depth: 1, height: 2, palette: 'steel', accent: 0x7a3d1c },
		// Donut / hot-dog
		{ id: 'dp-donut', label: 'Vitrine donuts', kind: 'donut-case', x: 1, y: 7, width: 2, depth: 1, height: 2, palette: 'lemon', accent: 0xffb36b },
		{ id: 'dp-hotdog', label: 'Hot-dog grill', kind: 'hot-dog', x: 9, y: 7, width: 2, depth: 1, height: 2, palette: 'lemon', accent: 0xd46640 },
		// Plantes / déco
		{ id: 'dp-plant-1', label: 'Plante', kind: 'plant', x: 0, y: 9, width: 1, depth: 1, height: 2, palette: 'leaf', accent: 0x67be7f },
		{ id: 'dp-plant-2', label: 'Plante', kind: 'plant', x: 11, y: 9, width: 1, depth: 1, height: 2, palette: 'leaf', accent: 0x67be7f },
		// Lampes
		{ id: 'dp-lamp-1', label: 'Néon plafond', kind: 'lamp', x: 3, y: 2, width: 1, depth: 1, height: 2, palette: 'lemon', accent: 0xfff0b3 },
		{ id: 'dp-lamp-2', label: 'Néon plafond', kind: 'lamp', x: 8, y: 2, width: 1, depth: 1, height: 2, palette: 'lemon', accent: 0xfff0b3 },
		// Tapis aire
		{ id: 'dp-rug-main', label: 'Tapis', kind: 'rug', x: 3, y: 9, width: 6, depth: 1, height: 0, palette: 'lemon', accent: 0xeccc6b, walkable: true }
	]
})

// ─────────────── GANG ROOMS ───────────────
type GangFactionId = 'blonds' | 'bmf' | 'vagos' | 'crips' | 'motards' | 'quebec'

type GangFaction = {
	id: GangFactionId
	name: string
	tagline: string
	palette: 'royal-blonds' | 'crimson-bmf' | 'gold-vagos' | 'blue-crips' | 'leather-motards' | 'ice-quebec'
	accent: number
	drugs: Array<'weed' | 'coke' | 'ecsta' | 'molly'>
	weapons: string[]
}

const FACTIONS: GangFaction[] = [
	{ id: 'blonds', name: 'Les Blonds', tagline: 'Old school · argent · or', palette: 'royal-blonds', accent: 0xffe88a, drugs: ['weed', 'coke', 'ecsta', 'molly'], weapons: ['Pistolet 9mm', 'Fusil de chasse', 'Batte'] },
	{ id: 'bmf', name: 'BMF', tagline: 'Black Mafia Family · cash · respect', palette: 'crimson-bmf', accent: 0xf7b7bf, drugs: ['weed', 'coke', 'molly'], weapons: ['Glock', 'SMG', 'Uzi'] },
	{ id: 'vagos', name: 'Vagos', tagline: 'Desert gold · bikes · feu', palette: 'gold-vagos', accent: 0xffd96b, drugs: ['weed', 'ecsta', 'molly'], weapons: ['Revolver', 'Shotgun', 'Machette'] },
	{ id: 'crips', name: 'Crips', tagline: 'Blue flag · west side', palette: 'blue-crips', accent: 0x9ac4ff, drugs: ['weed', 'coke', 'ecsta'], weapons: ['9mm', 'AK', 'Katana'] },
	{ id: 'motards', name: 'Motards', tagline: 'Chrome · essence · liberté', palette: 'leather-motards', accent: 0xf0f0f0, drugs: ['weed', 'coke', 'molly'], weapons: ['Fusil', 'Chaîne', 'Batte'] },
	{ id: 'quebec', name: 'Québec', tagline: 'Froid · neige · crew QC', palette: 'ice-quebec', accent: 0xcef0ff, drugs: ['weed', 'coke', 'ecsta', 'molly'], weapons: ['Carabine', 'Couteau', 'Batte'] }
]

function gangRoom(faction: GangFaction): RoomData {
	return baseRoom({
		id: `gang-${faction.id}`,
		name: `Planque ${faction.name}`,
		description: `Hideout de la faction ${faction.name}.`,
		category: 'gang',
		type: 'Gang',
		initialZoom: 1.95,
		map: { room: EMPTY_MAP_10 },
		furnitures: [
			{ id: `${faction.id}-rug`, label: 'Tapis faction', kind: 'rug', x: 3, y: 3, width: 4, depth: 2, height: 0, palette: faction.palette, accent: faction.accent, walkable: true },
			{ id: `${faction.id}-enseigne`, label: faction.name.toUpperCase(), kind: 'enseigne', x: 3, y: 0, width: 2, depth: 1, height: 3, palette: faction.palette, accent: faction.accent },
			{ id: `${faction.id}-weapons`, label: 'Râtelier armes', kind: 'weapon-rack', x: 0, y: 2, width: 2, depth: 1, height: 3, palette: faction.palette, accent: faction.accent },
			{ id: `${faction.id}-stash`, label: 'Stash drogues', kind: 'drug-stash', x: 7, y: 2, width: 2, depth: 1, height: 2, palette: 'hash-brown', accent: faction.accent },
			{ id: `${faction.id}-safe`, label: 'Coffre cash', kind: 'safe', x: 0, y: 5, width: 1, depth: 1, height: 2, palette: 'slate', accent: faction.accent },
			{ id: `${faction.id}-pool`, label: 'Billard', kind: 'pool-table', x: 3, y: 5, width: 3, depth: 2, height: 1, palette: faction.palette, accent: 0x1f6f3a },
			{ id: `${faction.id}-arcade`, label: 'Arcade', kind: 'arcade', x: 8, y: 5, width: 1, depth: 1, height: 3, palette: faction.palette, accent: faction.accent },
			{ id: `${faction.id}-bar`, label: 'Bar', kind: 'bar', x: 2, y: 1, width: 2, depth: 1, height: 1, palette: faction.palette, accent: faction.accent },
			{ id: `${faction.id}-sofa`, label: 'Canapé crew', kind: 'chill-sofa', x: 6, y: 0, width: 3, depth: 1, height: 1, palette: faction.palette, accent: faction.accent },
			{ id: `${faction.id}-crate-1`, label: 'Caisse', kind: 'gang-crate', x: 0, y: 7, width: 1, depth: 1, height: 1, palette: faction.palette, accent: faction.accent },
			{ id: `${faction.id}-crate-2`, label: 'Caisse', kind: 'gang-crate', x: 9, y: 7, width: 1, depth: 1, height: 1, palette: faction.palette, accent: faction.accent },
			faction.id === 'motards'
				? { id: `${faction.id}-moto`, label: 'Moto', kind: 'motorbike', x: 6, y: 6, width: 2, depth: 1, height: 1, palette: faction.palette, accent: 0xff3f00 }
				: { id: `${faction.id}-plant`, label: 'Plante', kind: 'plant', x: 9, y: 0, width: 1, depth: 1, height: 2, palette: 'leaf', accent: 0x67be7f },
			{ id: `${faction.id}-lamp-1`, label: 'Lampe', kind: 'lamp', x: 4, y: 2, width: 1, depth: 1, height: 2, palette: faction.palette, accent: faction.accent }
		]
	})
}

export const GANG_FACTIONS = FACTIONS
export type { GangFaction, GangFactionId }

const gangRooms: RoomData[] = FACTIONS.map(gangRoom)

// ─────────────── LABORATOIRE ───────────────
const laboratoryRoom: RoomData = baseRoom({
	id: 'lab',
	name: 'Laboratoire Clandestin',
	description: 'Labo underground : pyrex, hotte, produits, scale de précision.',
	category: 'gang',
	type: 'Lab',
	initialZoom: 2.0,
	map: { room: EMPTY_MAP_12 },
	furnitures: [
		{ id: 'lab-rug', label: 'Tapis sécurité', kind: 'rug', x: 4, y: 3, width: 4, depth: 3, height: 0, palette: 'acid-lab', accent: 0xa9ffbe, walkable: true },
		{ id: 'lab-enseigne', label: 'LAB 42', kind: 'enseigne', x: 4, y: 0, width: 3, depth: 1, height: 3, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-hotte-1', label: 'Hotte chimique', kind: 'hotte', x: 0, y: 0, width: 2, depth: 1, height: 4, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-hotte-2', label: 'Hotte chimique', kind: 'hotte', x: 10, y: 0, width: 2, depth: 1, height: 4, palette: 'violet-lab', accent: 0xd7b7ff },
		{ id: 'lab-table-1', label: 'Paillasse cook', kind: 'lab-table', x: 1, y: 4, width: 3, depth: 1, height: 1, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-table-2', label: 'Paillasse chimie', kind: 'lab-table', x: 8, y: 4, width: 3, depth: 1, height: 1, palette: 'violet-lab', accent: 0xd7b7ff },
		{ id: 'lab-pyrex-1', label: 'Pyrex cook', kind: 'pyrex', x: 2, y: 3, width: 1, depth: 1, height: 2, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-pyrex-2', label: 'Pyrex blue', kind: 'pyrex', x: 3, y: 3, width: 1, depth: 1, height: 2, palette: 'acid-lab', accent: 0x5acbff },
		{ id: 'lab-pyrex-3', label: 'Pyrex molly', kind: 'pyrex', x: 9, y: 3, width: 1, depth: 1, height: 2, palette: 'violet-lab', accent: 0xd7b7ff },
		{ id: 'lab-cabinet-1', label: 'Armoire réactifs', kind: 'lab-cabinet', x: 0, y: 7, width: 2, depth: 1, height: 3, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-cabinet-2', label: 'Armoire produits', kind: 'lab-cabinet', x: 10, y: 7, width: 2, depth: 1, height: 3, palette: 'violet-lab', accent: 0xd7b7ff },
		{ id: 'lab-chemical-1', label: 'Produits chimiques', kind: 'chemical', x: 4, y: 7, width: 1, depth: 1, height: 2, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-chemical-2', label: 'Produits chimiques', kind: 'chemical', x: 7, y: 7, width: 1, depth: 1, height: 2, palette: 'violet-lab', accent: 0xd7b7ff },
		{ id: 'lab-scale-1', label: 'Balance précision', kind: 'scale', x: 5, y: 7, width: 1, depth: 1, height: 1, palette: 'steel', accent: 0xa9ffbe },
		{ id: 'lab-scale-2', label: 'Balance précision', kind: 'scale', x: 6, y: 7, width: 1, depth: 1, height: 1, palette: 'steel', accent: 0xd7b7ff },
		{ id: 'lab-vent', label: 'Ventilation', kind: 'neon', x: 4, y: 1, width: 3, depth: 1, height: 3, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-safe', label: 'Coffre stock', kind: 'safe', x: 5, y: 9, width: 1, depth: 1, height: 2, palette: 'slate', accent: 0xa9ffbe },
		{ id: 'lab-stash', label: 'Stash brut', kind: 'drug-stash', x: 6, y: 9, width: 1, depth: 1, height: 2, palette: 'hash-brown', accent: 0xd7b7ff },
		{ id: 'lab-lamp-1', label: 'Lampe UV', kind: 'lamp', x: 3, y: 2, width: 1, depth: 1, height: 2, palette: 'acid-lab', accent: 0xa9ffbe },
		{ id: 'lab-lamp-2', label: 'Lampe UV', kind: 'lamp', x: 8, y: 2, width: 1, depth: 1, height: 2, palette: 'violet-lab', accent: 0xd7b7ff }
	]
})

// ─────────────── MARCHÉ NOIR ───────────────
const blackMarketRoom: RoomData = baseRoom({
	id: 'black-market',
	name: 'Marché Noir',
	description: 'Stands clandestins : armes, drogues, deals, vendeur masqué.',
	category: 'gang',
	type: 'Market',
	initialZoom: 1.95,
	map: { room: EMPTY_MAP_12 },
	furnitures: [
		{ id: 'bm-rug', label: 'Tapis sombre', kind: 'rug', x: 4, y: 4, width: 4, depth: 2, height: 0, palette: 'shadow', accent: 0xff3f00, walkable: true },
		{ id: 'bm-enseigne', label: 'BLACK MARKET', kind: 'enseigne', x: 4, y: 0, width: 3, depth: 1, height: 3, palette: 'blood', accent: 0xff3f00 },
		{ id: 'bm-stand-1', label: 'Stand drogues', kind: 'market-stand', x: 0, y: 2, width: 3, depth: 1, height: 2, palette: 'shadow', accent: 0x9affc6 },
		{ id: 'bm-npc-1', label: 'Vendeur drogues', kind: 'npc-vendor', x: 1, y: 3, width: 1, depth: 1, height: 3, palette: 'shadow', accent: 0x9affc6 },
		{ id: 'bm-stand-2', label: 'Stand armes', kind: 'market-stand', x: 4, y: 2, width: 3, depth: 1, height: 2, palette: 'blood', accent: 0xff5a5a },
		{ id: 'bm-npc-2', label: 'Vendeur armes', kind: 'npc-vendor', x: 5, y: 3, width: 1, depth: 1, height: 3, palette: 'blood', accent: 0xff5a5a },
		{ id: 'bm-stand-3', label: 'Stand faux papiers', kind: 'market-stand', x: 8, y: 2, width: 3, depth: 1, height: 2, palette: 'violet-lab', accent: 0xd7b7ff },
		{ id: 'bm-npc-3', label: 'Fixer', kind: 'npc-vendor', x: 9, y: 3, width: 1, depth: 1, height: 3, palette: 'violet-lab', accent: 0xd7b7ff },
		{ id: 'bm-board-1', label: 'Prix du jour', kind: 'price-board', x: 2, y: 0, width: 2, depth: 1, height: 3, palette: 'shadow', accent: 0x9affc6 },
		{ id: 'bm-board-2', label: 'Cours armes', kind: 'price-board', x: 8, y: 0, width: 2, depth: 1, height: 3, palette: 'blood', accent: 0xff5a5a },
		{ id: 'bm-safe-1', label: 'Coffre cash', kind: 'safe', x: 0, y: 6, width: 1, depth: 1, height: 2, palette: 'shadow', accent: 0xff3f00 },
		{ id: 'bm-safe-2', label: 'Coffre cash', kind: 'safe', x: 11, y: 6, width: 1, depth: 1, height: 2, palette: 'shadow', accent: 0xff3f00 },
		{ id: 'bm-stash', label: 'Stash back-room', kind: 'drug-stash', x: 3, y: 7, width: 2, depth: 1, height: 2, palette: 'hash-brown', accent: 0x9affc6 },
		{ id: 'bm-weapons', label: 'Râtelier arrière', kind: 'weapon-rack', x: 7, y: 7, width: 2, depth: 1, height: 3, palette: 'shadow', accent: 0xff5a5a },
		{ id: 'bm-bar', label: 'Bar cash', kind: 'bar', x: 5, y: 7, width: 2, depth: 1, height: 1, palette: 'shadow', accent: 0xff3f00 },
		{ id: 'bm-sofa', label: 'Canapé deal', kind: 'chill-sofa', x: 4, y: 9, width: 3, depth: 1, height: 1, palette: 'shadow', accent: 0xff5a5a },
		{ id: 'bm-ashtray', label: 'Cendrier', kind: 'ashtray', x: 7, y: 9, width: 1, depth: 1, height: 1, palette: 'slate', accent: 0xff7a2a },
		{ id: 'bm-lamp-1', label: 'Lampe rouge', kind: 'lamp', x: 3, y: 1, width: 1, depth: 1, height: 2, palette: 'blood', accent: 0xff5a5a },
		{ id: 'bm-lamp-2', label: 'Lampe rouge', kind: 'lamp', x: 8, y: 1, width: 1, depth: 1, height: 2, palette: 'blood', accent: 0xff5a5a }
	]
})

// ─────────────── REGISTRY ───────────────

const ROOM_LIBRARY: RoomData[] = [
	{ ...defaultRoomData, name: 'EtherWorld Suite', category: 'spawn' },
	weedShopRoom,
	depanneurRoom,
	laboratoryRoom,
	blackMarketRoom,
	...gangRooms
]

export function getAllRooms(): RoomData[] {
	return ROOM_LIBRARY
}

export function getRoomById(id: string): RoomData | undefined {
	return ROOM_LIBRARY.find((room) => room.id === id)
}

export function getRoomSummary() {
	return ROOM_LIBRARY.map((room) => ({
		id: room.id,
		name: room.name,
		category: room.category ?? 'premium',
		description: room.description ?? '',
		currentUsers: room.currentUsers,
		maxUsers: room.maxUsers
	}))
}

export const DEFAULT_ROOM_ID = defaultRoomData.id
