# 🎨 EtherWorld - Visual Guide Rapide

## À quoi ça ressemble ?

### 🏠 **Écran Principal (Room)**

```
┌──────────────────────────────────────────────────────┐
│  EtherWorld    [Status Badges]      [Menu buttons]   │  ← Top bar cyan
├─────────────────────────────────────────────────────────┤
│                                                        │
│  ╔════════════════════════════════════════════════╗  │
│  ║                                                ║  │
│  ║         ISOMETRIC GAME ROOM (Canvas)           ║  │
│  ║                                                ║  │
│  ║    ⬡ Tuiles grises (losanges)                ║  │
│  ║   /|\ Meubles pixelisés (sprites)            ║  │
│  ║  / | \ Avatar joueur (64×80px)               ║  │
│  ║                                                ║  │
│  ║  - Cyan glow quand sélectionné               ║  │
│  ║  - Shadows sous chaque objet                 ║  │
│  ║  - Dark background (gradient noir-bleu)      ║  │
│  ║                                                ║  │
│  ╚════════════════════════════════════════════════╝  │
│                                                        │
│ [◀ Prev] [Next ▶]  [Teleport]  [Settings]    👤      │
└────────────────────────────────────────────────────────┘
```

### 🎨 **Palette de couleurs**

```
┌─────────────────────────────────────────┐
│ DARK BLUE        #08111d  ███           │  ← Fond principal
│ DARKER NAVY      #07101b  ███           │  ← Walls/bg top
│ PURE BLACK       #000000  ███           │  ← Ombres
├─────────────────────────────────────────┤
│ CYAN BRIGHT      #4fc3f7  ███ ✨        │  ← PRIMARY (boutons)
│ VIOLET ACCENT    #7c4dff  ███ ✨        │  ← ACCENT (gradients)
├─────────────────────────────────────────┤
│ TEXT LIGHT       #edf4ff  ███           │  ← Texte principal
│ MUTED BLUE       #91a4c4  ███           │  ← Texte secondaire
└─────────────────────────────────────────┘
```

---

## 🎮 **Types de visuels**

### 1️⃣ **Login Screen**
```
        🔱
     ETHERWORLD
   HABBO-STYLE GAME

   ┌─────────────────┐
   │  CONNEXION      │  ← Gradient cyan→violet
   │                 │     Glow effect
   └─────────────────┘

  ████████░░░░░░░░░  ← Progress bar (shimmer)
  Chargement des avatars...
```

**Style:** Glassmorphism card, centré, noir semi-transparent avec border fine

---

### 2️⃣ **Game Room Canvas**

**Background:**
```
█████████████████████  ← #121521 (gris-bleu top)
███████████████████░░
██████████████░░░░░░░
███████░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░  ← #080A0F (noir pur bottom)
```

**Éléments:**
```
   Tuile normal        Tuile hovered         Meuble sélectionné
   ╱╲  gris           ╱╲  CYAN              ╱╲  + Cyan shadow
  ╱  ╲ foncé         ╱  ╲ lumineux         ╱  ╲ + Box outline
  ╲  ╱              ╲  ╱ + glow            ╲  ╱ + Glow effect
   ╲╱                ╲╱                     ╲╱
   
   Avatar            Meuble               Ombre
   👤 pixel art      📦 sprite            ⭕ ellipse noire
   64×80px          32-128px              transparent
```

---

### 3️⃣ **UI Panels** (Glassmorphic)

```
┌─────────────────────────────────────┐
│  PANEL TITLE                    [✕] │  ← Header avec fermer
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🎭  Item / Avatar Preview    │ │
│  │      (pixelated image)        │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Button 1] [Button 2] [Button 3]  │
│                                     │
│  ├─ List Item 1                    │
│  ├─ List Item 2                    │
│  └─ List Item 3                    │
│                                     │
└─────────────────────────────────────┘

Style:
- Background: Semi-transparent dark blue
- Border: Thin cyan outline
- Backdrop: Blur effect (10-14px)
- Shadow: Glow effect 0 18px 42px
```

---

### 4️⃣ **Avatar Customization**

```
        👤
      (64×80px)
    Pixel art
    Color: Skin tone
    
    ┌─ Head
    ├─ Body (clothes layer)
    ├─ Feet (shoes layer)
    └─ Accessories (hat, bag, etc)

Preview:
    Haut-contraste pour clarté
    Fond dégradé léger
    Position centrée
```

---

### 5️⃣ **Buttons & Interactions**

