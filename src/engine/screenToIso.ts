// screenToIso optimisé avec offsets
export function screenToIso(
  screenX: number, 
  screenY: number, 
  engine: OptimizedIsoEngine
): {x: number; y: number; z: number} {
  const centerX = (engine.canvas.width / window.devicePixelRatio) * 0.5 - engine.TILE_SIZE * 4;
  const centerY = (engine.canvas.height / window.devicePixelRatio) * 0.4 - engine.TILE_SIZE * 2;
  
  const adjX = screenX - centerX;
  const adjY = screenY - centerY;
  
  const tileX = (adjX / (engine.TILE_SIZE * 0.5) + adjY / (engine.TILE_SIZE * 0.25)) / 2;
  const tileZ = (adjY / (engine.TILE_SIZE * 0.25) - adjX / (engine.TILE_SIZE * 0.5)) / 2;
  
  return { x: Math.floor(tileX), y: 0, z: Math.floor(tileZ) };
}
