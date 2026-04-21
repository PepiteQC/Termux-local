#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "==> Création des dossiers assets et data packs..."

mkdir -p public/assets/{walls,floors,landscapes,furni,avatars,ui,fx,icons,rooms}
mkdir -p public/assets/walls/{classic,luxury,industrial,neon,gothic,crystal,ether,vip}
mkdir -p public/assets/floors/{wood,marble,tile,carpet,metal,neon,terrace,void}
mkdir -p public/assets/landscapes/{city,sunset,beach,mountain,astral,void,luxury}
mkdir -p public/assets/furni/{seating,tables,beds,storage,lighting,decor,electronics,wall_items,doors,dividers,plants,music,bath,vip,rare}
mkdir -p public/assets/avatars/{base,hair,tops,bottoms,shoes,accessories,fx,emotes,directions}
mkdir -p public/assets/ui/{windows,buttons,panels,tabs,chat,inventory,catalog,profile,badges,nav,shop}
mkdir -p public/assets/icons/{currencies,gangs}
mkdir -p public/assets/fx/{auras,particles,overlays,sparkles,distortions,divine,astral,crystal}
mkdir -p public/assets/rooms
mkdir -p data/packs

echo "==> Création des JSON de packs..."

cat > data/packs/walls.json <<'JSON'
[
  {
    "id": "wall-classic-blue-panel",
    "name": "Classic Blue Panel",
    "category": "wall",
    "style": "classic",
    "sprite": "/assets/walls/classic/blue-panel.png",
    "rarity": "common",
    "price": 120
  },
  {
    "id": "wall-luxury-black-marble",
    "name": "Luxury Black Marble",
    "category": "wall",
    "style": "luxury",
    "sprite": "/assets/walls/luxury/black-marble-wall.png",
    "rarity": "rare",
    "price": 320
  },
  {
    "id": "wall-crystal-void",
    "name": "Crystal Void",
    "category": "wall",
    "style": "crystal",
    "sprite": "/assets/walls/crystal/crystal-void-wall.png",
    "rarity": "premium",
    "price": 450
  }
]
JSON

cat > data/packs/floors.json <<'JSON'
[
  {
    "id": "floor-wood-light",
    "name": "Light Wood",
    "category": "floor",
    "style": "wood",
    "sprite": "/assets/floors/wood/light-wood.png",
    "rarity": "common",
    "price": 100
  },
  {
    "id": "floor-marble-black",
    "name": "Black Marble",
    "category": "floor",
    "style": "marble",
    "sprite": "/assets/floors/marble/black-marble.png",
    "rarity": "rare",
    "price": 280
  },
  {
    "id": "floor-void-neochrome",
    "name": "Void Neochrome",
    "category": "floor",
    "style": "void",
    "sprite": "/assets/floors/void/void-neochrome.png",
    "rarity": "premium",
    "price": 420
  }
]
JSON

cat > data/packs/landscapes.json <<'JSON'
[
  {
    "id": "landscape-city-night",
    "name": "City Night",
    "category": "landscape",
    "style": "city",
    "sprite": "/assets/landscapes/city/city-night.png",
    "rarity": "common",
    "price": 180
  },
  {
    "id": "landscape-sunset-gold",
    "name": "Golden Sunset",
    "category": "landscape",
    "style": "sunset",
    "sprite": "/assets/landscapes/sunset/golden-sunset.png",
    "rarity": "uncommon",
    "price": 220
  },
  {
    "id": "landscape-astral-cosmos",
    "name": "Astral Cosmos",
    "category": "landscape",
    "style": "astral",
    "sprite": "/assets/landscapes/astral/astral-cosmos.png",
    "rarity": "premium",
    "price": 500
  }
]
JSON

cat > data/packs/furni.json <<'JSON'
[
  {
    "id": "furni-sofa-modern-white",
    "name": "Modern White Sofa",
    "category": "seating",
    "sprite": "/assets/furni/seating/sofa-modern-white.png",
    "size": { "w": 3, "h": 1 },
    "interactive": true,
    "action": "sit",
    "rarity": "common",
    "price": 200
  },
  {
    "id": "furni-bed-luxury-black",
    "name": "Luxury Black Bed",
    "category": "beds",
    "sprite": "/assets/furni/beds/bed-luxury-black.png",
    "size": { "w": 3, "h": 2 },
    "interactive": true,
    "action": "lie",
    "rarity": "rare",
    "price": 420
  },
  {
    "id": "furni-lamp-crystal-orb",
    "name": "Crystal Orb Lamp",
    "category": "lighting",
    "sprite": "/assets/furni/lighting/lamp-crystal-orb.png",
    "size": { "w": 1, "h": 1 },
    "interactive": true,
    "action": "toggle",
    "rarity": "premium",
    "price": 310
  }
]
JSON

cat > data/packs/boutique.json <<'JSON'
[
  {
    "id": "shop-halo-divin",
    "name": "Halo Divin",
    "category": "effects",
    "sprite": "/assets/fx/shop-previews/halo-divin.png",
    "rarity": "premium",
    "price": 1200,
    "currency": "crystals"
  },
  {
    "id": "shop-aura-astrale",
    "name": "Aura Astrale",
    "category": "effects",
    "sprite": "/assets/fx/shop-previews/aura-astrale.png",
    "rarity": "legendary",
    "price": 1800,
    "currency": "crystals"
  },
  {
    "id": "shop-bundle-ether-noir",
    "name": "Bundle Ether Noir",
    "category": "bundle",
    "sprite": "/assets/ui/shop/bundle-ether-noir.png",
    "rarity": "premium",
    "price": 2400,
    "currency": "crystals"
  }
]
JSON

