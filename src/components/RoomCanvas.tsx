'use client';
import { useRef, useEffect, useCallback, type MouseEvent } from 'react';
import { OptimizedIsoEngine, RenderLayer, RenderEntity } from '@/lib/iso/OptimizedIsoEngine';
import { Furniture } from '@/lib/iso/collision'; // Garde ton type

interface RoomCanvasProps {
  furnitures: Furniture[];
  onEntityClick: (entityId: string) => void;
}

export default function RoomCanvas({ furnitures, onEntityClick }: RoomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<OptimizedIsoEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    engineRef.current = new OptimizedIsoEngine(canvasRef.current);
    const engine = engineRef.current;
    
    const renderLoop = () => {
      const layers: RenderLayer[] = [
        { name: 'floor', entities: engine.generateFloorGrid(16), zOffset: 0 },
        { name: 'walls', entities: engine.generateWalls(), zOffset: 50 },
        { name: 'objects', entities: furnituresToEntities(furnitures), zOffset: 100 },
        { name: 'player', entities: [], zOffset: 200 }, // Ton avatar ici
        { name: 'ui', entities: [], zOffset: 300 },
        { name: 'overlay', entities: [], zOffset: 400 }
      ];
      
      engine.render(layers);
      requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
    
    return () => {
      // Cleanup
      if (engine.canvas) {
        const ctx = engine.canvas.getContext('2d');
        ctx?.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
      }
    };
  }, [furnitures]);

  const handleClick = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isoPos = engineRef.current!.screenToIso(x, y);
    onEntityClick(`furniture-${Math.floor(isoPos.x)}-${Math.floor(isoPos.z)}`);
  }, [onEntityClick]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[600px] rounded-3xl border-4 border-purple-500/50 shadow-2xl bg-gradient-to-b from-black/50 to-purple-900/30"
      onClick={handleClick}
      style={{ touchAction: 'none' }}
    />
  );
}

function furnituresToEntities(furnitures: Furniture[]): RenderEntity[] {
  return furnitures.map(f => ({
    id: f.id,
    type: 'furniture',
    isoX: f.x,
    isoY: 0,
    isoZ: f.z,
    sprite: f.type,
    rotation: f.rotation || 0,
    scale: 1,
    glow: ['lamp-halo', 'crystal-ether', 'neon-crown'].includes(f.type),
    shadow: true,
    selected: f.selected || false
  }));
}
