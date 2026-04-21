# 🎨 Analyse du rendu graphique EtherWorld

**Version:** 21 avril 2026  
**Basé sur:** Stack Next.js 15.5.15 + Pixi.js + Canvas 2D + React

---

## 📊 Vue d'ensemble

EtherWorld utilise **une architecture hybride de rendu** combinant :
- 🎮 **Canvas 2D isométrique** pour le rendu des rooms (tuiles, meubles, avatars)
- 🌐 **Next.js React UI** pour les panneaux et menus
- ✨ **CSS moderne** avec glassmorphism et gradients

---

## 🎨 1. Design visual global

### Couleurs dominantes
```css
Fond principal:  #08111d (bleu très foncé)
Gradient bg:    Linear: #07101b → #04070f
Accent primaire: #4fc3f7 (cyan lumineux)
Accent accent:   #7c4dff (violet/mauve)
Texte:          #edf4ff (blanc cassé)
Muted:          #91a4c4 (gris bleu clair)
```

### Atmosphère
- 🌙 **Nocturne/Cyberpunk** — Ambiance sombre avec néons
- ✨ **Glassmorphism** — Panneaux semi-transparents avec blur
- 🔵 **Thème cyan/violet** — Inspiré par Habbo mais modernisé
- 🎆 **Animations subtiles** — Floating icons, shimmer effects

---

## 🏠 2. Rendu des Rooms (Canvas 2D Isométrique)

### Architecture du rendu

```
Canvas 2D (HTMLCanvasElement)
├─ Background Gradient (3 étapes)
├─ Isometric Grid
│  ├─ Walls (en arrière)
│  ├─ Tiles (sol, X,Y)
│  └─ Z-sorting
├─ Furniture Layer
│  ├─ Shadows (ombres elliptiques)
│  ├─ Sprites (image-rendering: pixelated)
│  └─ Selection highlight (cyan glow)
├─ Avatar Layer
│  ├─ Shadow ellipse
│  ├─ Sprite (64×80px)
│  └─ Animation support
└─ Drag Preview (semi-transparent overlay)
```

### Coordonnées isométriques

```typescript
// Conversion screen → isometric
type IsoPoint = { x: number; y: number; z: number }
type ScreenPoint = { x: number; y: number }

// Projection configuration
{
  originX: canvas.width / 2,      // Centre horizontal
  originY: 188                      // Décalage vertical (horizon)
}

// Profondeur de dessin (Z-ordering)
depth = x + y + (z * 0.5)
```

### Tuiles (Tiles)

**Dimensions:** 32×32 pixels (isométrique)
- Forme: Losange isométrique (diamond)
- Couleur: Gris sombre avec bordure subtile
- Hover state: Highlight cyan lumineux
- Grille: 16×16 tuiles par room (ROOM_SIZE = 16)

```css
Tile appearance:
- Resting: Gris foncé avec bordure 1px grise
- Hovered: Cyan (#4fc3f7) avec glow subtil
- Selected: Pas de sélection visuelle (mais interactif)
```

### Meubles (Furniture)

**Caractéristiques:**
- **Sprites:** PNG pixelisés (art Habbo-style)
- **Dimensions:** Variées (32×64, 64×64, etc.)
- **Ombres:** Ellipse noire semi-transparente (0.28 alpha)
- **Rotation:** Support 4-8 directions (rotation douce)
- **Interaction:** Selection glow cyan, bounding box

```javascript
// Propriétés de rendu du meuble
{
  type: "chair" | "table" | "door" | etc,
  x, y: number,                    // Position tuile
  z: number,                       // Hauteur
  rotation: 0-7,                   // Angles de rotation
  sprite: "/sprites/furnitures/...", // Image
  drawSize: { width, height },     // Dimensions de dessin
  offset: { x, y }                 // Décalage de dessin
}
```

**Selection visual:**
```
Sélectionné:
├─ Shadow glow cyan (shadowBlur: 22)
├─ Shadow color: rgba(0,224,255,0.58)
├─ Bounding box blanc (#f2f2f2)
└─ Line width: 2px
```

### Avatars

**Dimensions:** 64×80 pixels
- **Sprite:** `/sprites/avatar/avatar-ether.png`
- **Style:** Pixel art Habbo-like
- **Shadow:** Ellipse sous l'avatar (14×8px)
- **Position:** Centre du sol
- **Z-ordering:** Trié avec les meubles par profondeur

```javascript
drawIsoAvatar({
  x, y: number,                    // Position isométrique
  sprite: CanvasImageSource,       // Image pixel art
  shadow: ellipse(14px, 8px),      // Ombre douce
  height: 80px                     // Hauteur au-dessus du sol
})
```

### Gradients de fond (Room)

```css
Background gradient:
0%   → #121521 (gris très foncé)
45%  → #0D1018 (noir avec teinte bleue)
100% → #080A0F (noir pur)

Effet:
- Horizon haut: gris-bleu
- Milieu: dégradé progressif
- Bas: noir complet (profondeur)
```

