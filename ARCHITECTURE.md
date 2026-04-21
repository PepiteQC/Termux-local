# EtherWorld Client Architecture

## 📋 Overview

EtherWorld is a full-featured Habbo-like client with isometric room rendering, avatar customization, furniture system, and marketplace integration.

## 🎮 Core Systems

### 1. **Room Engine** (`lib/room/`)
- **Canvas-based isometric renderer** with depth sorting
- Real-time pathfinding and smooth avatar movement
- Furniture collision detection and placement
- Interactive tile highlighting

**Key files:**
- `types.ts` - Room definitions and interfaces
- `map.ts` - Isometric coordinate conversion and tile detection
- `pathfinding.ts` - A* pathfinding algorithm for avatar navigation
- `sampleRoom.ts` - Room configuration and furniture layout

### 2. **Avatar System** (`lib/avatar/`)
- Customizable outfit with layered clothing
- Real-time visual updates
- Animation support (walk/idle)
- Direction-based sprite rendering

**Key files:**
- `AvatarRenderer.ts` - Custom avatar drawing with color mapping
- Supports: hair, shirt, jacket, pants, shoes, accessories

### 3. **Furniture & Objects** (`lib/furniture/`)
- Complete furniture registry with 50+ items
- Sprite-based rendering
- Collision and depth calculation
- Furniture states and properties

**Key files:**
- `FurnitureRegistry.ts` - Complete furniture catalog with dimensions and offsets
- `FurnitureTypes.ts` - Type definitions
- `FurnitureCollision.ts` - Collision detection system

### 4. **Data & Marketplace** (`data/`)
- `clothing.ts` - 40+ clothing items across 6 categories
- `marketplace.ts` - Full shop inventory with pricing (50+ items)
- Dynamic category filtering

### 5. **UI Components** (`components/`)

#### RoomUIPanel.tsx
Central control panel with tabbed interface:
- **Wardrobe Panel** - Avatar outfit customization
- **Shop Panel** - Browse and purchase items
- **Inventory Panel** - View and manage owned items

#### WardrobePanel.tsx
- 5 clothing categories (hair, tops, jackets, bottoms, shoes)
- Real-time outfit preview
- Color-coded items

#### ShopPanel.tsx
- 11 shop categories
- Item descriptions and prices
- Purchase confirmation

#### InventoryPanel.tsx
- Separate furniture/clothing display
- Quick actions (Place/Use)
- Quantity tracking

### 6. **State Management** (Optional - Zustand ready)
- `lib/store/gameStore.ts` - Global game state
- Room state, inventory, outfit
- Actions for all game operations

## 🏗️ Project Structure

```
etherworld/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── room/
│   │   ├── page.tsx
│   │   └── EtherRoom.tsx          # Main room view
│   └── api/
├── lib/
│   ├── types/
│   │   └── game.ts                # Game type definitions
│   ├── engine/
│   │   └── IsometricEngine.ts     # Isometric math
│   ├── avatar/
│   │   └── AvatarRenderer.ts      # Avatar rendering
│   ├── furniture/
│   │   ├── FurnitureRegistry.ts   # All furniture
│   │   └── FurnitureTypes.ts
│   ├── room/
│   │   ├── types.ts
│   │   ├── map.ts
│   │   ├── pathfinding.ts
│   │   └── sampleRoom.ts
│   ├── renderer/
│   │   └── RoomRenderer.ts        # Pixi.js renderer
│   └── store/
│       └── gameStore.ts           # Zustand state
├── components/
│   ├── RoomViewer.tsx             # Pixi.js room canvas
│   ├── RoomUIPanel.tsx            # Main UI control
│   ├── WardrobePanel.tsx          # Outfit selector
│   ├── ShopPanel.tsx              # Marketplace
│   ├── InventoryPanel.tsx         # Item management
│   ├── Wardrobe.tsx               # Legacy wardrobe
│   ├── Shop.tsx                   # Legacy shop
│   └── Inventory.tsx              # Legacy inventory
├── data/
│   ├── clothing.ts                # 40+ clothing items
│   ├── marketplace.ts             # 50+ shop items
│   └── avatars.json
├── public/
│   └── sprites/
│       ├── furnitures/            # 50+ furniture sprites
│       └── avatar/                # Clothing sprites
└── package.json
```

## 🎨 Features Implemented

### Room Rendering
- ✅ Isometric perspective (45° angle, 2:1 ratio)
- ✅ Floor tiles with depth sorting
- ✅ Walls (back and left) with texture details
- ✅ Hover tile highlighting
- ✅ Furniture depth calculation
- ✅ Shadow rendering for visual depth

