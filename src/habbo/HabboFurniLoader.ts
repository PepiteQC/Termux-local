import { Assets, Container, Sprite, Texture } from 'pixi.js'
import type { HabboFurniBundle } from './HabboFurniBundle'

const BUNDLE_CACHE = new Map<string, Promise<HabboFurniBundle | null>>()

const BASE_PATHS = [
  '/habbo-extracted',
  '/habbo-assets',
  '/habbo-sorted'
]

export async function loadHabboBundle(className: string): Promise<HabboFurniBundle | null> {
  const cached = BUNDLE_CACHE.get(className)
  if (cached) return cached
  
  const p = (async () => {
    for (const basePath of BASE_PATHS) {
      try {
        const res = await fetch(`${basePath}/${className}/bundle.json`, { cache: 'force-cache' })
        if (res.ok) {
          const bundle = (await res.json()) as HabboFurniBundle
          // Injecter le chemin de base trouvé dans le bundle pour usage ultérieur
          (bundle as any)._foundInPath = basePath
          return bundle
        }
      } catch {
        continue
      }
    }
    return null
  })()
  
  BUNDLE_CACHE.set(className, p)
  return p
}

function layerLetter(index: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + index)
}

function assetName(className: string, size: string, letter: string, dir: number, frame: number): string {
  return `${className}_${size}_${letter}_${dir}_${frame}`
}

const INK_TO_BLEND: Record<string, 'normal' | 'add'> = {
  ADD: 'add',
  normal: 'normal'
}

interface BuildOptions {
  className: string
  size?: 64 | 32
  direction?: number
  frame?: number
}

/**
 * Construit un Container Pixi représentant la pièce Habbo, couche par couche.
 */
export async function buildHabboFurniContainer(opts: BuildOptions): Promise<Container | null> {
  const { className } = opts
  const size = (opts.size ?? 64).toString()
  const direction = opts.direction ?? 2
  const frame = opts.frame ?? 0
  const bundle = await loadHabboBundle(className)
  if (!bundle) return null

  const container = new Container()
  container.eventMode = 'none'
  container.sortableChildren = true

  const sized = bundle.visualization[size]
  const layerCount = sized?.layerCount ?? 1
  const layerInfos = sized?.layers ?? {}
  const dirOverrides = sized?.directions?.[direction.toString()] ?? {}

  // Shadow first (z=-10)
  await addLayer(container, bundle, className, size, 'sd', direction, frame, { z: -10, alpha: 102 })

  for (let li = 0; li < layerCount; li++) {
    const letter = layerLetter(li)
    const baseInfo = layerInfos[li.toString()] ?? {}
    const dirInfo = dirOverrides[li.toString()] ?? {}
    await addLayer(container, bundle, className, size, letter, direction, frame, {
      z: dirInfo.z ?? baseInfo.z ?? li,
      dx: dirInfo.x,
      dy: dirInfo.y,
      alpha: baseInfo.alpha,
      ink: baseInfo.ink,
      color: baseInfo.color,
      ignoreMouse: baseInfo.ignoreMouse
    })
  }

  return container
}

interface LayerOpts {
  z: number
  dx?: number
  dy?: number
  alpha?: number
  ink?: string
  color?: string
  ignoreMouse?: boolean
}

async function addLayer(
  container: Container,
  bundle: HabboFurniBundle,
  className: string,
  size: string,
  letter: string,
  direction: number,
  frame: number,
  opts: LayerOpts
): Promise<void> {
  const basePath = (bundle as any)._foundInPath || BASE_PATHS[0]
  
  // Stratégie de fallback exhaustive pour les assets
  const candidateDirs = [direction, 0, 2, 4, 6]
  const candidateFrames = [frame, 0]
  
  const candidates: string[] = []
  for (const d of candidateDirs) {
    for (const f of candidateFrames) {
      candidates.push(assetName(className, size, letter, d, f))
    }
  }

  let chosen: string | null = null
  for (const c of candidates) {
    if (bundle.assets[c]) {
      chosen = c
      break
    }
  }

  if (!chosen) {
    // Si même le frame 0 de la direction par défaut manque, 
    // on cherche n'importe quel asset qui commence par le même préfixe (couche)
    const prefix = `${className}_${size}_${letter}_`
    const fallbackAsset = Object.keys(bundle.assets).find(k => k.startsWith(prefix))
    if (fallbackAsset) {
      chosen = fallbackAsset
    } else {
      return
    }
  }

  const asset = bundle.assets[chosen]
  const sourceName = asset.source ?? chosen
  const file = `${basePath}/${className}/${sourceName}.png`
  
  let tex: Texture
  try {
    // Vérifier si l'asset est déjà chargé pour éviter des erreurs Pixi
    if (Assets.cache.has(file)) {
      tex = Assets.get(file)
    } else {
      tex = (await Assets.load(file)) as Texture
    }
  } catch (err) {
    // Si 404, on ne réessaie pas pour ce sprite précis
    console.warn(`[HabboFurniLoader] Failed to load asset: ${file}`)
    return
  }

  const sprite = new Sprite(tex)
  if (asset.flipH) {
    sprite.scale.x = -1
  }
  const x = (asset.flipH ? asset.x : -asset.x) + (opts.dx ?? 0)
  const y = -asset.y + (opts.dy ?? 0)
  sprite.position.set(x, y)
  sprite.zIndex = opts.z
  
  if (opts.alpha !== undefined) sprite.alpha = opts.alpha / 255
  if (opts.ink && INK_TO_BLEND[opts.ink]) sprite.blendMode = INK_TO_BLEND[opts.ink]
  if (opts.color) {
    const rgb = parseInt(opts.color, 16)
    if (!Number.isNaN(rgb)) sprite.tint = rgb
  }
  
  sprite.eventMode = opts.ignoreMouse ? 'none' : 'static'
  container.addChild(sprite)
}

