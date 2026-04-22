/**
 * EtherCristal wardrobe system.
 * Les options viennent des assets officiels présents dans le projet,
 * mais tout le branding visible côté interface doit rester EtherCristal.
 */

import type { HabboDirection } from "./figure"
import { buildHabboAvatarUrl } from "./figure"
import {
        GENERATED_HAIRS,
        GENERATED_HEADS,
        GENERATED_SHIRTS,
        GENERATED_PANTS,
        GENERATED_SHOES
} from "./wardrobe.generated"

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
        { id: 1, hex: "#f5da88", label: "Sable" },
        { id: 2, hex: "#fffab8", label: "Or pâle" },
        { id: 7, hex: "#f5c9a1", label: "Pêche" },
        { id: 8, hex: "#c88f5f", label: "Caramel" },
        { id: 9, hex: "#9a6a46", label: "Noisette" },
        { id: 12, hex: "#5b3115", label: "Cacao" },
        { id: 19, hex: "#1e1109", label: "Ébène" },
        { id: 21, hex: "#cc3a3a", label: "Rouge Ether" },
        { id: 26, hex: "#d86a8e", label: "Rose pulse" },
        { id: 31, hex: "#e87b39", label: "Orange flare" },
        { id: 42, hex: "#3e822f", label: "Forêt" },
        { id: 45, hex: "#7fb43c", label: "Lime" },
        { id: 61, hex: "#332a2a", label: "Noir chaud" },
        { id: 66, hex: "#c7272c", label: "Crimson" },
        { id: 80, hex: "#4fb4cc", label: "Cyan" },
        { id: 82, hex: "#2c5ea2", label: "Bleu Ether" },
        { id: 92, hex: "#552a82", label: "Violet" },
        { id: 100, hex: "#af3d8a", label: "Magenta" },
        { id: 120, hex: "#1e1e1e", label: "Noir" },
        { id: 143, hex: "#2f4531", label: "Sapin" }
]

export const HAIRS: Record<Gender, FigureSet[]> = {
        M: [...GENERATED_HAIRS.M],
        F: [...GENERATED_HAIRS.F]
}

export const HEADS: Record<Gender, FigureSet[]> = {
        M: [...GENERATED_HEADS.M],
        F: [...GENERATED_HEADS.F]
}

export const SHIRTS: Record<Gender, FigureSet[]> = {
        M: [...GENERATED_SHIRTS.M],
        F: [...GENERATED_SHIRTS.F]
}

export const PANTS: Record<Gender, FigureSet[]> = {
        M: [...GENERATED_PANTS.M],
        F: [...GENERATED_PANTS.F]
}

export const SHOES: Record<Gender, FigureSet[]> = {
        M: [...GENERATED_SHOES.M],
        F: [...GENERATED_SHOES.F]
}

function firstSet(list: FigureSet[] | readonly FigureSet[], fallback: number): number {
        return Number(list?.[0]?.id ?? fallback)
}

export const DEFAULT_SELECTION: Record<Gender, FigureSelection> = {
        M: {
                hr: { set: firstSet(HAIRS.M, 100), color1: 61 },
                hd: { set: firstSet(HEADS.M, 180), color1: 7 },
                ch: { set: firstSet(SHIRTS.M, 210), color1: 66 },
                lg: { set: firstSet(PANTS.M, 270), color1: 82 },
                sh: { set: firstSet(SHOES.M, 290), color1: 80 },
                ha: { set: 0, color1: 0 },
                fa: { set: 0, color1: 0 }
        },
        F: {
                hr: { set: firstSet(HAIRS.F, 515), color1: 31 },
                hd: { set: firstSet(HEADS.F, 600), color1: 7 },
                ch: { set: firstSet(SHIRTS.F, 630), color1: 100 },
                lg: { set: firstSet(PANTS.F, 695), color1: 82 },
                sh: { set: firstSet(SHOES.F, 725), color1: 80 },
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
