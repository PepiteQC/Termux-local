import type { FigurePartSelection } from '../types/AvatarTypes'
import { safeNumber } from '../utils/figure'

export function parseFigureString(figure: string): Record<string, FigurePartSelection> {
	const selections: Record<string, FigurePartSelection> = {}

	if (!figure || typeof figure !== 'string') {
		return selections
	}

	const chunks = figure
		.split('.')
		.map((part) => part.trim())
		.filter(Boolean)

	for (const chunk of chunks) {
		const tokens = chunk.split('-').filter(Boolean)

		if (tokens.length < 2) {
			continue
		}

		const category = tokens[0]
		const setId = safeNumber(tokens[1], 0)
		const colorIds = tokens.slice(2).map((v) => safeNumber(v, 0)).filter((v) => v > 0)

		selections[category] = {
			category,
			setId,
			colorIds
		}
	}

	return selections
}
