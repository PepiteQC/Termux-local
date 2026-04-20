export class Grid {
  width: number;
  height: number;
  tiles: number[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 0)
    );
  }

  isWalkable(x: number, y: number) {
    return this.tiles[y] && this.tiles[y][x] === 0;
  }
}
