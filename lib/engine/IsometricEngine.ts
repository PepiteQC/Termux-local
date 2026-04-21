import type { IsoPoint, Point } from '@/lib/types/game';

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

export class IsometricEngine {
  private tileWidth: number;
  private tileHeight: number;

  constructor(tileWidth = TILE_WIDTH, tileHeight = TILE_HEIGHT) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  worldToScreen(x: number, y: number, z: number = 0): Point {
    const screenX = (x - y) * (this.tileWidth / 2);
    const screenY = (x + y) * (this.tileHeight / 2) - z * this.tileHeight * 0.5;
    return { x: screenX, y: screenY };
  }

  screenToWorld(screenX: number, screenY: number, z: number = 0): IsoPoint {
    screenY += z * this.tileHeight * 0.5;
    const x = (screenX / (this.tileWidth / 2) + screenY / (this.tileHeight / 2)) / 2;
    const y = (screenY / (this.tileHeight / 2) - screenX / (this.tileWidth / 2)) / 2;
    return { x: Math.round(x), y: Math.round(y), z };
  }

  calculateDepth(x: number, y: number, z: number = 0): number {
    return x + y * 1000 + z * 1000000;
  }

  getScreenBounds(roomWidth: number, roomHeight: number): { width: number; height: number } {
    const topRight = this.worldToScreen(roomWidth, 0);
    const bottomLeft = this.worldToScreen(0, roomHeight);
    return {
      width: Math.abs(topRight.x) * 2,
      height: Math.abs(bottomLeft.y) * 2,
    };
  }

  getTileCorners(x: number, y: number, z: number = 0) {
    return {
      nw: this.worldToScreen(x, y, z),
      ne: this.worldToScreen(x + 1, y, z),
      se: this.worldToScreen(x + 1, y + 1, z),
      sw: this.worldToScreen(x, y + 1, z),
    };
  }

  isPointInTile(screenX: number, screenY: number, tileX: number, tileY: number): boolean {
    const corners = this.getTileCorners(tileX, tileY);
    const points = [corners.nw, corners.ne, corners.se, corners.sw];

    for (let i = 0; i < 4; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 4];
      const cross = (p2.x - p1.x) * (screenY - p1.y) - (p2.y - p1.y) * (screenX - p1.x);
      if (cross < 0) return false;
    }
    return true;
  }
}

// Create default instance for backwards compatibility
export const isoEngine = new IsometricEngine();