### Avatar System
- ✅ Layered clothing rendering
- ✅ Customizable outfit (hair, shirt, jacket, pants, shoes)
- ✅ Real-time visual updates
- ✅ Walk/idle animations
- ✅ Direction-aware rendering

### Furniture & Objects
- ✅ 50+ furniture items in registry
- ✅ Realistic dimensions and offsets
- ✅ Glow effects on select items
- ✅ Multiple furniture kinds (sofa, bed, lamp, plant, screen, desk, etc.)
- ✅ Collision detection

### Marketplace
- ✅ 11 shop categories
- ✅ 50+ purchasable items
- ✅ Item pricing and descriptions
- ✅ Real-time inventory updates
- ✅ Visual item previews

### User Interface
- ✅ Tabbed control panel
- ✅ Smooth transitions and hover states
- ✅ Category-based item browsing
- ✅ Real-time status feedback
- ✅ Responsive button states
- ✅ Scrollable item lists
- ✅ Color-coded purchase confirmations

## 🔧 Technology Stack

- **Frontend**: React 19 + Next.js 15
- **Rendering**: Canvas (EtherRoom) + Pixi.js ready (RoomRenderer)
- **State**: Zustand (configured, ready to use)
- **Styling**: Inline CSS + Tailwind-ready
- **Type Safety**: TypeScript 5.9
- **Build**: Next.js 15

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Type Checking
```bash
npm run typecheck
```

### Build
```bash
npm run build
npm start
```

## 📦 Asset Organization

**Furniture Sprites**: `/public/sprites/furnitures/`
- Format: PNG with transparency
- 50+ items pre-registered
- Naming: `{furniture-id}.png`

**Avatar Sprites**: `/public/sprites/avatar/`
- Hair, shirts, jackets, pants, shoes, glasses
- Organized by clothing type
- Spritesheets with multiple frames for animation

## 🎯 Key Design Decisions

1. **Canvas for Room** - Direct pixel-perfect control, smooth animations, proven Habbo technique
2. **Zustand for State** - Minimal boilerplate, perfect for game state
3. **Isometric Rendering** - Classic Habbo perspective, 64x32 tiles
4. **Layered Clothing** - Each outfit piece rendered separately for full customization
5. **Registry Pattern** - Centralized furniture catalog, easy to extend
6. **Type Safety** - Full TypeScript for all game systems

## 🔄 Data Flow

```
User Interaction
    ↓
RoomUIPanel (event handler)
    ↓
State Update (Zustand/Local State)
    ↓
Component Re-render
    ↓
Canvas/Room Update (EtherRoom component)
    ↓
Visual Feedback (tile hover, status message)
```

## 📝 Extending the System

### Add New Furniture
1. Create sprite PNG at `/public/sprites/furnitures/{id}.png`
2. Add entry to `FURNITURE_REGISTRY` in `lib/furniture/FurnitureRegistry.ts`
3. Add marketplace item to `data/marketplace.ts`

### Add New Clothing
1. Add definition to `data/clothing.ts`
2. Create sprite at `/public/sprites/avatar/{category}/{id}.png`
3. Update `getClothingByCategory()` function

### Add New Shop Category
1. Add to `SHOP_CATEGORIES` in `data/marketplace.ts`
2. Add items with that category
3. Update `ShopPanel.tsx` if needed

## 🎮 Room Controls

- **Left Click** - Walk to tile
- **Hover** - Highlight walkable tiles
- **UI Buttons** - Open wardrobe/shop/inventory
- **Select Items** - Choose outfit or furniture

## 📊 Performance Notes

- Canvas rendering: 60 FPS target
- Depth sorting: O(n log n) per frame
- Pathfinding: A* algorithm with blocked set cache
- Furniture sprites: Loaded on-demand with caching
- Avatar updates: Real-time, no expensive recalculations

## 🐛 Known Limitations

- Drag & drop for furniture placement (ready for implementation)
- Multi-item stacking not fully visualized
- Avatar animations are simplified (ready for spritesheet)
- Wall interactions (doors, windows) not interactive yet

## 🔮 Next Steps

1. Implement furniture drag & drop to room
2. Add avatar animations from spritesheet
3. Add room saved/load functionality
4. Implement furniture rotation
5. Add multiplayer avatar viewing
6. Create custom room editor

---

**Status**: Room engine functional, full UI panels implemented, ready for gameplay features.
