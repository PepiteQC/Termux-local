export function isoToScreenRaw(
  x: number,
  y: number,
  z: number,
  tileSize: number,
  centerX: number,
  centerY: number
) {
  const halfW = tileSize * 0.5;
  const quarterH = tileSize * 0.25;

  const sx = (x - z) * halfW + centerX;
  const sy = (x + z) * quarterH - y * tileSize * 0.5 + centerY;

  return { sx, sy };
}

export function screenToIsoRaw(
  screenX: number,
  screenY: number,
  tileSize: number,
  centerX: number,
  centerY: number
) {
  const adjX = screenX - centerX;
  const adjY = screenY - centerY;

  const tileX = (adjX / (tileSize * 0.5) + adjY / (tileSize * 0.25)) / 2;
  const tileZ = (adjY / (tileSize * 0.25) - adjX / (tileSize * 0.5)) / 2;

  return {
    x: Math.floor(tileX),
    y: 0,
    z: Math.floor(tileZ),
  };
}
