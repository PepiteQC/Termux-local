/**
 * Structure du bundle.json généré par scripts/habbo-extract.mjs.
 * Représente les données extraites d'un SWF Habbo officiel.
 */

export interface HabboAssetRef {
  x: number
  y: number
  /** Nom d'un autre asset dont on réutilise le PNG (ex: miroir horizontal). */
  source?: string
  flipH: boolean
}

export interface HabboVisualizationLayer {
  z: number
  tag?: string
  ink?: string
  alpha?: number
  ignoreMouse: boolean
  color?: string
}

export interface HabboVisualizationDirectionLayer {
  z?: number
  x?: number
  y?: number
}

export interface HabboVisualizationSize {
  layerCount: number
  angle: number
  layers: Record<string, HabboVisualizationLayer>
  directions: Record<string, Record<string, HabboVisualizationDirectionLayer>>
}

export interface HabboLogicDimensions {
  x: number
  y: number
  z: number
}

export interface HabboFurniBundle {
  className: string
  assets: Record<string, HabboAssetRef>
  visualization: Record<string, HabboVisualizationSize>
  logic: {
    dimensions?: HabboLogicDimensions
    directions?: number[]
  }
  index: { type?: string; visualization?: string; logic?: string } | null
  imageList: string[]
}

/** Mappe l'id numérique d'un layer à son code alphabétique (0='a', 1='b', ...). */
export function layerIdToLetter(id: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + id)
}
