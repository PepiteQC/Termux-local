/**
 * @deprecated Use ShopPanel.tsx instead - this is a legacy component kept for reference
 * ShopPanel.tsx provides the same functionality with better typing and integration
 */
'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { FURNITURE_REGISTRY } from '@/lib/furniture/FurnitureRegistry';
import { clsx } from 'clsx';

type FurnitureCategory = 'seating' | 'tables' | 'beds' | 'decor' | 'walls' | 'rugs';
type ClothingCategory = 'shirts' | 'jackets' | 'pants' | 'shoes' | 'accessories';
type ShopCategory = FurnitureCategory | ClothingCategory;

type FurnitureShopItem = {
  id: string;
  type: 'furniture';
  itemId: string;
  category: FurnitureCategory;
  price: number;
};

type ClothingShopItem = {
  id: string;
  type: 'clothing';
  category: ClothingCategory;
  price: number;
  itemId?: undefined;
};

type ShopItem = FurnitureShopItem | ClothingShopItem;

const SHOP_ITEMS: ShopItem[] = [
  // Furniture - Seating
  { id: 'shop-chair-nebula', type: 'furniture', itemId: 'chair-nebula', category: 'seating', price: 50 },
  { id: 'shop-sofa-ivory', type: 'furniture', itemId: 'sofa-ivory', category: 'seating', price: 120 },
  { id: 'shop-lounge-chair-ivory', type: 'furniture', itemId: 'lounge-chair-ivory', category: 'seating', price: 80 },
  { id: 'shop-office-chair-black', type: 'furniture', itemId: 'office-chair-black', category: 'seating', price: 60 },

  // Furniture - Tables
  { id: 'shop-coffee-table-gold', type: 'furniture', itemId: 'coffee-table-gold', category: 'tables', price: 75 },
  { id: 'shop-coffee-table-glass', type: 'furniture', itemId: 'coffee-table-glass', category: 'tables', price: 70 },
  { id: 'shop-table-prism', type: 'furniture', itemId: 'table-prism', category: 'tables', price: 100 },
  { id: 'shop-desk-l-modern', type: 'furniture', itemId: 'desk-l-modern', category: 'tables', price: 200 },

  // Furniture - Beds
  { id: 'shop-bed-obsidian', type: 'furniture', itemId: 'bed-obsidian', category: 'beds', price: 250 },
  { id: 'shop-bed-royal-red', type: 'furniture', itemId: 'bed-royal-red', category: 'beds', price: 300 },
  { id: 'shop-bed-tiki-canopy', type: 'furniture', itemId: 'bed-tiki-canopy', category: 'beds', price: 350 },
  { id: 'shop-hammock-cream', type: 'furniture', itemId: 'hammock-cream', category: 'beds', price: 180 },

  // Furniture - Decor
  { id: 'shop-plant-tall-modern', type: 'furniture', itemId: 'plant-tall-modern', category: 'decor', price: 40 },
  { id: 'shop-lamp-halo', type: 'furniture', itemId: 'lamp-halo', category: 'decor', price: 90 },
  { id: 'shop-statue-gold', type: 'furniture', itemId: 'statue-gold', category: 'decor', price: 150 },
  { id: 'shop-crystal-ether', type: 'furniture', itemId: 'crystal-ether', category: 'decor', price: 110 },

  // Furniture - Wall
  { id: 'shop-window-city-wide', type: 'furniture', itemId: 'window-city-wide', category: 'walls', price: 200 },
  { id: 'shop-tv-wall-black', type: 'furniture', itemId: 'tv-wall-black', category: 'walls', price: 180 },
  { id: 'shop-fireplace-classic', type: 'furniture', itemId: 'fireplace-classic', category: 'walls', price: 220 },

  // Furniture - Rugs
  { id: 'shop-rug-gray-large', type: 'furniture', itemId: 'rug-gray-large', category: 'rugs', price: 85 },
  { id: 'shop-rug-royal-red', type: 'furniture', itemId: 'rug-royal-red', category: 'rugs', price: 95 },
  { id: 'shop-rug-sand-warm', type: 'furniture', itemId: 'rug-sand-warm', category: 'rugs', price: 80 },

  // Clothing
  { id: 'shop-shirt-polo-blue', type: 'clothing', category: 'shirts', price: 20 },
  { id: 'shop-shirt-cropped-pink', type: 'clothing', category: 'shirts', price: 25 },
  { id: 'shop-jacket-bomber-blue', type: 'clothing', category: 'jackets', price: 45 },
  { id: 'shop-pants-shorts-black', type: 'clothing', category: 'pants', price: 18 },
  { id: 'shop-shoes-heels-red', type: 'clothing', category: 'shoes', price: 35 },
  { id: 'shop-glasses-aviator', type: 'clothing', category: 'accessories', price: 30 },
];

export function Shop() {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('seating');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const { addToInventory } = useGameStore();

  const categories: ShopCategory[] = [
    'seating',
    'tables',
    'beds',
    'decor',
    'walls',
    'rugs',
    'shirts',
    'jackets',
    'pants',
    'shoes',
    'accessories',
  ];

  const items = SHOP_ITEMS.filter((item) => item.category === activeCategory);

  const handleBuy = (item: ShopItem) => {
    addToInventory({
      id: `${item.id}-${Date.now()}`,
      type: item.type,
      itemId: item.itemId || item.category,
      quantity: 1,
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col max-h-96">
      <h2 className="text-sm font-bold text-yellow-400 mb-3 uppercase tracking-wider">
        Boutique
      </h2>

      {/* Categories */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedItem(null);
            }}
            className={clsx(
              'px-2 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap',
              activeCategory === cat
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={clsx(
                'p-2 rounded text-xs text-left transition-colors border',
                selectedItem?.id === item.id
                  ? 'bg-green-900 border-green-500 text-green-100'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              )}
            >
              <div className="font-semibold truncate">
                {item.itemId
                  ? FURNITURE_REGISTRY[item.itemId]?.label || item.category
                  : item.category}
              </div>
              <div className="text-yellow-400 font-bold">{item.price}$</div>
            </button>
          ))}
        </div>
      </div>

      {/* Buy Section */}
      {selectedItem && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={() => {
              handleBuy(selectedItem);
              setSelectedItem(null);
            }}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold text-sm transition-colors"
          >
            Acheter - {selectedItem.price}$
          </button>
        </div>
      )}
    </div>
  );
}
