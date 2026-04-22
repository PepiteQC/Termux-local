import { Assets, Container, Sprite, Texture } from 'pixi.js'
import type { HabboFurniBundle } from './HabboFurniBundle'

const BUNDLE_CACHE = new Map<string, Promise<HabboFurniBundle | null>>()
const TEXTURE_CACHE = new Map<string, Promise<Texture | null>>()
const RESOLVED_ASSET_CACHE = new Map<string, string | null>()

const BASE_PATHS = ['/habbo-extracted', '/habbo-assets', '/habbo-sorted'] as const

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

type PreloadFurnitureItem = {
        habboClassName?: string | null
        habboDirection?: number | null
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

function uniq<T>(values: T[]): T[] {
        return [...new Set(values)]
}

function layerLetter(index: number): string {
        return String.fromCharCode('a'.charCodeAt(0) + index)
}

function assetName(className: string, size: string, letter: string, dir: number, frame: number): string {
        return `${className}_${size}_${letter}_${dir}_${frame}`
}

function getBundleBasePath(bundle: HabboFurniBundle): string {
        return ((bundle as unknown as { _foundInPath?: string })._foundInPath ?? BASE_PATHS[0]) as string
}

async function loadTextureCached(file: string): Promise<Texture | null> {
        const cached = TEXTURE_CACHE.get(file)
        if (cached) return cached

        const p = (async () => {
                try {
                        if (Assets.cache.has(file)) {
                                return Assets.get(file) as Texture
                        }
                        return (await Assets.load(file)) as Texture
                } catch {
                        console.warn(`[HabboFurniLoader] Failed to load asset: ${file}`)
                        return null
                }
        })()

        TEXTURE_CACHE.set(file, p)
        return p
}

function getSizedVisualization(bundle: HabboFurniBundle, size: string) {
        return bundle.visualization[size] ?? bundle.visualization['64'] ?? bundle.visualization['32']
}

function resolveAssetKey(
        bundle: HabboFurniBundle,
        className: string,
        size: string,
        letter: string,
        direction: number,
        frame: number
): string | null {
        const cacheKey = `${className}|${size}|${letter}|${direction}|${frame}`
        const cached = RESOLVED_ASSET_CACHE.get(cacheKey)
        if (cached !== undefined) return cached

        const candidateDirs = uniq([direction, 0, 2, 4, 6])
        const candidateFrames = uniq([frame, 0])

        for (const d of candidateDirs) {
                for (const f of candidateFrames) {
                        const name = assetName(className, size, letter, d, f)
                        if (bundle.assets[name]) {
                                RESOLVED_ASSET_CACHE.set(cacheKey, name)
                                return name
                        }
                }
        }

        const prefix = `${className}_${size}_${letter}_`
        const fallbackAsset = Object.keys(bundle.assets).find((key) => key.startsWith(prefix)) ?? null
        RESOLVED_ASSET_CACHE.set(cacheKey, fallbackAsset)
        return fallbackAsset
}

function getLayerFiles(
        bundle: HabboFurniBundle,
        className: string,
        size: string,
        direction: number,
        frame: number
): string[] {
        const sized = getSizedVisualization(bundle, size)
        if (!sized) return []

        const letters = ['sd']
        const layerCount = sized.layerCount ?? 1

        for (let li = 0; li < layerCount; li++) {
                letters.push(layerLetter(li))
        }

        const basePath = getBundleBasePath(bundle)
        const files: string[] = []

        for (const letter of letters) {
                const chosen = resolveAssetKey(bundle, className, size, letter, direction, frame)
                if (!chosen) continue

                const asset = bundle.assets[chosen]
                if (!asset) continue

                const sourceName = asset.source ?? chosen
                files.push(`${basePath}/${className}/${sourceName}.png`)
        }

        return uniq(files)
}

export async function loadHabboBundle(className: string): Promise<HabboFurniBundle | null> {
        const cached = BUNDLE_CACHE.get(className)
        if (cached) return cached

        const p = (async () => {
                for (const basePath of BASE_PATHS) {
                        try {
                                const res = await fetch(`${basePath}/${className}/bundle.json`, { cache: 'force-cache' })
                                if (res.ok) {
                                        const bundle = (await res.json()) as HabboFurniBundle
                                        ;(bundle as unknown as { _foundInPath?: string })._foundInPath = basePath
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

export async function preloadHabboRoomFurni(items: PreloadFurnitureItem[]): Promise<void> {
        const wanted = new Map<string, Set<number>>()

        for (const item of items) {
                const className = item.habboClassName?.trim()
                if (!className) continue

                if (!wanted.has(className)) {
                        wanted.set(className, new Set<number>())
                }

                wanted.get(className)!.add(item.habboDirection ?? 2)
        }

        await Promise.all(
                [...wanted.entries()].map(async ([className, directions]) => {
                        const bundle = await loadHabboBundle(className)
                        if (!bundle) return

                        const files = new Set<string>()
                        for (const direction of directions) {
                                for (const file of getLayerFiles(bundle, className, '64', direction, 0)) {
                                        files.add(file)
                                }
                        }

                        await Promise.all([...files].map((file) => loadTextureCached(file)))
                })
        )
}

/**
 * Construit un Container Pixi représentant un meuble Habbo, couche par couche.
 */
export async function buildHabboFurniContainer(opts: BuildOptions): Promise<Container | null> {
        const { className } = opts
        const size = String(opts.size ?? 64)
        const direction = opts.direction ?? 2
        const frame = opts.frame ?? 0

        const bundle = await loadHabboBundle(className)
        if (!bundle) return null

        const sized = getSizedVisualization(bundle, size)
        if (!sized) return null

        const container = new Container()
        container.eventMode = 'none'
        container.sortableChildren = true

        const layerCount = sized.layerCount ?? 1
        const layerInfos = sized.layers ?? {}
        const dirOverrides = sized.directions?.[direction.toString()] ?? {}

        await addLayer(container, bundle, className, size, 'sd', direction, frame, {
                z: -10,
                alpha: 102,
                ignoreMouse: true
        })

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
        const chosen = resolveAssetKey(bundle, className, size, letter, direction, frame)
        if (!chosen) return

        const asset = bundle.assets[chosen]
        if (!asset) return

        const basePath = getBundleBasePath(bundle)
        const sourceName = asset.source ?? chosen
        const file = `${basePath}/${className}/${sourceName}.png`

        const tex = await loadTextureCached(file)
        if (!tex) return

        const sprite = new Sprite(tex)

        if (asset.flipH) {
                sprite.scale.x = -1
        }

        const x = (asset.flipH ? asset.x : -asset.x) + (opts.dx ?? 0)
        const y = -asset.y + (opts.dy ?? 0)

        sprite.position.set(x, y)
        sprite.zIndex = opts.z
        sprite.eventMode = opts.ignoreMouse ? 'none' : 'static'

        if (opts.alpha !== undefined) {
                sprite.alpha = opts.alpha / 255
        }

        if (opts.ink && INK_TO_BLEND[opts.ink]) {
                sprite.blendMode = INK_TO_BLEND[opts.ink]
        }

        if (opts.color) {
                const rgb = parseInt(opts.color, 16)
                if (!Number.isNaN(rgb)) {
                        sprite.tint = rgb
                }
        }

        container.addChild(sprite)
}
