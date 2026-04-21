import type RoomData from './RoomData'

const defaultRoomData: RoomData = {
	allowPets: false,
	allowPetsEating: false,
	category: 'premium-suite',
	currentUsers: 1,
	description: 'EtherWorld premium room renderer',
	floorThickness: 10,
	hideWalls: false,
	hideWired: false,
	id: 'etherworld-room-main',
	initialZoom: 2.05,
	map: {
		room: [
			'0000000000',
			'0000000000',
			'0000000000',
			'0000000000',
			'0000000000',
			'0000000000',
			'0000000000',
			'0000000000'
		]
	},
	maxUsers: 25,
	name: 'EtherWorld Suite',
	type: 'Suite',
	wallHeight: 5,
	wallThickness: 6,
	avatars: [
		{
			id: 'local-avatar',
			username: 'EtherUser',
			motto: 'Pixel room preview',
			x: 2,
			y: 6,
			look: {
				hair: '/sprites/avatar/hair/hair-braids.png',
				shirt: '/sprites/avatar/shirt/shirt-tshirt.png',
				jacket: '/sprites/avatar/jacket/jacket-bomber.png',
				pants: '/sprites/avatar/pants/pants-shorts.png',
				shoes: '/sprites/avatar/shoes/shoes-hi-tops.png'
			}
		}
	],
	furnitures: [
		{
			id: 'sofa-main',
			label: 'Corner Sofa',
			kind: 'sofa',
			x: 2,
			y: 2,
			width: 2,
			depth: 1,
			height: 1,
			palette: 'plum',
			accent: 0xd7c8ff,
			habboClassName: 'club_sofa',
			habboDirection: 2
		},
		{
			id: 'coffee-table',
			label: 'Coffee Table',
			kind: 'table',
			x: 4,
			y: 2,
			width: 2,
			depth: 2,
			height: 1,
			palette: 'oak',
			accent: 0xe3c08e,
			habboClassName: 'table_polyfon',
			habboDirection: 2
		},
		{
			id: 'royal-bed',
			label: 'Bed',
			kind: 'bed',
			x: 6,
			y: 1,
			width: 2,
			depth: 3,
			height: 1,
			palette: 'ember',
			accent: 0xf1d6df,
			habboClassName: 'bed_polyfon',
			habboDirection: 2
		},
		{
			id: 'desk-shelf',
			label: 'Bookshelf',
			kind: 'shelf',
			x: 1,
			y: 5,
			width: 1,
			depth: 1,
			height: 1,
			palette: 'oak',
			accent: 0xc9a779,
			habboClassName: 'shelves_norja',
			habboDirection: 2
		},
		{
			id: 'screen-flat',
			label: 'Screen',
			kind: 'screen',
			x: 2,
			y: 5,
			width: 1,
			depth: 1,
			height: 2,
			palette: 'slate',
			accent: 0x69dfff
		},
		{
			id: 'floor-lamp',
			label: 'Lamp',
			kind: 'lamp',
			x: 8,
			y: 2,
			width: 1,
			depth: 1,
			height: 2,
			palette: 'gold',
			accent: 0xfff1b1,
			habboClassName: 'rare_dragonlamp',
			habboDirection: 2
		},
		{
			id: 'plant-tall',
			label: 'Plant',
			kind: 'plant',
			x: 8,
			y: 5,
			width: 1,
			depth: 1,
			height: 2,
			palette: 'leaf',
			accent: 0x6fd188,
			habboClassName: 'plant_yukka',
			habboDirection: 2
		},
		{
			id: 'main-rug',
			label: 'Rug',
			kind: 'rug',
			x: 3,
			y: 4,
			width: 2,
			depth: 2,
			height: 0,
			palette: 'sand',
			accent: 0xf3ead2,
			walkable: true,
			habboClassName: 'rare_daffodil_rug',
			habboDirection: 2
		}
	]
}

export default defaultRoomData
