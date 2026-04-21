# EtherWorld Habbo-Like Integration Guide

## Architecture Overview

La room EtherWorld utilise maintenant un système complètement thématisé Habbo-like avec:
- Rendu des tiles avec palettes dynamiques
- Murs thématiques premium
- Registry centralisé des assets Habbo
- Configuration simple via JSON

## Core Components

### 1. Theme Management

**ThemeManager.ts** - Palettes de couleurs pour tiles
```typescript
import { getThemePalette } from '@/data/habbo/ThemeManager'

const palette = getThemePalette()
// { topColor, topStroke, southColor, southStroke, eastColor, eastStroke, highlight1, innerDetail1, innerDetail2, shadowAccent }
```

**WallPaletteManager.ts** - Palettes pour les murs
```typescript
import { getWallPalette } from '@/data/habbo/WallPaletteManager'

const wallPalette = getWallPalette()
// { eastMain, eastEdge, eastStroke, southMain, southEdge, southStroke, ... }
```

### 2. Asset Registry

**HabboAssetRegistry.ts** - Gestion centralisée des assets
```typescript
import { assetRegistry } from '@/data/habbo/HabboAssetRegistry'

// Récupérer les assets actifs
const assets = assetRegistry.getAllActiveAssets()
// { floor, wall, rug, window }

// Accéder à un asset spécifique
const wallAsset = assetRegistry.getActiveWall()
// { name, category, filename, path, isActive }

// Lister tous les assets d'une catégorie
const floors = assetRegistry.getAssetsByCategory('floor')
```

### 3. Theme Configuration

**active-room-theme.json** - Configuration du thème actif
```json
{
  "floor": "steampunk_floor2",
  "floorFallback": "rainyday_c20_woodenfloor",
  "rug": "gothic_carpet",
  "wall": "paris_c15_wall",
  "window": "window_nt_skyscraper"
}
```

**visual-shortlist.json** - Catalogue des assets disponibles
```json
{
  "walls": ["paris_c15_wall", "anc_c15_wall", ...],
  "floors": ["steampunk_floor2", "gothic_carpet", ...],
  "windows": ["window_nt_skyscraper", ...]
}
```

## Changing Themes

### Option 1: Edit active-room-theme.json
```json
{
  "floor": "gothic_carpet",
  "wall": "anc_c15_wall",
  "rug": "tiki_junglerug",
  "window": "art_c20_window"
}
```
Les couleurs se changent automatiquement au reload.

### Option 2: Ajouter un nouveau floor/wall
1. Ajouter le nom dans `visual-shortlist.json`
2. Ajouter la palette dans `ThemeManager.ts` (pour floors) ou `WallPaletteManager.ts` (pour walls)
3. Assets `.swf` doivent être dans `/public/habbo-selected/`

Exemple pour ajouter `ma_custom_floor`:
```typescript
// ThemeManager.ts
const PALETTES: Record<string, TilePalette> = {
  ma_custom_floor: {
    topColor: 0x4a3a2a,
    topStroke: 0x7a5a40,
    southColor: 0x3a2a1a,
    southStroke: 0x6a4a30,
    eastColor: 0x2a1a0a,
    eastStroke: 0x5a3a20,
    highlight1: 0xd4b080,
    innerDetail1: 0x6a5a40,
    innerDetail2: 0x4a3a25,
    shadowAccent: 0x2a1a10
  },
  // ... autres
}
```

## Debugging

Au boot, ouvrez la console pour voir le status complet:
```
🎨 ETHERWORLD HABBO-LIKE THEME STATUS
═══════════════════════════════════════════════════
📍 Active Theme: { floor: "steampunk_floor2", ... }
🏠 Assets: { floor: "steampunk_floor2", wall: "paris_c15_wall", ... }
🎨 Tile Palette: { topColor: "#2a241b", ... }
🧱 Wall Palette: { eastMain: "#bbb5ca", ... }
═══════════════════════════════════════════════════
```

Ou accéder directement:
```typescript
import { HabboThemeVisualizer } from '@/data/habbo/HabboThemeVisualizer'

HabboThemeVisualizer.logThemeStatus()
const status = HabboThemeVisualizer.getThemeStatus()
```

## Asset Integration Pipeline

Les assets Habbo `.swf` sont prêts à être intégrés visuellement. La structure est en place:

1. **Asset Discovery** → `assetRegistry` les catalogue
2. **Asset Resolution** → `.swf` files dans `/public/habbo-selected/`
3. **Theme Binding** → Active assets via `active-room-theme.json`

Pour brancher visuellement les textures `.swf` dans les tiles/murs:
1. Créer un `TextureCache` qui précharge les `.swf`
2. Utiliser `assetRegistry.getActiveFloor()` pour récupérer le chemin
3. Passer les textures à TileGenerator/WallGenerator

## Visual Assets Location

```
/public/habbo-selected/
├── floors/       (9 fichiers .swf)
├── walls/        (7 fichiers .swf)
└── windows/      (4 fichiers .swf)
```

## Palettes disponibles

### Floors
- steampunk_floor2 (actuel)
- rainyday_c20_woodenfloor
- pixel_floor_brown
- gothic_carpet
- hs_carpet_blk
- val14_largetile
- tiki_junglerug
- env_grass
- suncity_c19_floor

### Walls
- paris_c15_wall (actuel)
- anc_c15_wall
- tiki_c15_wall
- bling_c15_wall
- exe_c15_wall
- romantique_c15_wall
- gold_c15_arc_icewall

### Windows
- window_nt_skyscraper (actuel)
- window_nt_diner2
- art_c20_window
- lodge_c15_window

## Code Structure

```
src/
├── data/habbo/
│   ├── ThemeManager.ts              # Palettes tiles
│   ├── WallPaletteManager.ts         # Palettes murs
│   ├── HabboAssetRegistry.ts         # Registry assets
│   ├── HabboThemeVisualizer.ts       # Debug visualizer
│   ├── initTheme.ts                  # Boot hook
│   ├── active-room-theme.json        # Config active
│   └── visual-shortlist.json         # Catalogue assets
│
├── rooms/
│   ├── tiles/
│   │   └── TileGenerator.ts          # Rendu tiles (v2 - premium)
│   └── walls/
│       └── WallGenerator.ts          # Rendu murs (v2 - premium)
│
└── Habbo.ts                          # Boot + hook theme
```

## Performance Notes

- Palettes pré-calculées et cachées en memoria
- Pas de rechargement dynamique - thème fixe au boot
- Assets `.swf` stockés statiquement → prêts pour intégration texture

## Next Steps

1. ✅ Palettes thématiques pour tous les floors/walls
2. ✅ Registry centralisé des assets
3. ✅ Configuration simple via JSON
4. ⏳ Intégration textures `.swf` directes dans TileGenerator
5. ⏳ Support des rugs comme objets placés
6. ⏳ Support des windows comme décoration murale
