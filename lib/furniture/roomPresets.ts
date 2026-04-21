export type EtherRoomId = "modern" | "luxury" | "tiki";

export type EtherRoomPlacement = {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  rotation: 0 | 1 | 2 | 3;
  state?: string;
};

export type EtherRoomShell = {
  floorA: string;
  floorB: string;
  wallLeft: string;
  wallRight: string;
  ambientTop: string;
  ambientBottom: string;
};

export type EtherRoomPreset = {
  id: EtherRoomId;
  name: string;
  tagline: string;
  theme: string;
  occupancy: string;
  shell: EtherRoomShell;
  placements: EtherRoomPlacement[];
};

const p = (
  id: string,
  type: string,
  x: number,
  z: number,
  rotation: 0 | 1 | 2 | 3 = 0,
  y = 0,
  state = "idle"
): EtherRoomPlacement => ({
  id,
  type,
  x,
  y,
  z,
  rotation,
  state
});

export const ETHER_ROOM_PRESETS: Record<EtherRoomId, EtherRoomPreset> = {
  modern: {
    id: "modern",
    name: "Appartement Moderne",
    tagline: "Suite urbaine froide, propre, premium.",
    theme: "Modern / City",
    occupancy: "2-4",
    shell: {
      floorA: "#d6d1dc",
      floorB: "#c9c3d0",
      wallLeft: "#d8d5db",
      wallRight: "#bbb4c4",
      ambientTop: "#2b2733",
      ambientBottom: "#0f1015"
    },
    placements: [
      p("modern-window-1", "window-city-wide", 1, 0, 0),
      p("modern-window-2", "window-city-wide", 3, 0, 0),
      p("modern-window-3", "window-city-wide", 5, 0, 0),

      p("modern-tv", "tv-wall-black", 0, 2, 1),
      p("modern-console", "media-console-black", 1, 2, 1),

      p("modern-sofa-main", "sectional-sofa-dark", 2, 5, 1),
      p("modern-sofa-side", "sectional-sofa-dark-corner", 1, 6, 0),
      p("modern-rug", "rug-gray-large", 3, 5, 0),
      p("modern-table", "coffee-table-glass", 3, 5, 0),

      p("modern-desk", "desk-l-modern", 6, 6, 2),
      p("modern-monitor-a", "monitor-flat-27", 6, 6, 2),
      p("modern-monitor-b", "monitor-flat-27", 7, 6, 2),
      p("modern-chair", "office-chair-black", 7, 7, 3),

      p("modern-shelf", "wall-shelf-minimal", 2, 1, 1),
      p("modern-lamp", "floor-lamp-white", 0, 4, 0),
      p("modern-plant", "plant-tall-modern", 2, 3, 0),
      p("modern-fridge", "fridge-steel", 7, 2, 0),
      p("modern-sideboard", "cabinet-dark-low", 5, 2, 1),
      p("modern-kitchen-mini", "kitchen-line-dark", 0, 8, 1)
    ]
  },

  luxury: {
    id: "luxury",
    name: "Suite Luxueuse",
    tagline: "Marbre, or chaud, piano et grande suite privée.",
    theme: "Luxury / Penthouse",
    occupancy: "2-6",
    shell: {
      floorA: "#d3bb86",
      floorB: "#b7904d",
      wallLeft: "#8a4f26",
      wallRight: "#6f3f21",
      ambientTop: "#25170f",
      ambientBottom: "#090909"
    },
    placements: [
      p("lux-window-1", "window-city-wide-gold", 2, 0, 0),
      p("lux-window-2", "window-city-wide-gold", 4, 0, 0),
      p("lux-window-3", "window-city-wide-gold", 6, 0, 0),

      p("lux-chandelier", "chandelier-grand-gold", 4, 2, 0),
      p("lux-bed", "bed-royal-red", 5, 3, 2),
      p("lux-bedside-left", "nightstand-gold", 4, 4, 0),
      p("lux-bedside-right", "nightstand-gold", 7, 3, 0),

      p("lux-piano", "grand-piano-black", 2, 4, 1),
      p("lux-fireplace", "fireplace-classic", 1, 3, 1),

      p("lux-sofa-a", "sofa-ivory", 2, 7, 1),
      p("lux-sofa-b", "sofa-ivory", 4, 7, 3),
      p("lux-chair", "lounge-chair-ivory", 5, 6, 2),
      p("lux-table", "coffee-table-gold", 3, 7, 0),

      p("lux-bar", "bar-marble-black", 7, 6, 2),
      p("lux-stool-1", "bar-stool-gold", 8, 6, 0),
      p("lux-stool-2", "bar-stool-gold", 8, 7, 0),
      p("lux-stool-3", "bar-stool-gold", 8, 8, 0),

      p("lux-jacuzzi", "jacuzzi-round-gold", 7, 1, 0),
      p("lux-statue", "statue-gold", 8, 3, 0),
      p("lux-rug", "rug-royal-red", 4, 6, 0),
      p("lux-shelf", "shelf-luxury-backbar", 1, 1, 1)
    ]
  },

  tiki: {
    id: "tiki",
    name: "Bungalow Tiki",
    tagline: "Bois chaud, eau, feu, hamac, vibe tropicale.",
    theme: "Tiki / Tropical",
    occupancy: "2-5",
    shell: {
      floorA: "#d4a85b",
      floorB: "#b88237",
      wallLeft: "#8b6331",
      wallRight: "#7a5529",
      ambientTop: "#2c1908",
      ambientBottom: "#0a0907"
    },
    placements: [
      p("tiki-wall-water", "waterfall-wall", 7, 1, 0),
      p("tiki-bed", "bed-tiki-canopy", 4, 2, 2),
      p("tiki-bar", "bar-tiki-bamboo", 2, 5, 1),

      p("tiki-stool-1", "stool-tiki", 3, 6, 0),
      p("tiki-stool-2", "stool-tiki", 4, 6, 0),
      p("tiki-stool-3", "stool-tiki", 5, 6, 0),

      p("tiki-pool", "pool-plunge-stone", 7, 6, 0),
      p("tiki-firepit", "firepit-stone", 5, 8, 0),
      p("tiki-chair-1", "chair-wicker", 4, 9, 0),
      p("tiki-chair-2", "chair-wicker", 6, 9, 0),
      p("tiki-table", "table-tiki-low", 5, 9, 0),

      p("tiki-hammock", "hammock-cream", 9, 4, 1),
      p("tiki-surfboard", "surfboard-yellow", 10, 3, 0),
      p("tiki-palm-left", "palm-tree-tall", 9, 1, 0),
      p("tiki-palm-right", "palm-tree-tall", 10, 1, 0),
      p("tiki-torch-left", "torch-tiki", 8, 2, 0),
      p("tiki-torch-right", "torch-tiki", 10, 6, 0),

      p("tiki-lounge", "sofa-tiki-lounge", 1, 8, 1),
      p("tiki-rug", "rug-sand-warm", 2, 8, 0),
      p("tiki-shelf", "shelf-tiki-drinks", 1, 4, 1)
    ]
  }
};

export const ETHER_ROOM_LIST = Object.values(ETHER_ROOM_PRESETS).map((room) => ({
  id: room.id,
  name: room.name,
  tagline: room.tagline,
  theme: room.theme,
  occupancy: room.occupancy
}));

export function getEtherRoomPreset(roomId: string) {
  return ETHER_ROOM_PRESETS[(roomId as EtherRoomId) || "modern"] ?? ETHER_ROOM_PRESETS.modern;
}
