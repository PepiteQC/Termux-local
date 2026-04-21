import { getPackIndex } from '@/lib/catalog/getPackIndex'
import type { AnyCatalogItem } from '@/types/packs'

export function getAllCatalogItems(): AnyCatalogItem[] {
  const packs = getPackIndex()

  return [
    ...packs.walls,
    ...packs.floors,
    ...packs.landscapes,
    ...packs.furni,
    ...packs.boutique,
    ...packs.avatars,
    ...packs.gangs,
    ...packs.ui,
    ...packs.fx,
  ]
}

export function getItemsByCategory(category: string): AnyCatalogItem[] {
  return getAllCatalogItems().filter((item) => item.category === category)
}

export function getItemsByRarity(rarity: string): AnyCatalogItem[] {
  return getAllCatalogItems().filter((item) => item.rarity === rarity)
}

export function getItemsByText(query: string): AnyCatalogItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return getAllCatalogItems()

  return getAllCatalogItems().filter((item) => {
    const haystack = [
      item.id,
      item.name,
      item.category,
      item.rarity ?? '',
      item.style ?? '',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}
