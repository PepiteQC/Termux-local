import { FURNITURE_ORDER, FURNITURE_REGISTRY } from "../furniture/FurnitureRegistry";
import type { FurniturePlacement, FurnitureType, ScreenPoint } from "../furniture/FurnitureTypes";

export type { FurniturePlacement as FurnitureRecord, FurnitureType as FurnitureKind, ScreenPoint };

export type ActionLog = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
};

export type AvatarRecord = {
  id: string;
  user: string;
  x: number;
  y: number;
  direction: "north" | "east" | "south" | "west";
};

export type InventoryItem = {
  id: string;
  item: FurnitureType;
  quantity: number;
};

export type DragState = {
  item: FurnitureType;
  pointer: ScreenPoint;
} | null;

export type RoomRecord = {
  id: string;
  name: string;
  settings: {
    ambience: string;
  };
};

export const ROOM_SIZE = 12;
export const ISO_WALL_HEIGHT = 128;
export const FURNITURE_CATALOG = Object.fromEntries(
  Object.entries(FURNITURE_REGISTRY).map(([key, value]) => [
    key,
    {
      ...value,
      drawSize: { width: value.drawWidth, height: value.drawHeight },
      offset: { x: value.offsetX, y: value.offsetY }
    }
  ])
) as Record<
  FurnitureType,
  (typeof FURNITURE_REGISTRY)[FurnitureType] & {
    drawSize: { width: number; height: number };
    offset: { x: number; y: number };
  }
>;
export { FURNITURE_ORDER };

export const DEFAULT_ROOM: RoomRecord = {
  id: "ether-suite-premium",
  name: "Ether Suite Premium",
  settings: {
    ambience: "aurora"
  }
};

export const DEFAULT_AVATAR: AvatarRecord = {
  id: "avatar-guest",
  user: "guest",
  x: 9,
  y: 9,
  direction: "south"
};

export const DEFAULT_FURNITURES: FurniturePlacement[] = [
  {
    id: "seed-chair",
    type: "chair-nebula",
    x: 3,
    y: 0,
    z: 3,
    rotation: 0
  },
  {
    id: "seed-table",
    type: "table-prism",
    x: 5,
    y: 0,
    z: 4,
    rotation: 1
  }
];

export const DEFAULT_INVENTORY: InventoryItem[] = FURNITURE_ORDER.map((item, index) => ({
  id: `inventory-${item}`,
  item,
  quantity: index < 3 ? 2 : 1
}));
