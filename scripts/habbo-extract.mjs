#!/usr/bin/env node
// Extract Habbo SWF furniture → public/habbo-extracted/<className>/{*.png, bundle.json}
// Usage:
//   node scripts/habbo-extract.mjs <className>             single
//   node scripts/habbo-extract.mjs --batch <list.txt>      one name per line
//   node scripts/habbo-extract.mjs --defaults              curated starter set

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swfExtract from 'swf-extract'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SWF_DIR = path.join(ROOT, 'public/habbo-assets/dcr/hof_furni')
const OUT_DIR = path.join(ROOT, 'public/habbo-extracted')

function parseSymbolClass(rawData) {
  const names = {}
  let off = 0
  const count = rawData.readUInt16LE(off); off += 2
  for (let i = 0; i < count; i++) {
    const tag = rawData.readUInt16LE(off); off += 2
    let end = off
    while (end < rawData.length && rawData[end] !== 0) end++
    names[tag] = rawData.slice(off, end).toString('utf8')
    off = end + 1
  }
  return names
}

function parseBinaryData(rawData) {
  const tag = rawData.readUInt16LE(0)
  return { tag, data: rawData.slice(6) }
}

// Minimal XML attribute extractor (Habbo XMLs are simple, no mixed content)
function xmlToObj(xml) {
  // Strip BOM + declaration
  xml = xml.replace(/^\uFEFF/, '').replace(/<\?xml[^?]*\?>/i, '').trim()
  let i = 0
  function skipWs() { while (i < xml.length && /\s/.test(xml[i])) i++ }
  function parseTag() {
    skipWs()
    if (xml[i] !== '<') return null
    if (xml.startsWith('<!--', i)) {
      const end = xml.indexOf('-->', i)
      i = end === -1 ? xml.length : end + 3
      return parseTag()
    }
    i++ // <
    let nameEnd = i
    while (nameEnd < xml.length && !/[\s/>]/.test(xml[nameEnd])) nameEnd++
    const name = xml.slice(i, nameEnd)
    i = nameEnd
    const attrs = {}
    while (i < xml.length && xml[i] !== '>' && xml[i] !== '/') {
      skipWs()
      if (xml[i] === '>' || xml[i] === '/') break
      let keyEnd = i
      while (keyEnd < xml.length && xml[keyEnd] !== '=' && !/\s/.test(xml[keyEnd]) && xml[keyEnd] !== '>' && xml[keyEnd] !== '/') keyEnd++
      const key = xml.slice(i, keyEnd)
      i = keyEnd
      if (xml[i] === '=') {
        i++
        const quote = xml[i]
        if (quote === '"' || quote === "'") {
          i++
          const valEnd = xml.indexOf(quote, i)
          attrs[key] = xml.slice(i, valEnd)
          i = valEnd + 1
        }
      } else {
        attrs[key] = true
      }
    }
    if (xml[i] === '/') {
      i += 2
      return { name, attrs, children: [] }
    }
    i++ // >
    const children = []
    while (i < xml.length) {
      skipWs()
      if (xml.startsWith('</', i)) {
        const end = xml.indexOf('>', i)
        i = end + 1
        break
      }
      const child = parseTag()
      if (child) children.push(child)
      else break
    }
    return { name, attrs, children }
  }
  return parseTag()
}

function buildBundle(className, xmls, imageNames) {
  const bundle = { className, assets: {}, visualization: {}, logic: {}, index: null }

  // index.xml
  if (xmls.index) {
    const root = xmlToObj(xmls.index)
    if (root) bundle.index = { ...root.attrs }
  }

  // assets.xml : <asset name="..." x=".." y=".." flipH=".."/>
  if (xmls.assets) {
    const root = xmlToObj(xmls.assets)
    if (root) {
      for (const c of root.children) {
        if (c.name === 'asset') {
          bundle.assets[c.attrs.name] = {
            x: +(c.attrs.x ?? 0),
            y: +(c.attrs.y ?? 0),
            source: c.attrs.source,
            flipH: c.attrs.flipH === '1'
          }
        }
      }
    }
  }

  // visualization.xml : sizes {64, 32}, layers, directions
  if (xmls.visualization) {
    const root = xmlToObj(xmls.visualization)
    if (root) {
      for (const vis of root.children) {
        if (vis.name !== 'graphics') continue
        for (const v of vis.children) {
          if (v.name !== 'visualization') continue
          const size = v.attrs.size
          const sized = { layerCount: +(v.attrs.layerCount ?? 1), angle: +(v.attrs.angle ?? 0), layers: {}, directions: {} }
          for (const block of v.children) {
            if (block.name === 'layers') {
              for (const l of block.children) {
                if (l.name !== 'layer') continue
                sized.layers[l.attrs.id] = {
                  z: +(l.attrs.z ?? 0),
                  tag: l.attrs.tag,
                  ink: l.attrs.ink,
                  alpha: l.attrs.alpha ? +l.attrs.alpha : undefined,
                  ignoreMouse: l.attrs.ignoreMouse === '1',
                  color: l.attrs.color
                }
              }
            } else if (block.name === 'directions') {
              for (const d of block.children) {
                if (d.name !== 'direction') continue
                const dir = d.attrs.id
                const layers = {}
                for (const dl of d.children) {
                  if (dl.name !== 'layer') continue
                  layers[dl.attrs.id] = {
                    z: dl.attrs.z ? +dl.attrs.z : undefined,
                    x: dl.attrs.x ? +dl.attrs.x : undefined,
                    y: dl.attrs.y ? +dl.attrs.y : undefined
                  }
                }
                sized.directions[dir] = layers
              }
            } else if (block.name === 'animations') {
              // keep minimal — we render default frame 0 for now
            }
          }
          bundle.visualization[size] = sized
        }
      }
    }
  }

  // logic.xml : model/dimensions etc.
  if (xmls.logic) {
    const root = xmlToObj(xmls.logic)
    if (root) {
      for (const c of root.children) {
        if (c.name === 'model') {
          for (const mc of c.children) {
            if (mc.name === 'dimensions') {
              bundle.logic.dimensions = {
                x: +(mc.attrs.x ?? 1),
                y: +(mc.attrs.y ?? 1),
                z: +(mc.attrs.z ?? 1)
              }
            } else if (mc.name === 'directions') {
              bundle.logic.directions = mc.children.filter((d) => d.name === 'direction').map((d) => +d.attrs.id)
            }
          }
        }
      }
    }
  }

  bundle.imageList = imageNames
  return bundle
}