cat > data/packs/avatars.json <<'JSON'
[
  {
    "id": "avatar-base-masc-01",
    "name": "Base Masc 01",
    "category": "base",
    "sprite": "/assets/avatars/base/base-masc-01.png",
    "rarity": "default"
  },
  {
    "id": "avatar-hair-neochrome",
    "name": "Hair Neochrome",
    "category": "hair",
    "sprite": "/assets/avatars/hair/hair-neochrome.png",
    "rarity": "premium",
    "price": 450
  },
  {
    "id": "avatar-top-crystal-jacket",
    "name": "Crystal Jacket",
    "category": "tops",
    "sprite": "/assets/avatars/tops/top-crystal-jacket.png",
    "rarity": "rare",
    "price": 600
  }
]
JSON

cat > data/packs/interactions.json <<'JSON'
[
  { "id": "walk", "label": "Marcher", "type": "movement" },
  { "id": "sit", "label": "S'asseoir", "type": "furni" },
  { "id": "lie", "label": "Se coucher", "type": "furni" },
  { "id": "dance", "label": "Danser", "type": "emote" },
  { "id": "wave", "label": "Salut", "type": "emote" },
  { "id": "talk", "label": "Parler", "type": "chat" },
  { "id": "whisper", "label": "Chuchoter", "type": "chat" },
  { "id": "shout", "label": "Crier", "type": "chat" },
  { "id": "use", "label": "Utiliser", "type": "object" },
  { "id": "rotate", "label": "Tourner objet", "type": "build" }
]
JSON

cat > data/packs/gangs.json <<'JSON'
[
  {
    "id": "gang-badge-void",
    "name": "Void Badge",
    "category": "badge",
    "sprite": "/assets/icons/gangs/gang-badge-void.png",
    "rarity": "rare"
  },
  {
    "id": "gang-banner-ether",
    "name": "Ether Banner",
    "category": "banner",
    "sprite": "/assets/ui/gangs/gang-banner-ether.png",
    "rarity": "premium"
  },
  {
    "id": "gang-throne-leader",
    "name": "Leader Throne",
    "category": "furniture",
    "sprite": "/assets/furni/gangs/throne-leader.png",
    "rarity": "legendary"
  }
]
JSON

cat > data/packs/ui.json <<'JSON'
[
  {
    "id": "ui-chat-bubble-dark",
    "name": "Dark Chat Bubble",
    "category": "chat",
    "sprite": "/assets/ui/chat/chat-bubble-dark.png"
  },
  {
    "id": "ui-catalog-window",
    "name": "Catalog Window",
    "category": "catalog",
    "sprite": "/assets/ui/windows/catalog-window.png"
  },
  {
    "id": "ui-inventory-grid",
    "name": "Inventory Grid",
    "category": "inventory",
    "sprite": "/assets/ui/inventory/inventory-grid.png"
  }
]
JSON

cat > data/packs/fx.json <<'JSON'
[
  {
    "id": "fx-divine-halo",
    "name": "Divine Halo",
    "category": "auras",
    "sprite": "/assets/fx/divine/divine-halo.png",
    "rarity": "premium"
  },
  {
    "id": "fx-astral-rain",
    "name": "Astral Rain",
    "category": "particles",
    "sprite": "/assets/fx/astral/astral-rain.png",
    "rarity": "legendary"
  },
  {
    "id": "fx-crystal-sparkle",
    "name": "Crystal Sparkle",
    "category": "sparkles",
    "sprite": "/assets/fx/crystal/crystal-sparkle.png",
    "rarity": "rare"
  }
]
JSON

echo "==> Création de placeholders pour les premiers packs visuels..."

touch public/assets/walls/classic/blue-panel.png
touch public/assets/walls/luxury/black-marble-wall.png
touch public/assets/walls/crystal/crystal-void-wall.png

touch public/assets/floors/wood/light-wood.png
touch public/assets/floors/marble/black-marble.png
touch public/assets/floors/void/void-neochrome.png

touch public/assets/landscapes/city/city-night.png
touch public/assets/landscapes/sunset/golden-sunset.png
touch public/assets/landscapes/astral/astral-cosmos.png

touch public/assets/furni/seating/sofa-modern-white.png
touch public/assets/furni/beds/bed-luxury-black.png
touch public/assets/furni/lighting/lamp-crystal-orb.png

touch public/assets/avatars/base/base-masc-01.png
touch public/assets/avatars/hair/hair-neochrome.png
touch public/assets/avatars/tops/top-crystal-jacket.png

mkdir -p public/assets/fx/shop-previews
touch public/assets/fx/shop-previews/halo-divin.png
touch public/assets/fx/shop-previews/aura-astrale.png
touch public/assets/ui/shop/bundle-ether-noir.png

mkdir -p public/assets/ui/gangs
mkdir -p public/assets/furni/gangs
touch public/assets/icons/gangs/gang-badge-void.png
touch public/assets/ui/gangs/gang-banner-ether.png
touch public/assets/furni/gangs/throne-leader.png

touch public/assets/ui/chat/chat-bubble-dark.png
touch public/assets/ui/windows/catalog-window.png
touch public/assets/ui/inventory/inventory-grid.png

touch public/assets/fx/divine/divine-halo.png
touch public/assets/fx/astral/astral-rain.png
touch public/assets/fx/crystal/crystal-sparkle.png

echo "==> Terminé."
echo "Dossiers créés : public/assets/... + data/packs/..."
echo "Fichiers JSON de base créés."
echo "Placeholders .png créés pour les premiers items."
