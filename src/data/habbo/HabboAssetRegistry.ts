import visualShortlist from './visual-shortlist.json'
import activeTheme from './active-room-theme.json'

export interface AssetInfo {
	name: string
	category: 'floor' | 'wall' | 'window' | 'rug'
	filename: string
	path: string
	isActive: boolean
}

class HabboAssetRegistry {
	private assetMap: Map<string, AssetInfo> = new Map()
	private activeFloor: string = (activeTheme as any).floor || 'steampunk_floor2'
	private activeWall: string = (activeTheme as any).wall || 'paris_c15_wall'
	private activeRug: string = (activeTheme as any).rug || 'gothic_carpet'
	private activeWindow: string = (activeTheme as any).window || 'window_nt_skyscraper'

	constructor() {
		this.registerAssets()
	}

	private registerAssets() {
		const floors = (visualShortlist as any).floors || []
		const walls = (visualShortlist as any).walls || []
		const windows = (visualShortlist as any).windows || []

		floors.forEach((name: string) => {
			this.assetMap.set(name, {
				name,
				category: 'floor',
				filename: `${name}.swf`,
				path: `/habbo-selected/floors/${name}.swf`,
				isActive: name === this.activeFloor
			})
		})

		floors.forEach((name: string) => {
			if (name === this.activeRug) {
				this.assetMap.set(`${name}_rug`, {
					name,
					category: 'rug',
					filename: `${name}.swf`,
					path: `/habbo-selected/floors/${name}.swf`,
					isActive: true
				})
			}
		})

		walls.forEach((name: string) => {
			this.assetMap.set(name, {
				name,
				category: 'wall',
				filename: `${name}.swf`,
				path: `/habbo-selected/walls/${name}.swf`,
				isActive: name === this.activeWall
			})
		})

		windows.forEach((name: string) => {
			this.assetMap.set(name, {
				name,
				category: 'window',
				filename: `${name}.swf`,
				path: `/habbo-selected/windows/${name}.swf`,
				isActive: name === this.activeWindow
			})
		})
	}

	public getAsset(name: string): AssetInfo | undefined {
		return this.assetMap.get(name)
	}

	public getActiveFloor(): AssetInfo | undefined {
		return this.assetMap.get(this.activeFloor)
	}

	public getActiveWall(): AssetInfo | undefined {
		return this.assetMap.get(this.activeWall)
	}

	public getActiveRug(): AssetInfo | undefined {
		return this.assetMap.get(`${this.activeRug}_rug`)
	}

	public getActiveWindow(): AssetInfo | undefined {
		return this.assetMap.get(this.activeWindow)
	}

	public getAssetsByCategory(category: 'floor' | 'wall' | 'window' | 'rug'): AssetInfo[] {
		return Array.from(this.assetMap.values()).filter(asset => asset.category === category)
	}

	public getAllActiveAssets(): {
		floor: AssetInfo | undefined
		wall: AssetInfo | undefined
		rug: AssetInfo | undefined
		window: AssetInfo | undefined
	} {
		return {
			floor: this.getActiveFloor(),
			wall: this.getActiveWall(),
			rug: this.getActiveRug(),
			window: this.getActiveWindow()
		}
	}
}

export const assetRegistry = new HabboAssetRegistry()