async function extractOne(className) {
  const swfPath = path.join(SWF_DIR, `${className}.swf`)
  if (!fs.existsSync(swfPath)) {
    console.warn(`[skip] ${className}: ${swfPath} not found`)
    return false
  }
  const buf = fs.readFileSync(swfPath)
  let swf
  try {
    swf = await swfExtract.readFromBufferP(buf)
  } catch (e) {
    console.warn(`[fail] ${className}: ${e.message}`)
    return false
  }

  const nameMap = {}
  for (const s of swf.tags.filter((t) => t.code === 76)) {
    if (s.rawData) Object.assign(nameMap, parseSymbolClass(s.rawData))
  }

  const xmls = {}
  for (const b of swf.tags.filter((t) => t.code === 87)) {
    if (!b.rawData) continue
    const { tag, data } = parseBinaryData(b.rawData)
    const name = nameMap[tag] || ''
    const text = data.toString('utf8')
    if (name.endsWith('_manifest')) xmls.manifest = text
    else if (name.endsWith('_index')) xmls.index = text
    else if (name.endsWith('_visualization')) xmls.visualization = text
    else if (name.endsWith('_assets')) xmls.assets = text
    else if (name.endsWith('_logic')) xmls.logic = text
  }

  const outDir = path.join(OUT_DIR, className)
  fs.mkdirSync(outDir, { recursive: true })

  const imageNames = []
  const imgs = await Promise.all(swfExtract.extractImages(swf.tags))
  for (const img of imgs) {
    if (!img.imgData) continue
    let name = nameMap[img.characterId] || `${className}_${img.characterId}`
    // Strip library prefix (className_className_... → className_...)
    const libPrefix = `${className}_`
    if (name.startsWith(libPrefix) && name.slice(libPrefix.length).startsWith(libPrefix)) {
      name = name.slice(libPrefix.length)
    }
    const ext = img.imgType === 'jpg' ? 'jpg' : 'png'
    const file = `${name}.${ext}`
    fs.writeFileSync(path.join(outDir, file), img.imgData)
    imageNames.push(file)
  }

  const bundle = buildBundle(className, xmls, imageNames)
  fs.writeFileSync(path.join(outDir, 'bundle.json'), JSON.stringify(bundle, null, 2))
  console.log(`[ok] ${className}: ${imageNames.length} images, ${Object.keys(xmls).length} xml`)
  return true
}

const DEFAULTS = [
  'throne', 'bling_sofa', 'club_sofa', 'carpet_standard', 'chair_basic', 'chair_plasto',
  'shelves_norja', 'rare_daffodil_rug', 'rare_dragonlamp', 'rare_elephant_statue',
  'bed_budget', 'bed_polyfon', 'bed_silo', 'plant_small_cactus', 'plant_yukka',
  'table_plasto_round', 'table_polyfon', 'wall_rainbow', 'door', 'shadow_tile',
  'bling_chair', 'bling_sofa', 'bling_stand', 'bling_table', 'bling_lamp',
  'neon_r', 'neon_g', 'neon_b', 'plant_big_cactus', 'plant_mazegate'
]

async function main() {
  const args = process.argv.slice(2)
  fs.mkdirSync(OUT_DIR, { recursive: true })

  let targets = []
  if (args[0] === '--batch' && args[1]) {
    targets = fs.readFileSync(args[1], 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
  } else if (args[0] === '--defaults' || args.length === 0) {
    targets = [...new Set(DEFAULTS)]
  } else if (args[0] === '--all') {
    targets = fs.readdirSync(SWF_DIR).filter((f) => f.endsWith('.swf')).map((f) => f.replace(/\.swf$/, ''))
  } else {
    targets = args
  }

  let ok = 0
  let fail = 0
  for (const name of targets) {
    const r = await extractOne(name)
    if (r) ok++
    else fail++
  }
  console.log(`\n--- done: ${ok} ok / ${fail} fail ---`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
