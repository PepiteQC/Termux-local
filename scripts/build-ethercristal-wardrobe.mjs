import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const TARGET_PARTS = {
  hr: "Cheveux",
  hd: "Visage",
  ch: "Haut",
  lg: "Bas",
  sh: "Chaussures",
  ha: "Coiffes",
  fa: "Visage+"
}

const SEARCH_ROOTS = [
  "public",
  "resource",
  "data",
  "src",
  "."
]

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue
      walk(full, out)
    } else if (entry.isFile() && entry.name.toLowerCase() === "figuredata.xml") {
      out.push(full)
    }
  }
  return out
}

function findFigureData() {
  for (const rel of SEARCH_ROOTS) {
    const found = walk(path.join(ROOT, rel))
    if (found.length) return found[0]
  }
  return null
}

function parseAttrs(raw) {
  const attrs = {}
  for (const m of raw.matchAll(/([a-zA-Z0-9_:-]+)="([^"]*)"/g)) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

function parseSetTypes(xml) {
  const result = {}
  const setTypeRe = /<settype\b([^>]*)>([\s\S]*?)<\/settype>/g

  for (const match of xml.matchAll(setTypeRe)) {
    const attrs = parseAttrs(match[1] ?? "")
    const type = attrs.type
    if (!type || !(type in TARGET_PARTS)) continue

    const body = match[2] ?? ""
    const sets = []
    const setRe = /<set\b([^>]*)>/g

    for (const setMatch of body.matchAll(setRe)) {
      const setAttrs = parseAttrs(setMatch[1] ?? "")
      const id = Number(setAttrs.id || 0)
      const gender = (setAttrs.gender || "U").toUpperCase()
      const selectable = setAttrs.selectable ?? "1"
      const club = Number(setAttrs.club || 0)

      if (!id) continue
      if (selectable === "0") continue

      sets.push({
        id,
        gender: gender === "M" || gender === "F" || gender === "U" ? gender : "U",
        club
      })
    }

    result[type] = sets
      .sort((a, b) => a.club - b.club || a.id - b.id)
      .slice(0, 60)
  }

  return result
}

function splitByGender(partName, sets) {
  const out = { M: [], F: [] }

  for (const set of sets) {
    const base = { id: set.id, label: `${partName} ${set.id}` }

    if (set.gender === "M" || set.gender === "U") out.M.push(base)
    if (set.gender === "F" || set.gender === "U") out.F.push(base)
  }

  return {
    M: out.M.slice(0, 24),
    F: out.F.slice(0, 24)
  }
}

const figurePath = findFigureData()

if (!figurePath) {
  console.error("Impossible de trouver figuredata.xml dans le projet.")
  process.exit(1)
}

const xml = fs.readFileSync(figurePath, "utf8")
const parsed = parseSetTypes(xml)

const hairs = splitByGender(TARGET_PARTS.hr, parsed.hr ?? [])
const heads = splitByGender(TARGET_PARTS.hd, parsed.hd ?? [])
const shirts = splitByGender(TARGET_PARTS.ch, parsed.ch ?? [])
const pants = splitByGender(TARGET_PARTS.lg, parsed.lg ?? [])
const shoes = splitByGender(TARGET_PARTS.sh, parsed.sh ?? [])

const generated = `export const GENERATED_HAIRS = ${JSON.stringify(hairs, null, 8)} as const

export const GENERATED_HEADS = ${JSON.stringify(heads, null, 8)} as const

export const GENERATED_SHIRTS = ${JSON.stringify(shirts, null, 8)} as const

export const GENERATED_PANTS = ${JSON.stringify(pants, null, 8)} as const

export const GENERATED_SHOES = ${JSON.stringify(shoes, null, 8)} as const
`

fs.writeFileSync(path.join(ROOT, "lib/habbo/wardrobe.generated.ts"), generated)
console.log("OK: lib/habbo/wardrobe.generated.ts créé depuis", figurePath)
