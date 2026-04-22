/**
 * Habbo avatar figurestring helpers + imaging URL builder.
 *
 * Reference :
 *   https://www.habbo.com/habbo-imaging/avatarimage
 *
 * A figurestring is a dot-separated list of `<category>-<setId>-<colorId>[-<colorId2>]`
 * tokens. Categories used by the Habbo client include :
 *   hr (hair)         hd (head)        ch (chest / shirt)
 *   lg (legs)         sh (shoes)       ha (hat)
 *   he (head accessory)               ea (eye accessory)
 *   fa (face accessory)               ca (chest accessory)
 *   wa (waist accessory)              cc (chest piece / jacket)
 *   cp (chest print)
 */

export type HabboDirection = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type HabboAction =
	| "std"
	| "wlk"
	| "sit"
	| "lay"
	| "wav"
	| "crr"
	| "drk"

export type HabboGesture = "nrm" | "sml" | "srp" | "agr" | "sad" | "eyb" | "spk"

export type HabboSize = "s" | "m" | "l"

export interface HabboAvatarOptions {
	figure: string
	direction?: HabboDirection
	headDirection?: HabboDirection
	action?: HabboAction | HabboAction[]
	gesture?: HabboGesture
	size?: HabboSize
	frame?: number
	headOnly?: boolean
}

/**
 * Default Habbo figurestring used when no per-avatar look is provided yet.
 * Picked to render a recognisable, neutral male avatar for previews.
 */
export const DEFAULT_HABBO_FIGURE =
	"hr-100-61.hd-180-1.ch-210-66.lg-270-82.sh-290-80"

const HABBO_IMAGING_ENDPOINT =
	"https://www.habbo.com/habbo-imaging/avatarimage"

/**
 * Build the Habbo avatar imaging URL.
 *
 * The upstream service mirrors the request `Origin` header back in
 * `Access-Control-Allow-Origin`, so the resulting PNG can be loaded
 * directly as a Pixi WebGL texture without any proxy.
 */
export function buildHabboAvatarUrl(opts: HabboAvatarOptions): string {
	const params = new URLSearchParams()
	params.set("figure", opts.figure || DEFAULT_HABBO_FIGURE)

	if (opts.direction !== undefined) params.set("direction", String(opts.direction))
	if (opts.headDirection !== undefined)
		params.set("head_direction", String(opts.headDirection))

	if (opts.action) {
		const value = Array.isArray(opts.action) ? opts.action.join(",") : opts.action
		params.set("action", value)
	}
	if (opts.gesture) params.set("gesture", opts.gesture)
	if (opts.size) params.set("size", opts.size)
	if (opts.frame !== undefined) params.set("frame", String(opts.frame))
	if (opts.headOnly) params.set("headonly", "1")

	params.set("img_format", "png")

	return `${HABBO_IMAGING_ENDPOINT}?${params.toString()}`
}

/**
 * Map an internal 0..7 direction (Habbo convention : 0 = south, going CCW)
 * to itself, but exposed as a typed helper to make AvatarSprite code clearer.
 */
export function clampDirection(value: number): HabboDirection {
	const n = ((Math.round(value) % 8) + 8) % 8
	return n as HabboDirection
}
