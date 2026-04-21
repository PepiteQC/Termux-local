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
