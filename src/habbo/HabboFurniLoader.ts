import { Assets, Container, Sprite, Texture } from 'pixi.js'
import type { HabboFurniBundle } from './HabboFurniBundle'

const BUNDLE_CACHE = new Map<string, Promise<HabboFurniBundle | null>>()

const BASE_PATH = '/habbo-extracted'

export async function loadHabboBundle(className: string): Promise<HabboFurniBundle | null> {
  if (BUNDLE_CACHE.has(className)) return BUNDLE_CACHE.get(className)!
  const p = (async () => {
    try {
      const res = await fetch(`${BASE_PATH}/${className}/bundle.json`, { cache: 'force-cache' })
      if (!res.ok) return null
      return (await res.json()) as HabboFurniBundle
    } catch {
      return null
    }
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
 * Construit un Container Pixi représentant la pièce Habbo, couche par couche,
 * en suivant assets.xml (offsets + flip) et visualization.xml (z-order / ink / alpha).
 * Renvoie null si l'asset n'est pas extrait.
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

  // Shadow first (z=-10). alpha est exprimé en 0-255 (même échelle que les XML Habbo).
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
  // Résout le nom de l'asset pour cette direction (fallback direction 2 si absent)
  const candidates = [
    assetName(className, size, letter, direction, frame),
    assetName(className, size, letter, direction, 0),
    assetName(className, size, letter, 2, 0)
  ]
  let chosen: string | null = null
  for (const c of candidates) {
    if (bundle.assets[c]) {
      chosen = c
      break
    }
  }
  if (!chosen) return

  const asset = bundle.assets[chosen]
  const sourceName = asset.source ?? chosen
  const file = `${BASE_PATH}/${className}/${sourceName}.png`
  let tex: Texture
  try {
    tex = (await Assets.load(file)) as Texture
  } catch {
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
