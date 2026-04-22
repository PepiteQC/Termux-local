"use client"

import { useEffect, useRef } from "react"
import { Application, Assets, Texture } from "pixi.js"
import HabboRoomScene from "@/src/habbo-core/HabboRoomScene"

const FLOOR_MAP = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
]

const HEIGHT_MAP = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 1, 2, 1, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0],
]

export default function HabboVraiPage() {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true
    let app: Application | null = null

    const boot = async () => {
      if (!hostRef.current) return

      app = new Application()
      await app.init({
        width: hostRef.current.clientWidth || window.innerWidth,
        height: hostRef.current.clientHeight || window.innerHeight,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      })

      app.canvas.style.width = "100%"
      app.canvas.style.height = "100%"
      app.canvas.style.display = "block"
      app.canvas.style.imageRendering = "pixelated"

      hostRef.current.replaceChildren(app.canvas)

      let tileset: Record<string | number, Texture> = {}

      try {
        const loaded = await Assets.load("/assets/tiles/tileset.json")
        const maybeTextures = (loaded as { textures?: Record<string, Texture> }).textures
        if (maybeTextures) {
          tileset = maybeTextures
        }
      } catch {
        tileset = {}
      }

      if (!mounted || !app) return

      const scene = new HabboRoomScene(tileset, {
        floorMap: FLOOR_MAP,
        heightMap: HEIGHT_MAP,
      })

      const metrics = scene.getViewportMetrics()
      scene.x = app.renderer.width / 2 - metrics.centerX
      scene.y = 80

      app.stage.addChild(scene)
    }

    void boot()

    return () => {
      mounted = false
      app?.destroy(true, { children: true })
    }
  }, [])

  return <div ref={hostRef} className="h-[100dvh] w-full bg-black" />
}