---

## 🖼️ 3. Interface utilisateur (React + CSS)

### Layout principal (Desktop)

```
┌─────────────────────────────────────────────┐
│ Top bar: Logo | Titre | Actions             │
├────────────┬──────────────────────┬──────────┤
│  Left      │                      │  Right   │
│  Panel     │   Canvas Room        │  Panel   │
│            │   (Isometric)        │          │
│  - Rooms   │                      │ - Inv.   │
│  - Status  │                      │ - Looks  │
│  - Items   │                      │ - Nav.   │
└────────────┴──────────────────────┴──────────┘
```

### Pages principales

#### 1. **Homepage** (`app/page.tsx`)
```
┌──────────────────────────┐
│      🔱 ETHERWORLD       │ (Cyan glow)
│  HABBO-STYLE GAME ENGINE │
│                          │
│  [  CONNEXION BUTTON  ]  │ (Gradient cyan→violet)
│                          │
│  ████████░░░░░░░░░░░░░░ │ (Progress bar)
│  Chargement des avatars... │
│                          │
│   v2.0.0 — Premium Chbr  │
└──────────────────────────┘

Animations:
- Logo flotte verticalement (etherFloat)
- Progress bar brille (etherShimmer)
- Button scale on hover
```

#### 2. **Room Page** (`app/room/page.tsx`)
```
Full isometric renderer:
- Canvas 2D au centre
- Panneaux flottants:
  - Left: Looks panel (avatar customization)
  - Right: Navigator (room/furniture browser)
  - Bottom: Inventory dock (selected items)
  - D-Pad: Movement controls (mobile)
```

#### 3. **Marketplace** (`app/marketplace/page.tsx`)
```
Grid layout:
- Shop categories (left)
- Product grid (center)
- Each item: image + price + action
- Style: pixelated image-rendering
```

#### 4. **Client** (`app/client/page.tsx`)
```
Fullscreen Pixi.js canvas:
- Overlay UI (top): Logo + badges
- Center: Game canvas
- Bottom: Action buttons
- Fixed positioning (100vw × 100vh)
```

### Composants réutilisables

#### Buttons
```css
.button-primary:
  Background: linear-gradient(135deg, #4fc3f7, #7c4dff)
  Padding: 16px 48px
  Border-radius: 14-16px
  Hover: translateY(-2px) + enhanced shadow

.button-secondary:
  Background: rgba(255, 255, 255, 0.08)
  Hover: opacity increase
```

#### Panels (Glass effect)
```css
.glass-panel:
  Background: rgba(10, 16, 29, 0.86)
  Border: 1px solid rgba(135, 191, 255, 0.16)
  Backdrop-filter: blur(14px)
  Box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35)
```

#### Cards
```css
.ew-room-card / .ew-asset-card:
  Background: rgba(21, 31, 53, 0.94)
  Border: 1px solid rgba(255, 255, 255, 0.08)
  Border-radius: 18px
  Padding: 12-14px
  
  Active state:
    Outline: 2px solid rgba(79, 195, 247, 0.48)
    Shadow: inset cyan glow
```

#### Avatar Preview
```css
.ew-avatar-stage:
  Background: Gradient (cyan → violet)
  Size: 210px height
  Image-rendering: pixelated
  
  Display:
    - Sprite 124×124px
    - Pixelated rendering
    - Layers (body, clothes, accessories)
```

---

## 🎭 4. Système d'images (Sprites)

### Organisation des assets

```
/public/sprites/
├─ avatar/
│  └─ avatar-ether.png              (64×80, pixel art)
├─ furnitures/
│  ├─ chair-wood.png                (32×64)
│  ├─ table-round.png               (64×64)
│  ├─ door-red.png                  (32×96)
│  └─ ... (20+ furniture types)
├─ habbo/
│  ├─ avatars/                       (Original Habbo assets)
│  ├─ furnitures/                    (Original Habbo assets)
│  └─ items/
└─ ui/
   └─ icons/
```

### Propriétés de rendu

```css
/* Pixel art perfect rendering */
image-rendering: pixelated;
image-rendering: crisp-edges;
image-rendering: -moz-crisp-edges;
imageSmoothingEnabled: false;        /* Canvas API */

Resultat: Sprites nets et pixelisés (pas de blur)
```

---

## ⚡ 5. Animations & Interactions

### Animations CSS

```css
@keyframes etherFloat:
  0%, 100%  → translateY(0)
  50%       → translateY(-10px)
  Duration: 3s infinite

@keyframes etherShimmer:
  0%, 100%  → brightness(1)
  50%       → brightness(1.25)
  Duration: 2s infinite
```

### Interactions Canvas

