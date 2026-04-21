import { create } from 'zustand';
import type { RoomState, Avatar, FurnitureItem, InventoryItem, AvatarOutfit } from '@/lib/types/game';
import { FURNITURE_REGISTRY } from '@/lib/furniture/FurnitureRegistry';

const defaultOutfit: AvatarOutfit = {
  head: 'head-default',
  hair: 'hair-short-black',
  shirt: 'shirt-tshirt-white',
  jacket: 'jacket-none',
  pants: 'pants-jeans-blue',
  shoes: 'shoes-sneakers-black',
  accessories: [],
};

const initialRoomState: RoomState = {
  width: 10,
  height: 10,
  floorColor: '#3a3a3a',
  wallColor: '#2a2a2a',
  furniture: [
    { id: 'f1', type: 'sofa-ivory', x: 2, y: 2, z: 0, rotation: 0 },
    { id: 'f2', type: 'coffee-table-gold', x: 4, y: 3, z: 0, rotation: 0 },
    { id: 'f3', type: 'plant-tall-modern', x: 8, y: 2, z: 0, rotation: 0 },
    { id: 'f4', type: 'lamp-halo', x: 3, y: 7, z: 0, rotation: 0 },
  ],
  avatars: [
    {
      id: 'player1',
      name: 'You',
      x: 5,
      y: 5,
      z: 0,
      direction: 2,
      moving: false,
      outfit: defaultOutfit,
      animation: { type: 'idle', frame: 0, duration: 0 },
    },
  ],
};

interface GameStore {
  room: RoomState;
  inventory: InventoryItem[];
  selectedWardrobeItem: string | null;
  currentOutfit: AvatarOutfit;
  hoveredTile: { x: number; y: number } | null;
  selectedFurniture: string | null;
  draggingFurniture: { id: string; offsetX: number; offsetY: number } | null;

  // Room actions
  setRoom: (room: RoomState) => void;
  addFurniture: (item: FurnitureItem) => void;
  removeFurniture: (id: string) => void;
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  updateAvatar: (id: string, updates: Partial<Avatar>) => void;

  // Inventory actions
  addToInventory: (item: InventoryItem) => void;
  removeFromInventory: (id: string, quantity: number) => void;

  // Wardrobe actions
  setOutfit: (outfit: AvatarOutfit) => void;
  updateOutfitPart: (part: keyof AvatarOutfit, value: string) => void;

  // UI actions
  setHoveredTile: (tile: { x: number; y: number } | null) => void;
  setSelectedFurniture: (id: string | null) => void;
  setDraggingFurniture: (data: { id: string; offsetX: number; offsetY: number } | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  room: initialRoomState,
  inventory: [
    { id: 'inv1', type: 'furniture', itemId: 'chair-nebula', quantity: 3 },
    { id: 'inv2', type: 'furniture', itemId: 'rug-gray-large', quantity: 1 },
    { id: 'inv3', type: 'furniture', itemId: 'desk-l-modern', quantity: 1 },
    { id: 'inv4', type: 'clothing', itemId: 'shirt-polo-blue', quantity: 1 },
  ],
  selectedWardrobeItem: null,
  currentOutfit: defaultOutfit,
  hoveredTile: null,
  selectedFurniture: null,
  draggingFurniture: null,

  setRoom: (room) => set({ room }),

  addFurniture: (item) =>
    set((state) => ({
      room: {
        ...state.room,
        furniture: [...state.room.furniture, item],
      },
    })),

  removeFurniture: (id) =>
    set((state) => ({
      room: {
        ...state.room,
        furniture: state.room.furniture.filter((f) => f.id !== id),
      },
    })),

  updateFurniture: (id, updates) =>
    set((state) => ({
      room: {
        ...state.room,
        furniture: state.room.furniture.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      },
    })),

  updateAvatar: (id, updates) =>
    set((state) => ({
      room: {
        ...state.room,
        avatars: state.room.avatars.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      },
    })),

  addToInventory: (item) =>
    set((state) => {
      const existing = state.inventory.find((i) => i.itemId === item.itemId && i.type === item.type);
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return {
        inventory: [...state.inventory, item],
      };
    }),

  removeFromInventory: (id, quantity) =>
    set((state) => ({
      inventory: state.inventory
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - quantity } : i))
        .filter((i) => i.quantity > 0),
    })),

  setOutfit: (outfit) => {
    set({ currentOutfit: outfit });
    set((state) => ({
      room: {
        ...state.room,
        avatars: state.room.avatars.map((a) =>
          a.id === 'player1' ? { ...a, outfit } : a
        ),
      },
    }));
  },

  updateOutfitPart: (part, value) =>
    set((state) => {
      const newOutfit = { ...state.currentOutfit, [part]: value };
      set({ currentOutfit: newOutfit });
      set((s) => ({
        room: {
          ...s.room,
          avatars: s.room.avatars.map((a) =>
            a.id === 'player1' ? { ...a, outfit: newOutfit } : a
          ),
        },
      }));
      return { currentOutfit: newOutfit };
    }),

  setHoveredTile: (tile) => set({ hoveredTile: tile }),
  setSelectedFurniture: (id) => set({ selectedFurniture: id }),
  setDraggingFurniture: (data) => set({ draggingFurniture: data }),
}));
