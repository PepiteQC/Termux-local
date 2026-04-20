import { isoToScreenRaw, screenToIsoRaw } from './utils';
export { habboPathfind } from "./pathfinding";

export type IsoCoord = { x: number; y: number; z: number };
export type RenderEntity = {
  id: string;
  type: "furniture" | "avatar" | "tile" | "wall";
  isoX: number;
  isoY: number;
  isoZ: number;
  sprite: string;
  rotation?: number;
  scale?: number;
  glow?: boolean;
  shadow?: boolean;
  selected?: boolean;
};

export type RenderLayer = {
  name: string;
  entities: RenderEntity[];
  zOffset: number;
};

export class OptimizedIsoEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  TILE_SIZE: number;

  constructor(canvas: HTMLCanvasElement, tileSize = 64) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
    this.TILE_SIZE = tileSize;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private getCenter() {
    const ratio = window.devicePixelRatio || 1;
    const centerX = (this.canvas.width / ratio) * 0.5 - this.TILE_SIZE * 4;
    const centerY = (this.canvas.height / ratio) * 0.4 - this.TILE_SIZE * 2;
    return { centerX, centerY };
  }

  isoToScreen(x: number, y: number, z: number) {
    const { centerX, centerY } = this.getCenter();
    return isoToScreenRaw(x, y, z, this.TILE_SIZE, centerX, centerY);
  }

  screenToIso(screenX: number, screenY: number): IsoCoord {
    const { centerX, centerY } = this.getCenter();
    return screenToIsoRaw(screenX, screenY, this.TILE_SIZE, centerX, centerY);
  }

  drawIsoTile(x: number, y: number, z: number, color = '#4A5568') {
    const { sx, sy } = this.isoToScreen(x, y, z);
    const halfW = this.TILE_SIZE * 0.5;
    const halfH = this.TILE_SIZE * 0.25;

    this.ctx.beginPath();
    this.ctx.moveTo(sx, sy - halfH);
    this.ctx.lineTo(sx + halfW, sy);
    this.ctx.lineTo(sx, sy + halfH);
    this.ctx.lineTo(sx - halfW, sy);
    this.ctx.closePath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawGrid(width: number, depth: number) {
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        this.drawIsoTile(x, 0, z, '#2D3748');
      }
    }
  }

  generateFloorGrid(size: number): RenderEntity[] {
    const entities: RenderEntity[] = [];

    for (let x = 0; x < size; x += 1) {
      for (let z = 0; z < size; z += 1) {
        entities.push({
          id: `tile-${x}-${z}`,
          type: "tile",
          isoX: x,
          isoY: 0,
          isoZ: z,
          sprite: "tile"
        });
      }
    }

    return entities;
  }

  generateWalls(size = 16): RenderEntity[] {
    const entities: RenderEntity[] = [];

    for (let x = 0; x < size; x += 1) {
      entities.push({
        id: `wall-top-${x}`,
        type: "wall",
        isoX: x,
        isoY: 0,
        isoZ: 0,
        sprite: "wall-top"
      });
      entities.push({
        id: `wall-left-${x}`,
        type: "wall",
        isoX: 0,
        isoY: 0,
        isoZ: x,
        sprite: "wall-left"
      });
    }

    return entities;
  }

  render(layers: RenderLayer[]) {
    this.clear();
    const entries = layers
      .flatMap((layer) =>
        layer.entities.map((entity) => ({
          ...entity,
          depth: entity.isoX + entity.isoY + entity.isoZ + layer.zOffset
        }))
      )
      .sort((left, right) => left.depth - right.depth);

    entries.forEach((entity) => {
      if (entity.type === "tile") {
        this.drawIsoTile(entity.isoX, entity.isoY, entity.isoZ, "#263149");
        return;
      }

      const { sx, sy } = this.isoToScreen(entity.isoX, entity.isoY, entity.isoZ);
      this.ctx.save();

      if (entity.type === "wall") {
        this.ctx.strokeStyle = "rgba(255,255,255,0.12)";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(sx, sy - this.TILE_SIZE * 0.8);
        this.ctx.lineTo(sx, sy);
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = entity.selected ? "#cfefff" : "#7aa2ff";
        this.ctx.fillRect(sx - 14, sy - 28, 28, 28);
      }

      this.ctx.restore();
    });
  }
}
