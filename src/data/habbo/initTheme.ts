import { HabboThemeVisualizer } from './HabboThemeVisualizer'

export function initializeHabboTheme(): void {
	if (typeof window !== 'undefined') {
		HabboThemeVisualizer.logThemeStatus()
	}
}
