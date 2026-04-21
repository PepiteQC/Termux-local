'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { clsx } from 'clsx';

const WARDROBE_CATEGORIES = {
  hair: ['hair-short-black', 'hair-long-blonde', 'hair-braids-3d', 'hair-afro'],
  shirts: ['shirt-tshirt-white', 'shirt-tshirt-black', 'shirt-polo-blue', 'shirt-cropped-pink'],
  jackets: ['jacket-bomber-blue', 'jacket-cropped-denim', 'jacket-none'],
  pants: ['pants-jeans-blue', 'pants-shorts-black', 'pants-sweatpants-gray'],
  shoes: ['shoes-sneakers-black', 'shoes-heels-red', 'shoes-hi-tops-white'],
  accessories: [],
};

type WardrobeSection = keyof typeof WARDROBE_CATEGORIES;

export function Wardrobe() {
  const [activeSection, setActiveSection] = useState<WardrobeSection>('shirts');
  const { currentOutfit, updateOutfitPart } = useGameStore();

  const items = WARDROBE_CATEGORIES[activeSection];

  const getOutfitValue = (section: WardrobeSection): string => {
    switch (section) {
      case 'hair':
        return currentOutfit.hair;
      case 'shirts':
        return currentOutfit.shirt;
      case 'jackets':
        return currentOutfit.jacket;
      case 'pants':
        return currentOutfit.pants;
      case 'shoes':
        return currentOutfit.shoes;
      default:
        return '';
    }
  };

  const handleSelect = (item: string) => {
    switch (activeSection) {
      case 'hair':
        updateOutfitPart('hair', item);
        break;
      case 'shirts':
        updateOutfitPart('shirt', item);
        break;
      case 'jackets':
        updateOutfitPart('jacket', item);
        break;
      case 'pants':
        updateOutfitPart('pants', item);
        break;
      case 'shoes':
        updateOutfitPart('shoes', item);
        break;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-96 flex flex-col">
      <h2 className="text-sm font-bold text-yellow-400 mb-3 uppercase tracking-wider">
        Garde-Robe
      </h2>

      {/* Categories */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {(Object.keys(WARDROBE_CATEGORIES) as WardrobeSection[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveSection(cat)}
            className={clsx(
              'px-3 py-1 text-xs font-semibold rounded transition-colors',
              activeSection === cat
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="overflow-y-auto flex-1 pr-2">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => handleSelect(item)}
              className={clsx(
                'p-2 rounded text-xs text-center font-semibold transition-colors',
                getOutfitValue(activeSection) === item
                  ? 'bg-green-600 text-white border border-green-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              )}
            >
              {item.split('-').slice(1).join(' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
