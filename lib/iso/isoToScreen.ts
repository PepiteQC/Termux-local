export type ProjectionConfig = {
  originX: number;
  originY: number;
  tileWidth?: number;
  tileHeight?: number;
};

function getDimensions(projection: ProjectionConfig) {
  return {
    tileWidth: projection.tileWidth ?? 64,
    tileHeight: projection.tileHeight ?? 32
  };
}

export function isoToScreen(
  x: number,
  y: number,
  z: number,
  projection: ProjectionConfig
) {
  const { tileWidth, tileHeight } = getDimensions(projection);

  return {
    x: (x - z) * (tileWidth / 2) + projection.originX,
    y: (x + z) * (tileHeight / 2) - y * tileHeight + projection.originY
  };
}

export function getTilePolygon(
  x: number,
  y: number,
  z: number,
  projection: ProjectionConfig
) {
  const center = isoToScreen(x + 0.5, y, z + 0.5, projection);
  const { tileWidth, tileHeight } = getDimensions(projection);
  const halfW = tileWidth / 2;
  const halfH = tileHeight / 2;

  return [
    { x: center.x, y: center.y - halfH },
    { x: center.x + halfW, y: center.y },
    { x: center.x, y: center.y + halfH },
    { x: center.x - halfW, y: center.y }
  ];
}

export function getIsoDepth(x: number, y: number, z: number) {
  return x + z + y;
}
