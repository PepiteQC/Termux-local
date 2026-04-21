export type PackRarity =
  | 'default'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'premium'
  | 'legendary'

export type PackCurrency =
  | 'credits'
  | 'crystals'
  | 'points'
  | 'gems'
  | string

export type PackSize = {
  w: number
  h: number
}

export type BasePackItem = {
  id: string
  name: string
  category: string
  sprite: string
  rarity?: PackRarity
  price?: number
  currency?: PackCurrency
  style?: string
}

export type WallPackItem = BasePackItem & {
  category: 'wall'
}

export type FloorPackItem = BasePackItem & {
  category: 'floor'
}

export type LandscapePackItem = BasePackItem & {
  category: 'landscape'
}

export type FurniPackItem = BasePackItem & {
  size?: PackSize
  interactive?: boolean
  action?: string
}

export type AvatarPackItem = BasePackItem

export type BoutiquePackItem = BasePackItem

export type FxPackItem = BasePackItem

export type UiPackItem = BasePackItem

export type GangPackItem = BasePackItem

export type InteractionPackItem = {
  id: string
  label: string
  type: string
}

export type AnyCatalogItem =
  | WallPackItem
  | FloorPackItem
  | LandscapePackItem
  | FurniPackItem
  | AvatarPackItem
  | BoutiquePackItem
  | FxPackItem
  | UiPackItem
  | GangPackItem

export type PackIndex = {
  walls: WallPackItem[]
  floors: FloorPackItem[]
  landscapes: LandscapePackItem[]
  furni: FurniPackItem[]
  boutique: BoutiquePackItem[]
  avatars: AvatarPackItem[]
  interactions: InteractionPackItem[]
  gangs: GangPackItem[]
  ui: UiPackItem[]
  fx: FxPackItem[]
}
