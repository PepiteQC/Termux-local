'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useGameStore } from '@/lib/store/gameStore';
import { RoomRenderer } from '@/lib/renderer/RoomRenderer';
import { isoEngine } from '@/lib/engine/IsometricEngine';
import type { Point } from '@/lib/types/game';

export function RoomViewer() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const rendererRef = useRef<RoomRenderer | null>(null);

  const room = useGameStore((s) => s.room);
  const setHoveredTile = useGameStore((s) => s.setHoveredTile);
  const updateFurniture = useGameStore((s) => s.updateFurniture);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initPixi = async () => {
      const app = new PIXI.Application();
      await app.init({
        width: 1200,
        height: 700,
        antialias: true,
        backgroundColor: 0x1a1a1a,
      });

      canvasRef.current!.appendChild(app.canvas);
      appRef.current = app;

      app.stage.sortableChildren = true;
      app.stage.interactive = true;

      const renderer = new RoomRenderer(app);
      rendererRef.current = renderer;

      await renderer.renderRoom(room);

      // Mouse move for tile hover
      app.stage.on('mousemove', (e) => {
        const pos = e.global;
        let foundTile = null;

        for (let y = 0; y < room.height; y++) {
          for (let x = 0; x < room.width; x++) {
            if (isoEngine.isPointInTile(pos.x, pos.y, x, y)) {
              foundTile = { x, y };
              break;
            }
          }
          if (foundTile) break;
        }

        setHoveredTile(foundTile);
      });

      // Mouse click for furniture placement
      app.stage.on('pointerdown', (e) => {
        const pos = e.global;
        let clickedTile = null;

        for (let y = room.height - 1; y >= 0; y--) {
          for (let x = room.width - 1; x >= 0; x--) {
            if (isoEngine.isPointInTile(pos.x, pos.y, x, y)) {
              clickedTile = { x, y };
              break;
            }
          }
          if (clickedTile) break;
        }

        if (clickedTile) {
          // Trigger furniture placement if one is being dragged
        }
      });

      // Re-render on room state changes
      const renderLoop = setInterval(async () => {
        await renderer.renderRoom(room);
      }, 1000 / 30); // 30 FPS

      return () => {
        clearInterval(renderLoop);
        app.destroy();
      };
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy();
      }
      if (rendererRef.current) {
        rendererRef.current.cleanup();
      }
    };
  }, [room, setHoveredTile, updateFurniture]);

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-gray-900 rounded-lg overflow-hidden"
      style={{ minHeight: '700px' }}
    />
  );
}
