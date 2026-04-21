import activeTheme from './active-room-theme.json'
import { assetRegistry } from './HabboAssetRegistry'
import { getThemePalette } from './ThemeManager'
import { getWallPalette } from './WallPaletteManager'

export class HabboThemeVisualizer {
	static getThemeStatus(): Record<string, any> {
		const assets = assetRegistry.getAllActiveAssets()
		const tilePalette = getThemePalette()
		const wallPalette = getWallPalette()

		return {
			activeTheme: activeTheme,
			assets: {
				floor: assets.floor?.name || 'not set',
				wall: assets.wall?.name || 'not set',
				rug: assets.rug?.name || 'not set',
				window: assets.window?.name || 'not set'
			},
			tilePalette: {
				topColor: `#${tilePalette.topColor.toString(16).padStart(6, '0')}`,
				southColor: `#${tilePalette.southColor.toString(16).padStart(6, '0')}`,
				eastColor: `#${tilePalette.eastColor.toString(16).padStart(6, '0')}`
			},
			wallPalette: {
				eastMain: `#${wallPalette.eastMain.toString(16).padStart(6, '0')}`,
				southMain: `#${wallPalette.southMain.toString(16).padStart(6, '0')}`
			}
		}
	}

	static logThemeStatus(): void {
		const status = this.getThemeStatus()
		console.log('═══════════════════════════════════════════════════')
		console.log('🎨 ETHERWORLD HABBO-LIKE THEME STATUS')
		console.log('═══════════════════════════════════════════════════')
		console.log('📍 Active Theme:', JSON.stringify(status.activeTheme, null, 2))
		console.log('🏠 Assets:', status.assets)
		console.log('🎨 Tile Palette:', status.tilePalette)
		console.log('🧱 Wall Palette:', status.wallPalette)
		console.log('═══════════════════════════════════════════════════')
	}
}
