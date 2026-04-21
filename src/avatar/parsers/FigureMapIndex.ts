export interface FigureMapPart {
	id: number
	type: string
}

export interface FigureMapLibrary {
	id: string
	revision?: number
	parts: FigureMapPart[]
}

export interface FigureMapFile {
	libraries: FigureMapLibrary[]
}

export default class FigureMapIndex {
	private readonly libraries: FigureMapLibrary[]
	private readonly bySetId: Map<number, FigureMapLibrary[]>
	private readonly byLibId: Map<string, FigureMapLibrary>

	public constructor(data: FigureMapFile) {
		this.libraries = Array.isArray(data?.libraries) ? data.libraries : []
		this.bySetId = new Map()
		this.byLibId = new Map()

		this.buildIndexes()
	}

	private buildIndexes(): void {
		for (const lib of this.libraries) {
			if (!lib?.id) continue

			this.byLibId.set(lib.id, lib)

			const setIds = new Set<number>()

			for (const part of lib.parts ?? []) {
				if (typeof part?.id === 'number') {
					setIds.add(part.id)
				}
			}

			for (const setId of setIds) {
				const current = this.bySetId.get(setId) ?? []
				current.push(lib)
				this.bySetId.set(setId, current)
			}
		}
	}

	public getLibrariesBySetId(setId: number): FigureMapLibrary[] {
		return this.bySetId.get(setId) ?? []
	}

	public getLibraryById(libId: string): FigureMapLibrary | undefined {
		return this.byLibId.get(libId)
	}

	public getAllLibraries(): FigureMapLibrary[] {
		return this.libraries
	}
}
