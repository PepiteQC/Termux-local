import { canPlaceFurniture, pointInPolygon, getFurnitureHitPolygon } from "./FurnitureCollision";
import type {
  FurniturePlacement,
  FurniturePreviewState,
  FurnitureRotation,
  FurnitureSelection,
  FurnitureType,
  IsoTile,
  ScreenPoint
} from "./FurnitureTypes";
import { OptimizedIsoEngine } from "../iso/OptimizedIsoEngine";
import type { ProjectionConfig } from "../iso/isoToScreen";

type FurnitureEngineOptions = {
  roomWidth: number;
  roomDepth: number;
};

export class FurnitureEngine {
  readonly roomWidth: number;
  readonly roomDepth: number;
  private selectedType: FurnitureType | null = null;
  private rotation: FurnitureRotation = 0;
  private selection: FurnitureSelection = { id: null, hoveredId: null };

  constructor(private readonly isoEngine: OptimizedIsoEngine, options: FurnitureEngineOptions) {
    this.roomWidth = options.roomWidth;
    this.roomDepth = options.roomDepth;
  }

  setSelectedType(type: FurnitureType | null) {
    this.selectedType = type;
  }

  getSelectedType() {
    return this.selectedType;
  }

  setRotation(rotation: FurnitureRotation) {
    this.rotation = rotation;
  }

  rotateClockwise() {
    this.rotation = ((this.rotation + 1) % 4) as FurnitureRotation;
    return this.rotation;
  }

  getRotation() {
    return this.rotation;
  }

  setSelection(next: Partial<FurnitureSelection>) {
    this.selection = { ...this.selection, ...next };
  }

  getSelection() {
    return this.selection;
  }

  screenToTile(point: ScreenPoint): IsoTile {
    const iso = this.isoEngine.screenToIso(point.x, point.y);

    return {
      x: Math.max(0, Math.min(this.roomWidth - 1, Math.floor(iso.x))),
      y: 0,
      z: Math.max(0, Math.min(this.roomDepth - 1, Math.floor(iso.z)))
    };
  }

  buildPreview(tile: IsoTile, furnitures: FurniturePlacement[]): FurniturePreviewState | null {
    if (!this.selectedType) {
      return null;
    }

    const previewPlacement: FurniturePlacement = {
      id: "preview",
      type: this.selectedType,
      x: tile.x,
      y: tile.y,
      z: tile.z,
      rotation: this.rotation
    };
    const validation = canPlaceFurniture(
      previewPlacement,
      furnitures,
      this.roomWidth,
      this.roomDepth
    );

    return {
      type: this.selectedType,
      tile,
      rotation: this.rotation,
      valid: validation.valid,
      reason: validation.reason
    };
  }

  createPlacement(id: string, tile: IsoTile): FurniturePlacement | null {
    if (!this.selectedType) {
      return null;
    }

    return {
      id,
      type: this.selectedType,
      x: tile.x,
      y: tile.y,
      z: tile.z,
      rotation: this.rotation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  pickFurnitureAtPoint(
    point: ScreenPoint,
    furnitures: FurniturePlacement[],
    projection: ProjectionConfig
  ) {
    return [...furnitures]
      .reverse()
      .find((item) => pointInPolygon(point, getFurnitureHitPolygon(item, projection))) ?? null;
  }
}
