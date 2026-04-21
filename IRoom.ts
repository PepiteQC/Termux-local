import { FurnitureType, RoomEntityType, RoomTileType } from './type';

export type RoomType = 'PUBLIC' | 'LOCKED' | 'PASSWORD' | 'HIDDEN';

export interface RoomMapData {
  room: string[];
}

export interface RoomData {
  allowPets: boolean;
  allowPetsEating: boolean;
  category: null | string;
  currentUsers: number;
  description: null | string;
  floorThickness: number;
  hideWalls: boolean;
  hideWired: boolean;
  id: string;
  map: RoomMapData;
  maxUsers: number;
  name: string;
  type: RoomType;
  wallHeight: number;
  wallThickness: number;
}

export interface RoomTile {
  x: number;
  y: number;
  height: number;
  type: RoomTileType;
  walkable: boolean;
}

export interface RoomPlayer {
  id: string;
  username: string;
  motto?: string;
  figure?: string;
  online?: boolean;
  roomId: string;
  x: number;
  y: number;
  z?: number;
  goalX?: number;
  goalY?: number;
  moving?: boolean;
  rotation?: number;
  entityType: RoomEntityType.PLAYER;
}

export interface RoomBot {
  id: string;
  name: string;
  motto?: string;
  figure?: string;
  roomId: string;
  x: number;
  y: number;
  z?: number;
  rotation?: number;
  entityType: RoomEntityType.BOT;
}

export interface RoomPet {
  id: string;
  name: string;
  roomId: string;
  x: number;
  y: number;
  z?: number;
  rotation?: number;
  entityType: RoomEntityType.PET;
}

export type RoomEntity = RoomPlayer | RoomBot | RoomPet;

export interface RoomFurniture {
  id: string;
  roomId: string;
  ownerId?: string;
  type: FurnitureType;
  sprite?: string;
  name: string;
  x: number;
  y: number;
  z?: number;
  width: number;
  length: number;
  height?: number;
  rotation?: number;
  walkable?: boolean;
  stackable?: boolean;
  extraData?: Record<string, unknown>;
}

export interface RoomWithPlayers {
  roomData: RoomData;
  players: RoomPlayer[];
}

export interface RoomSnapshot {
  room: RoomData;
  entities: RoomEntity[];
  furnitures: RoomFurniture[];
}
