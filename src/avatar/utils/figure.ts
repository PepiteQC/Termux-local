export function normalizeGender(gender?: string): 'M' | 'F' | 'U' {
	if (!gender) return 'U'

	const value = gender.trim().toUpperCase()

	if (value === 'M') return 'M'
	if (value === 'F') return 'F'

	return 'U'
}

export function safeNumber(value: string | undefined, fallback = 0): number {
	if (!value) return fallback

	const n = Number.parseInt(value, 10)
	return Number.isFinite(n) ? n : fallback
}
