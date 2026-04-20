export type FurnitureRotation = 0 | 1 | 2 | 3;

export type FurnitureType =
  | "chair-nebula"
  | "table-prism"
  | "bed-obsidian"
  | "lamp-halo"
  | "crystal-ether"
  | "neon-crown";

export type IsoTile = {
  x: number;
  y: number;
  z: number;
};

export type ScreenPoint = {
  x: number;
  y: number;
};

export type FurnitureDefinition = {
  id: FurnitureType;
  name: string;
  label: string;
  sprite: string;
  storagePath: string;
  width: number;
  depth: number;
  height: number;
  offsetX: number;
  offsetY: number;
  walkable: boolean;
  drawWidth: number;
  drawHeight: number;
  glow?: string;
};

export type FurniturePlacement = {
  id: string;
  type: FurnitureType;
  x: number;
  y: number;
  z: number;
  rotation: FurnitureRotation;
  createdAt?: string;
  updatedAt?: string;
};

export type FurniturePreviewState = {
  type: FurnitureType;
  tile: IsoTile;
  rotation: FurnitureRotation;
  valid: boolean;
  reason: string | null;
};

export type FurnitureSelection = {
  id: string | null;
  hoveredId: string | null;
};

export type FurnitureApiRecord = FurniturePlacement & {
  roomId: string;
};
