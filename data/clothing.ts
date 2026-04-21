export type ClothingCategory = 'hair' | 'shirts' | 'jackets' | 'pants' | 'shoes' | 'accessories';

export interface ClothingItem {
  label: string;
  category: ClothingCategory;
  color: string;
}

export const CLOTHING_ITEMS: Record<ClothingCategory, Record<string, ClothingItem>> = {
  hair: {
    'hair-short-black': { label: 'Short Black', category: 'hair', color: '#000' },
    'hair-long-blonde': { label: 'Long Blonde', category: 'hair', color: '#ffd700' },
    'hair-braids-brown': { label: 'Braids Brown', category: 'hair', color: '#8b4513' },
    'hair-curly-red': { label: 'Curly Red', category: 'hair', color: '#ff4500' },
    'hair-wavy-white': { label: 'Wavy White', category: 'hair', color: '#f5f5f5' },
  },
  shirts: {
    'shirt-tshirt-white': { label: 'White T-Shirt', category: 'shirts', color: '#ffffff' },
    'shirt-tshirt-black': { label: 'Black T-Shirt', category: 'shirts', color: '#000000' },
    'shirt-polo-blue': { label: 'Blue Polo', category: 'shirts', color: '#0066cc' },
    'shirt-polo-red': { label: 'Red Polo', category: 'shirts', color: '#cc0000' },
    'shirt-cropped-pink': { label: 'Cropped Pink', category: 'shirts', color: '#ff69b4' },
    'shirt-tank-yellow': { label: 'Tank Yellow', category: 'shirts', color: '#ffff00' },
  },
  jackets: {
    'jacket-none': { label: 'No Jacket', category: 'jackets', color: 'transparent' },
    'jacket-bomber-blue': { label: 'Blue Bomber', category: 'jackets', color: '#0066cc' },
    'jacket-bomber-black': { label: 'Black Bomber', category: 'jackets', color: '#000000' },
    'jacket-cropped-denim': { label: 'Denim Cropped', category: 'jackets', color: '#3d5a80' },
    'jacket-leather-brown': { label: 'Brown Leather', category: 'jackets', color: '#8b4513' },
  },
  pants: {
    'pants-jeans-blue': { label: 'Blue Jeans', category: 'pants', color: '#0066cc' },
    'pants-jeans-black': { label: 'Black Jeans', category: 'pants', color: '#000000' },
    'pants-shorts-black': { label: 'Black Shorts', category: 'pants', color: '#000000' },
    'pants-shorts-white': { label: 'White Shorts', category: 'pants', color: '#ffffff' },
    'pants-sweatpants-gray': { label: 'Gray Sweats', category: 'pants', color: '#808080' },
    'pants-skirt-red': { label: 'Red Skirt', category: 'pants', color: '#cc0000' },
  },
  shoes: {
    'shoes-sneakers-black': { label: 'Black Sneakers', category: 'shoes', color: '#000000' },
    'shoes-sneakers-white': { label: 'White Sneakers', category: 'shoes', color: '#ffffff' },
    'shoes-heels-red': { label: 'Red Heels', category: 'shoes', color: '#cc0000' },
    'shoes-heels-black': { label: 'Black Heels', category: 'shoes', color: '#000000' },
    'shoes-hi-tops-white': { label: 'White Hi-Tops', category: 'shoes', color: '#ffffff' },
    'shoes-boots-brown': { label: 'Brown Boots', category: 'shoes', color: '#8b4513' },
  },
  accessories: {
    'glasses-aviator': { label: 'Aviator Glasses', category: 'accessories', color: '#666666' },
    'glasses-round': { label: 'Round Glasses', category: 'accessories', color: '#666666' },
    'hat-beanie': { label: 'Beanie', category: 'accessories', color: '#000000' },
    'hat-cap': { label: 'Baseball Cap', category: 'accessories', color: '#0066cc' },
  },
};

export type ClothingItemId = string;

export function getClothingItem(id: ClothingItemId) {
  for (const categoryItems of Object.values(CLOTHING_ITEMS)) {
    const item = categoryItems[id];
    if (item) {
      return { id, ...item };
    }
  }
  return null;
}

export function getClothingByCategory(category: ClothingCategory) {
  return Object.entries(CLOTHING_ITEMS[category] || {}).map(([id, item]) => ({
    id,
    ...item,
  }));
}
