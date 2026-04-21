#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "==> Création des dossiers TS..."

mkdir -p types
mkdir -p lib/catalog
mkdir -p "app/(protected)/boutique"
mkdir -p "app/(protected)/room"

echo "==> Création de types/packs.ts"

cat > types/packs.ts <<'TS'
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
TS

echo "==> Création de lib/catalog/getPackIndex.ts"

cat > lib/catalog/getPackIndex.ts <<'TS'
import walls from '@/data/packs/walls.json'
import floors from '@/data/packs/floors.json'
import landscapes from '@/data/packs/landscapes.json'
import furni from '@/data/packs/furni.json'
import boutique from '@/data/packs/boutique.json'
import avatars from '@/data/packs/avatars.json'
import interactions from '@/data/packs/interactions.json'
import gangs from '@/data/packs/gangs.json'
import ui from '@/data/packs/ui.json'
import fx from '@/data/packs/fx.json'

import type { PackIndex } from '@/types/packs'

export function getPackIndex(): PackIndex {
  return {
    walls: walls as PackIndex['walls'],
    floors: floors as PackIndex['floors'],
    landscapes: landscapes as PackIndex['landscapes'],
    furni: furni as PackIndex['furni'],
    boutique: boutique as PackIndex['boutique'],
    avatars: avatars as PackIndex['avatars'],
    interactions: interactions as PackIndex['interactions'],
    gangs: gangs as PackIndex['gangs'],
    ui: ui as PackIndex['ui'],
    fx: fx as PackIndex['fx'],
  }
}
TS

echo "==> Création de lib/catalog/getItemsByCategory.ts"

cat > lib/catalog/getItemsByCategory.ts <<'TS'
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
TS

echo "==> Création de app/(protected)/boutique/page.tsx"

cat > "app/(protected)/boutique/page.tsx" <<'TS'
'use client'

import { useMemo, useState } from 'react'
import { getAllCatalogItems } from '@/lib/catalog/getItemsByCategory'

const FILTERS = [
  'all',
  'wall',
  'floor',
  'landscape',
  'seating',
  'beds',
  'lighting',
  'effects',
  'bundle',
  'hair',
  'tops',
  'chat',
  'catalog',
  'inventory',
] as const

function formatPrice(price?: number, currency?: string) {
  if (typeof price !== 'number') return '—'
  return `${price.toLocaleString('fr-CA')} ${currency ?? 'credits'}`
}

