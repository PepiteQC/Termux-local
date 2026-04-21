import type {
	AvatarGender,
	FigurePartLayer,
	ParsedFigure
} from './types/AvatarTypes'

import { normalizeGender } from './utils/figure'
import { parseFigureString } from './parsers/parseFigureString'
import FigureMapIndex, { type FigureMapFile } from './parsers/FigureMapIndex'

export default class AvatarFigure {
	private readonly mapIndex: FigureMapIndex

	public constructor(figureMapData: FigureMapFile) {
		this.mapIndex = new FigureMapIndex(figureMapData)
	}

	public parse(rawFigure: string, gender: AvatarGender = 'U'): ParsedFigure {
		const selections = parseFigureString(rawFigure)
		const layers: FigurePartLayer[] = []

		for (const selection of Object.values(selections)) {
			const libs = this.mapIndex.getLibrariesBySetId(selection.setId)

			for (const lib of libs) {
				for (const part of lib.parts ?? []) {
					if (part.id !== selection.setId) continue

					layers.push({
						libId: lib.id,
						partId: part.id,
						partType: part.type,
						revision: lib.revision,
						category: selection.category,
						setId: selection.setId,
						colorIds: selection.colorIds
					})
				}
			}
		}

		return {
			raw: rawFigure,
			gender: normalizeGender(gender),
			selections,
			layers: this.sortLayers(layers)
		}
	}

	private sortLayers(layers: FigurePartLayer[]): FigurePartLayer[] {
		const priority: Record<string, number> = {
			bd: 0,
			hd: 5,
			fa: 10,
			ea: 12,
			ha: 15,
			he: 18,
			hr: 20,
			ch: 30,
			cc: 35,
			cp: 36,
			ca: 37,
			lh: 40,
			rh: 41,
			ls: 45,
			rs: 46,
			lc: 50,
			rc: 51,
			wa: 55,
			lg: 60,
			sh: 70
		}

		return [...layers].sort((a, b) => {
			const pa = priority[a.partType] ?? 999
			const pb = priority[b.partType] ?? 999

			if (pa !== pb) return pa - pb
			if (a.category !== b.category) return a.category.localeCompare(b.category)
			return a.libId.localeCompare(b.libId)
		})
	}
}
