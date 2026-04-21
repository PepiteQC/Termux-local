#!/usr/bin/env node
// Génère data/habbo/catalog.json : liste compacte (id, className, category, xdim, ydim, name, desc)
// à partir de public/habbo-assets/gamedata/furnidata.json

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'public/habbo-assets/gamedata/furnidata.json')
const OUT = path.join(ROOT, 'public/data/habbo/catalog.json')
const SWF_DIR = path.join(ROOT, 'public/habbo-assets/dcr/hof_furni')

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'))
const entries = [
  ...(raw.roomitemtypes?.furnitype ?? []),
  ...(raw.wallitemtypes?.furnitype ?? [])
]

const existing = new Set(fs.readdirSync(SWF_DIR).filter((f) => f.endsWith('.swf')).map((f) => f.replace(/\.swf$/, '')))

// On ne conserve que les items réellement disponibles en SWF pour alléger le JSON
// (le set complet est déjà dans public/habbo-assets/gamedata/furnidata.json).
const catalog = entries
  .filter((e) => existing.has(e.classname))
  .map((e) => ({
    id: e.id,
    className: e.classname,
    category: e.category ?? null,
    furniline: e.furniline ?? null,
    xdim: e.xdim ?? 1,
    ydim: e.ydim ?? 1,
    name: (e.name ?? '').trim(),
    description: (e.description ?? '').trim().slice(0, 140),
    canstandon: !!e.canstandon,
    cansiton: !!e.cansiton,
    canlayon: !!e.canlayon,
    rare: !!e.rare,
    hasSwf: true,
    icon: `/habbo-assets/dcr/hof_furni/${e.classname}_icon.png`
  }))

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify({ count: catalog.length, furni: catalog }))

const cats = {}
for (const c of catalog) cats[c.category || 'unknown'] = (cats[c.category || 'unknown'] || 0) + 1
console.log(`[ok] ${catalog.length} items → ${OUT}`)
console.log(`categories:`, Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 15))
