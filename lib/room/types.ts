export type Tile = {
  x: number
  y: number
}

export type Point = {
  x: number
  y: number
}

export type Direction = "NE" | "NW" | "SE" | "SW"

export type RoomFurnitureKind =
  | "sofa"
  | "table"
  | "bed"
  | "desk"
  | "screen"
  | "lamp"
  | "plant"
  | "rug"

export type RoomFurniture = {
  id: string
  label: string
  kind: RoomFurnitureKind
  x: number
  y: number
  w: number
  d: number
  h: number
  color: string
  accent?: string
  walkable?: boolean
}

export type AvatarState = {
  gridX: number
  gridY: number
  renderX: number
  renderY: number
  direction: Direction
  walking: boolean
}

export type RoomDefinition = {
  title: string
  subtitle?: string
  width: number
  height: number
  tileWidth?: number
  tileHeight?: number
  wallHeight: number
  stepHeight: number
  floorDrop: number
  moveSpeed: number
  startTile: Tile
  furnitures: RoomFurniture[]
}
