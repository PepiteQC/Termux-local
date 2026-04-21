export interface Point {
  x: number;
  y: number;
}

export interface IsoPoint extends Point {
  z: number;
}

export interface Tile {
  x: number;
  y: number;
  z?: number;
  walkable: boolean;
  blocked?: boolean;
}

export interface Avatar {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  direction: Direction;
  moving: boolean;
  outfit: AvatarOutfit;
  animation: AnimationState;
}

export interface AvatarOutfit {
  head: string; // e.g., 'head-default'
  hair: string; // e.g., 'hair-short-black', 'hair-long-blonde'
  shirt: string; // e.g., 'shirt-tshirt-white', 'shirt-polo-blue'
  jacket: string; // e.g., 'jacket-none', 'jacket-bomber-blue'
  pants: string; // e.g., 'pants-jeans-blue', 'pants-shorts-black'
  shoes: string; // e.g., 'shoes-sneakers-black', 'shoes-heels-red'
  accessories: string[]; // e.g., ['glasses-aviator']
}

export type Direction = 0 | 1 | 2 | 3 | 4;

export interface AnimationState {
  type: 'idle' | 'walk';
  frame: number;
  duration: number;
}

export interface FurnitureItem {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  rotation: 0 | 1 | 2 | 3;
  state?: string;
}

export interface RoomState {
  width: number;
  height: number;
  floorColor: string;
  wallColor: string;
  furniture: FurnitureItem[];
  avatars: Avatar[];
  selectedFurniture?: string;
}

export interface InventoryItem {
  id: string;
  type: 'furniture' | 'clothing';
  itemId: string;
  quantity: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  type: 'furniture' | 'clothing';
  itemId: string;
  preview?: string;
}
