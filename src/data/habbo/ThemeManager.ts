import activeTheme from './active-room-theme.json'

export interface TilePalette {
	topColor: number
	topStroke: number
	southColor: number
	southStroke: number
	eastColor: number
	eastStroke: number
	highlight1: number
	innerDetail1: number
	innerDetail2: number
	shadowAccent: number
}

const PALETTES: Record<string, TilePalette> = {
	steampunk_floor2: {
		topColor: 0x2a241b,
		topStroke: 0x5c4a3b,
		southColor: 0x1a140f,
		southStroke: 0x6b5645,
		eastColor: 0x141008,
		eastStroke: 0x5a4835,
		highlight1: 0xe8b856,
		innerDetail1: 0x6d5a47,
		innerDetail2: 0x4a3f32,
		shadowAccent: 0x1c1612
	},
	rainyday_c20_woodenfloor: {
		topColor: 0x5c4528,
		topStroke: 0x8a6840,
		southColor: 0x3f2d1d,
		southStroke: 0x6d5435,
		eastColor: 0x2f2415,
		eastStroke: 0x5c4733,
		highlight1: 0xd4a563,
		innerDetail1: 0x7a5c38,
		innerDetail2: 0x524035,
		shadowAccent: 0x3a2d20
	},
	pixel_floor_brown: {
		topColor: 0x6a4a2a,
		topStroke: 0x8a6842,
		southColor: 0x4e3620,
		southStroke: 0x73583a,
		eastColor: 0x3b2815,
		eastStroke: 0x62482a,
		highlight1: 0xead8a8,
		innerDetail1: 0x7d5a35,
		innerDetail2: 0x5a4328,
		shadowAccent: 0x3d2f20
	},
	gothic_carpet: {
		topColor: 0x1f1419,
		topStroke: 0x5c3a47,
		southColor: 0x140b0f,
		southStroke: 0x4a2a38,
		eastColor: 0x0d0709,
		eastStroke: 0x3d2230,
		highlight1: 0xc97a95,
		innerDetail1: 0x5d3342,
		innerDetail2: 0x3a2230,
		shadowAccent: 0x1a0f14
	},
	hs_carpet_blk: {
		topColor: 0x1a1a1a,
		topStroke: 0x454545,
		southColor: 0x0f0f0f,
		southStroke: 0x383838,
		eastColor: 0x0a0a0a,
		eastStroke: 0x303030,
		highlight1: 0xb4b4b4,
		innerDetail1: 0x4b4b4b,
		innerDetail2: 0x2d2d2d,
		shadowAccent: 0x0d0d0d
	},
	val14_largetile: {
		topColor: 0xccbbaa,
		topStroke: 0x9b8f7e,
		southColor: 0xa39080,
		southStroke: 0x8a7a6a,
		eastColor: 0x8f7b68,
		eastStroke: 0x7a6a5a,
		highlight1: 0xf5f5f0,
		innerDetail1: 0xbcaa98,
		innerDetail2: 0x9d8b7a,
		shadowAccent: 0xa59480
	},
	tiki_junglerug: {
		topColor: 0x2a4020,
		topStroke: 0x669555,
		southColor: 0x1f3018,
		southStroke: 0x4a7240,
		eastColor: 0x172410,
		eastStroke: 0x3e5f35,
		highlight1: 0xc6db8e,
		innerDetail1: 0x5e7d49,
		innerDetail2: 0x3d5c30,
		shadowAccent: 0x1a2c15
	},
	env_grass: {
		topColor: 0x3f6a28,
		topStroke: 0x7a9c50,
		southColor: 0x2d5020,
		southStroke: 0x5a8240,
		eastColor: 0x1f3818,
		eastStroke: 0x4a6f38,
		highlight1: 0xd9f0b8,
		innerDetail1: 0x638d49,
		innerDetail2: 0x3f6a28,
		shadowAccent: 0x2a4a1f
	},
	suncity_c19_floor: {
		topColor: 0x944c28,
		topStroke: 0xc4874e,
		southColor: 0x6a3a20,
		southStroke: 0x9a6040,
		eastColor: 0x523018,
		eastStroke: 0x824a30,
		highlight1: 0xffd39d,
		innerDetail1: 0x925f31,
		innerDetail2: 0x6a4825,
		shadowAccent: 0x5a3f22
	}
}

export function getThemePalette(): TilePalette {
	const floorKey = (activeTheme as { floor?: string }).floor || 'steampunk_floor2'
	return PALETTES[floorKey] ?? PALETTES.steampunk_floor2
}
