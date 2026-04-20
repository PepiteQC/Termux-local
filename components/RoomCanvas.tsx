'use client';

import React, { useEffect, useRef } from 'react';
import { OptimizedIsoEngine } from '@/lib/iso/OptimizedIsoEngine';

export const RoomCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<OptimizedIsoEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = 800 * ratio;
    canvas.height = 600 * ratio;
    canvas.style.width = '800px';
    canvas.style.height = '600px';

    const engine = new OptimizedIsoEngine(canvas, 64);
    engineRef.current = engine;

    engine.clear();
    engine.drawGrid(10, 10);

    const handleClick = (e: MouseEvent) => {
      if (!engineRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const iso = engineRef.current.screenToIso(x, y);
      console.log('CLICK ISO →', iso);

      engineRef.current.clear();
      engineRef.current.drawGrid(10, 10);
      engineRef.current.drawIsoTile(iso.x, 0, iso.z, '#FF6B6B');
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: '#0B1020' }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #2D3748',
          imageRendering: 'pixelated',
          background: '#111827',
        }}
      />
    </div>
  );
};
