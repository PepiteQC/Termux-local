export type Entity = {
  id: string;
  sprite: string;
  isoX: number;
  isoY: number;
  isoZ: number;
};

export class RoomEngine {
  floorEntities: Entity[] = [];
  wallEntities: Entity[] = [];
  objectEntities: Entity[] = [];
  playerEntity: Entity | null = null;

  generateFloor(size: number = 12) {
    this.floorEntities = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        this.floorEntities.push({
          id: `floor-${x}-${y}`,
          sprite: 'tile-diamond',
          isoX: x,
          isoY: y,
          isoZ: 0,
        });
      }
    }
  }

  generateWalls(size: number = 12, wallHeight: number = 3) {
    this.wallEntities = [];

    // Left wall
    for (let y = 0; y < size; y++) {
      this.wallEntities.push({ id: `wall-left-${y}`, sprite: 'wall-left', isoX: -1, isoY: y, isoZ: 1 });
    }
    // Right wall
    for (let y = 0; y < size; y++) {
      this.wallEntities.push({ id: `wall-right-${y}`, sprite: 'wall-right', isoX: size, isoY: y, isoZ: 1 });
    }
    // Back wall (top en isométrique)
    for (let x = 0; x < size; x++) {
      this.wallEntities.push({ id: `wall-back-${x}`, sprite: 'wall-back', isoX: x, isoY: size, isoZ: 1 });
    }
  }

  // Méthode compatible avec ton addEntity existant
  addObject(entity: Partial<Entity>) {
    this.objectEntities.push({ ...entity, isoZ: 1 } as Entity);
  }
}