export default function BoutiquePage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')

  const items = useMemo(() => {
    const all = getAllCatalogItems()

    return all.filter((item) => {
      const matchesFilter = filter === 'all' ? true : item.category === filter
      const q = query.trim().toLowerCase()

      const matchesQuery = q
        ? [item.name, item.id, item.category, item.rarity ?? '', item.style ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q)
        : true

      return matchesFilter && matchesQuery
    })
  }, [filter, query])

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
            EtherCristal Shop
          </p>
          <h1 className="mt-2 text-3xl font-black">Boutique des packs</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/70">
            Catalogue branché sur data/packs. Ici tu peux filtrer les murs, sols, furni,
            bundles, effets, avatars et UI sans coder en aveugle.
          </p>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Recherche: crystal, premium, sofa, halo..."
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none ring-0 placeholder:text-white/35"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
          >
            {FILTERS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </section>

        <section className="mb-4 flex items-center justify-between">
          <div className="text-sm text-white/60">
            {items.length} item{items.length > 1 ? 's' : ''}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="flex h-40 items-center justify-center border-b border-white/10 bg-black/20">
                <img
                  src={item.sprite}
                  alt={item.name}
                  className="max-h-28 max-w-[80%] object-contain"
                />
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold leading-tight">{item.name}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/45">
                      {item.category}
                    </p>
                  </div>

                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {item.rarity ?? 'default'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-white/65">
                  <p>ID: {item.id}</p>
                  {'style' in item && item.style ? <p>Style: {item.style}</p> : null}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <strong className="text-base">{formatPrice(item.price, item.currency)}</strong>
                  <button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15">
                    Voir
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
TS

echo "==> Création de app/(protected)/room/page.tsx"

cat > "app/(protected)/room/page.tsx" <<'TS'
'use client'

import { useMemo } from 'react'
import { getPackIndex } from '@/lib/catalog/getPackIndex'

export default function RoomPage() {
  const packs = useMemo(() => getPackIndex(), [])

  const wall = packs.walls[0]
  const floor = packs.floors[0]
  const landscape = packs.landscapes[0]
  const sofa = packs.furni.find((item) => item.category === 'seating') ?? packs.furni[0]
  const bed = packs.furni.find((item) => item.category === 'beds') ?? packs.furni[0]
  const lamp = packs.furni.find((item) => item.category === 'lighting') ?? packs.furni[0]

  return (
    <main className="min-h-screen bg-[#07070d] text-white p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-300/80">
            EtherCristal Room
          </p>
          <h1 className="mt-2 text-3xl font-black">Prototype room visuelle</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/70">
            Cette page te sert à brancher rapidement les packs murs, sols, paysages et furni
            dans une première room de preview.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#10101a] p-5 shadow-[0_14px_60px_rgba(0,0,0,0.38)]">
            <div className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#171726]">
              {landscape ? (
                <div className="absolute inset-x-0 top-0 h-[42%] border-b border-white/5 bg-[linear-gradient(180deg,#1e1830_0%,#171726_100%)]">
                  <img
                    src={landscape.sprite}
                    alt={landscape.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                </div>
              ) : null}

              {wall ? (
                <div className="absolute inset-x-0 top-[22%] h-[28%] bg-[linear-gradient(180deg,#2b243d_0%,#1c1830_100%)]">
                  <img
                    src={wall.sprite}
                    alt={wall.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                </div>
              ) : null}

              {floor ? (
                <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,#29233a_0%,#17141f_100%)]">
                  <img
                    src={floor.sprite}
                    alt={floor.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-50"
                  />
                </div>
              ) : null}

              <div className="absolute left-[18%] top-[58%] h-0 w-[64%] border-l-[180px] border-r-[180px] border-t-[90px] border-l-transparent border-r-transparent border-t-white/5" />

              {sofa ? (
                <img
                  src={sofa.sprite}
                  alt={sofa.name}
                  className="absolute left-[22%] top-[54%] h-20 w-auto object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.45)]"
                />
              ) : null}

              {bed ? (
                <img
                  src={bed.sprite}
                  alt={bed.name}
                  className="absolute left-[52%] top-[50%] h-24 w-auto object-contain drop-shadow-[0_16px_20px_rgba(0,0,0,0.45)]"
                />
              ) : null}

              {lamp ? (
                <img
                  src={lamp.sprite}
                  alt={lamp.name}
                  className="absolute left-[44%] top-[48%] h-14 w-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.4)]"
                />
              ) : null}

              <div className="absolute left-[32%] top-[58%] rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-cyan-100 shadow-lg">
                EtherUser
              </div>

              <div className="absolute left-[28%] top-[64%] h-14 w-10 rounded-t-[12px] rounded-b-[8px] border border-white/10 bg-[linear-gradient(180deg,#d9d9df_0%,#8b8b98_100%)] shadow-[0_12px_20px_rgba(0,0,0,0.45)]" />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-bold">Packs chargés</h2>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p>Murs: {packs.walls.length}</p>
                <p>Sols: {packs.floors.length}</p>
                <p>Paysages: {packs.landscapes.length}</p>
                <p>Furni: {packs.furni.length}</p>
                <p>Boutique: {packs.boutique.length}</p>
                <p>Avatars: {packs.avatars.length}</p>
                <p>FX: {packs.fx.length}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-bold">Éléments preview</h2>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <p>Mur: {wall?.name ?? '—'}</p>
                <p>Sol: {floor?.name ?? '—'}</p>
                <p>Paysage: {landscape?.name ?? '—'}</p>
                <p>Sofa: {sofa?.name ?? '—'}</p>
                <p>Lit: {bed?.name ?? '—'}</p>
                <p>Lampe: {lamp?.name ?? '—'}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
TS

echo "==> D3 terminé."
echo "Fichiers créés :"
echo " - types/packs.ts"
echo " - lib/catalog/getPackIndex.ts"
echo " - lib/catalog/getItemsByCategory.ts"
echo " - app/(protected)/boutique/page.tsx"
echo " - app/(protected)/room/page.tsx"
