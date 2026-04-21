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
