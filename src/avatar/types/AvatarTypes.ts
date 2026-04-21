export type AvatarGender = 'M' | 'F' | 'U'

export interface FigurePartSelection {
	category: string
	setId: number
	colorIds: number[]
}

export interface FigurePartLayer {
	libId: string
	partId: number
	partType: string
	revision?: number
	category: string
	setId: number
	colorIds: number[]
}

export interface ParsedFigure {
	raw: string
	gender: AvatarGender
	selections: Record<string, FigurePartSelection>
	layers: FigurePartLayer[]
}
