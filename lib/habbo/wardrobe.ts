/**
 * Curated Habbo figure parts + palette for the character creator and the
 * in-game wardrobe. Values are official Habbo setIds / palette ids taken
 * from `public/habbo-assets/gamedata/figuredata.xml`, restricted to a
 * small, recognisable subset so we don't overwhelm the user.
 */

import type { HabboDirection } from "./figure"
import { buildHabboAvatarUrl } from "./figure"

export type Gender = "M" | "F"

export type FigurePart = "hr" | "hd" | "ch" | "lg" | "sh" | "ha" | "fa"

export interface FigureSet {
	id: number
	label: string
	gender?: Gender | "U"
	colorable?: boolean
}

export type FigureSelection = Record<FigurePart, { set: number; color1: number; color2?: number }>

export const PALETTE: Array<{ id: number; hex: string; label: string }> = [
	{ id: 1, hex: "#f5da88", label: "Paille" },
	{ id: 2, hex: "#fffab8", label: "Ambre" },
	{ id: 7, hex: "#f5c9a1", label: "Pêche" },
	{ id: 8, hex: "#c88f5f", label: "Caramel" },
	{ id: 9, hex: "#9a6a46", label: "Noisette" },
	{ id: 12, hex: "#5b3115", label: "Cacao" },
	{ id: 19, hex: "#1e1109", label: "Ébène" },
	{ id: 21, hex: "#cc3a3a", label: "Rouge" },
	{ id: 26, hex: "#d86a8e", label: "Rose" },
	{ id: 31, hex: "#e87b39", label: "Orange" },
	{ id: 42, hex: "#3e822f", label: "Forêt" },
	{ id: 45, hex: "#7fb43c", label: "Lime" },
	{ id: 61, hex: "#332a2a", label: "Noir chaud" },
	{ id: 66, hex: "#c7272c", label: "Cerise" },
	{ id: 80, hex: "#4fb4cc", label: "Cyan" },
	{ id: 82, hex: "#2c5ea2", label: "Bleu" },
	{ id: 92, hex: "#552a82", label: "Violet" },
	{ id: 100, hex: "#af3d8a", label: "Magenta" },
	{ id: 120, hex: "#1e1e1e", label: "Noir" },
	{ id: 143, hex: "#2f4531", label: "Sapin" }
]

// Hair — mix of male / female / unisex sets from Habbo catalog
export const HAIRS: Record<Gender, FigureSet[]> = {
	M: [
		{ id: 100, label: "Classique" },
		{ id: 125, label: "Rockabilly" },
		{ id: 140, label: "Ébouriffé" },
		{ id: 165, label: "Mohawk" },
		{ id: 180, label: "Court" },
		{ id: 190, label: "Undercut" },
		{ id: 802, label: "Bonnet" },
		{ id: 828, label: "Casquette" },
		{ id: 3163, label: "Skater" }
	],
	F: [
		{ id: 500, label: "Carré" },
		{ id: 515, label: "Long" },
		{ id: 525, label: "Tresses" },
		{ id: 535, label: "Frange" },
		{ id: 565, label: "Queue" },
		{ id: 570, label: "Court" },
		{ id: 580, label: "Boucles" },
		{ id: 585, label: "Mèches" },
		{ id: 595, label: "Punk" }
	]
}

export const HEADS: Record<Gender, FigureSet[]> = {
	M: [
		{ id: 180, label: "Visage A" },
		{ id: 185, label: "Visage B" },
		{ id: 190, label: "Visage C" },
		{ id: 195, label: "Visage D" },
		{ id: 206, label: "Visage E" },
		{ id: 209, label: "Visage F" }
	],
	F: [
		{ id: 600, label: "Visage A" },
		{ id: 605, label: "Visage B" },
		{ id: 610, label: "Visage C" },
		{ id: 615, label: "Visage D" },
		{ id: 625, label: "Visage E" },
		{ id: 627, label: "Visage F" }
	]
}