```javascript
// Touch handlers
onTouchStart  → Detect long press (500ms)
onTouchMove   → Drag furniture / update hover
onTouchEnd    → Detect single/double tap

// Gesture recognition
Single tap on tile     → Move avatar
Double tap on tile     → Teleport
Long press on item     → Start drag
Drag + release         → Place furniture
```

### Hover effects

```javascript
// Tile hover
- Hovered tile gets cyan highlight
- Updated in real-time during drag
- Clamps to valid grid positions

// Furniture hover
- Detect via hit polygon (collision detection)
- Show selection glow (cyan shadow)
- Bounding box outline
```

---

## 📱 6. Responsive Design

### Desktop (> 1240px)
```
3-column grid:
[320px left panel] | [fluid center] | [320px right panel]
```

### Tablet (720px - 1240px)
```
1-column layout:
- Full width panels
- Stacked vertically
- Canvas responsive height
```

### Mobile (< 720px)
```
- Fullscreen canvas
- Floating panels (overlay)
- D-Pad controls (floating)
- Inventory dock (bottom overlay)
- Touch-optimized buttons (44px min)
```

---

## 🔧 7. Stack technologique

### Rendering engines

| Engine | Usage | Pourquoi |
|--------|-------|---------|
| Canvas 2D | Room isométrique | Performance, contrôle fin, pixel art |
| React | UI & layouts | Composants réutilisables, state management |
| CSS Grid | Layouts complexes | Responsive, flexible |
| Pixi.js | Client fullscreen (opt) | WebGL accélération si besoin |

### Libraries graphiques

- **@pixi/react** (8.0.3) — Bindings React pour Pixi.js
- **clsx** (2.1.1) — Gestion des classes CSS conditionnelles
- **zod** (4.1.5) — Validation de types (assets, furniture)

### Image processing

- **sharp** (0.34.3) — Optimisation PNG/sprite generation (backend)

---

## 🎬 8. Performance

### Optimisations appliquées

```javascript
✓ Usememo pour tri Z-ordering (sortedFurnitures)
✓ Image preloading async (charger avant rendu)
✓ Canvas DPR scaling (device pixel ratio)
✓ requestAnimationFrame implicit (React render loop)
✓ Hit polygon caching (collision detection)
✓ Lazy sprite loading (unique paths only)
```

### Métriques

```
Canvas size:        560-760px height (responsive)
Tile resolution:    32×32 isométrique
Furniture count:    ~10-20 visible
FPS target:         60fps (canvas 2D)
Bundle size:        ~102kB shared + routes
```

---

## 🎨 9. Style visual signature

### Inspirations
- **Habbo Hotel** — Isométrie, pixel art, social game
- **Cyberpunk** — Palette cyan/violet, dark mode, neons
- **Modern design** — Glassmorphism, gradients, smooth transitions

### Identité visuelle
- 🔷 **Géométrie isométrique** — Tuiles et meubles 3D
- 🎨 **Pixel art** — Sprites retro (64-128px)
- 🌙 **Dark mode** — Ambiance nocturne immersive
- ✨ **Glow effects** — Selection cyan, text shadows
- 🎭 **Avatar customization** — Clothes layers, accessories

---

## 📋 10. Hiérarchie visuelle

```
Z-index layers (Canvas):
  Background    → Gradient bg + walls
  Tiles         → Sol isométrique
  Shadows       → Sous meubles/avatar
  Furniture     → Items > 0 taille
  Avatar        → Joueur principal
  Selection     → Highlights et selection
  Drag preview  → Semi-transparent overlay
  
Z-index (React):
  1  → Glass panels, cards
  3  → Inventory dock
  5  → Floating panels (Looks, Navigator)
  20 → Top overlay (logo, badges)
  30 → Bottom action buttons
```

---

## 🎯 Résumé visuel

| Aspect | Style |
|--------|-------|
| **Ambiance** | Cyberpunk sombre avec néons |
| **Palette** | Cyan lumineux + violet accent |
| **Typographie** | Arial sans-serif, uppercase caps |
| **Iconographie** | Emojis (🔱, 👤, etc) + pixel art |
| **Layout** | Grille responsive + overlays |
| **Interactions** | Smooth, subtle, tactile |
| **Performance** | 60fps Canvas, <2s load |

---

## 🚀 Améliorations futures

```
Phase 1 (Court terme):
  [ ] Animations sprite (marche, danse, émotes)
  [ ] Effets de particules (flammes, bulles)
  [ ] Dynamic lighting (ombres directionnelles)

Phase 2 (Moyen terme):
  [ ] WebGL avec Pixi.js pour meilleures perfs
  [ ] Shaders personnalisés (post-processing)
  [ ] Animated backgrounds

Phase 3 (Long terme):
  [ ] 3D isométrique (Three.js)
  [ ] Physics engine (meubles qui tombent)
  [ ] Real-time multiplayer avatars
```

---

**Rapport généré:** 21 avril 2026  
**Analyse basée sur:** Code source complet + CSS + Canvas API
