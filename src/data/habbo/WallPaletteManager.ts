import activeTheme from './active-room-theme.json'

export interface WallPalette {
	eastMain: number
	eastEdge: number
	eastStroke: number
	eastEdgeStroke: number
	eastDetail: number
	southMain: number
	southEdge: number
	southStroke: number
	southEdgeStroke: number
	southDetail: number
	shadowLine: number
}

const WALL_PALETTES: Record<string, WallPalette> = {
	paris_c15_wall: {
		eastMain: 0xbbb5ca,
		eastEdge: 0xe3ddef,
		eastStroke: 0x756d84,
		eastEdgeStroke: 0x9990aa,
		eastDetail: 0x8b839b,
		southMain: 0x9f97b2,
		southEdge: 0xd3cbdf,
		southStroke: 0x61586f,
		southEdgeStroke: 0x887f96,
		southDetail: 0x6f667f,
		shadowLine: 0x524a60
	},
	anc_c15_wall: {
		eastMain: 0xa89089,
		eastEdge: 0xd4cac5,
		eastStroke: 0x6a6258,
		eastEdgeStroke: 0x8b8178,
		eastDetail: 0x7a726a,
		southMain: 0x8a7a6a,
		southEdge: 0xbbada8,
		southStroke: 0x4a4238,
		southEdgeStroke: 0x6a6258,
		southDetail: 0x5a5248,
		shadowLine: 0x3d3530
	},
	tiki_c15_wall: {
		eastMain: 0xa88a5a,
		eastEdge: 0xdac0a8,
		eastStroke: 0x6a5238,
		eastEdgeStroke: 0x8a7058,
		eastDetail: 0x7a6248,
		southMain: 0x8a7248,
		southEdge: 0xbbaa8a,
		southStroke: 0x4a3a28,
		southEdgeStroke: 0x6a5a40,
		southDetail: 0x5a4a38,
		shadowLine: 0x3d3022
	},
	bling_c15_wall: {
		eastMain: 0xd4baa8,
		eastEdge: 0xebe5dc,
		eastStroke: 0x8a7668,
		eastEdgeStroke: 0xa89aa8,
		eastDetail: 0x9a8a98,
		southMain: 0xbbaa98,
		southEdge: 0xdcccc4,
		southStroke: 0x6a5a50,
		southEdgeStroke: 0x8a7a70,
		southDetail: 0x7a6a60,
		shadowLine: 0x4d4640
	},
	exe_c15_wall: {
		eastMain: 0xb5a398,
		eastEdge: 0xdcd4cb,
		eastStroke: 0x746a5f,
		eastEdgeStroke: 0x958b80,
		eastDetail: 0x85796f,
		southMain: 0x9a8878,
		southEdge: 0xcbbdb5,
		southStroke: 0x5a5045,
		southEdgeStroke: 0x7a6a60,
		southDetail: 0x6a5a50,
		shadowLine: 0x4a4035
	},
	romantique_c15_wall: {
		eastMain: 0xc9b4a8,
		eastEdge: 0xeae0d8,
		eastStroke: 0x8a7568,
		eastEdgeStroke: 0xa99a88,
		eastDetail: 0x9a8578,
		southMain: 0xb0a098,
		southEdge: 0xdbcdc5,
		southStroke: 0x6a5a50,
		southEdgeStroke: 0x8a7a70,
		southDetail: 0x7a6a60,
		shadowLine: 0x4d4638
	},
	gold_c15_arc_icewall: {
		eastMain: 0xc4b5a8,
		eastEdge: 0xeae8e0,
		eastStroke: 0x7a7068,
		eastEdgeStroke: 0x9a9088,
		eastDetail: 0x8a8078,
		southMain: 0xaba098,
		southEdge: 0xdcdad2,
		southStroke: 0x5a5048,
		southEdgeStroke: 0x7a7068,
		southDetail: 0x6a6058,
		shadowLine: 0x454038
	}
}

export function getWallPalette(): WallPalette {
	const wallKey = (activeTheme as { wall?: string }).wall || 'paris_c15_wall'
	return WALL_PALETTES[wallKey] ?? WALL_PALETTES.paris_c15_wall
}