export const SHIRTS: Record<Gender, FigureSet[]> = {
	M: [
		{ id: 210, label: "T-shirt" },
		{ id: 215, label: "Col V" },
		{ id: 220, label: "Polo" },
		{ id: 225, label: "Chemise" },
		{ id: 255, label: "Hoodie" },
		{ id: 260, label: "Veste" },
		{ id: 262, label: "Bomber" },
		{ id: 265, label: "Sweat" },
		{ id: 3030, label: "Débardeur" }
	],
	F: [
		{ id: 630, label: "T-shirt" },
		{ id: 635, label: "Col V" },
		{ id: 645, label: "Débardeur" },
		{ id: 655, label: "Chemisier" },
		{ id: 665, label: "Pull" },
		{ id: 675, label: "Crop top" },
		{ id: 685, label: "Veste" },
		{ id: 690, label: "Hoodie" }
	]
}

export const PANTS: Record<Gender, FigureSet[]> = {
	M: [
		{ id: 270, label: "Jean" },
		{ id: 275, label: "Chino" },
		{ id: 280, label: "Jogger" },
		{ id: 281, label: "Short" },
		{ id: 285, label: "Cargo" },
		{ id: 290, label: "Pantalon" },
		{ id: 3116, label: "Slim" }
	],
	F: [
		{ id: 695, label: "Jean" },
		{ id: 700, label: "Jupe" },
		{ id: 705, label: "Short" },
		{ id: 710, label: "Legging" },
		{ id: 715, label: "Pantalon" },
		{ id: 716, label: "Jogger" }
	]
}

// Shoes are gender-specific in figuredata.xml — male 290-305 don't exist
// for F, female 725-740 don't exist for M. 905 and 906 are unisex (gender=U)
// and kept in both lists.
export const SHOES: Record<Gender, FigureSet[]> = {
	M: [
		{ id: 290, label: "Baskets" },
		{ id: 295, label: "Running" },
		{ id: 300, label: "Bottines" },
		{ id: 305, label: "Mocassins" },
		{ id: 905, label: "Sandales" },
		{ id: 906, label: "Bottes" },
		{ id: 908, label: "Chic" }
	],
	F: [
		{ id: 725, label: "Baskets" },
		{ id: 730, label: "Bottes" },
		{ id: 735, label: "Bottines" },
		{ id: 740, label: "Mocassins" },
		{ id: 905, label: "Sandales" },
		{ id: 906, label: "Talons" },
		{ id: 907, label: "Escarpins" }
	]
}

export const DEFAULT_SELECTION: Record<Gender, FigureSelection> = {
	M: {
		hr: { set: 100, color1: 61 },
		hd: { set: 180, color1: 7 },
		ch: { set: 210, color1: 66 },
		lg: { set: 270, color1: 82 },
		sh: { set: 290, color1: 80 },
		ha: { set: 0, color1: 0 },
		fa: { set: 0, color1: 0 }
	},
	F: {
		hr: { set: 515, color1: 31 },
		hd: { set: 600, color1: 7 },
		ch: { set: 630, color1: 100 },
		lg: { set: 695, color1: 82 },
		sh: { set: 725, color1: 80 },
		ha: { set: 0, color1: 0 },
		fa: { set: 0, color1: 0 }
	}
}

export function selectionToFigurestring(selection: FigureSelection): string {
	const parts: string[] = []
	const order: FigurePart[] = ["hr", "hd", "ch", "lg", "sh", "ha", "fa"]
	for (const key of order) {
		const piece = selection[key]
		if (!piece || piece.set === 0) continue
		const tokens = [key, String(piece.set), String(piece.color1)]
		if (piece.color2 && piece.color2 > 0) tokens.push(String(piece.color2))
		parts.push(tokens.join("-"))
	}
	return parts.join(".")
}

/**
 * Parse a Habbo figurestring back into the structured selection shape so we
 * can seed the wardrobe UI from a persisted value.
 */
export function figurestringToSelection(
	figure: string,
	fallback: FigureSelection
): FigureSelection {
	const next: FigureSelection = JSON.parse(JSON.stringify(fallback))
	if (!figure) return next
	for (const chunk of figure.split(".")) {
		const [part, setId, color1, color2] = chunk.split("-")
		if (!part || !setId) continue
		if (!(part in next)) continue
		const key = part as FigurePart
		next[key] = {
			set: Number(setId) || 0,
			color1: Number(color1) || 0,
			color2: color2 ? Number(color2) : undefined
		}
	}
	return next
}

export function previewAvatarUrl(
	figurestring: string,
	direction: HabboDirection = 2,
	size: "s" | "m" | "l" = "l"
): string {
	return buildHabboAvatarUrl({
		figure: figurestring,
		direction,
		headDirection: direction,
		action: "std",
		gesture: "nrm",
		size
	})
}