```
PRIMARY BUTTON (Gradient)
┌────────────────────┐
│   CONNEXION        │  ← Cyan→Violet gradient
│ (Elevated shadow)  │     Box-shadow intense
└────────────────────┘
Hover: Move up (-2px) + brighten shadow

SECONDARY BUTTON (Glass)
┌────────────────────┐
│   Secondary        │  ← Transparent + border
│ (Subtle shadow)    │
└────────────────────┘
Hover: Increase opacity

CARD ACTIVE STATE
┌────────────────────┐
│ Item Name      [✓] │  ← Cyan outline (2px)
│ Price         10$  │     Inset glow
└────────────────────┘
```

---

## 🎬 **Animations**

### Icon Float
```
Frame 1: ↑ (translateY: -10px)
Frame 2: ↔ (translateY: 0)
Frame 3: ↓ (translateY: -10px)
Duration: 3s, infinite
Effect: Icon flotte doucement
```

### Progress Shimmer
```
████████░░░░░░░░░░░  ← brightness: 1
███████░░░░░░░░░░░░░  ← brightness: 1.25 (brillant)
████████░░░░░░░░░░░  ← brightness: 1
Duration: 2s, infinite
Effect: Barre de progresse brille
```

### Button Hover
```
Resting:  position: normal, shadow: normal
Hover:    transform: translateY(-2px), shadow: larger
Active:   transform: none
```

---

## 📱 **Mobile View**

```
┌─────────────┐
│   EtherWld  │  ← Compact header
├─────────────┤
│  FULLSCREEN │
│   CANVAS    │  ← Canvas remplit l'écran
│             │
│  [↑] [Menu] │  ← D-Pad en bas droit
│  [←][↓][→]  │
│             │
└─────────────┘
 Overlay panels (top/bottom) en besoin
```

---

## 🖼️ **Types de sprites (Pixel Art)**

### Avatar Habbo-style
```
   ╭─╮
   │ │ (8×8 head, skin tone)
  ╭┴─┴╮
  │   │ (16×16 body, colored)
  ╰───╯
   │ │ (4×8 arms)
  ╭┴─┴╮
  │   │ (8×8 legs)
  ╰───╯
  
Total: ~64×80px au canvas
```

### Furniture Examples
```
Chair        Table        Door
  ▀▀         ┌────┐      ╒════╕
 ▀▄▄▀        │    │      │    │
  ▐▌        │    │      │ ⭕ │
            └────┘      ╘════╛

 32×64px    64×64px    32×96px
```

---

## 🌈 **Glassmorphism Elements**

Tous les panneaux appliquent:
```css
background: rgba(10, 16, 29, 0.86)  /* 86% opacité */
backdrop-filter: blur(14px)          /* Blur du fond */
border: 1px solid rgba(..., 0.16)    /* Border fine */
box-shadow: 0 18px 42px rgba(0,0,0,.35)
```

**Résultat:** Effet "verre dépoli" moderne avec profondeur

---

## ✨ **Glow Effects**

### Selection Cyan Glow
```
outline: 2px solid rgba(79, 195, 247, 0.48)
box-shadow: 0 0 16px rgba(79, 195, 247, 0.3)
```

### Text Glow
```
text-shadow: 0 0 24px rgba(79, 195, 247, 0.45)
```

### Shadow Blur (Furniture)
```
ctx.shadowBlur = 22
ctx.shadowColor = "rgba(0, 224, 255, 0.58)"  /* Cyan vif */
```

---

## 🎯 **Tailles standards**

```
Avatar sprite:        64×80px
Small furniture:      32×64px
Medium furniture:     64×64px
Large furniture:      128×128px
Tile isometric:       32×32px (losange)

Button min-height:    38-42px
Panel border-radius:  18-24px
Card padding:         12-16px
Gap spacing:          8-12px
```

---

## 📊 **Responsive breakpoints**

```
Desktop (> 1240px):
  3-column grid
  320px sidebars
  Full UI

Tablet (720px - 1240px):
  1-column stacked
  Full width panels
  Medium canvas

Mobile (< 720px):
  Fullscreen canvas
  Floating overlays
  44px+ touch targets
  D-Pad controls
```

---

## 🎓 **Summary**

**EtherWorld looks like:**
- 🌙 **Dark cyberpunk aesthetic** (inspiration Habbo meets 2020s design)
- 🎮 **Isometric pixel art game** (tuiles losanges, sprites retro)
- 🔵 **Cyan & violet neons** (bright accents on dark background)
- ✨ **Glassmorphic UI** (modern, blurred panels)
- 📱 **Fully responsive** (desktop, tablet, mobile optimized)
- 🎭 **Avatar customization** (pixel art character builder)
- 🏠 **Social game rooms** (Habbo-inspired spaces)

**Inspirations visuelles:**
- Habbo Hotel (isométrie, gameplay)
- Cyberpunk 2077 (palette cyan/violet)
- iOS/macOS design (glassmorphism, shadows)
- Retro gaming (pixel art, sprites)

---

**Version:** 21 avril 2026  
**Visualisée:** Production live
