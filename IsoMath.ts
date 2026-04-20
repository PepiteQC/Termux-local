export class IsoMath {
  static TILE_WIDTH = 128;
  static TILE_HEIGHT = 64;

  static isoToScreen(x: number, y: number, z: number) {
    return {
      screenX: (x - y) * (this.TILE_WIDTH / 2),
      screenY: (x + y) * (this.TILE_HEIGHT / 2) - z * this.TILE_HEIGHT
    };
  }

  static screenToIso(screenX: number, screenY: number, z = 0) {
    const adjustedY = screenY + z * this.TILE_HEIGHT;

    return {
      isoX: adjustedY / this.TILE_HEIGHT + screenX / this.TILE_WIDTH,
      isoY: adjustedY / this.TILE_HEIGHT - screenX / this.TILE_WIDTH,
      isoZ: z
    };
  }

  static getGlobalOffset(
    canvasWidth: number,
    canvasHeight: number,
    roomWidth: number = 12,
    roomDepth: number = 12
  ) {
    const centerIsoX = roomWidth / 2;
    const centerIsoY = roomDepth / 2;
    const centerScreen = this.isoToScreen(centerIsoX, centerIsoY, 0);

    return {
      offsetX: Math.floor(canvasWidth / 2 - centerScreen.screenX),
      offsetY: Math.floor(canvasHeight / 2 - centerScreen.screenY) + 80
    };
  }
}
